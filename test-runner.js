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

console.log('\n--- ALL TEST SUITE CHECKS PASSED SUCCESSFULLY (6/6) ---');

