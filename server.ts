import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import crypto from "crypto";
import { startBot } from "./bot";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Start the Telegram Bot
  startBot();

  // Prodamus webhook uses raw body for HMAC-SHA256 signature verification.
  // Must be registered BEFORE express.json / urlencoded (otherwise they consume the body).
  app.post(
    "/api/prodamus/webhook",
    express.raw({ type: "*/*", limit: "1mb" }),
    async (req, res) => {
      try {
        const prodamusSecret = process.env.PRODAMUS_SECRET_KEY;
        if (!prodamusSecret) {
          console.error("PRODAMUS_SECRET_KEY is not set");
          return res.status(500).send("Server configuration error");
        }

        const rawBody: Buffer = req.body instanceof Buffer ? req.body : Buffer.from("");
        const rawString = rawBody.toString("utf8");

        const signHeader = (req.headers["sign"] || req.headers["Sign"] || req.headers["x-sign"] || "") as string;
        const expected = crypto.createHmac("sha256", prodamusSecret).update(rawBody).digest("hex");
        const provided = String(signHeader).trim().toLowerCase();

        const signatureOk =
          provided.length > 0 &&
          provided.length === expected.length &&
          crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));

        if (!signatureOk) {
          console.warn("Prodamus webhook signature mismatch", { provided, expected });
          return res.status(401).send("Invalid signature");
        }

        // Parse body (Prodamus sends urlencoded or JSON)
        let paymentData: any = {};
        const contentType = String(req.headers["content-type"] || "").toLowerCase();
        if (contentType.includes("application/json")) {
          try { paymentData = JSON.parse(rawString); } catch {}
        } else {
          paymentData = Object.fromEntries(new URLSearchParams(rawString).entries());
        }
        console.log("Received webhook from Prodamus:", paymentData);

      // Check if payment is successful
      // Prodamus sends payment_status=success
      if (paymentData.payment_status === 'success') {
        const customerEmail = paymentData.customer_email || 'Не указан';
        const customerPhone = paymentData.customer_phone || 'Не указан';
        const orderId = paymentData.order_id || 'Не указан';
        const amount = paymentData.products ? paymentData.products[0]?.price : paymentData.sum;
        const tariffName = paymentData.products ? paymentData.products[0]?.name : 'Тариф';
        
        let customerName = 'Не указано';
        let originalContact = 'Не указан';
        
        if (paymentData.customer_extra) {
          try {
            const extra = JSON.parse(paymentData.customer_extra);
            if (extra.name) customerName = extra.name;
            if (extra.contact) originalContact = extra.contact;
          } catch (e) {
            console.error("Failed to parse customer_extra", e);
          }
        }

        // Send to Telegram
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID || '-1003978251165'; // Default to the one from URL
        const topicId = process.env.TELEGRAM_TOPIC_ID || '4';

        if (botToken) {
          const message = `🎉 <b>Успешная оплата!</b>\n\n` +
                          `<b>Имя:</b> ${customerName}\n` +
                          `<b>Введенный контакт:</b> ${originalContact}\n` +
                          `<b>Тариф:</b> ${tariffName}\n` +
                          `<b>Сумма:</b> ${amount} руб.\n` +
                          `<b>Email (Prodamus):</b> ${customerEmail}\n` +
                          `<b>Телефон (Prodamus):</b> ${customerPhone}\n` +
                          `<b>Заказ:</b> #${orderId}`;

          const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
          await fetch(tgUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_thread_id: parseInt(topicId),
              text: message,
              parse_mode: 'HTML'
            })
          });
          console.log("Sent notification to Telegram");
        } else {
          console.log("TELEGRAM_BOT_TOKEN not set, skipping Telegram notification");
        }
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).send("Error processing webhook");
    }
  });

  // Body parsers for the rest of the API (webhook above uses raw body)
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Generate payment link endpoint
  app.post("/api/prodamus/pay", (req, res) => {
    const { tariffName, price, contact, name } = req.body;
    const prodamusUrl = process.env.PRODAMUS_URL; // e.g., https://yourdomain.payform.ru

    if (!prodamusUrl) {
      return res.status(500).json({ error: "PRODAMUS_URL is not configured" });
    }

    // Construct Prodamus payment link
    const url = new URL(prodamusUrl);
    url.searchParams.append('products[0][name]', tariffName);
    url.searchParams.append('products[0][price]', price.toString());
    url.searchParams.append('products[0][quantity]', '1');
    
    if (contact) {
      if (contact.includes('@')) {
        url.searchParams.append('customer_email', contact);
      } else {
        url.searchParams.append('customer_phone', contact);
      }
    }
    
    // Pass name and contact in customer_extra so we get it back in the webhook
    const extraData = JSON.stringify({ name, contact });
    url.searchParams.append('customer_extra', extraData);
    
    // Add a unique order ID
    const orderId = `ORDER_${Date.now()}`;
    url.searchParams.append('order_id', orderId);

    res.json({ paymentUrl: url.toString() });
  });

  // General Telegram notification endpoint
  app.post("/api/telegram/notify", async (req, res) => {
    const { name, contact, message: userMessage, tariffName } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || '-1003978251165';
    const topicId = process.env.TELEGRAM_TOPIC_ID || '4';

    if (!botToken) {
      return res.status(500).json({ error: "TELEGRAM_BOT_TOKEN is not configured" });
    }

    const text = `🔥 <b>Новая заявка!</b>\n\n` +
                 `<b>Имя:</b> ${name}\n` +
                 `<b>Контакт:</b> ${contact}\n` +
                 `<b>Сообщение:</b> ${userMessage || 'Нет сообщения'}\n` +
                 `<b>Тариф:</b> ${tariffName || 'Не выбран'}`;

    try {
      const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_thread_id: parseInt(topicId),
          text: text,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        throw new Error(`Telegram API responded with ${response.status}`);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error sending to Telegram:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
