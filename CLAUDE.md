# CLAUDE.md

Справочник для агентов Claude Code по проекту **Otragenie Camp** — промо-сайт и коммуникационная платформа кэмпа «Отражение» (19–21 июня 2026, Красная Поляна, глэмпинг «Дзен рекавери»).

## Обзор

Монорепозиторий из трёх слоёв, запускаемых одним процессом через [server.ts](server.ts):

1. **Лендинг** — React 19 + Vite 6 + TypeScript + Tailwind 4 + Motion.
2. **Express API** — Prodamus (оплата), Telegram-нотификации, health.
3. **Telegram-бот** — Telegraf + better-sqlite3, ведёт воронку и синхронизирует переписку с forum-topic в группе.

На сайте работает голосовой AI-ассистент на Gemini (`@google/genai`, `gemini-2.5-flash`) с function calling для генерации платёжных ссылок. Ссылка формируется через `/api/prodamus/pay` (не локально).

## Ключевые файлы

- [server.ts](server.ts) — Express + Vite middleware + bootstrap бота. Endpoints: `/api/health`, `/api/prodamus/pay`, `/api/prodamus/webhook` (raw body + HMAC-SHA256 верификация), `/api/telegram/notify`, `/api/livechat/start`, `/api/livechat/message`, `/api/livechat/poll`.
- [bot.ts](bot.ts) — Telegraf-сценарий, SQLite-состояния пользователей (таблицы `users`, `message_logs`, `events`, `settings`, `livechat_sessions`, `livechat_messages`), forum topics, follow-up через 24ч. Админ-команды: `/setaudio`, `/cancelaudio`, `/audioinfo`, `/audiotest`, `/analytics`, `/prices`, `/dates`, `/docs`.
- [src/App.tsx](src/App.tsx) — главный лендинг (`/`), модалки, все секции-превью (крупный, кандидат на разбиение).
- [src/App.v3.tsx](src/App.v3.tsx) — **актуальная рабочая версия** (`/v3`): тексты по ТЗ, 14 экранов, галерея локации, LiveChat, JourneyPath, новые секции.
- [src/App.v1.tsx](src/App.v1.tsx) — замороженный снимок первой версии, отдаётся на `/v1`.
- [src/main.tsx](src/main.tsx) — роутер на основе `window.location.pathname` (без react-router).
- [src/components/ChatAssistant.tsx](src/components/ChatAssistant.tsx) — голосовой AI-ассистент (микрофон FAB, Web Speech API, TTS, пульсация каждые 30 сек, автооткрытие через 2 мин).
- [src/components/LiveChat.tsx](src/components/LiveChat.tsx) — виджет живого менеджера (FAB зелёный, имя → чат, поллинг ответов каждые 3 сек через `/api/livechat/*`).
- [src/ai-config.ts](src/ai-config.ts) — системный промпт (полный контент сайта) и function declarations для Gemini.
- [src/data.ts](src/data.ts) — контент: PAINS, WHAT_HAPPENS, AUTHORS, PROCESS, PROGRAM, CASES, FOR_WHO, RESULTS, STATS, PRICING.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — подробная техническая схема.
- [docs/ПРАВКИ_15-19-04-2026.md](docs/ПРАВКИ_15-19-04-2026.md) — журнал правок по ТЗ и переписке команды.

## Маршруты (window.location.pathname)

- `/` — основной лендинг (App.tsx)
- `/v3` — **актуальная рабочая версия** (App.v3.tsx) — тексты по ТЗ, 14 экранов, LiveChat
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

**Предпочтительный способ** — сборка прямо на сервере (esbuild установлен там):

```bash
git push origin main
ssh root@31.44.7.144 "cd /var/www/otragenie-camp.ru && git pull origin main && npm ci && npm run build && pm2 restart otragenie-camp"
```

**Альтернатива** — локальная сборка + scp (требует esbuild локально):

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

## LiveChat (живой менеджер)

- FAB зелёного цвета, фиксированный `bottom-24` (над AI-ботом).
- Фаза 1: ввод имени → фаза 2: чат с поллингом ответов каждые 3 сек.
- `POST /api/livechat/start` → создаёт сессию и forum-topic в TG-группе.
- `POST /api/livechat/message` → кладёт сообщение в `livechat_messages`, пересылает в топик.
- `GET /api/livechat/poll?sessionId=&after=` → возвращает ответы менеджера.
- Менеджер отвечает в TG-топике → `handleGroupText` в `bot.ts` определяет livechat-топик и кладёт ответ в очередь.
- SQLite таблицы: `livechat_sessions`, `livechat_messages`.

## Голосовой AI-ассистент

- FAB: микрофон в коричневом круге, фиксированный bottom-right.
- Пульсация каждые 30 секунд для привлечения внимания.
- Автооткрытие через 2 минуты с приветствием (озвучивается голосом).
- Зажать кнопку → говорить → отпустить → Gemini обрабатывает → ответ озвучивается TTS.
- Кнопка Volume2/VolumeX для включения/выключения голоса.
- Поддержка: Chrome/Edge (Web Speech API). В Safari/Firefox голосовой ввод недоступен.

## Подводные камни

- [src/App.tsx](src/App.tsx) большой и содержит все превью-страницы — кандидат на разбиение.
- **Активная разработка ведётся в [src/App.v3.tsx](src/App.v3.tsx)** — не путать с `App.tsx`.
- `better-sqlite3` — нативный модуль; при деплое на Linux нужна пересборка (`npm ci` на сервере).
- `esbuild` установлен только на сервере (`devDependency`); локальный `npm run build` без него упадёт — деплоить через `git push` + сборку на сервере.
- На Windows `rm -rf` из `npm run clean` работает только из bash.
- `createForumTopic` требует прав "Manage Topics" у бота в группе. Без них — fallback на leads topic.
- Голосовой ввод (SpeechRecognition) работает только по HTTPS и только в Chrome/Edge.
- `index.html` содержит `user-scalable=no` для блокировки зума на мобильных.
- Слово «терапевтическая/терапевтический» **запрещено** на сайте юридически (нет мед. лицензии) — использовать «интенсив», «глубинная работа», «выезд».

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

---

## Claude Code — скиллы и команды

Глобально установленные скиллы (`~/.claude/skills/`). Вызываются через `/skill-name` в чате.

### Дизайн и UI — создание с нуля

| Скилл | Когда использовать |
|---|---|
| `/impeccable teach` | Первый запуск в проекте — собирает дизайн-контекст в `.impeccable.md` |
| `/impeccable craft [описание]` | Создать новый компонент/секцию с нуля — bold эстетика, без AI-клише |
| `/impeccable shape [описание]` | Спланировать UX фичи перед кодом — интервью + дизайн-бриф |
| `/frontend-design` | Альтернатива impeccable — производственный React/Tailwind UI |
| `/ui-design-pro` | OKLCH-палитры, правила тёмной темы, 11 micro-interaction паттернов |
| `/mobile-app-ui-design` | Мобильные макеты: thumb-zone, 8pt grid, peak-end rule |
| `/canvas-design` | Маркетинговые ассеты (OG-изображения, постеры) — не код, а PNG/PDF |
| `/theme-factory` | Быстро применить одну из 10 готовых цветовых тем |

### Дизайн — улучшение существующего

| Скилл | Когда использовать |
|---|---|
| `/impeccable polish` | Финальный прогон перед шипом: выравнивание, отступы, micro-детали |
| `/impeccable bolder` | Сделать дизайн смелее и выразительнее |
| `/impeccable quieter` | Приглушить перегруженный дизайн |
| `/impeccable distill` | Упростить до сути — убрать лишнее |
| `/impeccable animate` | Добавить осмысленные анимации и micro-interactions |
| `/impeccable colorize` | Добавить цвет в монохромный интерфейс |
| `/impeccable typeset` | Улучшить типографику: шрифты, иерархия, читаемость |
| `/impeccable layout` | Исправить сетку, отступы, визуальный ритм |
| `/impeccable adapt` | Адаптация под разные экраны/контексты |
| `/impeccable optimize` | Производительность: LCP, bundle, анимации |

### Дизайн — аудит и оценка

| Скилл | Когда использовать |
|---|---|
| `/impeccable critique` | UX-оценка по эвристикам Нильсена |
| `/impeccable audit` | Технический аудит: a11y, перф, responsive, anti-patterns |
| `/ux-audit-rethink` | Глубокий UX-аудит с переосмыслением структуры |
| `/don-norman-principles-audit` | Проверка по принципам Нормана (affordance, feedback, mapping) |
| `/heuristic-evaluation` | Систематическая оценка по 10 эвристикам |
| `/verification-before-shipping` | Финальная проверка перед деплоем — доказательная, не «я думаю» |

### Конверсия и психология

| Скилл | Когда использовать |
|---|---|
| `/ux-psychology-skill` | 65 психологических принципов с JSX-примерами для страницы тарифов и онбординга |
| `/hooked-ux` | Hook Model (Trigger→Action→Reward→Investment) для вовлечения и удержания |
| `/cognitive-load-assessment` | Оценка когнитивной нагрузки на экране |
| `/error-prevention-recovery` | Проектирование состояний ошибок и восстановления |

### Дизайн-система и токены

| Скилл | Когда использовать |
|---|---|
| `/token-architecture` | Трёхуровневая система токенов (primitive/semantic/component) для Tailwind |
| `/ds-color-system` | Построить цветовую систему с CSS-переменными |
| `/ds-typography-scale` | Типографическая шкала |
| `/ds-spacing-system` | Система отступов (4pt/8pt grid) |
| `/ds-dark-mode-design` | Тёмная тема с правильными контрастами |
| `/motion-choreography` | Easing-кривые, тайминги, stagger-паттерны для анимаций |
| `/ds-micro-interaction-spec` | Спецификация micro-interactions |
| `/design-token-audit` | Аудит существующих токенов на консистентность |

### AI-интерфейс (ChatAssistant / LiveChat)

| Скилл | Когда использовать |
|---|---|
| `/system-prompt-structure` | Архитектура системного промпта для `src/ai-config.ts` |
| `/persona-architecture` | Характер, голос и модель отношений AI-ассистента |
| `/tone-calibration` | Настройка тона под контекст (тёплый/формальный) |
| `/conversation-patterns` | Паттерны диалогов: уточнение, подтверждение, turn-taking |
| `/multimodal-orchestration` | Голос + текст + визуал — для ChatAssistant с микрофоном |
| `/escalation-design` | Когда AI должен передать диалог живому менеджеру (LiveChat) |
| `/guardrail-design` | Технические и UX-гарантии безопасного поведения AI |
| `/error-personality` | Как AI коммуницирует ошибки в характере персонажа |

### Из скриншотов референсов → React код

| Команда | Когда использовать |
|---|---|
| `/extract-it` | Положить скриншоты в `/inspiration/` → получить анализ стиля |
| `/expand-it` | Углубить анализ референсов |
| `/merge-it` | Слить анализ с концепцией проекта → `styles.md` |
| `/design-it` | По `styles.md` сгенерировать 3 варианта React+Tailwind экрана |

**Рабочий процесс:** скриншоты в `/inspiration/` → `/extract-it` → `/merge-it` → `/design-it`

### MCP-сервер reactbits (анимированные компоненты)

Подключён локально к проекту. Даёт доступ к 135+ готовым анимированным React-компонентам с reactbits.dev.

Использование: просто попросить в чате — «найди aurora background из reactbits» или «возьми BlurText из reactbits для заголовка».

Особенно полезны: Aurora, Particles, Beams (фоны) — рейтинг 9.8/10. Избегать: buttons/forms (незавершены).

### Доступность (a11y)

| Скилл | Когда использовать |
|---|---|
| `/a11y-keyboard-navigation` | Порядок фокуса, skip-links, focus traps в модалках/FAB |
| `/a11y-motion-sensitivity` | `prefers-reduced-motion` для анимаций Motion |
| `/a11y-responsive-accessibility` | WCAG reflow при 200% zoom |
| `/a11y-feedback-and-status` | ARIA live regions для LiveChat и статусов |
| `/a11y-form-labelling` | Форма бронирования |
| `/a11y-voice-interaction` | Паттерны голосового UI для ChatAssistant |
| `/accessibility-engineer` | Общий аудит a11y компонентов |
