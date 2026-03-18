/**
 * Vercel Serverless: restricted ChatGPT helper for site services.
 * Env: OPENAI_API_KEY
 */

const KNOWLEDGE = `
Евгений Берестенко. В крипте с 2017, vibecoding и AI с 2025.

Услуги:
- Консультации по крипто, токеномике, DeFi: от 150 USD/час
- Vibecoding / MVP и фронтенд под ключ: от 800 USD за проект
- Настройка AI-агентов и автоматизации (саппорт, данные): от 500 USD
- Поддержка и модерация комьюнити: по запросу
- Product & UX: проектирование интерфейсов и текстов: от 400 USD

Связь: Telegram @E_Berest (https://t.me/E_Berest).
`;

const SYSTEM_PROMPT = `Ты - Помощник Юный Подаван, ассистент Евгения.

Работай только в рамках услуг Евгения, формата сотрудничества, ценовых ориентиров и контактов.
Если вопрос не относится к услугам Евгения - вежливо откажи и предложи вернуться к теме услуг.
Не отвечай как универсальный ChatGPT и не давай ответы на посторонние темы.
Отвечай кратко, конкретно, по делу.
Для связи всегда предлагай Telegram @E_Berest.
Не придумывай услуги и цены, которых нет в данных.

Данные:
${KNOWLEDGE}`;

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => item && typeof item.content === 'string' && (item.role === 'user' || item.role === 'assistant'))
    .slice(-12)
    .map((item) => ({ role: item.role, content: item.content.trim().slice(0, 1500) }));
}

async function callOpenAI(message, history) {
  const rawKey = process.env.OPENAI_API_KEY;
  const apiKey = rawKey && typeof rawKey === 'string' ? rawKey.trim() : '';
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');
  const normalizedHistory = normalizeHistory(history);
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  messages.push(...normalizedHistory);
  if (!normalizedHistory.length || normalizedHistory[normalizedHistory.length - 1].content !== message) {
    messages.push({ role: 'user', content: message });
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 420,
      temperature: 0.4,
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

  const { message, history } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Нет сообщения' });
  }

  try {
    const trimmed = message.trim();
    const response = await callOpenAI(trimmed, history);
    return res.status(200).json({ response });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Ошибка сервера' });
  }
};
