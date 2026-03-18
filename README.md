# Evgeniy Berestenko — Personal site

One-page personal website: dark theme, turquoise gradient accents, Ru/En toggle.

## Stack

- HTML, CSS, JavaScript
- Google Fonts (Inter), Font Awesome
- No build step — open `index.html` in a browser

## Run locally

Open `index.html` in a browser (double-click or drag into a tab).

## Structure

- **Hero** — avatar, name, tagline, social links (YouTube, Telegram, Instagram)
- **About** — short bio (crypto, vibecoding, AI)
- **Projects** — cards: AI Agent for Replay, СудьбаПро.AI, Vibe Automations, Dev Tools
- **Contacts** — same socials as buttons
- **Language** — header toggle: En / Ru (saved in `localStorage`)

## Chatbot

**Помощник Юный Подаван** — виджет в правом нижнем углу. Сначала проводит краткий бриф (несколько вопросов), затем отправляет заявку в Telegram-бота и только после этого отвечает на вопросы в рамках услуг Евгения.

Ограничение: это не универсальный ChatGPT, помощник работает только по темам услуг с сайта.

Бэкенд:
- `/api/chat.js` — ответы по услугам (OpenAI, `gpt-4o-mini`)
- `/api/lead.js` — отправка брифа в Telegram

**Чтобы чат работал на Vercel, добавь переменные окружения:**
- `OPENAI_API_KEY` - ключ OpenAI ([platform.openai.com](https://platform.openai.com/api-keys))
- `TELEGRAM_BOT_TOKEN` - токен Telegram-бота
- `TELEGRAM_CHAT_ID` - chat id, куда отправлять брифы

### Если заявки не приходят в Telegram

- Проверь, что `api/lead.js` задеплоен (если файл есть только локально, роут `/api/lead` на проде не существует)
- Проверь переменные `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` в окружении Vercel
- Убедись, что бот добавлен в нужный чат/группу и имеет право отправлять сообщения
- После изменения env-переменных сделай redeploy

## Repo

Public: [github.com/AIBerest/my-website](https://github.com/AIBerest/my-website)
