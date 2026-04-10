import { Telegraf, Markup, Context } from 'telegraf';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Initialize DB
const dbPath = path.join(process.cwd(), 'bot.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    first_name TEXT,
    step TEXT,
    name TEXT,
    role TEXT,
    pain TEXT,
    feeling TEXT,
    thread_id INTEGER,
    audio_sent_at INTEGER,
    followup_sent INTEGER DEFAULT 0
  )
`);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8635880957:AAFpvKA_jWM0SmQWlnmB9CELJjzi6LQ1XXg';
const GROUP_ID = process.env.TELEGRAM_CHAT_ID || '-1003978251165';

export const bot = new Telegraf(BOT_TOKEN);

// Helper to get or create user
const getUser = (ctx: Context) => {
  if (!ctx.from) return null;
  let user = db.prepare('SELECT * FROM users WHERE id = ?').get(ctx.from.id) as any;
  if (!user) {
    db.prepare('INSERT INTO users (id, username, first_name, step) VALUES (?, ?, ?, ?)').run(
      ctx.from.id, ctx.from.username || '', ctx.from.first_name || '', 'start'
    );
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(ctx.from.id);
  }
  return user;
};

const updateUser = (id: number, data: any) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setString = keys.map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE users SET ${setString} WHERE id = ?`).run(...values, id);
};

// Start command
bot.start(async (ctx) => {
  if (ctx.chat.type !== 'private') return;
  
  const user = getUser(ctx);
  updateUser(user.id, { step: 'ask_name' });

  // TODO: Add real image URL or local file path
  // await ctx.replyWithPhoto('https://otragenie-camp.ru/maya.jpg', {
  //   caption: 'Привет! Я Майя Дзодзатти...'
  // });
  
  await ctx.reply(
    'Привет! Я Майя Дзодзатти, психолог и соавтор кэмпа «Отражение».\n\n' +
    'Честность с собой — это первый шаг к любым изменениям. Прежде чем мы перейдем к основной программе, я хочу подарить вам небольшую практику.\n\n' +
    'Но сначала давайте познакомимся. Как к вам обращаться?'
  );
});

// Handle text messages and routing
bot.on('text', async (ctx) => {
  // If message is in the group (Topic)
  if (ctx.chat.id.toString() === GROUP_ID.toString()) {
    // Check if it's a topic
    if (ctx.message.message_thread_id) {
      // Find user by thread_id
      const user = db.prepare('SELECT * FROM users WHERE thread_id = ?').get(ctx.message.message_thread_id) as any;
      if (user) {
        try {
          await ctx.telegram.sendMessage(user.id, ctx.message.text);
        } catch (e) {
          console.error('Failed to forward message to user', e);
        }
      }
    }
    return;
  }

  // If message is in private chat
  if (ctx.chat.type === 'private') {
    const user = getUser(ctx);
    if (!user) return;

    if (user.step === 'ask_name') {
      updateUser(user.id, { name: ctx.message.text, step: 'ask_role' });
      await ctx.reply('Отлично! Выберите вашу текущую роль:', Markup.keyboard([
        ['Предприниматель / Собственник'],
        ['Топ-менеджер / Руководитель'],
        ['Другое']
      ]).oneTime().resize());
      return;
    }

    if (user.step === 'ask_role') {
      updateUser(user.id, { role: ctx.message.text, step: 'ask_pain' });
      await ctx.reply('Что сейчас откликается больше всего?', Markup.keyboard([
        ['Устал тянуть всё на себе'],
        ['Проблемы в отношениях из-за работы'],
        ['Потерял смыслы, живу на автопилоте']
      ]).oneTime().resize());
      return;
    }

    if (user.step === 'ask_pain') {
      updateUser(user.id, { pain: ctx.message.text, step: 'waiting_audio', audio_sent_at: Date.now() });
      
      await ctx.reply(
        'Спасибо за откровенность. \n\n' +
        'Сейчас я пришлю вам аудио-практику «10 минут честности с собой». \n' +
        'Найдите 10 минут тишины, наденьте наушники и включите запись.',
        Markup.removeKeyboard()
      );

      // Send audio (Placeholder, replace with actual file_id or URL)
      // await ctx.replyWithVoice('URL_OR_FILE_ID');
      await ctx.reply('🎧 [Здесь будет аудиофайл практики]');

      // Schedule the next question after 10 minutes
      setTimeout(async () => {
        try {
          updateUser(user.id, { step: 'ask_feeling' });
          await ctx.telegram.sendMessage(user.id, 'Какое одно слово или чувство сейчас внутри? Напиши мне.');
        } catch (e) {
          console.error(e);
        }
      }, 10 * 60 * 1000); // 10 minutes

      return;
    }

    if (user.step === 'ask_feeling') {
      updateUser(user.id, { feeling: ctx.message.text, step: 'finished' });
      
      await ctx.reply(
        'Спасибо, что поделились.\n\n' +
        'Если вы чувствуете, что вам нужно больше ясности, предлагаю записаться на индивидуальный разбор или узнать подробности о нашем терапевтическом кэмпе в Красной Поляне.',
        Markup.inlineKeyboard([
          [Markup.button.url('Узнать о кэмпе', 'https://otragenie-camp.ru')],
          [Markup.button.callback('Записаться на разбор', 'book_call')]
        ])
      );

      // Create topic in CRM group
      try {
        const topicName = `${user.name} | ${user.role} | @${user.username || 'no_username'}`;
        const topic = await ctx.telegram.createForumTopic(GROUP_ID, topicName);
        
        updateUser(user.id, { thread_id: topic.message_thread_id });

        const leadInfo = `🔥 <b>Новый лид после практики!</b>\n\n` +
                         `<b>Имя:</b> ${user.name}\n` +
                         `<b>Роль:</b> ${user.role}\n` +
                         `<b>Боль:</b> ${user.pain}\n` +
                         `<b>Чувство после практики:</b> ${ctx.message.text}\n` +
                         `<b>Username:</b> @${user.username || 'нет'}`;

        await ctx.telegram.sendMessage(GROUP_ID, leadInfo, {
          message_thread_id: topic.message_thread_id,
          parse_mode: 'HTML'
        });
      } catch (e) {
        console.error('Failed to create topic or send lead info', e);
      }
      return;
    }

    // If finished, forward messages to the topic
    if (user.step === 'finished' && user.thread_id) {
      try {
        await ctx.telegram.forwardMessage(GROUP_ID, ctx.chat.id, ctx.message.message_id, {
          message_thread_id: user.thread_id
        });
      } catch (e) {
        console.error('Failed to forward message to topic', e);
      }
    }
  }
});

// Handle callbacks
bot.action('book_call', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('Отлично! Организаторы свяжутся с вами в ближайшее время.');
  
  const user = getUser(ctx);
  if (user && user.thread_id) {
    await ctx.telegram.sendMessage(GROUP_ID, '❗️ <b>Пользователь хочет записаться на разбор!</b>', {
      message_thread_id: user.thread_id,
      parse_mode: 'HTML'
    });
  }
});

// Handle photos/voice from admin to user
bot.on(['photo', 'voice', 'document'], async (ctx) => {
  if (ctx.chat.id.toString() === GROUP_ID.toString() && ctx.message.message_thread_id) {
    const user = db.prepare('SELECT * FROM users WHERE thread_id = ?').get(ctx.message.message_thread_id) as any;
    if (user) {
      try {
        await ctx.telegram.copyMessage(user.id, ctx.chat.id, ctx.message.message_id);
      } catch (e) {
        console.error('Failed to copy media to user', e);
      }
    }
  } else if (ctx.chat.type === 'private') {
    const user = getUser(ctx);
    if (user && user.thread_id) {
      try {
        await ctx.telegram.copyMessage(GROUP_ID, ctx.chat.id, ctx.message.message_id, {
          message_thread_id: user.thread_id
        });
      } catch (e) {
        console.error('Failed to copy media to topic', e);
      }
    }
  }
});

// Follow-up cron job (runs every hour)
setInterval(async () => {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const usersToFollowUp = db.prepare('SELECT * FROM users WHERE step = ? AND audio_sent_at < ? AND followup_sent = 0').all('finished', oneDayAgo) as any[];

  for (const user of usersToFollowUp) {
    try {
      await bot.telegram.sendMessage(user.id, 
        'Здравствуйте! Прошли сутки с момента нашей аудио-практики.\n\n' +
        'Хочу поделиться с вами историей одного из участников нашего кэмпа, который пришел с похожим запросом...\n\n' +
        '<i>[Здесь будет кейс участника]</i>\n\n' +
        'Если вы готовы сделать шаг к изменениям, буду рада видеть вас на индивидуальном разборе.',
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Записаться на разбор', callback_data: 'book_call' }]
            ]
          }
        }
      );
      updateUser(user.id, { followup_sent: 1 });
    } catch (e) {
      console.error(`Failed to send follow-up to user ${user.id}`, e);
    }
  }
}, 60 * 60 * 1000);

// Error handling
bot.catch((err, ctx) => {
  console.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

export const startBot = () => {
  bot.launch().then(() => {
    console.log('Telegram bot started');
  }).catch(err => {
    console.error('Failed to start Telegram bot', err);
  });
};

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
