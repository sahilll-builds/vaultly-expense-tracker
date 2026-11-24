// api/chat.js - Vercel Serverless Function for Vaultly AI Assistant
// Powered by Vercel AI SDK Core with Multi-Provider Support, Real-Time Streaming,
// In-Memory Request-Scoped Financial Tools, Zero-Leakage Server-Only Key Architecture,
// Anaphoric Memory Resolution, and Guaranteed Offline Deterministic Fallback.

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
  'spend', 'spent', 'spending', 'expense', 'expenses', 'income', 'budget', 'budgets',
  'goal', 'goals', 'balance', 'saving', 'savings', 'transaction', 'transactions',
  'money', '₹', 'rupee', 'rupees', 'salary', 'cashflow', 'cash', 'finance', 'finances',
  'afford', 'health', 'score', 'anomaly', 'anomalies', 'unusual', 'duplicate',
  'simulate', 'twin', 'scenario', 'last month', 'this month', 'cost', 'paid', 'bill'
];

/**
 * Check if any of the last N messages (including current) are finance-related.
 * @param {string} currentMessage - The latest user message
 * @param {Array} history - Conversation history array
 * @returns {boolean}
 */
function isFinanceRelated(currentMessage, history = []) {
  const messagesToCheck = [currentMessage];

  // Check the last 4 messages from history for strong conversational memory
  const recentHistory = history.slice(-4);
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

  const tag = `[Offline Mode • Deterministic Engine]\n\n`;

  // --- Finance-related fallbacks (preserved for offline resilience & test suite) ---

  if (q.includes('last month')) {
    const lm = context.lastMonthTotals || { totalIncome: 0, totalExpenses: 0, netBalance: 0 };
    return tag + `Last month, your recorded income was ${formatINR(lm.totalIncome)} and expenses were ${formatINR(lm.totalExpenses)}, leaving a net balance of ${formatINR(lm.netBalance)}.`;
  }

  if (q.includes('spend') || q.includes('spending') || q.includes('outflow')) {
    if (topCat) {
      return tag + `You've spent a total of ${formatINR(totals.totalExpenses)} across ${totals.expenseCount || 0} logged transactions so far. Top expense is ${topCat.category} at ${formatINR(topCat.total)} (${topCat.percentage || 0}%).`;
    }
    return tag + `You've spent a total of ${formatINR(totals.totalExpenses)} across ${totals.expenseCount || 0} logged transactions so far.`;
  }

  if (q.includes('largest') || q.includes('top category') || q.includes('most') || q.includes('highest')) {
    if (topCat) {
      return tag + `Looks like your biggest expense is ${topCat.category}, coming out to ${formatINR(topCat.total)} (${topCat.percentage || 0}% of your total spending).`;
    }
    return tag + `You haven't recorded any expenses yet to find a top category.`;
  }

  if (q.includes('balance') || q.includes('net') || q.includes('saved')) {
    return tag + `Your net balance is sitting at ${formatINR(totals.netBalance)} right now (Total Income: ${formatINR(totals.totalIncome)} − Total Expenses: ${formatINR(totals.totalExpenses)}).`;
  }

  if (q.includes('safe') || q.includes('daily')) {
    const daysRemaining = Math.max(1, 30 - new Date().getDate());
    const remainingAfterExpenses = Math.max(0, totals.netBalance);
    const daily = Math.round(remainingAfterExpenses / daysRemaining);
    return tag + `You're good to spend about ${formatINR(daily)}/day over the remaining ${daysRemaining} days this month.`;
  }

  if (q.includes('budget') || q.includes('limit')) {
    return tag + `You have ${context.budgetCount || 0} active budget categories configured. Check out the Budgets tab to track your spending!`;
  }

  if (q.includes('goal') || q.includes('saving')) {
    return tag + `You have ${context.goalCount || 0} active savings goals registered. Head to the Goals tab to track your progress or stash some funds!`;
  }

  // Financial Health Score inquiry
  if (q.includes('health') || q.includes('score')) {
    if (context.healthScore !== undefined) {
      return tag + `Your Vaultly Financial Health Score is ${context.healthScore}/100 (${context.healthTier || 'Active'}). It reflects your savings retention, budget adherence, emergency runway, and recurring commitments. Check the Overview tab for your full pillar breakdown!`;
    }
    return tag + `Your Financial Health Score is computed across 4 weighted pillars on the Overview dashboard. Log your income and budgets to view your score!`;
  }

  // Anomaly & duplicate detection inquiry
  if (q.includes('anomal') || q.includes('unusual') || q.includes('duplicate') || q.includes('suspicious')) {
    if (context.anomalyCount !== undefined) {
      return tag + (context.anomalyCount > 0 
        ? `You have ${context.anomalyCount} transaction items flagged for review (statistical outliers or duplicate entries). Check the Transactions view to inspect them.`
        : `No suspicious spikes or duplicate transactions detected in your verified records!`);
    }
    return tag + `Vaultly automatically monitors for unusual spending spikes and duplicate records in your Transactions view.`;
  }

  // Digital Twin & What-If simulation inquiry
  if (q.includes('simulate') || q.includes('what if') || q.includes('scenario') || q.includes('twin')) {
    return tag + `Head over to the Analytics tab to test out the Financial Digital Twin! You can simulate income changes, rent adjustments, spending cuts, or major purchases with real-time feedback and zero mutation of your records.`;
  }

  // --- General conversation fallbacks ---

  // Greetings
  if (/\b(hey|hi|hello|what'?s\s*up|howdy|yo)\b/i.test(q)) {
    return tag + `Hey! 👋 I'm Vaultly AI. What's on your mind? We can check your spending, brainstorm an idea, learn something new, or just chat.`;
  }

  // Brainstorming & Idea Generation
  if (q.includes('brainstorm') || q.includes('idea') || q.includes('ideate') || q.includes('suggestion') || q.includes('concept') || q.includes('think of')) {
    return tag + `I'd love to help you brainstorm! 💡 What area are you thinking about?

Here are a few high-impact themes we can explore together:

1. 🚀 **Side Hustles & Micro-Ventures:**
   - Technical freelance services & high-value consulting
   - Digital products, templates, and micro-SaaS utilities
   - Niche newsletter, podcast, or creator monetization

2. 💰 **Financial Optimization & Wealth Accelerators:**
   - The 30-Day "Zero Discretionary Spend" Challenge
   - Automated micro-savings strategy (weekly round-ups & matching)
   - Category-by-category audit to eliminate zombie subscriptions and bank fees

3. 🛠️ **Product, Web & Tech Concepts:**
   - Privacy-first web applications using LocalStorage and local SQLite
   - Minimalist personal productivity dashboards with zero tracking
   - AI-assisted developer workflows and automation pipelines

Tell me which domain excites you, or share a rough thought and let's expand it into a full execution roadmap!`;
  }

  // Financial Tips & Educational Advice
  if (q.includes('advice') || q.includes('tip') || q.includes('how to save') || q.includes('invest') || q.includes('50/30/20') || q.includes('emergency fund') || q.includes('compound interest')) {
    return tag + `Here are the core financial principles that build lasting wealth:

1. **The 50/30/20 Framework:**
   - **50% Needs:** Housing, groceries, utilities, and transit.
   - **30% Wants:** Dining out, hobbies, personal care, and entertainment.
   - **20% Future You:** Savings goals, debt paydown, and long-term investments.

2. **The 3–6 Month Emergency Runway:**
   - Keep 3 to 6 months of essential living expenses liquid in a High-Yield Savings Account before speculative investing.

3. **Mindful Spend Friction:**
   - Apply a 48-hour cooling-off rule on any non-essential purchase over ₹2,000 to avoid impulse spending.

4. **Pay Yourself First:**
   - Automate your savings transfer the day your salary arrives, not whatever is left at month-end.

Want to check how your current Vaultly budget compares to the 50/30/20 rule?`;
  }

  // Capabilities & Help
  if (q.includes('what can you do') || q.includes('help') || q.includes('capabilities') || q.includes('features')) {
    return tag + `I'm Vaultly AI, your personal financial copilot! Here's what I can do:

- 📊 **Spending Insights:** Track expenses by category, date, or period (*"How much did I spend this month?"*, *"What about last month?"*).
- 🏆 **Cost Drivers:** Identify your largest expense categories (*"Which category was highest?"*).
- 💡 **Safe-to-Spend:** Calculate your remaining daily allowance (*"What is my safe daily spend?"*).
- ⚡ **Natural Language Transactions:** Type entries naturally (*"Spent 250 on lunch yesterday"*), review details, and confirm in the modal.
- 🎯 **Budgets & Goals:** Monitor spending limits and track savings milestones.
- 💬 **Conversation & Brainstorming:** Discuss savings strategies, side hustles, budgeting challenges, and tech ideas.`;
  }

  // Humor & Wit
  if (q.includes('joke') || q.includes('funny') || q.includes('laugh')) {
    return tag + `Why did the dollar break up with the pound? 😂\n\nIt was feeling way too much pressure from inflation!`;
  }

  // Coding & Tech Queries
  if (q.includes('code') || q.includes('javascript') || q.includes('html') || q.includes('css') || q.includes('programming') || q.includes('debug')) {
    return tag + `I'm always down to talk tech and code! 💻 Whether you're working with JavaScript, CSS architecture, API designs, or web performance, feel free to share the snippet or concept you're tackling and let's break it down.`;
  }

  // Bank account inquiry
  if (q.includes('bank') && (q.includes('account') || q.includes('balance') || q.includes('how much'))) {
    return tag + "Vaultly is privacy-first and keeps everything stored client-side on your device, so I can't peek into your live bank account. You can log income, expenses, and account transfers right here anytime!";
  }

  // User correction
  if (q.includes('no, i meant') || q.includes('i meant') || q.includes('not what i asked') || q.includes('that is wrong')) {
    return tag + "Ah, my bad! Apologies for the confusion. Could you clarify what you'd like to explore instead? I'm all ears!";
  }

  // Check if the message looks finance-related
  if (FINANCE_KEYWORDS.some(keyword => q.includes(keyword))) {
    return tag + `Here's a quick look at your numbers: Total Income is ${formatINR(totals.totalIncome)}, Total Expenses are ${formatINR(totals.totalExpenses)}, leaving a Net Balance of ${formatINR(totals.netBalance)}. Feel free to ask about your top categories, spending habits, or safe daily spend!`;
  }

  // General fallback for non-finance questions
  return tag + `I'm currently running in offline mode without server AI credentials configured. For open-ended conversation on any topic, configure GEMINI_API_KEY or OPENAI_API_KEY in your server environment. I can still answer questions about your Vaultly numbers anytime!`;
}

/**
 * Builds request-scoped in-memory financial tools for the Vercel AI SDK
 */
function createFinancialTools(context, z, tool) {
  if (!context || !z || !tool) return undefined;

  const transactions = Array.isArray(context.recentTransactions) ? context.recentTransactions : [];
  const budgets = Array.isArray(context.budgets) ? context.budgets : [];
  const goals = Array.isArray(context.goals) ? context.goals : [];

  return {
    getSpendingSummary: tool({
      description: 'Get total income, expenses, net balance, and transaction count for a specific period (this_month, last_month, or all_time)',
      parameters: z.object({
        period: z.enum(['this_month', 'last_month', 'all_time']).describe('The time period to query')
      }),
      execute: async ({ period }) => {
        if (period === 'last_month' && context.lastMonthTotals) {
          return { period: 'last_month', ...context.lastMonthTotals };
        }
        if (period === 'this_month' && context.thisMonthTotals) {
          return { period: 'this_month', ...context.thisMonthTotals };
        }
        return { period: 'all_time', ...(context.totals || {}) };
      }
    }),

    getCategoryBreakdown: tool({
      description: 'Get category spending breakdown, percentages, and largest expense for a period',
      parameters: z.object({
        period: z.enum(['this_month', 'last_month', 'all_time']).optional().describe('Period: this_month, last_month, or all_time')
      }),
      execute: async ({ period = 'this_month' }) => {
        let list = context.breakdown || [];
        if (period === 'last_month' && context.lastMonthBreakdown) {
          list = context.lastMonthBreakdown;
        } else if (period === 'this_month' && context.thisMonthBreakdown) {
          list = context.thisMonthBreakdown;
        }
        const top = list[0] || null;
        return {
          period,
          topCategory: top ? `${top.category} (₹${top.total}, ${top.percentage}%)` : 'None',
          categories: list.slice(0, 8)
        };
      }
    }),

    queryTransactions: tool({
      description: 'Search or filter recent transactions by category, type (income/expense), amount, or query',
      parameters: z.object({
        category: z.string().optional().describe('Filter by category (e.g. Food & Dining, Shopping, Transport, Bills)'),
        type: z.enum(['income', 'expense']).optional().describe('Transaction type'),
        minAmount: z.number().optional().describe('Minimum monetary amount'),
        maxAmount: z.number().optional().describe('Maximum monetary amount'),
        query: z.string().optional().describe('Keyword search in title or merchant name')
      }),
      execute: async ({ category, type, minAmount, maxAmount, query }) => {
        let results = transactions;
        if (category) {
          results = results.filter(t => t.category && t.category.toLowerCase().includes(category.toLowerCase()));
        }
        if (type) {
          results = results.filter(t => t.type === type);
        }
        if (typeof minAmount === 'number') {
          results = results.filter(t => t.amount >= minAmount);
        }
        if (typeof maxAmount === 'number') {
          results = results.filter(t => t.amount <= maxAmount);
        }
        if (query) {
          const qLower = query.toLowerCase();
          results = results.filter(t => (t.title && t.title.toLowerCase().includes(qLower)) || (t.notes && t.notes.toLowerCase().includes(qLower)));
        }
        return {
          matchCount: results.length,
          transactions: results.slice(0, 10).map(t => ({
            title: t.title,
            amount: t.amount,
            category: t.category,
            date: t.date,
            type: t.type
          }))
        };
      }
    }),

    checkBudget: tool({
      description: 'Check configured budget limit, current spending, and status for a specific category',
      parameters: z.object({
        category: z.string().describe('The category name to check')
      }),
      execute: async ({ category }) => {
        const found = budgets.find(b => b.category && b.category.toLowerCase().includes(category.toLowerCase()));
        if (!found) {
          return { configured: false, message: `No specific budget configured for ${category}.` };
        }
        return {
          configured: true,
          category: found.category,
          limit: found.limit,
          message: `Budget for ${found.category} is ₹${found.limit}.`
        };
      }
    }),

    getFinancialHealth: tool({
      description: 'Get the verified Financial Health Score (0-100), health tier, active goals, and anomalies',
      parameters: z.object({}),
      execute: async () => {
        return {
          healthScore: context.healthScore,
          healthTier: context.healthTier,
          anomalyCount: context.anomalyCount || 0,
          budgetCount: budgets.length,
          goalCount: goals.length,
          goals: goals.map(g => ({ title: g.title, target: g.targetAmount, current: g.currentAmount }))
        };
      }
    })
  };
}

/**
 * Direct native Google Generative Language REST API caller (Node 18+ native fetch).
 * Zero-dependency, bulletproof fallback for when SDK or bundling issues occur.
 */
async function callDirectGeminiRest(apiKey, systemInstructions, history, userText) {
  const candidateModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];

  const contents = [];
  if (Array.isArray(history)) {
    for (const msg of history.slice(-10)) {
      if (msg && msg.content) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content.replace(/^\[Offline Mode[^\]]*\]\s*/i, '') }]
        });
      }
    }
  }
  contents.push({
    role: 'user',
    parts: [{ text: userText }]
  });

  const payload = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  };

  if (systemInstructions) {
    payload.system_instruction = {
      parts: [{ text: systemInstructions }]
    };
  }

  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.error?.message || `HTTP ${res.status}`;
        const errReason = data?.error?.details?.[0]?.reason || '';
        if (res.status === 400 && (errReason === 'API_KEY_INVALID' || errMsg.toLowerCase().includes('api key not valid'))) {
          return {
            errorType: 'INVALID_KEY',
            message: "⚠️ Google Gemini API Error: The configured GEMINI_API_KEY was rejected by Google (API key invalid or unauthorized). Please verify your key at https://aistudio.google.com and update it in Vercel Environment Variables."
          };
        }
        if (res.status === 429 || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate limit')) {
          return {
            errorType: 'RATE_LIMIT',
            message: "⚠️ Google Gemini Rate Limit: Your Gemini API quota or rate limit has been exceeded. Please check your usage limits at https://aistudio.google.com."
          };
        }
        lastError = errMsg;
        continue;
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) {
        return { success: true, text: text.trim(), model: modelName };
      }
    } catch (fetchErr) {
      lastError = fetchErr.message;
    }
  }

  return { errorType: 'API_FAILURE', message: lastError || 'Failed to generate response from Gemini API.' };
}

module.exports = async function handler(req, res) {
  // 1. CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Vaultly-Stream');

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
  const { message, context, history, stream: wantsStreamBody } = req.body || {};
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Invalid request: "message" string is required.' });
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length > 4000) {
    return res.status(400).json({ error: 'Message exceeds maximum length of 4000 characters.' });
  }

  const isStreamRequested = wantsStreamBody === true || 
    req.headers['x-vaultly-stream'] === 'true' || 
    (typeof req.headers.accept === 'string' && req.headers.accept.includes('text/event-stream'));

  // Normalize conversation history
  const conversationHistory = Array.isArray(history) ? history.slice(-20) : [];

  // 4. Server-Only API Keys (Zero client key acceptance, whitespace/quote sanitized)
  const rawGeminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;
  const geminiKey = rawGeminiKey ? rawGeminiKey.trim().replace(/^['"]|['"]$/g, '') : '';
  const rawOpenaiKey = process.env.OPENAI_API_KEY;
  const openaiKey = rawOpenaiKey ? rawOpenaiKey.trim().replace(/^['"]|['"]$/g, '') : '';

  // Determine if conversation involves finance or tools
  const financeMode = isFinanceRelated(trimmedMessage, conversationHistory);

  // Build rich system prompt with deep conversational awareness & anaphoric memory
  const totals = context?.totals || { totalIncome: 0, totalExpenses: 0, netBalance: 0 };
  const topCat = (context?.breakdown && context.breakdown[0]) ? context.breakdown[0] : null;

  let systemInstructions = `You are Vaultly AI, an intelligent, conversational, and highly perceptive assistant.

Persona & Communication Style:
- Sound natural, friendly, sharp, and concise — like a knowledgeable friend.
- Avoid robotic preamble like "Certainly!", "As an AI...", "According to your records...", or "I would be happy to assist you with...".
- Answer the user's question directly in the very first sentence.
- Use formatting (bullet points, bold highlights, mini-tables) when comparing data or presenting lists.
- Keep general chitchat snappy; save deep explanations for when requested.

Conversational Context & Memory:
- Maintain full context across multi-turn exchanges. Resolve references like:
  * "It", "that", "the previous one" -> Refer to the specific expense/income/topic discussed in previous turns.
  * "What about last month?" -> Immediately query or discuss last month's figures.
  * "Which category was highest?" -> Resolve against the relevant period discussed.
  * "How much on food?" -> Focus on Food & Dining.
- Gracefully handle typos, fragments, and informal language (e.g. "hw mch spnt", "spent 250 on lunch", "salary 50k received").
- Do not force every conversation into personal finance. If the user asks about coding, physics, cooking, or general advice, answer directly without mentioning expenses.

Financial Data & Tool Grounding:
- You have access to real financial data through context and tools.
- NEVER invent, guess, or hallucinate transactions, balances, or numbers.
- When numbers are asked, cite exact figures formatted with ₹ (INR).
- If financial data for a specific inquiry is not recorded or unavailable, clearly state so.

Transaction Intent & Pre-filling:
- When the user expresses intent to record a transaction (e.g. "I spent 250 on lunch", "Received 30000 salary yesterday"):
  1. Identify amount, category, type (income/expense), and date.
  2. Clearly confirm the details back to the user.
  3. Inform them that the entry is pre-filled for their review and ask for their confirmation before saving.
  4. Never state that a transaction was committed to the database without explicit user confirmation.`;

  if (context) {
    systemInstructions += `

Current Financial Context Snapshot:
- Total Income: ₹${totals.totalIncome || 0}
- Total Expenses: ₹${totals.totalExpenses || 0}
- Net Balance: ₹${totals.netBalance || 0}
- Top Category: ${topCat ? `${topCat.category} (₹${topCat.total}, ${topCat.percentage}%)` : 'None'}
- Total Transactions: ${context?.transactionCount || 0}
- Active Budgets: ${context?.budgetCount || 0}
- Active Goals: ${context?.goalCount || 0}${context?.healthScore !== undefined ? `\n- Financial Health Score: ${context.healthScore}/100 (${context.healthTier || 'Evaluated'})` : ''}${context?.anomalyCount !== undefined ? `\n- Flagged Anomalies: ${context.anomalyCount}` : ''}
${context?.lastMonthTotals ? `- Last Month: Income ₹${context.lastMonthTotals.totalIncome || 0}, Expenses ₹${context.lastMonthTotals.totalExpenses || 0}, Balance ₹${context.lastMonthTotals.netBalance || 0}` : ''}`;
  }

  // 5. Attempt AI Execution (Vercel AI SDK Core with Gemini 1.5 Flash -> Direct Gemini REST -> OpenAI)
  if (geminiKey || openaiKey) {
    let apiErrorDiagnostic = null;

    // Layer 1: Vercel AI SDK Core with Gemini 1.5 Flash
    if (geminiKey) {
      try {
        const { streamText, generateText, tool } = await import('ai');
        const { z } = await import('zod');
        const { createGoogleGenerativeAI } = await import('@ai-sdk/google');

        const google = createGoogleGenerativeAI({ apiKey: geminiKey });
        const modelInstance = google('gemini-1.5-flash');

        // Prepare unified message structure for Vercel AI SDK
        const messages = [];
        for (const msg of conversationHistory) {
          if (msg && msg.content && (msg.role === 'user' || msg.role === 'assistant')) {
            messages.push({
              role: msg.role,
              content: msg.content.replace(/^\[Offline Mode[^\]]*\]\s*/i, '') // strip offline prefix from history
            });
          }
        }
        messages.push({
          role: 'user',
          content: trimmedMessage
        });

        // Provide in-memory financial tools whenever context is available
        const tools = context ? createFinancialTools(context, z, tool) : undefined;

        if (isStreamRequested && typeof res.writeHead === 'function') {
          // Streaming text response via Vercel AI SDK
          const streamResult = streamText({
            model: modelInstance,
            system: systemInstructions,
            messages,
            tools,
            maxSteps: tools ? 3 : 1,
            temperature: 0.65
          });

          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('X-Vaultly-Source', 'ai-gemini');
          res.setHeader('X-Vaultly-Model', 'gemini-1.5-flash');
          return streamResult.pipeTextStreamToResponse(res);
        } else {
          // Synchronous full text generation (or testing/legacy clients)
          const result = await generateText({
            model: modelInstance,
            system: systemInstructions,
            messages,
            tools,
            maxSteps: tools ? 3 : 1,
            temperature: 0.65
          });

          if (result && result.text) {
            return res.status(200).json({
              reply: result.text.trim(),
              source: 'ai-gemini',
              model: 'gemini-1.5-flash'
            });
          }
        }
      } catch (sdkError) {
        console.warn('[Vaultly AI SDK] SDK error, attempting direct REST fallback:', sdkError.message);
        const errMsg = (sdkError.message || '').toLowerCase();
        if (errMsg.includes('api_key_invalid') || errMsg.includes('api key not valid') || sdkError.status === 400) {
          apiErrorDiagnostic = {
            type: 'INVALID_KEY',
            message: "⚠️ Google Gemini API Error: The configured GEMINI_API_KEY was rejected by Google (API key invalid or unauthorized). Please verify your key at https://aistudio.google.com and update it in Vercel Environment Variables."
          };
        } else if (sdkError.status === 429 || errMsg.includes('quota') || errMsg.includes('rate limit')) {
          apiErrorDiagnostic = {
            type: 'RATE_LIMIT',
            message: "⚠️ Google Gemini Rate Limit: Your Gemini API quota or rate limit has been exceeded. Please check your usage limits at https://aistudio.google.com."
          };
        }
      }
    }

    // Layer 2: Direct Google Generative Language REST API Fallback
    // (If Vercel AI SDK throws or has bundling issues, this native fetch guarantees 100% direct connection to Google Gemini)
    if (geminiKey && !apiErrorDiagnostic) {
      try {
        const restResult = await callDirectGeminiRest(geminiKey, systemInstructions, conversationHistory, trimmedMessage);
        if (restResult.success && restResult.text) {
          if (isStreamRequested && typeof res.writeHead === 'function') {
            res.writeHead(200, {
              'Content-Type': 'text/plain; charset=utf-8',
              'X-Vaultly-Source': 'ai-gemini-rest',
              'X-Vaultly-Model': restResult.model
            });
            res.write(restResult.text);
            return res.end();
          }
          return res.status(200).json({
            reply: restResult.text,
            source: 'ai-gemini-rest',
            model: restResult.model
          });
        }
        if (restResult.errorType === 'INVALID_KEY' || restResult.errorType === 'RATE_LIMIT') {
          apiErrorDiagnostic = { type: restResult.errorType, message: restResult.message };
        }
      } catch (restErr) {
        console.warn('[Vaultly REST] Direct Gemini REST call error:', restErr.message);
      }
    }

    // Layer 3: OpenAI Fallback (if OpenAI key configured)
    if (openaiKey && !apiErrorDiagnostic) {
      try {
        const { streamText, generateText, tool } = await import('ai');
        const { z } = await import('zod');
        const { createOpenAI } = await import('@ai-sdk/openai');
        const openai = createOpenAI({ apiKey: openaiKey });
        const modelInstance = openai('gpt-4o-mini');

        const messages = [];
        for (const msg of conversationHistory) {
          if (msg && msg.content && (msg.role === 'user' || msg.role === 'assistant')) {
            messages.push({
              role: msg.role,
              content: msg.content.replace(/^\[Offline Mode[^\]]*\]\s*/i, '')
            });
          }
        }
        messages.push({ role: 'user', content: trimmedMessage });

        const tools = context ? createFinancialTools(context, z, tool) : undefined;

        if (isStreamRequested && typeof res.writeHead === 'function') {
          const streamResult = streamText({
            model: modelInstance,
            system: systemInstructions,
            messages,
            tools,
            maxSteps: tools ? 3 : 1,
            temperature: 0.65
          });

          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('X-Vaultly-Source', 'ai-openai');
          res.setHeader('X-Vaultly-Model', 'gpt-4o-mini');
          return streamResult.pipeTextStreamToResponse(res);
        } else {
          const result = await generateText({
            model: modelInstance,
            system: systemInstructions,
            messages,
            tools,
            maxSteps: tools ? 3 : 1,
            temperature: 0.65
          });

          if (result && result.text) {
            return res.status(200).json({
              reply: result.text.trim(),
              source: 'ai-openai',
              model: 'gpt-4o-mini'
            });
          }
        }
      } catch (openAiErr) {
        console.warn('[Vaultly AI SDK] OpenAI init error:', openAiErr.message);
      }
    }

    // If an explicit API key error was diagnosed, surface it cleanly to the user
    if (apiErrorDiagnostic) {
      if (isStreamRequested && typeof res.writeHead === 'function') {
        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Vaultly-Source': 'api-diagnostic-error'
        });
        res.write(apiErrorDiagnostic.message);
        return res.end();
      }
      return res.status(200).json({
        reply: apiErrorDiagnostic.message,
        source: 'api-diagnostic-error'
      });
    }
  }

  // 6. Deterministic Local Fallback (zero key requirement, 100% offline-ready)
  const fallbackReply = generateDeterministicAnswer(trimmedMessage, context);

  if (isStreamRequested && typeof res.writeHead === 'function') {
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vaultly-Source': 'deterministic-fallback'
    });
    res.write(fallbackReply);
    return res.end();
  }

  return res.status(200).json({
    reply: fallbackReply,
    source: 'deterministic-fallback'
  });
};

// Export helpers for testing
module.exports.generateDeterministicAnswer = generateDeterministicAnswer;
module.exports.isRateLimited = isRateLimited;
module.exports.isFinanceRelated = isFinanceRelated;
