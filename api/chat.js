/**
 * Vercel Serverless: AI Chat - MiniMax API
 * Личный помощник Евгения
 * Env: MINIMAX_API_KEY
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

const SYSTEM_PROMPT = `Ты — Личный помощник Евгения. Отвечаешь от имени помощника по данным ниже.

ПРАВИЛА:
1. Отвечай ТОЛЬКО на основе информации ниже
2. Не выдумывай цены или услуги
3. Если информации нет — скажи "Уточните, пожалуйста, у Евгения в Telegram: @E_Berest"
4. Отвечай кратко и по делу
5. Для связи всегда предлагай Telegram @E_Berest

Данные:
${KNOWLEDGE}`;

async function callMiniMax(message) {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) throw new Error('MINIMAX_API_KEY not configured');

  const res = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'M2-her',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      max_completion_tokens: 1024,
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(data.base_resp.status_msg || 'MiniMax API error');
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
    const response = await callMiniMax(message.trim());
    return res.status(200).json({ response });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Ошибка сервера' });
  }
};
