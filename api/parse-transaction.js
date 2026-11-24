// api/parse-transaction.js - Vercel Serverless Function for Structured Financial Entity Extraction
// Uses Vercel AI SDK generateObject with Zod schema validation
// Falls back to deterministic rule-based NLP parser when offline or without keys.

const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 40;

  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }
  rateLimitMap.set(ip, record);

  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) rateLimitMap.delete(key);
    }
  }

  return record.count > maxRequests;
}

/**
 * Deterministic Regex-based fallback parser (guaranteed offline fallback)
 */
function deterministicParse(text, referenceDate) {
  if (!text || typeof text !== 'string') return null;
  const t = text.trim();
  const lower = t.toLowerCase();

  // 1. Amount Extraction
  const amountMatch = t.match(/(?:(?:₹|rs\.?|inr|\$|€|£|¥)\s*)?([0-9]+(?:\.[0-9]{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  // 2. Type Detection
  let type = 'expense';
  if (lower.includes('salary') || lower.includes('received') || lower.includes('earned') || lower.includes('deposit') || lower.includes('freelance') || lower.includes('allowance')) {
    type = 'income';
  }

  // 3. Category Detection
  let category = 'Other';
  if (type === 'income') {
    if (lower.includes('salary')) category = 'Salary';
    else if (lower.includes('freelance') || lower.includes('consulting') || lower.includes('project')) category = 'Freelance';
    else if (lower.includes('business')) category = 'Business';
    else if (lower.includes('allowance') || lower.includes('gift')) category = 'Allowance';
    else category = 'Other';
  } else {
    if (lower.includes('lunch') || lower.includes('dinner') || lower.includes('food') || lower.includes('burger') || lower.includes('pizza') || lower.includes('grocery') || lower.includes('groceries') || lower.includes('coffee') || lower.includes('cafe')) {
      category = 'Food & Dining';
    } else if (lower.includes('cab') || lower.includes('uber') || lower.includes('ola') || lower.includes('metro') || lower.includes('bus') || lower.includes('fuel') || lower.includes('petrol') || lower.includes('transport')) {
      category = 'Transport';
    } else if (lower.includes('bill') || lower.includes('electricity') || lower.includes('water') || lower.includes('wifi') || lower.includes('internet') || lower.includes('recharge')) {
      category = 'Bills & Utilities';
    } else if (lower.includes('movie') || lower.includes('cinema') || lower.includes('game') || lower.includes('concert')) {
      category = 'Entertainment';
    } else if (lower.includes('medicine') || lower.includes('hospital') || lower.includes('doctor') || lower.includes('pharmacy')) {
      category = 'Health';
    } else if (lower.includes('book') || lower.includes('course') || lower.includes('tuition')) {
      category = 'Education';
    } else if (lower.includes('amazon') || lower.includes('shopping') || lower.includes('cloth') || lower.includes('shoes')) {
      category = 'Shopping';
    }
  }

  // 4. Date Detection
  const baseDate = referenceDate ? new Date(referenceDate + 'T00:00:00') : new Date();
  const formatYMD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  let date = formatYMD(baseDate);
  if (lower.includes('yesterday')) {
    const y = new Date(baseDate);
    y.setDate(y.getDate() - 1);
    date = formatYMD(y);
  }

  // 5. Clean Title
  let title = t.replace(/(?:spent|paid|received|earned|got|on|for|yesterday|today|rs\.?|inr|₹|\$|€|£|¥|[0-9]+(?:\.[0-9]{1,2})?)/gi, '').trim();
  if (!title) {
    title = category === 'Other' ? (type === 'income' ? 'Income Payment' : 'Expense Payment') : category;
  } else {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return { amount, type, category, date, title };
}

module.exports = async function handler(req, res) {
  // 1. CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  // 2. Rate limiting check
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown-client';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment.' });
  }

  // 3. Payload validation
  const { input, referenceDate, geminiKey: clientKey } = req.body || {};
  if (!input || typeof input !== 'string' || input.trim() === '') {
    return res.status(400).json({ error: 'Invalid request: "input" string is required.' });
  }

  const trimmedInput = input.trim();
  const refDate = referenceDate || new Date().toISOString().split('T')[0];
  const geminiKey = process.env.GEMINI_API_KEY || clientKey;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 4. Attempt Structured Entity Extraction with Vercel AI SDK generateObject
  if (geminiKey || openaiKey) {
    try {
      const { generateObject } = await import('ai');
      const { z } = await import('zod');

      const TransactionSchema = z.object({
        amount: z.number().positive().describe('The monetary amount of the transaction'),
        type: z.enum(['income', 'expense']).describe('Whether this is an income or expense'),
        category: z.enum([
          'Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities',
          'Education', 'Entertainment', 'Health', 'Salary', 'Freelance',
          'Business', 'Allowance', 'Other'
        ]).describe('The most fitting expense or income category'),
        date: z.string().describe('YYYY-MM-DD formatted date, resolved relative to reference date'),
        title: z.string().max(80).describe('Concise description of the item, merchant, or reason'),
        notes: z.string().optional().describe('Any extra details or remarks from the text')
      });

      let modelInstance = null;
      let sourceName = '';

      if (geminiKey) {
        const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
        const google = createGoogleGenerativeAI({ apiKey: geminiKey });
        modelInstance = google('gemini-2.5-flash');
        sourceName = 'ai-sdk-gemini';
      } else if (openaiKey) {
        const { createOpenAI } = await import('@ai-sdk/openai');
        const openai = createOpenAI({ apiKey: openaiKey });
        modelInstance = openai('gpt-4o-mini');
        sourceName = 'ai-sdk-openai';
      }

      if (modelInstance) {
        const { object } = await generateObject({
          model: modelInstance,
          schema: TransactionSchema,
          prompt: `Today is ${refDate}. Extract the transaction details from this description:\n"${trimmedInput}"`
        });

        if (object && object.amount > 0) {
          return res.status(200).json({
            success: true,
            transaction: object,
            source: sourceName
          });
        }
      }
    } catch (sdkErr) {
      console.warn('[Vaultly API] generateObject error, falling through to deterministic parser:', sdkErr.message);
    }
  }

  // 5. Deterministic rule-based fallback (zero-dependency, always works offline)
  const fallbackParsed = deterministicParse(trimmedInput, refDate);
  if (fallbackParsed && fallbackParsed.amount > 0) {
    return res.status(200).json({
      success: true,
      transaction: fallbackParsed,
      source: 'deterministic-fallback'
    });
  }

  return res.status(200).json({
    success: false,
    error: 'Could not extract a valid transaction amount from the input.',
    source: 'deterministic-fallback'
  });
};

module.exports.deterministicParse = deterministicParse;
module.exports.isRateLimited = isRateLimited;
