# CLAUDE.md

Справочник для агентов Claude Code по проекту **Otragenie Camp** — промо-сайт и коммуникационная платформа терапевтического кэмпа «Отражение» (19–21 июня 2026, Красная Поляна, глэмпинг «Дзен рекавери»).

## Обзор

Монорепозиторий из трёх слоёв, запускаемых одним процессом через [server.ts](server.ts):

1. **Лендинг** — React 19 + Vite 6 + TypeScript + Tailwind 4 + Motion.
2. **Express API** — Prodamus (оплата), Telegram-нотификации, health.
3. **Telegram-бот** — Telegraf + better-sqlite3, ведёт воронку и синхронизирует переписку с forum-topic в группе.

На сайте работает голосовой AI-ассистент на Gemini (`@google/genai`, `gemini-2.5-flash`) с function calling для генерации платёжных ссылок. Ссылка формируется через `/api/prodamus/pay` (не локально).

## Ключевые файлы

- [server.ts](server.ts) — Express + Vite middleware + bootstrap бота. Endpoints: `/api/health`, `/api/prodamus/pay`, `/api/prodamus/webhook` (raw body + HMAC-SHA256 верификация), `/api/telegram/notify`.
- [bot.ts](bot.ts) — Telegraf-сценарий, SQLite-состояния пользователей (таблицы `users`, `message_logs`, `events`, `settings`), forum topics, follow-up через 24ч. Админ-команды: `/setaudio`, `/cancelaudio`, `/audioinfo`, `/audiotest`, `/analytics`, `/prices`, `/dates`, `/docs`.
- [src/App.tsx](src/App.tsx) — главный лендинг, модалки, все секции-превью (крупный, кандидат на разбиение).
- [src/App.v1.tsx](src/App.v1.tsx) — замороженный снимок первой версии, отдаётся на `/v1`.
- [src/main.tsx](src/main.tsx) — роутер на основе `window.location.pathname` (без react-router).
- [src/components/ChatAssistant.tsx](src/components/ChatAssistant.tsx) — голосовой AI-ассистент (микрофон FAB, Web Speech API, TTS, пульсация каждые 30 сек, автооткрытие через 2 мин).
- [src/ai-config.ts](src/ai-config.ts) — системный промпт (полный контент сайта) и function declarations для Gemini.
- [src/data.ts](src/data.ts) — контент: PAINS, WHAT_HAPPENS, AUTHORS, PROCESS, PROGRAM, CASES, FOR_WHO, RESULTS, STATS, PRICING.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — подробная техническая схема.

## Маршруты (window.location.pathname)

- `/` — основной лендинг (App)
- `/v1` — замороженный первый вариант
- `/doc` — документация (пароль `otragenie888camp`)
- `/sections` — индекс черновиков секций
- `/hero-sections`, `/about-sections`, `/process-sections`, `/philosophy-sections`, `/authors-sections`, `/metodology-sections`, `/program-sections`, `/location-sections`, `/testimonials-sections`, `/leadmagnit-sections`, `/for-who-sections`, `/result-sections`, `/pricing-sections`, `/faq-sections`, `/final-sections`, `/footer-sections` — по 4–5 вариантов каждой секции

## Команды

```bash
npm run dev      # tsx server.ts — бот + API + Vite middleware на :3000
npm run build    # vite build + esbuild server.ts -> dist/server.cjs
npm run start    # node dist/server.cjs
npm run lint     # tsc --noEmit (без eslint)
```

Тестов нет. `npm run clean` использует `rm -rf` — под Windows запускать из bash.

## Деплой на продакшен

```bash
npm run build
scp -r dist/. root@31.44.7.144:/var/www/otragenie-camp.ru/dist/
ssh root@31.44.7.144 "pm2 restart otragenie-camp"
```

Убить старый процесс если занят порт: `netstat -ano | grep :3000` → `taskkill //F //PID <pid>`

## Окружение

Переменные читаются из `.env` / `.env.local` (см. [.env.example](.env.example)):

- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_TOPIC_ID` — бот и нотификации.
- `TELEGRAM_LEADS_TOPIC_ID` — топик для лидов с сайта (по умолчанию `2`, t.me/c/3978251165/2).
- `TELEGRAM_ADMIN_IDS` — comma-separated user IDs, которым разрешены админ-команды бота.
- `TELEGRAM_AUDIO_FILE_ID` / `TELEGRAM_AUDIO_URL` — фолбэк для аудио-практики, если не задан через `/setaudio` в БД (`settings.audio_file_id`).
- `PRODAMUS_URL`, `PRODAMUS_SECRET_KEY` — оплата и верификация webhook.
- `GEMINI_API_KEY` — сервер; `VITE_GEMINI_API_KEY` — фронтенд (проброс также в [vite.config.ts](vite.config.ts)).
- `PUBLIC_SITE_URL` — для кнопок бота.
- `YANDEX_METRIKA_COUNTER_ID`, `YANDEX_METRIKA_OAUTH_TOKEN` — аналитика для команды `/analytics`.

SQLite-файл `bot.db` создаётся в корне при первом запуске бота (untracked). Для продакшена держать персистентным.

## Prodamus (оплата)

- `/api/prodamus/pay` — принимает `{ tariffName, price, contact, name }`, возвращает `{ paymentUrl }`. Используется и модалкой бронирования, и AI-ассистентом.
- `/api/prodamus/webhook` — **raw body**, HMAC-SHA256 от тела по `PRODAMUS_SECRET_KEY` сравнивается с заголовком `Sign`. При совпадении и `payment_status === 'success'` — уведомление в Telegram-группу.
- URL вебхука в кабинете Prodamus: `https://otragenie-camp.ru/api/prodamus/webhook`.
- Пока не задан `PRODAMUS_URL` — `/api/prodamus/pay` возвращает 500, ассистент показывает «не удалось сгенерировать ссылку».

## Telegram-бот

Сценарий: `/start` → имя → роль → боль → **сразу создаётся forum-topic** + earlyCard → аудио-практика → через N минут «какое слово/чувство?» → lead card → через 24 ч follow-up.

Пересылка сообщений: пользователь пишет в личку боту → копируется в его топик в группе. Админ отвечает в топике → копируется пользователю в личку. Если топик создать нельзя (нет прав "Manage Topics") — сообщения падают в `TELEGRAM_LEADS_TOPIC_ID` как fallback.

Бот требует права **"Управление темами" (Manage Topics)** в супергруппе для создания forum-topic под каждого лида.

Админ-команды (только в личке, только для `TELEGRAM_ADMIN_IDS`):
- `/setaudio` — переводит в режим ожидания; следующее voice/audio сохраняется в `settings.audio_file_id`.
- `/cancelaudio` — выйти из режима.
- `/audioinfo` — показать текущий file_id / тип / дату.
- `/audiotest` — прислать сохранённое аудио себе.
- `/analytics` — статистика Яндекс.Метрики за 7 дней.
- `/prices` — актуальные тарифы из `PRICING`.
- `/dates` — даты кэмпа.
- `/docs` — ссылка на документацию (magic-token bypass).

## Голосовой AI-ассистент

- FAB: микрофон в коричневом круге, фиксированный bottom-right.
- Пульсация каждые 30 секунд для привлечения внимания.
- Автооткрытие через 2 минуты с приветствием (озвучивается голосом).
- Зажать кнопку → говорить → отпустить → Gemini обрабатывает → ответ озвучивается TTS.
- Кнопка Volume2/VolumeX для включения/выключения голоса.
- Поддержка: Chrome/Edge (Web Speech API). В Safari/Firefox голосовой ввод недоступен.

## Подводные камни

- [src/App.tsx](src/App.tsx) большой и содержит все превью-страницы — кандидат на разбиение.
- `better-sqlite3` — нативный модуль; при деплое на Linux нужна пересборка (`npm ci` на сервере).
- На Windows `rm -rf` из `npm run clean` работает только из bash.
- `createForumTopic` требует прав "Manage Topics" у бота в группе. Без них — fallback на leads topic.
- Голосовой ввод (SpeechRecognition) работает только по HTTPS и только в Chrome/Edge.
- `index.html` содержит `user-scalable=no` для блокировки зума на мобильных.

## Конвенции

- TypeScript, ESM (`"type": "module"`).
- Русскоязычный UI-контент в [src/data.ts](src/data.ts) и JSX.
- Сервер и бот стартуют из одной точки входа — не запускать бота отдельным процессом.
- Секреты — только через env, не коммитить `.env*` кроме `.env.example`.
- Платформа разработки — Windows; в bash использовать forward slashes и `/dev/null`.
- Главная ветка: `main`. Git user: `ircitdev`.
- Перед коммитом прогонять `npm run lint`.
- Scroll-reveal анимации через компонент `Reveal` (motion/react, `whileInView`, `once: true`).

## Продакшен

- Сервер: `root@31.44.7.144`, домен `otragenie-camp.ru`.
- PM2 процесс: `otragenie-camp` (id 12).
- Деплой: `npm run build` → `scp dist/` → `pm2 restart otragenie-camp`.
- Nginx проксирует `/` и `/api/*` на `127.0.0.1:3000`, отдаёт webhook как raw (`client_max_body_size` ≥ 1M).
