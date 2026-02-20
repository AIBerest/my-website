/**
 * Vercel Serverless: AI Chat - OpenAI (ChatGPT) API + опциональный веб-поиск
 * Личный помощник Евгения
 * Env: OPENAI_API_KEY, SERPER_API_KEY (опционально — для ответов из интернета)
 */

const KNOWLEDGE = `
Евгений Берестенко. В крипте с 2017, vibecoding и AI с 2025.

Услуги и цены (ориентировочно):
- Консультации по крипто, токеномике, DeFi: от 150 USD/час
- Vibecoding / MVP и фронтенд под ключ: от 800 USD за проект
- Настройка AI-агентов и автоматизации (саппорт, данные): от 500 USD
- Поддержка и модерация комьюнити: по запросу
- Product & UX: проектирование интерфейсов и текстов: от 400 USD

Связь: Telegram @E_Berest (https://t.me/E_Berest). Отвечаю по делу, без воды. Открыт к сотрудничеству: криптопроекты, AI-продукты, автоматизация, консалтинг.
`;

const SYSTEM_PROMPT_BASE = `Ты — Личный помощник Евгения. Отвечаешь от имени помощника.

ПРАВИЛА:
1. По вопросам об Евгении, его услугах, ценах и контактах — отвечай ТОЛЬКО по данным ниже. Не выдумывай цены или услуги.
2. Если вопроса нет в данных ниже и нет в контексте поиска — скажи "Уточните, пожалуйста, у Евгения в Telegram: @E_Berest".
3. Отвечай кратко и по делу.
4. Для связи всегда предлагай Telegram @E_Berest.

Данные об Евгении:
${KNOWLEDGE}`;

/** Опциональный веб-поиск через Serper (google.serper.dev). Без ключа возвращает пустую строку. */
async function searchWeb(query) {
  const key = process.env.SERPER_API_KEY && typeof process.env.SERPER_API_KEY === 'string'
    ? process.env.SERPER_API_KEY.trim() : '';
  if (!key) return '';

  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 5 }),
    });
    const data = await res.json().catch(() => ({}));
    const organic = data.organic || [];
    if (organic.length === 0) return '';
    const lines = organic.slice(0, 5).map((o) => `• ${(o.snippet || o.title || '').slice(0, 300)}${o.link ? ` (${o.link})` : ''}`).filter(Boolean);
    return lines.join('\n');
  } catch {
    return '';
  }
}

async function callOpenAI(message, systemContent) {
  const rawKey = process.env.OPENAI_API_KEY;
  const apiKey = rawKey && typeof rawKey === 'string' ? rawKey.trim() : '';
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const systemPrompt = systemContent || SYSTEM_PROMPT_BASE;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error?.message || data?.error?.code || res.statusText;
    throw new Error(`OpenAI HTTP ${res.status}: ${msg || JSON.stringify(data)}`);
  }

  const content = data?.choices?.[0]?.message?.content;
  return content || 'Не удалось получить ответ. Напишите Евгению в Telegram: @E_Berest';
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Нет сообщения' });
  }

  try {
    const trimmed = message.trim();
    const webSnippets = await searchWeb(trimmed);
    const systemContent = webSnippets
      ? `${SYSTEM_PROMPT_BASE}\n\n---\nЕсли вопрос не про Евгения и его услуги — можешь опереться на результаты поиска в интернете:\n${webSnippets}\n\nОтвечай кратко. Если и тут нет ответа — предложи написать Евгению в Telegram: @E_Berest.`
      : SYSTEM_PROMPT_BASE;
    const response = await callOpenAI(trimmed, systemContent);
    return res.status(200).json({ response });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Ошибка сервера' });
  }
};
