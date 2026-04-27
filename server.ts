import "dotenv/config";
import express from "express";
import path from "path";
import crypto from "crypto";
import { startBot, livechatCreateSession, livechatSendMessage, livechatPollReplies } from "./bot";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

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

  // Generate payment link endpoint via Prodamus do=link API
  // Docs: https://help.prodamus.ru/payform.ru-onlain-oplaty/rest-api/instrukcii-dlya-samostoyatelnaya-integracii-servisov
  app.post("/api/prodamus/pay", async (req, res) => {
    const { tariffName, price, contact, name, installment } = req.body;
    const prodamusUrl = process.env.PRODAMUS_URL;

    if (!prodamusUrl) {
      return res.status(500).json({ error: "PRODAMUS_URL is not configured" });
    }

    const linkUrl = new URL(prodamusUrl);
    linkUrl.searchParams.append('do', 'link');
    linkUrl.searchParams.append('products[0][name]', String(tariffName));
    linkUrl.searchParams.append('products[0][price]', String(price));
    linkUrl.searchParams.append('products[0][quantity]', '1');
    linkUrl.searchParams.append('order_id', `ORDER_${Date.now()}`);
    linkUrl.searchParams.append('customer_extra', JSON.stringify({ name, contact }));

    if (contact) {
      if (contact.includes('@')) {
        linkUrl.searchParams.append('customer_email', contact);
      } else {
        linkUrl.searchParams.append('customer_phone', contact);
      }
    }

    // Installment 1.5 and 3 months (льготный тариф 6.5%)
    if (installment) {
      linkUrl.searchParams.append('available_payment_methods', 'installment_0_0_2|installment_0_0_3');
    }

    try {
      const response = await fetch(linkUrl.toString(), { method: 'GET' });
      const text = (await response.text()).trim();

      // Prodamus returns the short link as plain text body, e.g. "https://xxxx.payform.ru/abc123/"
      if (text.startsWith('http')) {
        return res.json({ paymentUrl: text });
      }

      console.error('Prodamus do=link unexpected response:', text.slice(0, 500));
      return res.status(502).json({ error: 'Unexpected response from Prodamus', body: text.slice(0, 500) });
    } catch (error: any) {
      console.error('Prodamus do=link error:', error?.message || error);
      return res.status(502).json({ error: 'Failed to generate payment link' });
    }
  });

  // General Telegram notification endpoint
  app.post("/api/telegram/notify", async (req, res) => {
    const { name, contact, message: userMessage, tariffName } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || '-1003978251165';
    // Topic 2 is the leads/заявки topic (t.me/c/3978251165/2)
    const topicId = process.env.TELEGRAM_LEADS_TOPIC_ID || '2';

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

  // --- LiveChat endpoints ---

  app.post("/api/livechat/start", async (req, res) => {
    const { visitorName } = req.body;
    if (!visitorName) return res.status(400).json({ error: "visitorName required" });

    const sessionId = `lc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const threadId = await livechatCreateSession(sessionId, visitorName);
    res.json({ sessionId, threadId });
  });

  app.post("/api/livechat/message", async (req, res) => {
    const { sessionId, text } = req.body;
    if (!sessionId || !text) return res.status(400).json({ error: "sessionId and text required" });

    const ok = await livechatSendMessage(sessionId, text.slice(0, 2000));
    res.json({ ok });
  });

  app.get("/api/livechat/poll", (req, res) => {
    const { sessionId, after } = req.query;
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });

    const messages = livechatPollReplies(String(sessionId), Number(after) || 0);
    res.json({ messages });
  });

  // Vite middleware for development (loaded dynamically so it is not bundled into prod)
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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

// ─── Prodamus signature helpers ──────────────────────────────────────────────
// Replicate PHP Hmac::create(): recursive ksort → JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES → HMAC-SHA256

function prodamusSerialize(value: any): string {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) {
    // PHP json_encode for indexed arrays produces JSON arrays
    return '[' + value.map(prodamusSerialize).join(',') + ']';
  }
  if (typeof value === 'object') {
    const sortedKeys = Object.keys(value).sort();
    const parts = sortedKeys.map(k => JSON.stringify(k) + ':' + prodamusSerialize(value[k]));
    return '{' + parts.join(',') + '}';
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  // String — JSON.stringify handles UNESCAPED_UNICODE by default in JS,
  // but escapes forward slashes. PHP UNESCAPED_SLASHES → strip the escape.
  return JSON.stringify(String(value)).replace(/\\\//g, '/');
}

function prodamusSign(params: Record<string, any>, secret: string): string {
  const { signature, ...rest } = params;
  void signature;
  const json = prodamusSerialize(rest);
  return crypto.createHmac('sha256', secret).update(json, 'utf8').digest('hex');
}

function appendNested(searchParams: URLSearchParams, obj: any, prefix = ''): void {
  if (obj === null || obj === undefined) return;
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      const key = prefix ? `${prefix}[${i}]` : String(i);
      appendNested(searchParams, item, key);
    });
    return;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}[${k}]` : k;
      appendNested(searchParams, v, key);
    }
    return;
  }
  searchParams.append(prefix, String(obj));
}

startServer();
