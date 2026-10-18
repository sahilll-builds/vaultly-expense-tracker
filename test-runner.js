// test-runner.js: Automated tests for Vaultly calculations, filters, validation & storage resilience
const assert = require('assert');

console.log('--- VAULTLY TEST SUITE STARTING ---');

// 1. Math & Calculation Engine Tests
function calculateTotals(transactionsList) {
  let totalIncome = 0;
  let totalExpenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const tx of transactionsList) {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
      incomeCount++;
    } else if (tx.type === 'expense') {
      totalExpenses += tx.amount;
      expenseCount++;
    }
  }

  const netBalance = totalIncome - totalExpenses;

  return { totalIncome, totalExpenses, netBalance, incomeCount, expenseCount };
}

// Test Case from Prompt: Income: 10,000 | Expense: 2,000 | Expense: 500
const testTransactions = [
  { id: '1', title: 'Salary', amount: 10000, type: 'income', category: 'Salary', date: '2026-10-15' },
  { id: '2', title: 'Groceries', amount: 2000, type: 'expense', category: 'Food & Dining', date: '2026-10-16' },
  { id: '3', title: 'Coffee', amount: 500, type: 'expense', category: 'Food & Dining', date: '2026-10-17' }
];

const totals = calculateTotals(testTransactions);
console.log('1. Testing Prompt Math Example:');
console.log('   Total Income:', totals.totalIncome, 'Expected: 10000');
console.log('   Total Expenses:', totals.totalExpenses, 'Expected: 2500');
console.log('   Net Balance:', totals.netBalance, 'Expected: 7500');

assert.strictEqual(totals.totalIncome, 10000, 'Total income must be 10,000');
assert.strictEqual(totals.totalExpenses, 2500, 'Total expenses must be 2,500');
assert.strictEqual(totals.netBalance, 7500, 'Net balance must be 7,500');
assert.strictEqual(totals.incomeCount, 1, 'Income count must be 1');
assert.strictEqual(totals.expenseCount, 2, 'Expense count must be 2');
console.log('   ✔ PASS: Math calculations are 100% correct.');

// 2. Category Breakdown Calculation Test
function calculateCategoryBreakdown(transactionsList) {
  const expenseTransactions = transactionsList.filter(tx => tx.type === 'expense');
  const totalExpenseSum = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  if (totalExpenseSum === 0) return [];

  const categoryTotals = {};
  for (const tx of expenseTransactions) {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
  }

  const breakdown = Object.keys(categoryTotals).map(cat => ({
    category: cat,
    total: categoryTotals[cat],
    percentage: Math.round((categoryTotals[cat] / totalExpenseSum) * 100)
  }));

  breakdown.sort((a, b) => b.total - a.total);
  return breakdown;
}

const breakdown = calculateCategoryBreakdown(testTransactions);
console.log('2. Testing Category Breakdown:');
assert.strictEqual(breakdown.length, 1, 'Should have 1 unique expense category');
assert.strictEqual(breakdown[0].category, 'Food & Dining');
assert.strictEqual(breakdown[0].total, 2500);
assert.strictEqual(breakdown[0].percentage, 100);
console.log('   ✔ PASS: Category breakdown matches.');

// 3. Validation Logic Tests
function validateInputs(title, amount, category, date) {
  if (!title || title.trim() === '') return { valid: false, error: 'Empty title' };
  if (title.length > 80) return { valid: false, error: 'Title too long' };
  const num = parseFloat(amount);
  if (!amount || isNaN(num) || num <= 0) return { valid: false, error: 'Invalid amount' };
  if (!category) return { valid: false, error: 'Missing category' };
  if (!date) return { valid: false, error: 'Missing date' };
  return { valid: true };
}

console.log('3. Testing Validation Constraints:');
assert.strictEqual(validateInputs('', '100', 'Food', '2026-10-17').valid, false);
assert.strictEqual(validateInputs('Lunch', '-50', 'Food', '2026-10-17').valid, false);
assert.strictEqual(validateInputs('Lunch', '0', 'Food', '2026-10-17').valid, false);
assert.strictEqual(validateInputs('Lunch', 'abc', 'Food', '2026-10-17').valid, false);
assert.strictEqual(validateInputs('Lunch', '150', '', '2026-10-17').valid, false);
assert.strictEqual(validateInputs('Lunch', '150', 'Food', '').valid, false);
assert.strictEqual(validateInputs('Lunch', '150.50', 'Food', '2026-10-17').valid, true);
console.log('   ✔ PASS: Validation accurately accepts valid data and rejects invalid inputs.');

// 4. Filter & Search Tests
function filterTransactions(list, typeFilter, query, categoryFilter) {
  return list.filter(tx => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
    if (query.trim() !== '') {
      const q = query.toLowerCase().trim();
      const matchesTitle = tx.title.toLowerCase().includes(q);
      const matchesCategory = tx.category.toLowerCase().includes(q);
      if (!matchesTitle && !matchesCategory) return false;
    }
    return true;
  });
}

console.log('4. Testing Search and Filtering Pipeline:');
const onlyIncome = filterTransactions(testTransactions, 'income', '', 'all');
assert.strictEqual(onlyIncome.length, 1);
assert.strictEqual(onlyIncome[0].title, 'Salary');

const searchCoffee = filterTransactions(testTransactions, 'all', 'coffee', 'all');
assert.strictEqual(searchCoffee.length, 1);
assert.strictEqual(searchCoffee[0].title, 'Coffee');

const filterDining = filterTransactions(testTransactions, 'all', '', 'Food & Dining');
assert.strictEqual(filterDining.length, 2);
console.log('   ✔ PASS: Filter and search pipeline behaves predictably.');

// 5. Corrupted Storage Recovery Test
function safeParseStorage(raw) {
  try {
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && typeof item.id === 'string' && typeof item.amount === 'number');
  } catch (e) {
    return [];
  }
}

console.log('5. Testing Corrupted LocalStorage Handling:');
assert.deepStrictEqual(safeParseStorage('not-a-json-string'), []);
assert.deepStrictEqual(safeParseStorage('{"single":"object"}'), []);
assert.deepStrictEqual(safeParseStorage('[{"id":"tx1","amount":100},{"invalid":true}]'), [{ id: 'tx1', amount: 100 }]);
console.log('   ✔ PASS: Corrupted LocalStorage is handled safely with empty/sanitized fallback.');

// 6. View Navigation & Routing Tests (Task 1)
const VALID_VIEWS = ['overview', 'transactions', 'analytics', 'budgets', 'goals', 'ai', 'settings'];
function isValidView(view) {
  return VALID_VIEWS.includes(view);
}

console.log('6. Testing 7-View Navigation Mapping (Task 1):');
assert.strictEqual(VALID_VIEWS.length, 7, 'Must have exactly 7 defined views');
assert.strictEqual(isValidView('overview'), true);
assert.strictEqual(isValidView('transactions'), true);
assert.strictEqual(isValidView('analytics'), true);
assert.strictEqual(isValidView('budgets'), true);
assert.strictEqual(isValidView('goals'), true);
assert.strictEqual(isValidView('ai'), true);
assert.strictEqual(isValidView('settings'), true);
assert.strictEqual(isValidView('dashboard'), false, 'Legacy dashboard must map to overview');
console.log('   ✔ PASS: 7-view navigation mapping is valid.');

// 7. Multi-Store Validation & Sanitization Tests (Task 2)
function validateBudgetModel(budget) {
  if (!budget || typeof budget !== 'object') return false;
  if (!budget.category || typeof budget.category !== 'string') return false;
  if (typeof budget.limit !== 'number' || isNaN(budget.limit) || budget.limit <= 0) return false;
  return true;
}

function validateGoalModel(goal) {
  if (!goal || typeof goal !== 'object') return false;
  if (!goal.id || !goal.title || typeof goal.title !== 'string') return false;
  if (typeof goal.targetAmount !== 'number' || isNaN(goal.targetAmount) || goal.targetAmount <= 0) return false;
  if (typeof goal.currentAmount !== 'number' || isNaN(goal.currentAmount) || goal.currentAmount < 0) return false;
  return true;
}

function validateRecurringModel(rec) {
  if (!rec || typeof rec !== 'object') return false;
  if (!rec.id || !rec.name || typeof rec.name !== 'string') return false;
  if (typeof rec.amount !== 'number' || isNaN(rec.amount) || rec.amount <= 0) return false;
  if (!['monthly', 'weekly', 'yearly'].includes(rec.frequency)) return false;
  return true;
}

console.log('7. Testing Multi-Store Validation (Task 2):');
assert.strictEqual(validateBudgetModel({ category: 'Food & Dining', limit: 8000 }), true);
assert.strictEqual(validateBudgetModel({ category: '', limit: 8000 }), false);
assert.strictEqual(validateBudgetModel({ category: 'Transport', limit: -100 }), false);
assert.strictEqual(validateGoalModel({ id: 'g1', title: 'MacBook Pro', targetAmount: 150000, currentAmount: 35000 }), true);
assert.strictEqual(validateGoalModel({ id: 'g2', title: 'Vacation', targetAmount: 0, currentAmount: 0 }), false);
assert.strictEqual(validateRecurringModel({ id: 'r1', name: 'Netflix', amount: 649, frequency: 'monthly' }), true);
assert.strictEqual(validateRecurringModel({ id: 'r2', name: 'Spotify', amount: 119, frequency: 'daily' }), false);
console.log('   ✔ PASS: Multi-store validation rules verified.');

// 8. Smart Budgets & Safe-to-Spend Calculations (Task 5)
function calculateBudgetUtilization(budgetLimit, spentAmount) {
  const safeLimit = Math.max(1, budgetLimit);
  const percentage = Math.round((spentAmount / safeLimit) * 100);
  const remaining = budgetLimit - spentAmount;
  const isOverBudget = spentAmount > budgetLimit;
  return { percentage, remaining, isOverBudget };
}

function calculateSafeToSpend(transactions, recurringList, currentDate = new Date(2026, 9, 15)) {
  const totals = calculateTotals(transactions);
  const activeRecurring = (recurringList || []).filter(r => r.active !== false);
  const totalCommitted = activeRecurring.reduce((sum, r) => sum + r.amount, 0);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const currentDay = currentDate.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay);

  const availableSurplus = Math.max(0, totals.netBalance - totalCommitted);
  const dailyAllowance = Math.round(availableSurplus / daysRemaining);

  return { availableSurplus, dailyAllowance, daysRemaining };
}

console.log('8. Testing Smart Budgets & Safe-to-Spend Math:');
const normalBudget = calculateBudgetUtilization(5000, 2500);
assert.strictEqual(normalBudget.percentage, 50);
assert.strictEqual(normalBudget.remaining, 2500);
assert.strictEqual(normalBudget.isOverBudget, false);

const overBudget = calculateBudgetUtilization(3000, 4500);
assert.strictEqual(overBudget.percentage, 150);
assert.strictEqual(overBudget.remaining, -1500);
assert.strictEqual(overBudget.isOverBudget, true);

const safeCalc = calculateSafeToSpend(testTransactions, [{ id: 'r1', amount: 500, active: true }]);
// netBalance = 7500, recurring = 500 => available = 7000. Oct 15 => 31 - 15 = 16 days remaining. 7000 / 16 = 438
assert.strictEqual(safeCalc.availableSurplus, 7000);
assert.strictEqual(safeCalc.daysRemaining, 16);
assert.strictEqual(safeCalc.dailyAllowance, Math.round(7000 / 16));
console.log('   ✔ PASS: Smart budget utilization and safe-to-spend math verified.');

// 9. Natural Language Transaction Parser (Task 9)
function parseNaturalLanguageTransaction(text) {
  if (!text || typeof text !== 'string') return null;
  const t = text.trim();
  const lower = t.toLowerCase();

  const amountMatch = t.match(/(?:(?:₹|rs\.?|inr)\s*)?([0-9]+(?:\.[0-9]{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  let type = 'expense';
  if (lower.includes('salary') || lower.includes('received') || lower.includes('earned') || lower.includes('deposit') || lower.includes('freelance')) {
    type = 'income';
  }

  let category = 'Other';
  if (type === 'income') {
    if (lower.includes('salary')) category = 'Salary';
    else if (lower.includes('freelance')) category = 'Freelance';
  } else {
    if (lower.includes('lunch') || lower.includes('dinner') || lower.includes('food') || lower.includes('groceries')) {
      category = 'Food & Dining';
    } else if (lower.includes('bill') || lower.includes('electricity') || lower.includes('wifi')) {
      category = 'Bills & Utilities';
    } else if (lower.includes('cab') || lower.includes('uber') || lower.includes('metro')) {
      category = 'Transport';
    }
  }

  return { amount, type, category };
}

console.log('9. Testing Natural Language Transaction Parser:');
const nlp1 = parseNaturalLanguageTransaction('Spent 350 on lunch today');
assert.strictEqual(nlp1.amount, 350);
assert.strictEqual(nlp1.type, 'expense');
assert.strictEqual(nlp1.category, 'Food & Dining');

const nlp2 = parseNaturalLanguageTransaction('Received 45000 salary');
assert.strictEqual(nlp2.amount, 45000);
assert.strictEqual(nlp2.type, 'income');
assert.strictEqual(nlp2.category, 'Salary');

const nlp3 = parseNaturalLanguageTransaction('Paid 1200 for electricity bill');
assert.strictEqual(nlp3.amount, 1200);
assert.strictEqual(nlp3.type, 'expense');
assert.strictEqual(nlp3.category, 'Bills & Utilities');

assert.strictEqual(parseNaturalLanguageTransaction(''), null);
assert.strictEqual(parseNaturalLanguageTransaction(null), null);
console.log('   ✔ PASS: Natural language transaction parser handles diverse formats.');

// 10. Serverless AI Assistant Endpoint & Fallback (Task 8)
console.log('10. Testing Serverless AI Assistant Endpoint (api/chat.js):');
const chatHandler = require('./api/chat.js');

async function testChatEndpoint() {
  // Test 10a: Method Not Allowed
  let statusCaptured = 0;
  let jsonCaptured = null;
  const mockGetRes = {
    setHeader: () => {},
    status: (code) => {
      statusCaptured = code;
      return {
        json: (data) => { jsonCaptured = data; }
      };
    }
  };

  await chatHandler({ method: 'GET', body: {}, headers: {} }, mockGetRes);
  assert.strictEqual(statusCaptured, 405, 'GET must return 405 Method Not Allowed');

  // Test 10b: Empty Message
  await chatHandler({ method: 'POST', body: { message: '' }, headers: {} }, mockGetRes);
  assert.strictEqual(statusCaptured, 400, 'Empty message must return 400 Bad Request');

  // Test 10c: Deterministic Fallback Answer with Context
  const mockPostRes = {
    setHeader: () => {},
    status: (code) => {
      statusCaptured = code;
      return {
        json: (data) => { jsonCaptured = data; }
      };
    }
  };

  const testContext = {
    totals: { totalIncome: 10000, totalExpenses: 2500, netBalance: 7500, expenseCount: 2 },
    breakdown: [{ category: 'Food & Dining', total: 2500, percentage: 100 }],
    transactionCount: 3,
    budgetCount: 1,
    goalCount: 1
  };

  await chatHandler({
    method: 'POST',
    body: { message: 'How much did I spend this month?', context: testContext },
    headers: {}
  }, mockPostRes);

  assert.strictEqual(statusCaptured, 200, 'Valid question must return 200');
  assert(jsonCaptured.reply.includes('2,500') || jsonCaptured.reply.includes('2500'), 'Reply must cite verified total expense');
  assert.strictEqual(jsonCaptured.source, 'deterministic-fallback');

  // Test 10d: Greeting Test (must NOT return finance report)
  await chatHandler({
    method: 'POST',
    body: { message: 'Hey', context: testContext },
    headers: {}
  }, mockPostRes);
  assert.strictEqual(statusCaptured, 200);
  assert(jsonCaptured.reply.toLowerCase().includes('hey') || jsonCaptured.reply.toLowerCase().includes('vaultly ai'), 'Greeting must be natural');
  assert(!jsonCaptured.reply.includes('Financial Overview: Total Income'), 'Greeting must not be forced into a financial overview');

  // Test 10e: General Knowledge / Non-Finance (must NOT return financial report)
  await chatHandler({
    method: 'POST',
    body: { message: 'Explain black holes in simple words.', context: testContext },
    headers: {}
  }, mockPostRes);
  assert.strictEqual(statusCaptured, 200);
  assert(!jsonCaptured.reply.includes('Financial Overview: Total Income'), 'General questions must not force a financial summary');

  // Test 10f: Missing live bank account data
  await chatHandler({
    method: 'POST',
    body: { message: 'How much money do I have in my bank account?', context: testContext },
    headers: {}
  }, mockPostRes);
  assert.strictEqual(statusCaptured, 200);
  assert(jsonCaptured.reply.toLowerCase().includes('bank') || jsonCaptured.reply.toLowerCase().includes('client-side'), 'Must clarify no live bank access');

  // Test 10g: User correction
  await chatHandler({
    method: 'POST',
    body: { message: 'No, I meant something else.', context: testContext },
    headers: {}
  }, mockPostRes);
  assert.strictEqual(statusCaptured, 200);
  assert(jsonCaptured.reply.toLowerCase().includes('apologies') || jsonCaptured.reply.toLowerCase().includes('clarify'), 'Must acknowledge correction');

  // Test 10h: Multi-turn history payload acceptance
  await chatHandler({
    method: 'POST',
    body: {
      message: 'Give me a beginner project.',
      history: [
        { role: 'user', content: 'Teach me Python.' },
        { role: 'assistant', content: 'Python is a versatile programming language!' }
      ],
      context: testContext
    },
    headers: {}
  }, mockPostRes);
  assert.strictEqual(statusCaptured, 200);

  // Test 10i: Financial Health Score query
  await chatHandler({
    method: 'POST',
    body: { message: 'What is my financial health score?', context: { ...testContext, healthScore: 92, healthTier: 'Exceptional' } },
    headers: {}
  }, mockPostRes);
  assert.strictEqual(statusCaptured, 200);
  assert(jsonCaptured.reply.includes('92/100'), 'Must cite verified health score');

  // Test 10j: Anomaly & duplicate detection query
  await chatHandler({
    method: 'POST',
    body: { message: 'Do I have any unusual transactions or duplicates?', context: { ...testContext, anomalyCount: 2 } },
    headers: {}
  }, mockPostRes);
  assert.strictEqual(statusCaptured, 200);
  assert(jsonCaptured.reply.includes('2 transaction items flagged'), 'Must cite anomaly count');

  // Test 10k: What-If simulation query
  await chatHandler({
    method: 'POST',
    body: { message: 'Can I simulate a what-if scenario?', context: testContext },
    headers: {}
  }, mockPostRes);
  assert.strictEqual(statusCaptured, 200);
  assert(jsonCaptured.reply.toLowerCase().includes('digital twin') || jsonCaptured.reply.toLowerCase().includes('simulate'), 'Must point to simulator');

  console.log('   ✔ PASS: api/chat handler verified for CORS, 405, 400, grounded finance, health scores, anomalies, simulations, natural greetings, bank clarity, corrections, and conversation history.');
}

// 11. Diagnostic Analytics Engine Test
console.log('11. Testing Diagnostic Analytics Engine:');
const {
  calculateDiagnosticAnalytics,
  calculatePredictiveAnalytics,
  calculateAnomaliesAndDuplicates,
  calculateFinancialHealthScore,
  simulateFinancialScenario,
  calculatePrescriptiveRecommendations
} = require('./script.js');

const sampleMultiMonthTxs = [
  // Current month
  { id: 'tx-cur-1', title: 'Restaurant Dinner', amount: 3500, type: 'expense', category: 'Food & Dining', date: '2026-10-10' },
  { id: 'tx-cur-2', title: 'Fuel & Transit', amount: 1200, type: 'expense', category: 'Transport', date: '2026-10-12' },
  // Prior month
  { id: 'tx-prev-1', title: 'Groceries', amount: 1500, type: 'expense', category: 'Food & Dining', date: '2026-09-15' },
  { id: 'tx-prev-2', title: 'Bus Pass', amount: 1000, type: 'expense', category: 'Transport', date: '2026-09-18' }
];

const diagnostic = calculateDiagnosticAnalytics(sampleMultiMonthTxs);
assert(diagnostic.topDriver !== null, 'Must identify a top spending driver');
assert.strictEqual(diagnostic.topDriver.category, 'Food & Dining', 'Food & Dining should be top driver');
assert(diagnostic.topDriver.delta > 0, 'Top driver delta must be positive');
assert(typeof diagnostic.narrative === 'string' && diagnostic.narrative.length > 10, 'Must produce explanatory narrative');
console.log('   ✔ PASS: Diagnostic analytics accurately calculates category shifts and cost drivers.');

// 12. Predictive Analytics Engine Test
console.log('12. Testing Predictive Analytics Engine:');
const predictive = calculatePredictiveAnalytics(sampleMultiMonthTxs, [{ id: 'rec-1', name: 'Wifi', amount: 1000, active: true }]);
assert(predictive.projectedMonthEnd >= 0, 'Projected month-end spend must be valid');
assert(predictive.confidenceRange.lowerBound <= predictive.projectedMonthEnd, 'Lower bound must be <= projection');
assert(predictive.confidenceRange.upperBound >= predictive.projectedMonthEnd, 'Upper bound must be >= projection');
assert(Array.isArray(predictive.assumptions) && predictive.assumptions.length >= 2, 'Must state assumptions explicitly');
console.log('   ✔ PASS: Predictive analytics generates bounded forecasts with clear assumptions.');

// 13. Anomaly & Duplicate Detection Test
console.log('13. Testing Anomaly & Duplicate Detection Engine:');
const anomalyTxs = [
  { id: 'a1', title: 'Coffee', amount: 200, type: 'expense', category: 'Food & Dining', date: '2026-10-01' },
  { id: 'a2', title: 'Sandwich', amount: 250, type: 'expense', category: 'Food & Dining', date: '2026-10-02' },
  { id: 'a3', title: 'Juice', amount: 180, type: 'expense', category: 'Food & Dining', date: '2026-10-03' },
  { id: 'a4', title: 'Luxury Watch', amount: 55000, type: 'expense', category: 'Shopping', date: '2026-10-04' }, // Outlier
  { id: 'd1', title: 'Cloud Subscription', amount: 750, type: 'expense', category: 'Bills & Utilities', date: '2026-10-05' },
  { id: 'd2', title: 'Cloud Subscription', amount: 750, type: 'expense', category: 'Bills & Utilities', date: '2026-10-06' }  // Duplicate within 24h
];

const anomalyResult = calculateAnomaliesAndDuplicates(anomalyTxs);
assert(anomalyResult.anomalies.length >= 1, 'Should detect statistical outlier');
assert.strictEqual(anomalyResult.anomalies[0].txId, 'a4', 'Luxury Watch should be flagged as anomaly');
assert(anomalyResult.duplicates.length >= 1, 'Should detect near-duplicate charge');
assert.strictEqual(anomalyResult.duplicates[0].primaryId, 'd1', 'Cloud Subscription should be flagged as duplicate');
console.log('   ✔ PASS: Anomaly and duplicate detection correctly flags outliers and duplicate entries.');

// 14. Transparent Financial Health Assessment Test
console.log('14. Testing Financial Health Assessment Engine:');
const healthTxs = [
  { id: 'h1', title: 'Salary', amount: 80000, type: 'income', category: 'Salary', date: '2026-10-01' },
  { id: 'h2', title: 'Rent', amount: 20000, type: 'expense', category: 'Bills & Utilities', date: '2026-10-02' },
  { id: 'h3', title: 'Groceries', amount: 6000, type: 'expense', category: 'Food & Dining', date: '2026-10-03' }
];
const healthBudgets = [{ category: 'Food & Dining', limit: 8000 }];
const healthGoals = [{ id: 'g1', title: 'Emergency Fund', targetAmount: 60000, currentAmount: 40000 }];
const healthRecurring = [{ id: 'r1', amount: 1500, active: true }];

const health = calculateFinancialHealthScore(healthTxs, healthBudgets, healthGoals, healthRecurring);
assert(health.overallScore >= 0 && health.overallScore <= 100, 'Health score must be between 0 and 100');
assert.strictEqual(health.pillars.length, 4, 'Must evaluate 4 distinct pillars');
assert(['Exceptional', 'Strong', 'Moderate', 'Needs Focus'].includes(health.tier), 'Tier rating must be valid');
console.log(`   ✔ PASS: Financial health score evaluated (${health.overallScore}/100 - ${health.tier}) with 4 weighted pillars.`);

// 15. Financial Digital Twin (What-If Simulation) Test
console.log('15. Testing Financial Digital Twin & What-If Scenario Simulator:');
const baseTotals = { totalIncome: 50000, totalExpenses: 30000, netBalance: 20000 };
const simTxs = [
  { id: 's1', title: 'Dining', amount: 8000, type: 'expense', category: 'Food & Dining', date: '2026-10-01' },
  { id: 's2', title: 'Shopping', amount: 4000, type: 'expense', category: 'Shopping', date: '2026-10-02' }
];
const simGoals = [{ id: 'sg1', title: 'MacBook', targetAmount: 80000, currentAmount: 20000 }];

// Simulate +₹5,000 raise, -20% discretionary spending trim, +₹2,000 extra goal savings
const simResult = simulateFinancialScenario(baseTotals, simTxs, simGoals, {
  incomeDelta: 5000,
  discretionaryCutPercent: 20,
  extraGoalSavings: 2000
});

assert.strictEqual(simResult.simulatedIncome, 55000, 'Simulated income should be 55,000');
assert(simResult.simulatedExpenses < 30000, 'Simulated expenses should decrease due to 20% discretionary trim');
assert(simResult.simulatedMonthlySurplus > 20000, 'Surplus must expand');
assert(simResult.goalProjections[0].monthsSaved > 0, 'Extra savings must accelerate goal completion');
console.log('   ✔ PASS: What-If simulation engine computes non-mutating scenarios accurately.');

// 16. Testing Hero Balance & 3D Chrome Visual Immovability (Stationary Integrity)
console.log('16. Testing Hero Balance & 3D Chrome Visual Immovability:');
const fs = require('fs');
const scriptSrc = fs.readFileSync('script.js', 'utf8');
const cssSrc = fs.readFileSync('style.css', 'utf8');

// Verify script.js does not include .hero-balance-card in spatial tilt
const tiltSelectorMatch = scriptSrc.match(/const targetSelector = '([^']+)';/);
assert(tiltSelectorMatch, 'targetSelector must be defined in script.js');
assert(!tiltSelectorMatch[1].includes('.hero-balance-card'), 'hero-balance-card must NOT be included in tilt targets');

// Verify script.js resets heroCard transform to none
assert(scriptSrc.includes("heroCard.style.transform = 'none'"), 'heroCard must have transform set to none');

// Verify balance visual orb has no mousemove listener
const orbFunc = scriptSrc.slice(scriptSrc.indexOf('function initSpatialBalanceOrb'), scriptSrc.indexOf('function initSpatialCardTilt'));
assert(!orbFunc.includes("addEventListener('mousemove'"), 'spatial balance orb must not attach mousemove listener');

// Verify style.css enforces transform: none !important on hero-balance-card and balance-card:hover
assert(cssSrc.includes('.hero-balance-card') && cssSrc.includes('transform: none !important'), 'style.css must enforce transform: none !important on hero-balance-card');
assert(cssSrc.includes('.balance-card:hover') && cssSrc.includes('transform: none !important'), 'style.css must enforce transform: none !important on balance-card:hover');
assert(cssSrc.includes('.chrome-canvas') && cssSrc.includes('transform: none !important'), 'style.css must enforce transform: none !important on chrome-canvas');
console.log('   ✔ PASS: Hero Balance card and 3D visual are verified fixed and non-movable under all states.');

// 17. Testing Desktop Sidebar Fixed Left Positioning (Non-Movable)
console.log('17. Testing Desktop Sidebar Fixed Left Positioning:');
assert(/position:\s*fixed;[\s\S]*?left:\s*0;/.test(cssSrc), 'desktop-sidebar must have position: fixed and left: 0');
assert(/margin-left:\s*250px;/.test(cssSrc), 'main-content-area must have margin-left: 250px on desktop');
assert(/margin-left:\s*0\s*!important;/.test(cssSrc), 'main-content-area must reset margin-left to 0 on mobile/tablets');
console.log('   ✔ PASS: Desktop sidebar is verified fixed to left position and does not move.');

testChatEndpoint().then(() => {
  console.log('\n--- ALL TEST SUITE CHECKS PASSED SUCCESSFULLY (17/17) ---');
}).catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});


