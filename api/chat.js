// api/chat.js - Vercel Serverless Function for Vaultly AI Assistant
// Multi-provider support (Gemini / OpenAI) with zero-leakage error handling
// and guaranteed offline deterministic fallback.

const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30;

  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }
  rateLimitMap.set(ip, record);

  // Periodically clean stale entries
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) rateLimitMap.delete(key);
    }
  }

  return record.count > maxRequests;
}

function generateDeterministicAnswer(message, context = {}) {
  const q = String(message || '').toLowerCase();
  const totals = context.totals || { totalIncome: 0, totalExpenses: 0, netBalance: 0, expenseCount: 0 };
  const breakdown = Array.isArray(context.breakdown) ? context.breakdown : [];
  const topCat = breakdown[0] || null;

  const formatINR = (num) => {
    return '₹' + Number(num || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  if (q.includes('spend') && (q.includes('this month') || q.includes('how much') || q.includes('total'))) {
    return `According to your verified records, your total recorded expenses are ${formatINR(totals.totalExpenses)} across ${totals.expenseCount || 0} logged transactions.`;
  }

  if (q.includes('largest') || q.includes('top category') || q.includes('most') || q.includes('highest')) {
    if (topCat) {
      return `Your largest expense category is ${topCat.category}, accounting for ${formatINR(topCat.total)} (${topCat.percentage || 0}% of all your recorded spending).`;
    }
    return `You haven't recorded any expenses yet to determine a top category.`;
  }

  if (q.includes('balance') || q.includes('net') || q.includes('saved')) {
    return `Your current net balance is ${formatINR(totals.netBalance)} (Total Income: ${formatINR(totals.totalIncome)} − Total Expenses: ${formatINR(totals.totalExpenses)}).`;
  }

  if (q.includes('safe') || q.includes('daily')) {
    const daysRemaining = Math.max(1, 30 - new Date().getDate());
    const remainingAfterExpenses = Math.max(0, totals.netBalance);
    const daily = Math.round(remainingAfterExpenses / daysRemaining);
    return `Based on your remaining net balance, your estimated safe daily allowance is approximately ${formatINR(daily)}/day for the next ${daysRemaining} days of this month.`;
  }

  if (q.includes('budget') || q.includes('limit')) {
    return `You have ${context.budgetCount || 0} active budget categories configured. Track spending vs limits in the Budgets view!`;
  }

  if (q.includes('goal') || q.includes('saving')) {
    return `You have ${context.goalCount || 0} active savings goals registered. Check the Goals tab to track progress and contribute funds!`;
  }

  return `Financial Overview: Total Income is ${formatINR(totals.totalIncome)}, Total Expenses are ${formatINR(totals.totalExpenses)}, leaving a Net Balance of ${formatINR(totals.netBalance)}. Feel free to ask about your top categories, spending habits, or safe daily allowance!`;
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
    return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment before sending another message.' });
  }

  // 3. Payload validation
  const { message, context } = req.body || {};
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Invalid request: "message" string is required.' });
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length > 2000) {
    return res.status(400).json({ error: 'Message exceeds maximum length of 2000 characters.' });
  }

  // 4. Check for API keys
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Build grounded context prompt
  const totals = context?.totals || { totalIncome: 0, totalExpenses: 0, netBalance: 0 };
  const topCat = (context?.breakdown && context.breakdown[0]) ? context.breakdown[0] : null;

  const systemInstructions = `You are Vaultly AI, an intelligent, concise, and helpful personal finance advisor.
Answer the user's financial question directly, encouragingly, and concisely.
Ground your answer ONLY in these verified user numbers:
- Total Income: ₹${totals.totalIncome || 0}
- Total Expenses: ₹${totals.totalExpenses || 0}
- Net Balance: ₹${totals.netBalance || 0}
- Top Category: ${topCat ? `${topCat.category} (₹${topCat.total}, ${topCat.percentage}%)` : 'None'}
- Total Transactions: ${context?.transactionCount || 0}
- Active Budgets: ${context?.budgetCount || 0}
- Active Goals: ${context?.goalCount || 0}

Rules:
1. NEVER invent, guess, or hallucinate transactions or numbers that are not in the context.
2. If the user asks how much they spent, reference the exact Total Expenses ₹${totals.totalExpenses || 0}.
3. Always format currency using the ₹ symbol.
4. Keep the response concise (1-3 brief paragraphs).
5. If the user expresses intent to record a transaction (e.g., "spent 200 on coffee"), confirm the details and mention that it has been pre-filled for their review.`;

  // 5. Provider dispatch: Gemini first
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemInstructions}\n\nUser Question: ${trimmedMessage}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const apiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (apiRes.ok) {
        const apiData = await apiRes.json();
        const reply = apiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return res.status(200).json({ reply: reply.trim(), source: 'ai-gemini' });
        }
      }
    } catch (err) {
      // Gracefully fall through to fallback, never leak keys
      console.warn('[Vaultly API] Gemini request failed, using deterministic fallback');
    }
  }

  // 6. Provider dispatch: OpenAI second
  if (openaiKey) {
    try {
      const url = 'https://api.openai.com/v1/chat/completions';
      const payload = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstructions },
          { role: 'user', content: trimmedMessage }
        ],
        temperature: 0.3,
        max_tokens: 500
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const apiRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (apiRes.ok) {
        const apiData = await apiRes.json();
        const reply = apiData?.choices?.[0]?.message?.content;
        if (reply) {
          return res.status(200).json({ reply: reply.trim(), source: 'ai-openai' });
        }
      }
    } catch (err) {
      console.warn('[Vaultly API] OpenAI request failed, using deterministic fallback');
    }
  }

  // 7. Deterministic Local Fallback (zero key requirement, 100% offline-ready)
  const fallbackReply = generateDeterministicAnswer(trimmedMessage, context);
  return res.status(200).json({
    reply: fallbackReply,
    source: 'deterministic-fallback'
  });
};

// Export helpers for testing
module.exports.generateDeterministicAnswer = generateDeterministicAnswer;
module.exports.isRateLimited = isRateLimited;
