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

**Личный помощник Евгения** — виджет в правом нижнем углу. Отвечает на вопросы об услугах, ценах и подсказывает, как связаться (Telegram @E_Berest). По вопросам вне базы знаний может искать ответ в интернете. Бэкенд: Vercel serverless `/api/chat.js`, модель OpenAI (gpt-4o-mini).

**Чтобы чат работал на Vercel:** добавь переменную окружения `OPENAI_API_KEY` (ключ с [platform.openai.com](https://platform.openai.com/api-keys)). Опционально: `SERPER_API_KEY` (ключ с [serper.dev](https://serper.dev)) — тогда бот будет подмешивать результаты поиска в интернете, если не знает ответ по своим данным.

## Repo

Public: [github.com/AIBerest/my-website](https://github.com/AIBerest/my-website)
