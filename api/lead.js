/**
 * Vercel Serverless: send brief lead to Telegram bot.
 * Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 */

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseJsonBody(body) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch (_) {
      return {};
    }
  }
  if (typeof body === 'object') return body;
  return {};
}

function splitByTelegramLimit(text, limit) {
  const chunks = [];
  let rest = text;
  while (rest.length > limit) {
    let splitAt = rest.lastIndexOf('\n', limit);
    if (splitAt < Math.floor(limit * 0.6)) splitAt = limit;
    chunks.push(rest.slice(0, splitAt));
    rest = rest.slice(splitAt).trimStart();
  }
  if (rest.length) chunks.push(rest);
  return chunks;
}

async function sendTelegramMessage(token, chatId, text) {
  const tgRes = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  });
  const data = await tgRes.json().catch(function() { return {}; });
  if (!tgRes.ok || !data.ok) {
    throw new Error(data.description || 'Telegram API error');
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID || '').trim();
  if (!token) return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured' });
  if (!chatId) return res.status(500).json({ error: 'TELEGRAM_CHAT_ID not configured' });

  const body = parseJsonBody(req.body);
  const lead = (body && body.lead && typeof body.lead === 'object') ? body.lead : body;
  const text =
    '<b>Новый бриф с сайта</b>\n\n' +
    '<b>Имя:</b> ' + escapeHtml(lead.name) + '\n' +
    '<b>Проект:</b> ' + escapeHtml(lead.project) + '\n' +
    '<b>Боли:</b> ' + escapeHtml(lead.pain) + '\n' +
    '<b>Куда уходит время:</b> ' + escapeHtml(lead.timeSink) + '\n' +
    '<b>Что автоматизировать:</b> ' + escapeHtml(lead.automationTasks) + '\n' +
    '<b>Цель:</b> ' + escapeHtml(lead.goal) + '\n' +
    '<b>Сроки и бюджет:</b> ' + escapeHtml(lead.timelineBudget) + '\n' +
    '<b>Контакт:</b> ' + escapeHtml(lead.contact);

  try {
    const chunks = splitByTelegramLimit(text, 3900);
    for (let i = 0; i < chunks.length; i += 1) {
      const part = chunks.length > 1
        ? `${chunks[i]}\n\n<i>Часть ${i + 1}/${chunks.length}</i>`
        : chunks[i];
      await sendTelegramMessage(token, chatId, part);
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Lead send failed' });
  }
};
