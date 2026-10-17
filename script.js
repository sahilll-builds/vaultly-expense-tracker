/**
 * ==============================================================================
 * VAULTLY — Personal Finance & Expense Tracker
 * Architecture: Clean Vanilla JavaScript (ES6+) with Separation of Concerns
 *
 * Core Modules:
 * 1. Constants & Category Taxonomy
 * 2. Application State Management
 * 3. Local Storage Persistence & Error Recovery
 * 4. Financial Calculation Engine
 * 5. Internationalization & Formatting (INR Currency & Dates)
 * 6. DOM Element Selectors & Cache
 * 7. Rendering Engine (Cards, Transactions, Categories, Fallbacks)
 * 8. Chart.js Visualization Controller
 * 9. Form Validation & Transaction Handling
 * 10. Delete Confirmation Flow
 * 11. Search, Filtering, and Sorting Pipeline
 * 12. Demo Data & Reset Handlers
 * 13. UI Enhancements (Toasts, Mobile Drawer, Greetings)
 * 14. Initialization Bootstrap
 * ==============================================================================
 */

'use strict';

/* ==============================================================================
   1. CONSTANTS & CATEGORY TAXONOMY
   ============================================================================== */

/**
 * Storage key used to persist transactions in the browser's Local Storage.
 * Using a dedicated namespace prevents collisions with other web applications.
 */
const STORAGE_KEY = 'vaultly_transactions';

/**
 * Expense Categories with metadata for icons and chart color mapping.
 * Colors adhere to the Cosmic Glassmorphism aesthetic.
 */
const EXPENSE_CATEGORIES = [
  { id: 'Food & Dining', name: 'Food & Dining', icon: 'utensils', color: '#70F0B2' },
  { id: 'Transport', name: 'Transport', icon: 'car', color: '#53DDE0' },
  { id: 'Shopping', name: 'Shopping', icon: 'shopping-bag', color: '#FFD38A' },
  { id: 'Bills & Utilities', name: 'Bills & Utilities', icon: 'zap', color: '#A78BFA' },
  { id: 'Education', name: 'Education', icon: 'book-open', color: '#6C8CFF' },
  { id: 'Entertainment', name: 'Entertainment', icon: 'film', color: '#FF8F9C' },
  { id: 'Health', name: 'Health', icon: 'heart-pulse', color: '#38BDF8' },
  { id: 'Other', name: 'Other', icon: 'more-horizontal', color: '#91A7FF' }
];

/**
 * Income Categories for categorizing inward cash flow.
 */
const INCOME_CATEGORIES = [
  { id: 'Salary', name: 'Salary', icon: 'briefcase', color: '#70F0B2' },
  { id: 'Freelance', name: 'Freelance', icon: 'laptop', color: '#53DDE0' },
  { id: 'Allowance', name: 'Allowance', icon: 'gift', color: '#FFD38A' },
  { id: 'Business', name: 'Business', icon: 'trending-up', color: '#6C8CFF' },
  { id: 'Other', name: 'Other', icon: 'dollar-sign', color: '#A78BFA' }
];

/**
 * Curated Demo Transactions to help first-time users explore features immediately.
 * Dates are dynamically adjusted relative to today's date when loaded.
 */
const SAMPLE_TRANSACTIONS = [
  {
    id: 'demo-tx-1',
    title: 'Monthly Software Engineering Salary',
    amount: 65000,
    type: 'income',
    category: 'Salary',
    dateOffsetDays: 3,
    notes: 'Direct bank deposit from employer'
  },
  {
    id: 'demo-tx-2',
    title: 'Apartment Electricity & Water Utility',
    amount: 3200,
    type: 'expense',
    category: 'Bills & Utilities',
    dateOffsetDays: 2,
    notes: 'Power corporation bill'
  },
  {
    id: 'demo-tx-3',
    title: 'Supermarket Grocery & Household Stock',
    amount: 4850,
    type: 'expense',
    category: 'Food & Dining',
    dateOffsetDays: 1,
    notes: 'Fresh veggies, staples, and fruits'
  },
  {
    id: 'demo-tx-4',
    title: 'Frontend UI/UX Consulting Project',
    amount: 15000,
    type: 'income',
    category: 'Freelance',
    dateOffsetDays: 1,
    notes: 'Client milestone completion payout'
  },
  {
    id: 'demo-tx-5',
    title: 'Metro Commute & Fuel Refill',
    amount: 1450,
    type: 'expense',
    category: 'Transport',
    dateOffsetDays: 0,
    notes: 'Weekly travel pass and fuel'
  }
];

/* ==============================================================================
   2. APPLICATION STATE MANAGEMENT
   Single source of truth for the active session.
   ============================================================================== */

const state = {
  transactions: [],          // Array of transaction objects
  activeTypeFilter: 'all',   // 'all' | 'income' | 'expense'
  searchQuery: '',           // Current search filter string
  selectedCategory: 'all',   // Category filter or 'all'
  sortBy: 'date-desc',       // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'
  pendingDeleteId: null,     // Holds ID while delete confirmation modal is open
  chartInstance: null        // References active Chart.js instance for cleanup
};

/* ==============================================================================
   3. LOCAL STORAGE PERSISTENCE & ERROR RECOVERY
   Safe JSON serialization with defensive error handling.
   ============================================================================== */

/**
 * Safely loads transactions from the browser's Local Storage.
 * Returns an empty array if storage is empty or contains malformed data.
 * @returns {Array<Object>} List of valid transactions
 */
function loadTransactions() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return [];
    }

    const parsed = JSON.parse(rawData);

    // Defensively verify parsed output is an array
    if (!Array.isArray(parsed)) {
      console.warn('[Vaultly] Stored data was not an array. Resetting to empty list.');
      return [];
    }

    // Filter and sanitize items to ensure required fields exist
    return parsed.filter(item => (
      item &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.amount === 'number' &&
      !isNaN(item.amount) &&
      (item.type === 'income' || item.type === 'expense') &&
      typeof item.category === 'string' &&
      typeof item.date === 'string'
    ));
  } catch (error) {
    console.error('[Vaultly] Failed to load transactions from Local Storage:', error);
    showToast('Could not load saved transactions. Local storage might be corrupted.', 'danger');
    return [];
  }
}

/**
 * Persists transactions array into Local Storage.
 * @param {Array<Object>} transactionsList - Array to serialize
 * @returns {boolean} True if successfully saved
 */
function saveTransactions(transactionsList) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactionsList));
    return true;
  } catch (error) {
    console.error('[Vaultly] Local Storage save error:', error);
    showToast('Failed to save to local storage. Your browser storage might be full.', 'danger');
    return false;
  }
}

/* ==============================================================================
   4. FINANCIAL CALCULATION ENGINE
   All metrics are computed purely on-the-fly from stored records.
   ============================================================================== */

/**
 * Calculates financial totals from transaction records.
 * @param {Array<Object>} transactionsList
 * @returns {{ totalIncome: number, totalExpenses: number, netBalance: number, incomeCount: number, expenseCount: number }}
 */
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

  // Net Balance is defined strictly as: Total Income − Total Expenses
  const netBalance = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    incomeCount,
    expenseCount
  };
}

/**
 * Aggregates expenses grouped by category for Chart.js and breakdown cards.
 * @param {Array<Object>} transactionsList
 * @returns {Array<{ category: string, total: number, percentage: number, color: string }>}
 */
function calculateCategoryBreakdown(transactionsList) {
  const expenseTransactions = transactionsList.filter(tx => tx.type === 'expense');
  const totalExpenseSum = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  if (totalExpenseSum === 0) {
    return [];
  }

  const categoryTotals = {};

  for (const tx of expenseTransactions) {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
  }

  // Map to structured breakdown array with colors
  const breakdown = Object.keys(categoryTotals).map(categoryName => {
    const total = categoryTotals[categoryName];
    const categoryMeta = EXPENSE_CATEGORIES.find(c => c.name === categoryName) || {
      color: '#9CA3AF'
    };

    return {
      category: categoryName,
      total: total,
      percentage: Math.round((total / totalExpenseSum) * 100),
      color: categoryMeta.color
    };
  });

  // Sort descending by highest spending
  breakdown.sort((a, b) => b.total - a.total);

  return breakdown;
}

/* ==============================================================================
   5. INTERNATIONALIZATION & FORMATTING (INR CURRENCY & DATES)
   ============================================================================== */

/**
 * Standard Indian Rupee (INR) currency formatter using the modern Intl API.
 * e.g., 65000 -> ₹65,000.00
 */
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

/**
 * Formats a numeric amount to INR.
 * @param {number} amount
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0.00';
  }
  return inrFormatter.format(amount);
}

/**
 * Formats a standard YYYY-MM-DD date string into a user-friendly date.
 * e.g., '2026-10-17' -> '17 Oct 2026'
 * @param {string} dateString - YYYY-MM-DD
 * @returns {string} Human readable date
 */
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);

    return dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Returns today's date formatted as YYYY-MM-DD for form default value.
 * @returns {string}
 */
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* ==============================================================================
   6. DOM ELEMENT SELECTORS
   Cached element references for clean performance and readability.
   ============================================================================== */

const DOM = {
  // Navigation & Drawer
  mobileMenuToggle: document.getElementById('mobileMenuToggle'),
  mobileDrawer: document.getElementById('mobileDrawer'),
  mobileDrawerBackdrop: document.getElementById('mobileDrawerBackdrop'),
  closeDrawerBtn: document.getElementById('closeDrawerBtn'),
  desktopNavItems: document.querySelectorAll('.nav-links-desktop .nav-item'),
  drawerLinks: document.querySelectorAll('.drawer-links .drawer-link'),
  dynamicGreeting: document.getElementById('dynamicGreeting'),
  currentDateDisplay: document.getElementById('currentDateDisplay'),

  // Summary Metrics
  totalBalance: document.getElementById('totalBalance'),
  balanceStatusBadge: document.getElementById('balanceStatusBadge'),
  totalIncome: document.getElementById('totalIncome'),
  incomeCountLabel: document.getElementById('incomeCountLabel'),
  totalExpense: document.getElementById('totalExpense'),
  expenseCountLabel: document.getElementById('expenseCountLabel'),

  // Safe to Spend Elements
  safeDailySpend: document.getElementById('safeDailySpend'),
  monthDaysTag: document.getElementById('monthDaysTag'),
  monthProgressBar: document.getElementById('monthProgressBar'),
  monthProgressPercent: document.getElementById('monthProgressPercent'),
  safeSpendDesc: document.getElementById('safeSpendDesc'),

  // Spending Insights Elements
  insightTopCategory: document.getElementById('insightTopCategory'),
  insightLargestTx: document.getElementById('insightLargestTx'),
  insightSavingsRate: document.getElementById('insightSavingsRate'),

  // Chart & Breakdown
  chartContainer: document.getElementById('chartContainer'),
  spendingChartCanvas: document.getElementById('spendingChart'),
  chartEmptyState: document.getElementById('chartEmptyState'),
  chartExpenseTotalBadge: document.getElementById('chartExpenseTotalBadge'),
  categoryBreakdownList: document.getElementById('categoryBreakdownList'),
  chartAddExpenseBtn: document.getElementById('chartAddExpenseBtn'),

  // Transactions & Toolbar
  transactionCountBadge: document.getElementById('transactionCountBadge'),
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  filterPills: document.querySelectorAll('.filter-pill'),
  categoryFilterSelect: document.getElementById('categoryFilterSelect'),
  sortSelect: document.getElementById('sortSelect'),
  transactionsList: document.getElementById('transactionsList'),
  emptyStateNoData: document.getElementById('emptyStateNoData'),
  emptyStateNoResults: document.getElementById('emptyStateNoResults'),
  resetFiltersBtn: document.getElementById('resetFiltersBtn'),

  // Add Transaction Modal
  openAddModalBtn: document.getElementById('openAddModalBtn'),
  transactionModal: document.getElementById('transactionModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),
  transactionForm: document.getElementById('transactionForm'),
  typeExpenseRadio: document.getElementById('typeExpense'),
  typeIncomeRadio: document.getElementById('typeIncome'),
  txTitleInput: document.getElementById('txTitle'),
  txAmountInput: document.getElementById('txAmount'),
  txCategorySelect: document.getElementById('txCategory'),
  txDateInput: document.getElementById('txDate'),
  txNotesInput: document.getElementById('txNotes'),

  // Form Validation Errors
  txTitleError: document.getElementById('txTitleError'),
  txAmountError: document.getElementById('txAmountError'),
  txCategoryError: document.getElementById('txCategoryError'),
  txDateError: document.getElementById('txDateError'),

  // Delete Confirmation Modal
  deleteConfirmModal: document.getElementById('deleteConfirmModal'),
  deleteTargetTitle: document.getElementById('deleteTargetTitle'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer'),

  // Demo & Reset Buttons (Desktop Header, Mobile Drawer & Empty States)
  loadDemoBtn: document.getElementById('loadDemoBtn'),
  clearAllBtn: document.getElementById('clearAllBtn'),
  loadDemoBtnMobile: document.getElementById('loadDemoBtnMobile'),
  clearAllBtnMobile: document.getElementById('clearAllBtnMobile'),
  emptyAddFirstBtn: document.getElementById('emptyAddFirstBtn'),
  emptyLoadDemoBtn: document.getElementById('emptyLoadDemoBtn')
};

/* ==============================================================================
   7. RENDERING ENGINE
   Safe DOM construction without unsanitized innerHTML.
   ============================================================================== */

/**
 * Master render routine: synchronizes all visual components with state.
 */
function renderDashboard() {
  renderSummaryCards();
  renderSafeToSpend();
  renderSpendingInsights();
  renderTransactionsList();
  renderChart();
  renderCategoryBreakdown();
  renderFilterCategoryOptions();
  refreshIcons();
}

/**
 * Smoothly animates a numeric currency value on a DOM element (Magic UI number-ticker style).
 * If user prefers reduced motion, snaps directly without animation.
 * @param {HTMLElement} element - Target DOM element
 * @param {number} targetValue - Number to animate to
 * @param {number} [duration=450] - Animation duration in ms
 */
function animateCurrencyTicker(element, targetValue, duration = 450) {
  if (!element) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    element.textContent = formatCurrency(targetValue);
    return;
  }

  const startValue = typeof element._currentValue === 'number' ? element._currentValue : 0;
  element._currentValue = targetValue;

  if (startValue === targetValue) {
    element.textContent = formatCurrency(targetValue);
    return;
  }

  const startTime = performance.now();

  function updateTicker(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Smooth easeOutCubic curve
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = startValue + (targetValue - startValue) * easeProgress;

    element.textContent = formatCurrency(currentValue);

    if (progress < 1) {
      requestAnimationFrame(updateTicker);
    } else {
      element.textContent = formatCurrency(targetValue);
    }
  }

  requestAnimationFrame(updateTicker);
}

/**
 * Updates summary cards (Balance, Income, Expenses, labels).
 */
function renderSummaryCards() {
  const totals = calculateTotals(state.transactions);

  animateCurrencyTicker(DOM.totalBalance, totals.netBalance);
  animateCurrencyTicker(DOM.totalIncome, totals.totalIncome);
  animateCurrencyTicker(DOM.totalExpense, totals.totalExpenses);

  DOM.incomeCountLabel.textContent = `${totals.incomeCount} ${totals.incomeCount === 1 ? 'record' : 'records'}`;
  DOM.expenseCountLabel.textContent = `${totals.expenseCount} ${totals.expenseCount === 1 ? 'record' : 'records'}`;

  // Update Net Position indicator badge text
  if (totals.netBalance > 0) {
    DOM.balanceStatusBadge.innerHTML = `<span class="tag-dot" style="background-color: var(--accent-emerald);" aria-hidden="true"></span><span>Positive Net Savings</span>`;
  } else if (totals.netBalance < 0) {
    DOM.balanceStatusBadge.innerHTML = `<span class="tag-dot" style="background-color: var(--color-expense);" aria-hidden="true"></span><span>Expenses exceed income</span>`;
  } else {
    DOM.balanceStatusBadge.innerHTML = `<span class="tag-dot" aria-hidden="true"></span><span>Net position (Income − Expenses)</span>`;
  }

  DOM.chartExpenseTotalBadge.textContent = `${formatCurrency(totals.totalExpenses)} Total`;
}

/**
 * Computes and renders Safe to Spend panel metrics.
 * Daily allowance = netBalance > 0 ? (netBalance / daysRemaining) : 0
 * Month progression = (currentDay / totalDaysInMonth) * 100
 */
function renderSafeToSpend() {
  const totals = calculateTotals(state.transactions);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);

  // Month progress percentage
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentDay / totalDaysInMonth) * 100)));

  if (DOM.monthDaysTag) {
    DOM.monthDaysTag.textContent = `${daysRemaining} ${daysRemaining === 1 ? 'Day' : 'Days'} Left`;
  }

  if (DOM.monthProgressPercent) {
    DOM.monthProgressPercent.textContent = `${progressPercent}%`;
  }

  if (DOM.monthProgressBar) {
    DOM.monthProgressBar.style.width = `${progressPercent}%`;
    const progressTrack = DOM.monthProgressBar.parentElement;
    if (progressTrack) {
      progressTrack.setAttribute('aria-valuenow', String(progressPercent));
    }
  }

  // Safe daily spend calculation
  if (DOM.safeDailySpend) {
    if (totals.netBalance > 0) {
      const dailyAllowance = totals.netBalance / daysRemaining;
      animateCurrencyTicker(DOM.safeDailySpend, dailyAllowance);
      if (DOM.safeSpendDesc) {
        DOM.safeSpendDesc.textContent = `Based on your net balance of ${formatCurrency(totals.netBalance)} distributed across the remaining ${daysRemaining} days of this month.`;
      }
    } else if (totals.netBalance < 0) {
      animateCurrencyTicker(DOM.safeDailySpend, 0);
      if (DOM.safeSpendDesc) {
        DOM.safeSpendDesc.textContent = 'Your total expenses currently exceed income. Pause non-essential spending to restore positive reserves.';
      }
    } else {
      animateCurrencyTicker(DOM.safeDailySpend, 0);
      if (DOM.safeSpendDesc) {
        DOM.safeSpendDesc.textContent = 'Add income or adjust expenses to calculate your personalized daily spending allowance.';
      }
    }
  }
}

/**
 * Renders live Spending Insights derived strictly from real transaction records.
 * - Top Spending Category
 * - Largest Single Transaction
 * - Savings Retention Rate ( (netBalance / totalIncome) * 100 )
 */
function renderSpendingInsights() {
  const totals = calculateTotals(state.transactions);
  const breakdown = calculateCategoryBreakdown(state.transactions);

  // 1. Largest Spending Category
  if (DOM.insightTopCategory) {
    if (breakdown.length > 0) {
      const top = breakdown[0];
      DOM.insightTopCategory.innerHTML = `<strong>${top.category}</strong> accounts for <strong>${top.percentage}%</strong> (${formatCurrency(top.total)}) of your spending.`;
    } else {
      DOM.insightTopCategory.textContent = 'No expense records yet to analyze.';
    }
  }

  // 2. Largest Single Transaction
  if (DOM.insightLargestTx) {
    if (state.transactions.length > 0) {
      const largest = [...state.transactions].sort((a, b) => b.amount - a.amount)[0];
      const typeLabel = largest.type === 'income' ? 'Income' : 'Expense';
      DOM.insightLargestTx.innerHTML = `<strong>${largest.title}</strong> at <strong>${formatCurrency(largest.amount)}</strong> (${typeLabel}).`;
    } else {
      DOM.insightLargestTx.textContent = 'No transactions recorded yet.';
    }
  }

  // 3. Savings Retention Rate
  if (DOM.insightSavingsRate) {
    if (totals.totalIncome > 0) {
      const retentionRate = Math.round((totals.netBalance / totals.totalIncome) * 100);
      if (retentionRate > 0) {
        DOM.insightSavingsRate.innerHTML = `You are retaining <strong>${retentionRate}%</strong> of your total earned income as net savings.`;
      } else if (retentionRate === 0) {
        DOM.insightSavingsRate.innerHTML = `Break-even: <strong>0%</strong> net retention (income matches expenses).`;
      } else {
        DOM.insightSavingsRate.innerHTML = `Deficit: Spending is <strong>${Math.abs(retentionRate)}%</strong> higher than recorded income.`;
      }
    } else if (totals.totalExpenses > 0) {
      DOM.insightSavingsRate.textContent = 'Only expenses recorded. Log income to track your savings retention rate.';
    } else {
      DOM.insightSavingsRate.textContent = 'Log income and expenses to view retention rate.';
    }
  }
}

/**
 * Filters and sorts the transactions list based on active user controls.
 * @returns {Array<Object>} Processed list ready for display
 */
function getFilteredAndSortedTransactions() {
  return state.transactions
    .filter(tx => {
      // 1. Type Filter (all / income / expense)
      if (state.activeTypeFilter !== 'all' && tx.type !== state.activeTypeFilter) {
        return false;
      }

      // 2. Category Filter
      if (state.selectedCategory !== 'all' && tx.category !== state.selectedCategory) {
        return false;
      }

      // 3. Search Query Filter (Title or Category)
      if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.toLowerCase().trim();
        const matchesTitle = tx.title.toLowerCase().includes(query);
        const matchesCategory = tx.category.toLowerCase().includes(query);
        const matchesNotes = tx.notes ? tx.notes.toLowerCase().includes(query) : false;
        if (!matchesTitle && !matchesCategory && !matchesNotes) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (state.sortBy) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'date-desc':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
}

/**
 * Helper to retrieve an icon name for a given category.
 * @param {string} categoryName
 * @param {string} type
 * @returns {string} Lucide icon name
 */
function getCategoryIcon(categoryName, type) {
  const pool = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const match = pool.find(item => item.name === categoryName);
  if (match) return match.icon;
  return type === 'income' ? 'arrow-down-left' : 'arrow-up-right';
}

/**
 * Builds a single transaction row safely using DOM APIs (preventing XSS).
 * @param {Object} tx - Transaction data object
 * @returns {HTMLElement} The transaction row element
 */
function createTransactionRowElement(tx) {
  const isIncome = tx.type === 'income';

  const row = document.createElement('div');
  row.className = 'tx-row';
  row.setAttribute('data-id', tx.id);

  // Left Section (Icon + Details)
  const left = document.createElement('div');
  left.className = 'tx-left';

  const iconWrap = document.createElement('div');
  iconWrap.className = `tx-category-icon type-${tx.type}`;
  iconWrap.setAttribute('aria-hidden', 'true');

  const iconElem = document.createElement('i');
  iconElem.setAttribute('data-lucide', getCategoryIcon(tx.category, tx.type));
  iconWrap.appendChild(iconElem);

  const details = document.createElement('div');
  details.className = 'tx-details';

  const title = document.createElement('span');
  title.className = 'tx-title';
  title.textContent = tx.title; // Safe textContent prevents HTML injection

  const meta = document.createElement('div');
  meta.className = 'tx-metadata';

  const categoryPill = document.createElement('span');
  categoryPill.className = 'tx-category-pill';
  categoryPill.textContent = tx.category;

  const dateSpan = document.createElement('span');
  dateSpan.className = 'tx-date';
  dateSpan.textContent = formatDate(tx.date);

  meta.appendChild(categoryPill);
  meta.appendChild(document.createTextNode('•'));
  meta.appendChild(dateSpan);

  if (tx.notes && tx.notes.trim() !== '') {
    const notesSpan = document.createElement('span');
    notesSpan.className = 'tx-notes-preview';
    notesSpan.textContent = `— ${tx.notes}`;
    meta.appendChild(notesSpan);
  }

  details.appendChild(title);
  details.appendChild(meta);

  left.appendChild(iconWrap);
  left.appendChild(details);

  // Right Section (Amount + Delete Button)
  const right = document.createElement('div');
  right.className = 'tx-right';

  const amountSpan = document.createElement('span');
  amountSpan.className = `tx-amount type-${tx.type}`;
  const prefix = isIncome ? '+' : '−';
  amountSpan.textContent = `${prefix}${formatCurrency(tx.amount)}`;

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'tx-delete-btn';
  deleteBtn.setAttribute('aria-label', `Delete transaction: ${tx.title}`);
  deleteBtn.title = 'Delete transaction';
  deleteBtn.dataset.action = 'delete';
  deleteBtn.dataset.id = tx.id;

  const deleteIcon = document.createElement('i');
  deleteIcon.setAttribute('data-lucide', 'trash-2');
  deleteIcon.className = 'btn-icon-sm';
  deleteIcon.setAttribute('aria-hidden', 'true');
  deleteBtn.appendChild(deleteIcon);

  right.appendChild(amountSpan);
  right.appendChild(deleteBtn);

  row.appendChild(left);
  row.appendChild(right);

  return row;
}

/**
 * Renders the transactions list and manages empty states.
 */
function renderTransactionsList() {
  DOM.transactionsList.innerHTML = '';
  const filteredList = getFilteredAndSortedTransactions();

  DOM.transactionCountBadge.textContent = String(filteredList.length);

  // Handle Empty States
  if (state.transactions.length === 0) {
    // State 1: User has no transactions at all
    DOM.emptyStateNoData.hidden = false;
    DOM.emptyStateNoData.style.display = 'flex';
    DOM.emptyStateNoResults.hidden = true;
    DOM.emptyStateNoResults.style.display = 'none';
    DOM.transactionsList.hidden = true;
    DOM.transactionsList.style.display = 'none';
    return;
  }

  if (filteredList.length === 0) {
    // State 2: Active filter/search query yielded zero results
    DOM.emptyStateNoData.hidden = true;
    DOM.emptyStateNoData.style.display = 'none';
    DOM.emptyStateNoResults.hidden = false;
    DOM.emptyStateNoResults.style.display = 'flex';
    DOM.transactionsList.hidden = true;
    DOM.transactionsList.style.display = 'none';
    return;
  }

  // State 3: We have matching transactions to display
  DOM.emptyStateNoData.hidden = true;
  DOM.emptyStateNoData.style.display = 'none';
  DOM.emptyStateNoResults.hidden = true;
  DOM.emptyStateNoResults.style.display = 'none';
  DOM.transactionsList.hidden = false;
  DOM.transactionsList.style.display = 'flex';

  const fragment = document.createDocumentFragment();
  filteredList.forEach(tx => {
    fragment.appendChild(createTransactionRowElement(tx));
  });

  DOM.transactionsList.appendChild(fragment);
}

/**
 * Populates category dropdown in form according to currently selected Type (Expense or Income).
 * @param {string} type - 'expense' | 'income'
 */
function updateFormCategoryOptions(type) {
  DOM.txCategorySelect.innerHTML = '';
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.name;
    option.textContent = cat.name;
    DOM.txCategorySelect.appendChild(option);
  });
}

/**
 * Populates category filter dropdown in the toolbar with all unique categories present.
 */
function renderFilterCategoryOptions() {
  const currentSelection = DOM.categoryFilterSelect.value;
  DOM.categoryFilterSelect.innerHTML = '<option value="all">All Categories</option>';

  // Combine unique categories from defined lists
  const allCategories = [
    ...EXPENSE_CATEGORIES.map(c => c.name),
    ...INCOME_CATEGORIES.map(c => c.name)
  ];
  const uniqueCategories = Array.from(new Set(allCategories));

  uniqueCategories.forEach(categoryName => {
    const opt = document.createElement('option');
    opt.value = categoryName;
    opt.textContent = categoryName;
    if (categoryName === currentSelection) {
      opt.selected = true;
    }
    DOM.categoryFilterSelect.appendChild(opt);
  });
}

/**
 * Renders the breakdown chips list underneath the chart.
 */
function renderCategoryBreakdown() {
  DOM.categoryBreakdownList.innerHTML = '';
  const breakdown = calculateCategoryBreakdown(state.transactions);

  if (breakdown.length === 0) {
    DOM.categoryBreakdownList.hidden = true;
    DOM.categoryBreakdownList.style.display = 'none';
    return;
  }

  DOM.categoryBreakdownList.hidden = false;
  DOM.categoryBreakdownList.style.display = 'grid';
  const fragment = document.createDocumentFragment();

  breakdown.forEach(item => {
    const chip = document.createElement('div');
    chip.className = 'breakdown-chip';

    const left = document.createElement('div');
    left.className = 'breakdown-chip-left';

    const colorDot = document.createElement('span');
    colorDot.className = 'breakdown-color-indicator';
    colorDot.style.backgroundColor = item.color;
    colorDot.setAttribute('aria-hidden', 'true');

    const name = document.createElement('span');
    name.className = 'breakdown-name';
    name.textContent = item.category;

    left.appendChild(colorDot);
    left.appendChild(name);

    const right = document.createElement('div');
    right.className = 'breakdown-chip-right';

    const amount = document.createElement('span');
    amount.className = 'breakdown-amount';
    amount.textContent = formatCurrency(item.total);

    const percentage = document.createElement('span');
    percentage.className = 'breakdown-percentage';
    percentage.textContent = `${item.percentage}% of spending`;

    right.appendChild(amount);
    right.appendChild(percentage);

    chip.appendChild(left);
    chip.appendChild(right);
    fragment.appendChild(chip);
  });

  DOM.categoryBreakdownList.appendChild(fragment);
}

/* ==============================================================================
   8. CHART.JS VISUALIZATION CONTROLLER
   Clean lifecycle management: safely handles updates, canvas destruction & empty states.
   ============================================================================== */

/**
 * Initializes or updates the Chart.js doughnut chart based on expense data.
 */
function renderChart() {
  const breakdown = calculateCategoryBreakdown(state.transactions);

  // If there are no expenses, show clean empty state
  if (breakdown.length === 0) {
    DOM.chartEmptyState.hidden = false;
    DOM.chartEmptyState.style.display = 'flex';
    DOM.spendingChartCanvas.hidden = true;
    DOM.spendingChartCanvas.style.display = 'none';

    // Properly destroy existing chart to release canvas memory
    if (state.chartInstance) {
      state.chartInstance.destroy();
      state.chartInstance = null;
    }
    return;
  }

  DOM.chartEmptyState.hidden = true;
  DOM.chartEmptyState.style.display = 'none';
  DOM.spendingChartCanvas.hidden = false;
  DOM.spendingChartCanvas.style.display = 'block';

  // Defensive check: Verify Chart.js library is loaded
  if (typeof Chart === 'undefined') {
    console.warn('[Vaultly] Chart.js library is not available. Using fallback breakdown chips.');
    return;
  }

  const labels = breakdown.map(item => item.category);
  const dataValues = breakdown.map(item => item.total);
  const backgroundColors = breakdown.map(item => item.color);

  // If a chart instance exists, destroy it before creating a new one to prevent canvas overlap
  if (state.chartInstance) {
    state.chartInstance.destroy();
    state.chartInstance = null;
  }

  const ctx = DOM.spendingChartCanvas.getContext('2d');

  try {
    state.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: backgroundColors,
          borderColor: 'rgba(16, 21, 42, 0.95)', // Matches deep-space glass surface for seamless cutout
          borderWidth: 2,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            display: false // Bespoke accessible category breakdown chips provide the legend
          },
          tooltip: {
            backgroundColor: 'rgba(16, 21, 42, 0.95)',
            titleColor: '#F5F7FF',
            bodyColor: '#70F0B2',
            borderColor: 'rgba(255, 255, 255, 0.16)',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            cornerRadius: 10,
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percent = Math.round((value / total) * 100);
                return ` ${formatCurrency(value)} (${percent}%)`;
              }
            }
          }
        },
        animation: {
          duration: 400
        }
      }
    });
  } catch (error) {
    console.error('[Vaultly] Error creating Chart.js chart:', error);
  }
}

/* ==============================================================================
   9. FORM VALIDATION & TRANSACTION MANAGEMENT
   Strict validation before mutating application state.
   ============================================================================== */

/**
 * Resets form errors and clears helper text.
 */
function resetFormErrors() {
  DOM.txTitleError.textContent = '';
  DOM.txAmountError.textContent = '';
  DOM.txCategoryError.textContent = '';
  DOM.txDateError.textContent = '';

  DOM.txTitleInput.classList.remove('has-error');
  DOM.txAmountInput.classList.remove('has-error');
  DOM.txCategorySelect.classList.remove('has-error');
  DOM.txDateInput.classList.remove('has-error');
}

/**
 * Validates form inputs before submission.
 * @returns {boolean} True if all inputs pass validation
 */
function validateForm() {
  resetFormErrors();
  let isValid = true;

  // 1. Title Validation
  const title = DOM.txTitleInput.value.trim();
  if (!title) {
    DOM.txTitleError.textContent = 'Please enter a transaction title.';
    DOM.txTitleInput.classList.add('has-error');
    isValid = false;
  } else if (title.length > 80) {
    DOM.txTitleError.textContent = 'Title must be 80 characters or fewer.';
    DOM.txTitleInput.classList.add('has-error');
    isValid = false;
  }

  // 2. Amount Validation
  const rawAmount = DOM.txAmountInput.value.trim();
  const parsedAmount = parseFloat(rawAmount);

  if (!rawAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
    DOM.txAmountError.textContent = 'Enter a valid positive amount greater than 0.';
    DOM.txAmountInput.classList.add('has-error');
    isValid = false;
  } else if (parsedAmount > 100000000) { // ₹10 Crore reasonable educational cap
    DOM.txAmountError.textContent = 'Amount exceeds maximum allowable threshold.';
    DOM.txAmountInput.classList.add('has-error');
    isValid = false;
  }

  // 3. Category Validation
  const category = DOM.txCategorySelect.value;
  if (!category) {
    DOM.txCategoryError.textContent = 'Please select a valid category.';
    DOM.txCategorySelect.classList.add('has-error');
    isValid = false;
  }

  // 4. Date Validation
  const date = DOM.txDateInput.value;
  if (!date) {
    DOM.txDateError.textContent = 'Please select a valid date.';
    DOM.txDateInput.classList.add('has-error');
    isValid = false;
  }

  return isValid;
}

/**
 * Generates a unique transaction identifier.
 * Uses crypto.randomUUID when available, with timestamp fallback.
 * @returns {string} Unique identifier
 */
function generateUniqueId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Handles submission of the Add Transaction form.
 * @param {Event} event
 */
function handleFormSubmit(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const selectedType = DOM.typeIncomeRadio.checked ? 'income' : 'expense';
  const amountNumber = parseFloat(parseFloat(DOM.txAmountInput.value).toFixed(2));

  const newTransaction = {
    id: generateUniqueId(),
    title: DOM.txTitleInput.value.trim(),
    amount: amountNumber,
    type: selectedType,
    category: DOM.txCategorySelect.value,
    date: DOM.txDateInput.value,
    notes: DOM.txNotesInput.value.trim()
  };

  // Add to beginning of array so newest transactions appear first
  state.transactions.unshift(newTransaction);

  // Persist updated state to Local Storage
  saveTransactions(state.transactions);

  // Re-render UI
  renderDashboard();

  // Close modal and reset form
  closeAddModal();

  showToast(`${selectedType === 'income' ? 'Income' : 'Expense'} of ${formatCurrency(amountNumber)} saved!`, 'success');
}

/**
 * Opens the Add Transaction modal and initializes default fields.
 * @param {string} [defaultType='expense']
 */
function openAddModal(defaultType = 'expense') {
  resetFormErrors();
  DOM.transactionForm.reset();

  if (defaultType === 'income') {
    DOM.typeIncomeRadio.checked = true;
    updateFormCategoryOptions('income');
  } else {
    DOM.typeExpenseRadio.checked = true;
    updateFormCategoryOptions('expense');
  }

  // Default date to today's date
  DOM.txDateInput.value = getTodayDateString();

  DOM.transactionModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling

  // Focus title input for immediate keyboard accessibility
  setTimeout(() => DOM.txTitleInput.focus(), 80);
}

/**
 * Closes the Add Transaction modal.
 */
function closeAddModal() {
  DOM.transactionModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ==============================================================================
   10. DELETE CONFIRMATION FLOW
   Protects users from accidental record deletion.
   ============================================================================== */

/**
 * Prompts user with the delete confirmation dialog.
 * @param {string} id - Transaction ID to delete
 */
function requestDeleteTransaction(id) {
  const target = state.transactions.find(tx => tx.id === id);
  if (!target) return;

  state.pendingDeleteId = id;
  DOM.deleteTargetTitle.textContent = `"${target.title}" (${formatCurrency(target.amount)})`;
  DOM.deleteConfirmModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Set focus to cancel button to prevent accidental enter-key deletion
  setTimeout(() => DOM.cancelDeleteBtn.focus(), 80);
}

/**
 * Cancels pending delete action and closes modal.
 */
function cancelDeleteTransaction() {
  state.pendingDeleteId = null;
  DOM.deleteConfirmModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/**
 * Confirms deletion, removes item from state, persists, and updates view.
 */
function confirmDeleteTransaction() {
  if (!state.pendingDeleteId) return;

  const targetIndex = state.transactions.findIndex(tx => tx.id === state.pendingDeleteId);
  if (targetIndex !== -1) {
    const deletedItem = state.transactions.splice(targetIndex, 1)[0];
    saveTransactions(state.transactions);
    renderDashboard();
    showToast(`Deleted "${deletedItem.title}"`, 'info');
  }

  cancelDeleteTransaction();
}

/* ==============================================================================
   11. SEARCH, FILTERING, AND SORTING PIPELINE
   Instant client-side filtering without page reloads.
   ============================================================================== */

/**
 * Handles search query changes.
 * @param {string} query
 */
function handleSearchInput(query) {
  state.searchQuery = query;
  DOM.clearSearchBtn.hidden = query.trim() === '';
  renderTransactionsList();
}

/**
 * Handles Type Filter pills (All, Income, Expense).
 * @param {string} filterValue
 */
function handleTypeFilterChange(filterValue) {
  state.activeTypeFilter = filterValue;

  DOM.filterPills.forEach(pill => {
    const isSelected = pill.dataset.filter === filterValue;
    pill.classList.toggle('active', isSelected);
    pill.setAttribute('aria-checked', String(isSelected));
  });

  renderTransactionsList();
}

/**
 * Resets all search and filter controls to default state.
 */
function resetAllFilters() {
  state.activeTypeFilter = 'all';
  state.searchQuery = '';
  state.selectedCategory = 'all';
  state.sortBy = 'date-desc';

  DOM.searchInput.value = '';
  DOM.clearSearchBtn.hidden = true;
  DOM.categoryFilterSelect.value = 'all';
  DOM.sortSelect.value = 'date-desc';

  DOM.filterPills.forEach(pill => {
    const isAll = pill.dataset.filter === 'all';
    pill.classList.toggle('active', isAll);
    pill.setAttribute('aria-checked', String(isAll));
  });

  renderTransactionsList();
}

/* ==============================================================================
   12. DEMO DATA & RESET SYSTEM
   Allows users to experiment with realistic figures without risking real data.
   ============================================================================== */

/**
 * Populates sample transactions with realistic relative dates.
 */
function loadSampleData() {
  const baseTime = new Date();

  const formattedSampleData = SAMPLE_TRANSACTIONS.map(sample => {
    const txDate = new Date(baseTime);
    txDate.setDate(txDate.getDate() - sample.dateOffsetDays);

    const year = txDate.getFullYear();
    const month = String(txDate.getMonth() + 1).padStart(2, '0');
    const day = String(txDate.getDate()).padStart(2, '0');

    return {
      id: generateUniqueId(),
      title: sample.title,
      amount: sample.amount,
      type: sample.type,
      category: sample.category,
      date: `${year}-${month}-${day}`,
      notes: sample.notes
    };
  });

  state.transactions = formattedSampleData;
  saveTransactions(state.transactions);
  resetAllFilters();
  renderDashboard();

  showToast('Sample demo transactions loaded successfully!', 'success');
}

/**
 * Completely resets transactions and clears Local Storage.
 */
function clearAllData() {
  if (state.transactions.length === 0) {
    showToast('There are no transactions to clear.', 'info');
    return;
  }

  const confirmed = window.confirm(
    'Are you sure you want to delete all transactions? This will reset your balance to ₹0.00 and cannot be undone.'
  );

  if (!confirmed) return;

  state.transactions = [];
  saveTransactions([]);
  resetAllFilters();
  renderDashboard();

  showToast('All transaction records have been reset.', 'info');
}

/* ==============================================================================
   13. UI ENHANCEMENTS & NOTIFICATIONS
   Toasts, greetings, live dates, mobile drawer.
   ============================================================================== */

/**
 * Displays a toast notification.
 * @param {string} message - Feedback message
 * @param {'success'|'danger'|'info'} [type='success']
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  const iconName = type === 'success' ? 'check-circle' : (type === 'danger' ? 'alert-circle' : 'info');

  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', iconName);
  icon.className = 'toast-icon';

  const text = document.createElement('span');
  text.className = 'toast-message';
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);

  DOM.toastContainer.appendChild(toast);
  refreshIcons();

  // Trigger smooth entrance animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto-dismiss after 3.5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  }, 3500);
}

/**
 * Updates dynamic greeting based on client's local hour and live date.
 */
function updateDynamicGreetingAndDate() {
  const now = new Date();
  const currentHour = now.getHours();
  let greeting = 'Good day';

  if (currentHour >= 5 && currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour >= 12 && currentHour < 17) {
    greeting = 'Good afternoon';
  } else if (currentHour >= 17 && currentHour < 22) {
    greeting = 'Good evening';
  } else {
    greeting = 'Welcome back';
  }

  DOM.dynamicGreeting.textContent = greeting;

  // Real date display: e.g. "Saturday, 17 October 2026"
  DOM.currentDateDisplay.textContent = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Re-runs Lucide icon generator if the library is available on the window.
 * If the Lucide CDN fails to load (offline development), this function
 * gracefully falls back to an embedded SVG dictionary so icons never disappear.
 */
function refreshIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
    return;
  }

  // Graceful Offline Fallback: Inject clean inline SVGs for all data-lucide tags
  const fallbackIcons = {
    'layout-dashboard': '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    'receipt': '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
    'pie-chart': '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    'sparkles': '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>',
    'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    'menu': '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
    'plus-circle': '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',
    'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
    'wallet': '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    'arrow-down-left': '<path d="M17 7 7 17"/><path d="M17 17H7V7"/>',
    'arrow-up-right': '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'search-x': '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>',
    'shield-check': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'utensils': '<path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 2v19"/><path d="M6 2v7a3 3 0 0 0 3 3 3 3 0 0 0 3-3V2"/><path d="M9 2v19"/>',
    'car': '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    'shopping-bag': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    'film': '<rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18"/><line x1="7" x2="7" y1="2" y2="22"/><line x1="17" x2="17" y1="2" y2="22"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="2" x2="7" y1="7" y2="7"/><line x1="2" x2="7" y1="17" y2="17"/><line x1="17" x2="22" y1="17" y2="17"/><line x1="17" x2="22" y1="7" y2="7"/>',
    'heart-pulse': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    'more-horizontal': '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    'briefcase': '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    'laptop': '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
    'gift': '<polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" x2="12" y1="22" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
    'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    'dollar-sign': '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'
  };

  document.querySelectorAll('[data-lucide]').forEach(el => {
    const iconName = el.getAttribute('data-lucide');
    const svgInner = fallbackIcons[iconName];
    if (svgInner) {
      el.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${el.className}">${svgInner}</svg>`;
    }
  });
}

/**
 * Toggles mobile drawer navigation.
 * @param {boolean} isOpen
 */
function toggleMobileMenu(isOpen) {
  if (DOM.mobileDrawer) {
    DOM.mobileDrawer.classList.toggle('open', isOpen);
    DOM.mobileDrawer.setAttribute('aria-hidden', String(!isOpen));
  }
  if (DOM.mobileDrawerBackdrop) {
    DOM.mobileDrawerBackdrop.classList.toggle('active', isOpen);
  }
  if (DOM.mobileMenuToggle) {
    DOM.mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
  }
}

/* ==============================================================================
   14. EVENT LISTENERS SETUP
   Centralized event bindings for predictable behavior.
   ============================================================================== */

function setupEventListeners() {
  // --- Mobile Drawer ---
  if (DOM.mobileMenuToggle) {
    DOM.mobileMenuToggle.addEventListener('click', () => {
      const isCurrentlyOpen = DOM.mobileDrawer && DOM.mobileDrawer.classList.contains('open');
      toggleMobileMenu(!isCurrentlyOpen);
    });
  }

  if (DOM.closeDrawerBtn) {
    DOM.closeDrawerBtn.addEventListener('click', () => toggleMobileMenu(false));
  }

  if (DOM.mobileDrawerBackdrop) {
    DOM.mobileDrawerBackdrop.addEventListener('click', () => toggleMobileMenu(false));
  }

  // Close drawer on mobile drawer link click
  if (DOM.drawerLinks) {
    DOM.drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleMobileMenu(false);
        DOM.drawerLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  // Desktop Navigation active pill state
  if (DOM.desktopNavItems) {
    DOM.desktopNavItems.forEach(item => {
      item.addEventListener('click', () => {
        DOM.desktopNavItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  // Mobile Drawer Quick Actions
  if (DOM.loadDemoBtnMobile) {
    DOM.loadDemoBtnMobile.addEventListener('click', () => {
      toggleMobileMenu(false);
      loadSampleData();
    });
  }

  if (DOM.clearAllBtnMobile) {
    DOM.clearAllBtnMobile.addEventListener('click', () => {
      toggleMobileMenu(false);
      clearAllData();
    });
  }

  // --- Add Transaction Modal ---
  DOM.openAddModalBtn.addEventListener('click', () => openAddModal('expense'));
  DOM.emptyAddFirstBtn.addEventListener('click', () => openAddModal('expense'));
  DOM.chartAddExpenseBtn.addEventListener('click', () => openAddModal('expense'));

  DOM.closeModalBtn.addEventListener('click', closeAddModal);
  DOM.cancelModalBtn.addEventListener('click', closeAddModal);

  // Type Toggle inside Form
  DOM.typeExpenseRadio.addEventListener('change', () => updateFormCategoryOptions('expense'));
  DOM.typeIncomeRadio.addEventListener('change', () => updateFormCategoryOptions('income'));

  // Form Submission
  DOM.transactionForm.addEventListener('submit', handleFormSubmit);

  // --- Delete Modal Controls ---
  DOM.cancelDeleteBtn.addEventListener('click', cancelDeleteTransaction);
  DOM.confirmDeleteBtn.addEventListener('click', confirmDeleteTransaction);

  // Event Delegation for Transaction Row Delete Buttons
  DOM.transactionsList.addEventListener('click', event => {
    const deleteButton = event.target.closest('button[data-action="delete"]');
    if (deleteButton) {
      const transactionId = deleteButton.dataset.id;
      if (transactionId) {
        requestDeleteTransaction(transactionId);
      }
    }
  });

  // --- Search & Filters ---
  DOM.searchInput.addEventListener('input', e => handleSearchInput(e.target.value));

  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.searchInput.value = '';
    handleSearchInput('');
    DOM.searchInput.focus();
  });

  DOM.filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const filterValue = pill.dataset.filter;
      handleTypeFilterChange(filterValue);
    });
  });

  DOM.categoryFilterSelect.addEventListener('change', e => {
    state.selectedCategory = e.target.value;
    renderTransactionsList();
  });

  DOM.sortSelect.addEventListener('change', e => {
    state.sortBy = e.target.value;
    renderTransactionsList();
  });

  DOM.resetFiltersBtn.addEventListener('click', resetAllFilters);

  // --- Demo & Reset ---
  DOM.loadDemoBtn.addEventListener('click', loadSampleData);
  DOM.emptyLoadDemoBtn.addEventListener('click', loadSampleData);
  DOM.clearAllBtn.addEventListener('click', clearAllData);

  // --- Keyboard & Accessibility Shortcuts ---
  document.addEventListener('keydown', event => {
    // Escape key closes open modals
    if (event.key === 'Escape') {
      if (DOM.transactionModal.getAttribute('aria-hidden') === 'false') {
        closeAddModal();
      }
      if (DOM.deleteConfirmModal.getAttribute('aria-hidden') === 'false') {
        cancelDeleteTransaction();
      }
    }
  });

  // Close modals when clicking outside dialog window (backdrop)
  DOM.transactionModal.addEventListener('click', event => {
    if (event.target === DOM.transactionModal) {
      closeAddModal();
    }
  });

  DOM.deleteConfirmModal.addEventListener('click', event => {
    if (event.target === DOM.deleteConfirmModal) {
      cancelDeleteTransaction();
    }
  });
}

/* ==============================================================================
   15. 3D CARD TILT & WATER-WHITE SPOTLIGHT INTERACTION
   Magic UI style interactive cursor tracker & 3D card tilt.
   ============================================================================== */

/**
 * Initializes interactive 3D Mouse Tilt and water-white spotlight tracker for glass cards.
 * Automatically skipped on touch devices and if user prefers reduced motion.
 */
function init3DCardTilt() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Detect touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return;
  }

  const cards = document.querySelectorAll('.glass-card');

  cards.forEach(card => {
    let bounds;

    function onMouseEnter() {
      bounds = card.getBoundingClientRect();
      card.classList.add('is-tilting');
    }

    function onMouseMove(event) {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mouseX = event.clientX - bounds.left;
      const mouseY = event.clientY - bounds.top;

      const percentX = (mouseX / bounds.width) * 100;
      const percentY = (mouseY / bounds.height) * 100;

      // Restrained 3D tilt: max ~5 degrees for elegant feel
      const tiltX = ((mouseY / bounds.height) - 0.5) * -6;
      const tiltY = ((mouseX / bounds.width) - 0.5) * 6;

      card.style.setProperty('--mouse-x', `${percentX.toFixed(1)}%`);
      card.style.setProperty('--mouse-y', `${percentY.toFixed(1)}%`);
      card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
    }

    function onMouseLeave() {
      card.classList.remove('is-tilting');
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      bounds = null;
    }

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
  });
}

/**
 * Attaches liquid water ripple feedback on clicks for interactive buttons.
 */
function initWaterRipple() {
  const interactiveSelectors = [
    '.btn-liquid-primary',
    '.btn-liquid-secondary',
    '.btn-liquid-danger',
    '.btn-ghost-glass',
    '.filter-glass-pill',
    '.tx-row'
  ];

  document.addEventListener('click', event => {
    const target = event.target.closest(interactiveSelectors.join(','));
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'water-ripple-wave';

    const size = Math.max(rect.width, rect.height) * 1.5;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

    // Clean up any existing ripple inside this element
    const existing = target.querySelector('.water-ripple-wave');
    if (existing) existing.remove();

    target.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentElement) {
        ripple.parentElement.removeChild(ripple);
      }
    }, 600);
  });
}

/* ==============================================================================
   16. APPLICATION BOOTSTRAP
   Loads persisted state, prepares UI, and attaches listeners.
   ============================================================================== */

function initApp() {
  // 1. Establish greeting & live formatted date
  updateDynamicGreetingAndDate();

  // 2. Set default category options in form
  updateFormCategoryOptions('expense');

  // 3. Load transactions from Local Storage
  state.transactions = loadTransactions();

  // 4. Attach event listeners
  setupEventListeners();

  // 5. Initialize 3D Mouse Tilt & Water Ripple effects
  init3DCardTilt();
  initWaterRipple();

  // 6. Initial render of entire application
  renderDashboard();

  console.info('[Vaultly] Application initialized successfully with', state.transactions.length, 'records.');
}

// Start application when DOM is fully parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
