import { Context, Markup, Telegraf } from "telegraf";
import Database from "better-sqlite3";
import path from "path";

type UserStep =
  | "start"
  | "ask_name"
  | "ask_role"
  | "ask_pain"
  | "waiting_audio"
  | "ask_feeling"
  | "finished";

type UserRecord = {
  id: number;
  username: string | null;
  first_name: string | null;
  step: UserStep;
  name: string | null;
  role: string | null;
  pain: string | null;
  feeling: string | null;
  thread_id: number | null;
  audio_sent_at: number | null;
  feeling_due_at: number | null;
  feeling_prompt_sent_at: number | null;
  followup_sent: number;
  book_call_requested: number;
  created_at: number;
  updated_at: number;
};

type MessageDirection = "user_to_admin" | "admin_to_user" | "bot_to_user" | "bot_to_admin";

const USER_ROLES = [
  "Предприниматель / Собственник",
  "Топ-менеджер / Руководитель",
  "Другое",
];

const USER_PAINS = [
  "Устал тянуть все на себе",
  "Проблемы в отношениях из-за работы",
  "Потерял смыслы, живу на автопилоте",
];

const DEFAULT_WELCOME_TEXT =
  "Привет! Я Майя Дзодзатти, психолог и соавтор кэмпа «Отражение».\n\n" +
  "Этот бот поможет пройти короткую практику и, если откликнется, перейти к личному разбору и общению с нашей командой.\n\n" +
  "Для начала познакомимся. Как к вам обращаться?";

const AUDIO_INTRO_TEXT =
  "Спасибо за откровенность.\n\n" +
  "Сейчас отправлю аудио-практику «10 минут честности с собой».\n" +
  "Найдите 10 минут тишины, наденьте наушники и включите запись.";

const FEELING_PROMPT =
  "Какое одно слово или чувство сейчас внутри? Напишите мне.";

const AFTER_FEELING_TEXT =
  "Спасибо, что поделились.\n\n" +
  "Если чувствуете, что хотите больше ясности, можно узнать подробности о кэмпе или оставить заявку на индивидуальный разбор.";

const BOOK_CALL_ACK =
  "Отлично. Организаторы увидели ваш запрос и свяжутся с вами в ближайшее время.";

const FOLLOWUP_TEXT =
  "Прошли сутки после практики.\n\n" +
  "Часто именно в этот момент начинает проявляться то, что раньше оставалось фоном. " +
  "Если хотите, мы можем помочь вам разобрать это глубже на личном разборе.";

const dbPath = path.join(process.cwd(), "bot.db");
const db = new Database(dbPath);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const GROUP_ID = process.env.TELEGRAM_CHAT_ID?.trim();
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL?.trim() || "https://otragenie-camp.ru";
const WELCOME_IMAGE_URL = process.env.TELEGRAM_WELCOME_IMAGE_URL?.trim();
const AUDIO_FILE_ID = process.env.TELEGRAM_AUDIO_FILE_ID?.trim();
const AUDIO_URL = process.env.TELEGRAM_AUDIO_URL?.trim();
const FEELING_DELAY_MS = Number(process.env.BOT_FEELING_DELAY_MS || 10 * 60 * 1000);
const FOLLOWUP_DELAY_MS = Number(process.env.BOT_FOLLOWUP_DELAY_MS || 24 * 60 * 60 * 1000);
const ADMIN_IDS = new Set(
  (process.env.TELEGRAM_ADMIN_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
);

let lifecycleInitialized = false;
let pollersStarted = false;
let started = false;

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    first_name TEXT,
    step TEXT NOT NULL DEFAULT 'start',
    name TEXT,
    role TEXT,
    pain TEXT,
    feeling TEXT,
    thread_id INTEGER,
    audio_sent_at INTEGER,
    feeling_due_at INTEGER,
    feeling_prompt_sent_at INTEGER,
    followup_sent INTEGER NOT NULL DEFAULT 0,
    book_call_requested INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS message_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    direction TEXT NOT NULL,
    message_type TEXT NOT NULL,
    telegram_message_id INTEGER,
    thread_id INTEGER,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    payload TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
  );
`);

const getSetting = (key: string): string | null => {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? null;
};
const setSetting = (key: string, value: string) => {
  db.prepare(
    "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
  ).run(key, value, Date.now());
};

const adminAwaitingAudio = new Set<number>();

const ensureColumn = (table: string, column: string, definition: string) => {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some((item) => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
};

ensureColumn("users", "feeling_due_at", "INTEGER");
ensureColumn("users", "feeling_prompt_sent_at", "INTEGER");
ensureColumn("users", "book_call_requested", "INTEGER NOT NULL DEFAULT 0");
ensureColumn("users", "created_at", "INTEGER");
ensureColumn("users", "updated_at", "INTEGER");

export const bot = BOT_TOKEN ? new Telegraf(BOT_TOKEN) : null;

const now = () => Date.now();

const formatUserTag = (user: UserRecord) => {
  if (user.username) return `@${user.username}`;
  return `id:${user.id}`;
};

const sanitizeTopicPart = (value: string | null | undefined, fallback: string) => {
  const normalized = (value || "").replace(/\s+/g, " ").trim();
  return normalized || fallback;
};

const getUserById = (userId: number) =>
  db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as UserRecord | undefined;

const getUserByThreadId = (threadId: number) =>
  db.prepare("SELECT * FROM users WHERE thread_id = ?").get(threadId) as UserRecord | undefined;

const ensureUser = (ctx: Context) => {
  if (!ctx.from) return null;

  const existing = getUserById(ctx.from.id);
  if (existing) {
    db.prepare(
      "UPDATE users SET username = ?, first_name = ?, updated_at = ? WHERE id = ?"
    ).run(ctx.from.username || null, ctx.from.first_name || null, now(), ctx.from.id);
    return getUserById(ctx.from.id) || null;
  }

  db.prepare(
    `INSERT INTO users (id, username, first_name, step, created_at, updated_at)
     VALUES (?, ?, ?, 'start', ?, ?)`
  ).run(ctx.from.id, ctx.from.username || null, ctx.from.first_name || null, now(), now());

  return getUserById(ctx.from.id) || null;
};

const updateUser = (userId: number, data: Partial<UserRecord>) => {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined);
  if (!entries.length) return;

  entries.push(["updated_at", now()]);
  const setClause = entries.map(([key]) => `${key} = ?`).join(", ");
  const values = entries.map(([, value]) => value);
  db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`).run(...values, userId);
};

const logEvent = (userId: number, eventType: string, payload?: string) => {
  db.prepare(
    "INSERT INTO events (user_id, event_type, payload, created_at) VALUES (?, ?, ?, ?)"
  ).run(userId, eventType, payload || null, now());
};

const logMessage = (
  userId: number,
  direction: MessageDirection,
  messageType: string,
  telegramMessageId?: number,
  threadId?: number | null
) => {
  db.prepare(
    `INSERT INTO message_logs (user_id, direction, message_type, telegram_message_id, thread_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(userId, direction, messageType, telegramMessageId || null, threadId || null, now());
};

const isAllowedAdmin = (ctx: Context) => {
  if (!ctx.from || ctx.from.is_bot) return false;
  if (!GROUP_ID || ctx.chat?.id.toString() !== GROUP_ID) return false;
  if (!ADMIN_IDS.size) return true;
  return ADMIN_IDS.has(ctx.from.id);
};

const roleKeyboard = () =>
  Markup.keyboard(USER_ROLES.map((role) => [role]))
    .resize()
    .oneTime();

const painKeyboard = () =>
  Markup.keyboard(USER_PAINS.map((pain) => [pain]))
    .resize()
    .oneTime();

const leadActions = () =>
  Markup.inlineKeyboard([
    [Markup.button.url("Узнать о кэмпе", PUBLIC_SITE_URL)],
    [Markup.button.callback("Записаться на разбор", "book_call")],
  ]);

const createTopicTitle = (user: UserRecord) => {
  const name = sanitizeTopicPart(user.name, user.first_name || "Лид");
  const role = sanitizeTopicPart(user.role, "Без роли");
  const username = user.username ? `@${user.username}` : `id${user.id}`;
  return `${name} | ${role} | ${username}`.slice(0, 128);
};

const createLeadCard = (user: UserRecord) =>
  [
    "🔥 <b>Новый лид после практики</b>",
    "",
    `<b>Имя:</b> ${sanitizeTopicPart(user.name, "Не указано")}`,
    `<b>Username:</b> ${user.username ? `@${user.username}` : "нет"}`,
    `<b>Роль:</b> ${sanitizeTopicPart(user.role, "Не указано")}`,
    `<b>Боль:</b> ${sanitizeTopicPart(user.pain, "Не указано")}`,
    `<b>Чувство после практики:</b> ${sanitizeTopicPart(user.feeling, "Не указано")}`,
    `<b>Контакт:</b> ${formatUserTag(user)}`,
  ].join("\n");

const createBookCallAdminText = (user: UserRecord) =>
  `❗️ <b>${sanitizeTopicPart(user.name, "Лид")}</b> нажал(а) «Записаться на разбор».`;

const sendWelcomeMessage = async (ctx: Context) => {
  if (WELCOME_IMAGE_URL && "replyWithPhoto" in ctx) {
    await (ctx as any).replyWithPhoto(
      { url: WELCOME_IMAGE_URL },
      {
        caption: DEFAULT_WELCOME_TEXT,
      }
    );
    return;
  }

  await ctx.reply(DEFAULT_WELCOME_TEXT);
};

const sendAudioPractice = async (ctx: Context, userId: number, threadId?: number | null) => {
  await ctx.reply(AUDIO_INTRO_TEXT, Markup.removeKeyboard());
  logMessage(userId, "bot_to_user", "text", undefined, threadId);

  const storedFileId = getSetting("audio_file_id") || AUDIO_FILE_ID;
  const storedFileType = getSetting("audio_file_type") || "voice";

  if (storedFileId) {
    if (storedFileType === "audio") {
      await (ctx as any).replyWithAudio(storedFileId);
    } else {
      await (ctx as any).replyWithVoice(storedFileId);
    }
    logMessage(userId, "bot_to_user", storedFileType, undefined, threadId);
    return;
  }

  if (AUDIO_URL) {
    await (ctx as any).replyWithVoice({ url: AUDIO_URL });
    logMessage(userId, "bot_to_user", "voice", undefined, threadId);
    return;
  }

  await ctx.reply(
    "Аудио ещё не подключено в окружении. Но мы уже сохранили ваш запрос, и команда сможет продолжить диалог здесь."
  );
  logMessage(userId, "bot_to_user", "text", undefined, threadId);
};

const ensureLeadTopic = async (user: UserRecord) => {
  if (!bot || !GROUP_ID) return user.thread_id;

  if (user.thread_id) return user.thread_id;

  const topic = await bot.telegram.createForumTopic(GROUP_ID, createTopicTitle(user));
  updateUser(user.id, { thread_id: topic.message_thread_id });
  logEvent(user.id, "topic_created", JSON.stringify({ threadId: topic.message_thread_id }));
  return topic.message_thread_id;
};

const sendLeadCardToAdmins = async (user: UserRecord) => {
  if (!bot || !GROUP_ID) return;

  const threadId = await ensureLeadTopic(user);
  if (!threadId) return;

  const sent = await bot.telegram.sendMessage(GROUP_ID, createLeadCard(user), {
    message_thread_id: threadId,
    parse_mode: "HTML",
  });

  logMessage(user.id, "bot_to_admin", "lead_card", sent.message_id, threadId);
};

const sendFeelingPromptToUser = async (user: UserRecord) => {
  if (!bot) return;
  if (user.feeling_prompt_sent_at) return;

  await bot.telegram.sendMessage(user.id, FEELING_PROMPT);
  updateUser(user.id, {
    step: "ask_feeling",
    feeling_prompt_sent_at: now(),
  });
  logEvent(user.id, "feeling_prompt_sent");
  logMessage(user.id, "bot_to_user", "text", undefined, user.thread_id);
};

const sendFollowupToUser = async (user: UserRecord) => {
  if (!bot) return;
  if (user.followup_sent || user.book_call_requested) return;

  await bot.telegram.sendMessage(user.id, FOLLOWUP_TEXT, {
    parse_mode: "HTML",
    reply_markup: leadActions().reply_markup,
  });

  updateUser(user.id, { followup_sent: 1 });
  logEvent(user.id, "followup_sent");
  logMessage(user.id, "bot_to_user", "followup", undefined, user.thread_id);
};

const processScheduledMessages = async () => {
  if (!bot) return;

  const currentTime = now();

  const usersWaitingFeeling = db
    .prepare(
      `SELECT * FROM users
       WHERE step = 'waiting_audio'
         AND feeling_due_at IS NOT NULL
         AND feeling_due_at <= ?
         AND feeling_prompt_sent_at IS NULL`
    )
    .all(currentTime) as UserRecord[];

  for (const user of usersWaitingFeeling) {
    try {
      await sendFeelingPromptToUser(user);
    } catch (error) {
      console.error(`Failed to send feeling prompt to user ${user.id}`, error);
      logEvent(user.id, "feeling_prompt_failed", String(error));
    }
  }

  const usersToFollowup = db
    .prepare(
      `SELECT * FROM users
       WHERE step = 'finished'
         AND audio_sent_at IS NOT NULL
         AND audio_sent_at <= ?
         AND followup_sent = 0`
    )
    .all(currentTime - FOLLOWUP_DELAY_MS) as UserRecord[];

  for (const user of usersToFollowup) {
    try {
      await sendFollowupToUser(user);
    } catch (error) {
      console.error(`Failed to send follow-up to user ${user.id}`, error);
      logEvent(user.id, "followup_failed", String(error));
    }
  }
};

const forwardGroupTextToUser = async (ctx: Context, user: UserRecord) => {
  if (!bot || !("message" in ctx) || !ctx.message || !("text" in ctx.message)) return;
  const sent = await bot.telegram.sendMessage(user.id, ctx.message.text);
  logMessage(user.id, "admin_to_user", "text", sent.message_id, user.thread_id);
};

const copyGroupMediaToUser = async (ctx: Context, user: UserRecord) => {
  if (!bot || !("message" in ctx) || !ctx.message) return;
  const sent = await bot.telegram.copyMessage(user.id, ctx.chat!.id, ctx.message.message_id);
  const messageType = Object.keys(ctx.message).find((key) =>
    ["photo", "voice", "document", "video", "audio"].includes(key)
  );
  logMessage(user.id, "admin_to_user", messageType || "media", sent.message_id, user.thread_id);
};

const copyPrivateMessageToTopic = async (ctx: Context, user: UserRecord) => {
  if (!bot || !GROUP_ID || !("message" in ctx) || !ctx.message) return;

  const threadId = await ensureLeadTopic(user);
  if (!threadId) return;

  const sent = await bot.telegram.copyMessage(GROUP_ID, ctx.chat!.id, ctx.message.message_id, {
    message_thread_id: threadId,
  });

  const messageType = "text" in ctx.message
    ? "text"
    : Object.keys(ctx.message).find((key) =>
        ["photo", "voice", "document", "video", "audio"].includes(key)
      ) || "media";

  logMessage(user.id, "user_to_admin", messageType, sent.message_id, threadId);
};

const handlePrivateText = async (ctx: Context) => {
  if (ctx.chat?.type !== "private" || !("message" in ctx) || !ctx.message || !("text" in ctx.message)) {
    return;
  }

  const user = ensureUser(ctx);
  if (!user) return;

  const text = ctx.message.text.trim();

  if (user.step === "ask_name") {
    updateUser(user.id, { name: text, step: "ask_role" });
    logEvent(user.id, "name_received", text);
    await ctx.reply("Отлично. Выберите вашу текущую роль:", roleKeyboard());
    logMessage(user.id, "bot_to_user", "text");
    return;
  }

  if (user.step === "ask_role") {
    updateUser(user.id, { role: text, step: "ask_pain" });
    logEvent(user.id, "role_received", text);
    await ctx.reply("Что сейчас откликается больше всего?", painKeyboard());
    logMessage(user.id, "bot_to_user", "text");
    return;
  }

  if (user.step === "ask_pain") {
    const scheduledFeelingTime = now() + FEELING_DELAY_MS;
    updateUser(user.id, {
      pain: text,
      step: "waiting_audio",
      audio_sent_at: now(),
      feeling_due_at: scheduledFeelingTime,
      feeling_prompt_sent_at: null,
      followup_sent: 0,
    });
    logEvent(user.id, "pain_received", text);
    await sendAudioPractice(ctx, user.id, user.thread_id);
    return;
  }

  if (user.step === "ask_feeling" || user.step === "waiting_audio") {
    updateUser(user.id, {
      feeling: text,
      step: "finished",
    });
    logEvent(user.id, "feeling_received", text);
    await ctx.reply(AFTER_FEELING_TEXT, leadActions());
    logMessage(user.id, "bot_to_user", "text");

    const updatedUser = getUserById(user.id);
    if (updatedUser) {
      await sendLeadCardToAdmins(updatedUser);
    }
    return;
  }

  if (user.step === "finished") {
    await copyPrivateMessageToTopic(ctx, user);
  }
};

const handlePrivateMedia = async (ctx: Context) => {
  if (ctx.chat?.type !== "private" || !("message" in ctx) || !ctx.message) return;

  const fromId = ctx.from?.id;
  if (fromId && adminAwaitingAudio.has(fromId) && isAdminUser(fromId)) {
    const msg: any = ctx.message;
    let fileId: string | null = null;
    let fileType: "voice" | "audio" | null = null;
    if (msg.voice?.file_id) {
      fileId = msg.voice.file_id;
      fileType = "voice";
    } else if (msg.audio?.file_id) {
      fileId = msg.audio.file_id;
      fileType = "audio";
    }
    if (fileId && fileType) {
      setSetting("audio_file_id", fileId);
      setSetting("audio_file_type", fileType);
      setSetting("audio_updated_at", String(Date.now()));
      adminAwaitingAudio.delete(fromId);
      await ctx.reply(
        `✅ Аудио-практика сохранена.\nТип: ${fileType}\nfile_id: ${fileId}\n\nПроверка: /audiotest\nИнфо: /audioinfo`
      );
      return;
    }
    await ctx.reply("Нужно voice-сообщение или аудио-файл. Отмена: /cancelaudio");
    return;
  }

  const user = ensureUser(ctx);
  if (!user || !user.thread_id) return;
  if (user.step !== "finished") return;

  await copyPrivateMessageToTopic(ctx, user);
};

const handleGroupText = async (ctx: Context) => {
  if (!GROUP_ID || !("message" in ctx) || !ctx.message || !("text" in ctx.message)) return;
  if (ctx.chat?.id.toString() !== GROUP_ID) return;
  if (!ctx.message.message_thread_id) return;
  if (!isAllowedAdmin(ctx)) return;

  const user = getUserByThreadId(ctx.message.message_thread_id);
  if (!user) return;

  await forwardGroupTextToUser(ctx, user);
};

const handleGroupMedia = async (ctx: Context) => {
  if (!GROUP_ID || !("message" in ctx) || !ctx.message) return;
  if (ctx.chat?.id.toString() !== GROUP_ID) return;
  if (!ctx.message.message_thread_id) return;
  if (!isAllowedAdmin(ctx)) return;

  const user = getUserByThreadId(ctx.message.message_thread_id);
  if (!user) return;

  await copyGroupMediaToUser(ctx, user);
};

const isAdminUser = (userId?: number) => {
  if (!userId) return false;
  if (!ADMIN_IDS.size) return false;
  return ADMIN_IDS.has(userId);
};

// --- Yandex.Metrika analytics ---

const YANDEX_METRIKA_COUNTER_ID = process.env.YANDEX_METRIKA_COUNTER_ID?.trim() || "108536568";
const YANDEX_METRIKA_OAUTH = process.env.YANDEX_METRIKA_OAUTH_TOKEN?.trim();

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return "—";
  return Math.round(value).toLocaleString("ru-RU");
};

type MetrikaRow = { metrics: number[] };

const fetchMetrika = async (from: Date, to: Date, metrics: string[]) => {
  if (!YANDEX_METRIKA_OAUTH) throw new Error("YANDEX_METRIKA_OAUTH_TOKEN не задан в .env");
  const params = new URLSearchParams({
    ids: YANDEX_METRIKA_COUNTER_ID,
    date1: formatDate(from),
    date2: formatDate(to),
    metrics: metrics.join(","),
    accuracy: "full",
  });
  const url = `https://api-metrika.yandex.net/stat/v1/data?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `OAuth ${YANDEX_METRIKA_OAUTH}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { totals?: number[]; data?: MetrikaRow[] };
  return data.totals || data.data?.[0]?.metrics || [];
};

const buildAnalyticsReport = async (): Promise<string> => {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const weekAgo = new Date(today); weekAgo.setUTCDate(today.getUTCDate() - 6);
  const monthAgo = new Date(today); monthAgo.setUTCDate(today.getUTCDate() - 29);
  const quarterAgo = new Date(today); quarterAgo.setUTCDate(today.getUTCDate() - 89);

  const metrics = ["ym:s:visits", "ym:s:users", "ym:s:pageviews", "ym:s:avgVisitDurationSeconds", "ym:s:bounceRate"];
  const periods: Array<[string, Date, Date]> = [
    ["Сегодня", today, today],
    ["Неделя", weekAgo, today],
    ["Месяц", monthAgo, today],
    ["Квартал", quarterAgo, today],
  ];

  const results: Array<[string, number[]]> = [];
  for (const [label, from, to] of periods) {
    const totals = await fetchMetrika(from, to, metrics);
    results.push([label, totals]);
  }

  const lines = [
    "📊 <b>Статистика сайта otragenie-camp.ru</b>",
    `<i>Счётчик Яндекс.Метрики ${YANDEX_METRIKA_COUNTER_ID}</i>`,
    "",
  ];
  for (const [label, m] of results) {
    const [visits = 0, users = 0, views = 0, duration = 0, bounce = 0] = m;
    const mmss = `${Math.floor(duration / 60)}:${String(Math.round(duration % 60)).padStart(2, "0")}`;
    lines.push(
      `<b>${label}</b>`,
      `  визиты: ${formatNumber(visits)} · посетители: ${formatNumber(users)}`,
      `  просмотры: ${formatNumber(views)} · длит.: ${mmss} · отказы: ${bounce ? bounce.toFixed(1) : "0"}%`,
      ""
    );
  }
  lines.push(`<a href="https://metrika.yandex.ru/dashboard?id=${YANDEX_METRIKA_COUNTER_ID}">Открыть в Метрике →</a>`);
  return lines.join("\n");
};

if (bot) {
  bot.command("setaudio", async (ctx) => {
    if (ctx.chat.type !== "private") return;
    if (!isAdminUser(ctx.from?.id)) {
      await ctx.reply("Команда доступна только администраторам. Добавьте свой Telegram ID в TELEGRAM_ADMIN_IDS.");
      return;
    }
    adminAwaitingAudio.add(ctx.from!.id);
    await ctx.reply(
      "Жду аудио-практику. Пришлите voice-сообщение или аудио-файл следующим сообщением.\nОтмена: /cancelaudio"
    );
  });

  bot.command("cancelaudio", async (ctx) => {
    if (ctx.chat.type !== "private") return;
    if (!ctx.from) return;
    if (adminAwaitingAudio.delete(ctx.from.id)) {
      await ctx.reply("Ожидание аудио отменено.");
    } else {
      await ctx.reply("Нет активного режима загрузки аудио.");
    }
  });

  bot.command("audioinfo", async (ctx) => {
    if (ctx.chat.type !== "private") return;
    if (!isAdminUser(ctx.from?.id)) return;
    const fid = getSetting("audio_file_id") || AUDIO_FILE_ID;
    const ftype = getSetting("audio_file_type") || (AUDIO_FILE_ID ? "voice" : "—");
    const updated = getSetting("audio_updated_at");
    await ctx.reply(
      `Текущая аудио-практика:\nfile_id: ${fid || "не задан"}\nтип: ${ftype}\nобновлено: ${updated ? new Date(Number(updated)).toLocaleString("ru-RU") : "—"}`
    );
  });

  bot.command("audiotest", async (ctx) => {
    if (ctx.chat.type !== "private") return;
    if (!isAdminUser(ctx.from?.id)) return;
    const fid = getSetting("audio_file_id") || AUDIO_FILE_ID;
    const ftype = getSetting("audio_file_type") || "voice";
    if (!fid) {
      await ctx.reply("Аудио ещё не загружено. /setaudio");
      return;
    }
    if (ftype === "audio") await (ctx as any).replyWithAudio(fid);
    else await (ctx as any).replyWithVoice(fid);
  });

  bot.command("prices", async (ctx) => {
    if (ctx.chat.type !== "private") return;
    if (!isAdminUser(ctx.from?.id)) return;
    const lines = [
      "💰 <b>Текущие тарифы</b>",
      "",
      "• <b>База</b> — 149 000 ₽",
      "• <b>Полный</b> — 179 000 ₽",
      "• <b>Премиум</b> — 249 000 ₽",
      "",
      "Подробности и сравнение: https://otragenie-camp.ru/#pricing",
    ];
    await ctx.reply(lines.join("\n"), { parse_mode: "HTML" } as any);
  });

  bot.command("dates", async (ctx) => {
    if (ctx.chat.type !== "private") return;
    if (!isAdminUser(ctx.from?.id)) return;
    const lines = [
      "📅 <b>Дата мероприятия</b>",
      "",
      "<b>19 — 21 июня 2026</b>",
      "Красная Поляна",
      "Глэмпинг «Дзен рекавери»",
      "",
      "Группа: до 10 человек",
    ];
    await ctx.reply(lines.join("\n"), { parse_mode: "HTML" } as any);
  });

  bot.command(["analytics", "stats"], async (ctx) => {
    if (ctx.chat.type !== "private") return;
    if (!isAdminUser(ctx.from?.id)) return;
    await ctx.reply("⏳ Собираю статистику сайта…");
    try {
      const report = await buildAnalyticsReport();
      await ctx.reply(report, { parse_mode: "HTML", disable_web_page_preview: true } as any);
    } catch (error: any) {
      console.error("analytics error:", error);
      await ctx.reply(`⚠️ Не удалось получить статистику: ${error?.message || "неизвестная ошибка"}`);
    }
  });

  bot.start(async (ctx) => {
    if (ctx.chat.type !== "private") return;

    const user = ensureUser(ctx);
    if (!user) return;

    updateUser(user.id, {
      step: "ask_name",
      name: null,
      role: null,
      pain: null,
      feeling: null,
      thread_id: null,
      audio_sent_at: null,
      feeling_due_at: null,
      feeling_prompt_sent_at: null,
      followup_sent: 0,
      book_call_requested: 0,
    });

    logEvent(user.id, "bot_started");
    await sendWelcomeMessage(ctx);
  });

  bot.on("text", async (ctx) => {
    if (ctx.from?.is_bot) return;

    if (ctx.chat?.type === "private") {
      await handlePrivateText(ctx);
      return;
    }

    await handleGroupText(ctx);
  });

  bot.on(["photo", "voice", "document", "video", "audio"], async (ctx) => {
    if (ctx.from?.is_bot) return;

    if (ctx.chat?.type === "private") {
      await handlePrivateMedia(ctx);
      return;
    }

    await handleGroupMedia(ctx);
  });

  bot.action("book_call", async (ctx) => {
    await ctx.answerCbQuery();

    const user = ensureUser(ctx);
    if (!user) return;

    updateUser(user.id, { book_call_requested: 1 });
    logEvent(user.id, "book_call_requested");

    await ctx.reply(BOOK_CALL_ACK);
    logMessage(user.id, "bot_to_user", "text");

    const updatedUser = getUserById(user.id);
    if (!updatedUser || !GROUP_ID) return;

    const threadId = await ensureLeadTopic(updatedUser);
    if (!threadId) return;

    const sent = await bot.telegram.sendMessage(GROUP_ID, createBookCallAdminText(updatedUser), {
      message_thread_id: threadId,
      parse_mode: "HTML",
    });

    logMessage(updatedUser.id, "bot_to_admin", "book_call", sent.message_id, threadId);
  });

  bot.catch((err, ctx) => {
    console.error(`Bot error on update ${ctx.updateType}`, err);
  });
}

const initLifecycle = () => {
  if (lifecycleInitialized || !bot) return;
  lifecycleInitialized = true;

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
};

const startPollers = () => {
  if (pollersStarted || !bot) return;
  pollersStarted = true;

  setInterval(() => {
    processScheduledMessages().catch((error) => {
      console.error("Scheduled bot task failed", error);
    });
  }, 60 * 1000);

  processScheduledMessages().catch((error) => {
    console.error("Initial scheduled bot task failed", error);
  });
};

export const startBot = async () => {
  if (!bot) {
    console.warn("Telegram bot is disabled: TELEGRAM_BOT_TOKEN is not configured.");
    return;
  }

  if (!GROUP_ID) {
    console.warn("Telegram bot is disabled: TELEGRAM_CHAT_ID is not configured.");
    return;
  }

  if (started) return;

  initLifecycle();
  startPollers();

  try {
    await bot.launch();
    started = true;
    console.log("Telegram bot started");
  } catch (error) {
    console.error("Failed to start Telegram bot", error);
  }
};
