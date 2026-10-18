// api/chat.js - Vercel Serverless Function for Vaultly AI Assistant
// Multi-provider support (Gemini / OpenAI) with zero-leakage error handling
// and guaranteed offline deterministic fallback.
// General-purpose conversational AI with deep Vaultly finance integration.

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

// Keywords that signal a finance-related conversation
const FINANCE_KEYWORDS = [
  'spend', 'expense', 'income', 'budget', 'goal', 'balance',
  'saving', 'transaction', 'money', '₹', 'rupee', 'salary',
  'cashflow', 'finance', 'afford'
];

/**
 * Check if any of the last N messages (including current) are finance-related.
 * @param {string} currentMessage - The latest user message
 * @param {Array} history - Conversation history array
 * @returns {boolean}
 */
function isFinanceRelated(currentMessage, history = []) {
  const messagesToCheck = [currentMessage];

  // Also check the last 2 messages from history (so total of 3 including current)
  const recentHistory = history.slice(-2);
  for (const msg of recentHistory) {
    if (msg && msg.content) {
      messagesToCheck.push(msg.content);
    }
  }

  const combined = messagesToCheck.join(' ').toLowerCase();
  return FINANCE_KEYWORDS.some(keyword => combined.includes(keyword));
}

function generateDeterministicAnswer(message, context = {}) {
  const q = String(message || '').toLowerCase();
  const totals = context.totals || { totalIncome: 0, totalExpenses: 0, netBalance: 0, expenseCount: 0 };
  const breakdown = Array.isArray(context.breakdown) ? context.breakdown : [];
  const topCat = breakdown[0] || null;

  const formatINR = (num) => {
    return '₹' + Number(num || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  // --- Finance-related fallbacks (preserved exactly for test compatibility) ---

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

  // --- General conversation fallbacks ---

  // Greetings
  if (/\b(hey|hi|hello|what'?s\s*up|howdy|yo)\b/i.test(q)) {
    return `Hey there! 👋 I'm Vaultly AI, your personal assistant. I can help with general questions, learning, coding, planning, and of course your finances. What can I do for you?`;
  }

  // Bank account inquiry
  if (q.includes('bank') && (q.includes('account') || q.includes('balance') || q.includes('how much'))) {
    return "Vaultly is a privacy-first personal finance platform that stores all records client-side on your device. I don't have access to your live bank account or external banking credentials unless an official integration is configured. You can log income, expenses, and account transfers directly in Vaultly!";
  }

  // User correction
  if (q.includes('no, i meant') || q.includes('i meant') || q.includes('not what i asked') || q.includes('that is wrong')) {
    return "My apologies for misunderstanding! Could you clarify what you'd like to explore? I'm ready to help with anything from general questions to specific calculations.";
  }

  // Check if the message looks finance-related (even if not caught above)
  if (FINANCE_KEYWORDS.some(keyword => q.includes(keyword))) {
    return `Financial Overview: Total Income is ${formatINR(totals.totalIncome)}, Total Expenses are ${formatINR(totals.totalExpenses)}, leaving a Net Balance of ${formatINR(totals.netBalance)}. Feel free to ask about your top categories, spending habits, or safe daily allowance!`;
  }

  // General fallback for non-finance questions
  return `I'm currently running in offline mode without AI connectivity. For the best experience with general questions, please ensure the GEMINI_API_KEY or OPENAI_API_KEY environment variable is configured. I can still help with your Vaultly financial data! Try asking about your spending, budgets, or savings goals.`;
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
  const { message, context, history } = req.body || {};
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Invalid request: "message" string is required.' });
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length > 4000) {
    return res.status(400).json({ error: 'Message exceeds maximum length of 4000 characters.' });
  }

  // Normalize and limit conversation history to last 20 messages
  const conversationHistory = Array.isArray(history) ? history.slice(-20) : [];

  // 4. Check for API keys
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Determine if conversation is finance-related
  const financeMode = isFinanceRelated(trimmedMessage, conversationHistory);

  // Build system prompt — general-purpose with conditional finance context
  const totals = context?.totals || { totalIncome: 0, totalExpenses: 0, netBalance: 0 };
  const topCat = (context?.breakdown && context.breakdown[0]) ? context.breakdown[0] : null;

  let systemInstructions = `You are Vaultly AI, a friendly, intelligent, and versatile conversational assistant.
You can help with any topic: general questions, science, learning, coding, writing, debugging, planning, brainstorming, and casual conversation.
You also have deep, optional integration with the user's personal finance data in Vaultly.
- When the user asks about their finances, spending, budgets, or goals, use the verified financial context provided.
- For general questions (e.g. coding, explaining black holes, telling jokes, writing emails), answer directly, creatively, and naturally without forcing financial topics or numbers.
- If asked about live bank accounts or external credentials, explain that Vaultly is a private, client-side app that does not connect directly to external banks without an official integration.
- Maintain context across follow-up questions, understanding pronouns ("it", "that", "the second one") and references to previous messages.
- If the user corrects you, acknowledge the correction gracefully and adjust your answer.
- Be conversational, concise, and helpful. Use clean markdown formatting (bullet points, bold text, code blocks) when appropriate.
- Never invent financial data. If financial context is provided, cite exact numbers.
- Acknowledge uncertainty rather than fabricating facts.
- Adapt response length to the question — punchy and warm for casual chat, structured and clear for complex topics.`;

  // Conditionally append financial context only when relevant
  if (financeMode && context) {
    systemInstructions += `

The user's verified financial data (use exact numbers, never invent):
- Total Income: ₹${totals.totalIncome || 0}
- Total Expenses: ₹${totals.totalExpenses || 0}
- Net Balance: ₹${totals.netBalance || 0}
- Top Category: ${topCat ? `${topCat.category} (₹${topCat.total}, ${topCat.percentage}%)` : 'None'}
- Total Transactions: ${context?.transactionCount || 0}
- Active Budgets: ${context?.budgetCount || 0}
- Active Goals: ${context?.goalCount || 0}

Rules for financial responses:
1. NEVER invent, guess, or hallucinate transactions or numbers that are not in the context.
2. If the user asks how much they spent, reference the exact Total Expenses ₹${totals.totalExpenses || 0}.
3. Always format currency using the ₹ symbol.
4. If the user expresses intent to record a transaction (e.g., "spent 200 on coffee"), confirm the details and mention that it has been pre-filled for their review.`;
  }

  // 5. Provider dispatch: Gemini first
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

      // Build contents array with conversation history for Gemini
      // Gemini uses role: 'user' and role: 'model'
      const contents = [];

      // Prepend system instructions as first user message context
      // (Gemini doesn't have a dedicated system role in v1beta contents)
      contents.push({
        role: 'user',
        parts: [{ text: systemInstructions }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I\'m ready to help as Vaultly AI.' }]
      });

      // Add conversation history
      for (const msg of conversationHistory) {
        if (msg && msg.content && (msg.role === 'user' || msg.role === 'assistant')) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      }

      // Add the current user message
      contents.push({
        role: 'user',
        parts: [{ text: trimmedMessage }]
      });

      const payload = {
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500
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

      // Build messages array with conversation history for OpenAI
      const messages = [
        { role: 'system', content: systemInstructions }
      ];

      // Add conversation history
      for (const msg of conversationHistory) {
        if (msg && msg.content && (msg.role === 'user' || msg.role === 'assistant')) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      // Add the current user message
      messages.push({ role: 'user', content: trimmedMessage });

      const payload = {
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1500
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
