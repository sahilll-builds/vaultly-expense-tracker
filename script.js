/**
 * ==============================================================================
 * VAULTLY — AI-Powered Personal Finance Platform
 * Architecture: Modular Vanilla JavaScript (ES6+) with Unidirectional Data Flow
 *
 * Core Modules:
 * 1. Constants & Category Taxonomy
 * 2. Multi-Store Local Storage Persistence & Error Recovery
 * 3. Application State Management
 * 4. Financial Calculation Engine
 * 5. Internationalization & Formatting (INR Currency & Dates)
 * 6. DOM Element Selectors & Cache
 * 7. Client-Side 7-View Router (switchView)
 * 8. Spatial 3D Balance Visualizer & Mouse Tilt Engine
 * 9. Transaction Management (CRUD, Custom Categories & CSV Export)
 * 10. Smart Budgets & Recurring Subscriptions
 * 11. Financial Goals & Savings Planner
 * 12. AI Spending Analyzer & Forecasting
 * 13. Vaultly AI Conversational Assistant & NL Parser
 * 14. Settings, Backup & Diagnostics
 * 15. UI Enhancements (Toasts, Mobile Drawer, Tactile Wave)
 * 16. Cinematic Loader Controller (<= 1.0s)
 * 17. Application Bootstrap
 * ==============================================================================
 */

'use strict';

/* ==============================================================================
   1. CONSTANTS & CATEGORY TAXONOMY
   ============================================================================== */

const STORAGE_KEYS = {
  transactions: 'vaultly_transactions',
  budgets: 'vaultly_budgets',
  goals: 'vaultly_goals',
  recurring: 'vaultly_recurring',
  customCategories: 'vaultly_custom_categories'
};

const EXPENSE_CATEGORIES = [
  { id: 'Food & Dining', name: 'Food & Dining', icon: 'utensils', color: '#FFFFFF' },
  { id: 'Transport', name: 'Transport', icon: 'car', color: '#E2E2E2' },
  { id: 'Shopping', name: 'Shopping', icon: 'shopping-bag', color: '#C6C6C6' },
  { id: 'Bills & Utilities', name: 'Bills & Utilities', icon: 'zap', color: '#AAAAAA' },
  { id: 'Education', name: 'Education', icon: 'book-open', color: '#8E8E8E' },
  { id: 'Entertainment', name: 'Entertainment', icon: 'film', color: '#727272' },
  { id: 'Health', name: 'Health', icon: 'heart-pulse', color: '#565656' },
  { id: 'Other', name: 'Other', icon: 'more-horizontal', color: '#3A3A3A' }
];

const INCOME_CATEGORIES = [
  { id: 'Salary', name: 'Salary', icon: 'briefcase', color: '#FFFFFF' },
  { id: 'Freelance', name: 'Freelance', icon: 'laptop', color: '#D4D4D4' },
  { id: 'Allowance', name: 'Allowance', icon: 'gift', color: '#A8A8A8' },
  { id: 'Business', name: 'Business', icon: 'trending-up', color: '#7E7E7E' },
  { id: 'Other', name: 'Other', icon: 'dollar-sign', color: '#545454' }
];

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
    notes: 'Fresh staples, fruits and vegetables'
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

const SAMPLE_BUDGETS = [
  { category: 'Food & Dining', limit: 8000 },
  { category: 'Transport', limit: 3000 },
  { category: 'Shopping', limit: 5000 },
  { category: 'Bills & Utilities', limit: 6000 }
];

const SAMPLE_GOALS = [
  { id: 'demo-goal-1', title: 'Emergency Fund', targetAmount: 75000, currentAmount: 35000, targetDate: '2026-12-31' },
  { id: 'demo-goal-2', title: 'Hardware Setup', targetAmount: 45000, currentAmount: 20000, targetDate: '2026-11-30' }
];

const SAMPLE_RECURRING = [
  { id: 'demo-rec-1', name: 'High-Speed Fiber Internet', amount: 999, frequency: 'monthly', nextDate: '2026-11-05', active: true },
  { id: 'demo-rec-2', name: 'Cloud Server Hosting', amount: 750, frequency: 'monthly', nextDate: '2026-11-12', active: true }
];

/* ==============================================================================
   2. APPLICATION STATE MANAGEMENT
   ============================================================================== */

const state = {
  transactions: [],
  budgets: [],
  goals: [],
  recurring: [],
  customCategories: [],
  activeView: 'overview',
  activeTypeFilter: 'all',
  searchQuery: '',
  selectedCategory: 'all',
  sortBy: 'date-desc',
  pendingDeleteId: null,
  editingTxId: null,
  chartInstance: null,
  aiMessages: [
    {
      sender: 'assistant',
      text: 'Welcome to Vaultly AI. I analyze your verified records to give you clear, accurate answers about your cashflow, budgets, and savings goals. Ask me a question or enter a transaction like: "Spent ₹250 on lunch today".'
    }
  ]
};

/* ==============================================================================
   3. MULTI-STORE PERSISTENCE & DEFENSIVE PARSING
   ============================================================================== */

function safeLoad(key, validator, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.filter(validator);
  } catch (err) {
    console.warn(`[Vaultly] Failed to parse ${key}:`, err);
    return fallback;
  }
}

function safeSave(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`[Vaultly] Storage save error for ${key}:`, err);
    return false;
  }
}

function loadTransactions() {
  return safeLoad(STORAGE_KEYS.transactions, item => (
    item &&
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.amount === 'number' &&
    !isNaN(item.amount) &&
    (item.type === 'income' || item.type === 'expense') &&
    typeof item.category === 'string' &&
    typeof item.date === 'string'
  ));
}

function saveTransactions(data) {
  return safeSave(STORAGE_KEYS.transactions, data);
}

function loadBudgets() {
  return safeLoad(STORAGE_KEYS.budgets, b => (
    b && typeof b.category === 'string' && typeof b.limit === 'number' && b.limit > 0
  ), SAMPLE_BUDGETS);
}

function saveBudgets(data) {
  return safeSave(STORAGE_KEYS.budgets, data);
}

function loadGoals() {
  return safeLoad(STORAGE_KEYS.goals, g => (
    g && typeof g.id === 'string' && typeof g.title === 'string' && typeof g.targetAmount === 'number' && g.targetAmount > 0
  ), SAMPLE_GOALS);
}

function saveGoals(data) {
  return safeSave(STORAGE_KEYS.goals, data);
}

function loadRecurring() {
  return safeLoad(STORAGE_KEYS.recurring, r => (
    r && typeof r.id === 'string' && typeof r.name === 'string' && typeof r.amount === 'number'
  ), SAMPLE_RECURRING);
}

function saveRecurring(data) {
  return safeSave(STORAGE_KEYS.recurring, data);
}

function loadCustomCategories() {
  return safeLoad(STORAGE_KEYS.customCategories, c => (
    c && typeof c.id === 'string' && typeof c.name === 'string'
  ), []);
}

function saveCustomCategories(data) {
  return safeSave(STORAGE_KEYS.customCategories, data);
}

/* ==============================================================================
   4. FINANCIAL CALCULATION ENGINE
   Deterministic arithmetic strictly from verified stored records.
   ============================================================================== */

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

function calculateCategoryBreakdown(transactionsList) {
  const expenseTransactions = transactionsList.filter(tx => tx.type === 'expense');
  const totalExpenseSum = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  if (totalExpenseSum === 0) return [];

  const categoryTotals = {};
  for (const tx of expenseTransactions) {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
  }

  const allCategories = [...EXPENSE_CATEGORIES, ...state.customCategories];

  const breakdown = Object.keys(categoryTotals).map(categoryName => {
    const total = categoryTotals[categoryName];
    const categoryMeta = allCategories.find(c => c.name === categoryName) || { color: '#858585' };
    const percentage = Math.round((total / totalExpenseSum) * 100);

    return {
      category: categoryName,
      total,
      percentage,
      color: categoryMeta.color
    };
  });

  breakdown.sort((a, b) => b.total - a.total);
  return breakdown;
}

function calculateSafeToSpend(transactionsList, recurringList = []) {
  const { netBalance } = calculateTotals(transactionsList);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);

  // Deduct remaining active recurring commitments for this month
  const activeRecurringSum = recurringList
    .filter(r => r.active !== false)
    .reduce((sum, r) => sum + r.amount, 0);

  const availableSurplus = Math.max(0, netBalance - activeRecurringSum);
  const dailyAllowance = netBalance > 0 ? (availableSurplus / daysRemaining) : 0;
  const monthProgress = Math.min(100, Math.round((currentDay / totalDaysInMonth) * 100));

  return {
    netBalance,
    dailyAllowance,
    daysRemaining,
    totalDaysInMonth,
    currentDay,
    monthProgress,
    activeRecurringSum
  };
}

function calculateSpendingForecast(transactionsList) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = Math.max(1, now.getDate());

  const thisMonthExpenses = transactionsList.filter(tx => {
    if (tx.type !== 'expense') return false;
    const d = new Date(tx.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const spentSoFar = thisMonthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
  const avgDaily = spentSoFar / currentDay;
  const projectedEnd = Math.round(spentSoFar + (avgDaily * (totalDays - currentDay)));

  return { spentSoFar, currentDay, totalDays, avgDaily, projectedEnd };
}

/* ==============================================================================
   5. CURRENCY & DATE FORMATTING
   ============================================================================== */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return inrFormatter.format(0);
  }
  return inrFormatter.format(amount);
}

function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (error) {
    return dateString;
  }
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* ==============================================================================
   6. DOM ELEMENT SELECTORS
   ============================================================================== */

const DOM = {
  // Navigation & Drawer
  mobileMenuToggle: document.getElementById('mobileMenuToggle'),
  mobileDrawer: document.getElementById('mobileDrawer'),
  mobileDrawerBackdrop: document.getElementById('mobileDrawerBackdrop'),
  closeDrawerBtn: document.getElementById('closeDrawerBtn'),
  dynamicGreeting: document.getElementById('dynamicGreeting'),
  currentDateDisplay: document.getElementById('currentDateDisplay'),

  // Views & Sidebar
  viewPanels: document.querySelectorAll('.view-panel'),
  sidebarNavItems: document.querySelectorAll('.sidebar-nav-item'),
  headerNavItems: document.querySelectorAll('.nav-links-desktop .nav-item'),
  drawerNavItems: document.querySelectorAll('.drawer-links .drawer-link'),
  bottomNavItems: document.querySelectorAll('.mobile-bottom-nav .bottom-nav-item'),
  sidebarTxCount: document.getElementById('sidebarTxCount'),
  sidebarAddTxBtn: document.getElementById('sidebarAddTxBtn'),
  txViewAddBtn: document.getElementById('txViewAddBtn'),

  // Balance & 3D Liquid Chrome Sculpture
  totalBalance: document.getElementById('totalBalance'),
  balanceStatusBadge: document.getElementById('balanceStatusBadge'),
  spatialBalanceOrb: document.getElementById('spatialBalanceOrb'),
  chromeSculptureWrap: document.getElementById('chromeSculptureWrap'),
  chromeSculptureCanvas: document.getElementById('chromeSculptureCanvas'),
  heroAddTxBtn: document.getElementById('heroAddTxBtn'),
  totalIncome: document.getElementById('totalIncome'),
  incomeCountLabel: document.getElementById('incomeCountLabel'),
  totalExpense: document.getElementById('totalExpense'),
  expenseCountLabel: document.getElementById('expenseCountLabel'),

  // Overview 7-Section Elements
  overviewSavingsCard: document.getElementById('overviewSavingsCard'),
  overviewSavingsRate: document.getElementById('overviewSavingsRate'),
  overviewSavingsCaption: document.getElementById('overviewSavingsCaption'),
  overviewGoalCard: document.getElementById('overviewGoalCard'),
  overviewGoalTitle: document.getElementById('overviewGoalTitle'),
  overviewGoalTarget: document.getElementById('overviewGoalTarget'),
  overviewGoalCurrent: document.getElementById('overviewGoalCurrent'),
  overviewGoalPercent: document.getElementById('overviewGoalPercent'),
  overviewGoalProgressBar: document.getElementById('overviewGoalProgressBar'),
  overviewGoalContribBtn: document.getElementById('overviewGoalContribBtn'),
  overviewSpendingCard: document.getElementById('overviewSpendingCard'),
  overviewSpendingBars: document.getElementById('overviewSpendingBars'),
  overviewRecentTxCard: document.getElementById('overviewRecentTxCard'),
  overviewRecentTxList: document.getElementById('overviewRecentTxList'),

  // Safe to Spend Elements
  safeDailySpend: document.getElementById('safeDailySpend'),
  monthDaysTag: document.getElementById('monthDaysTag'),
  monthProgressBar: document.getElementById('monthProgressBar'),
  monthProgressPercent: document.getElementById('monthProgressPercent'),
  safeSpendDesc: document.getElementById('safeSpendDesc'),

  // Insights Elements
  insightsBody: document.getElementById('insightsBody'),
  insightTopCategory: document.getElementById('insightTopCategory'),
  insightLargestTx: document.getElementById('insightLargestTx'),
  insightSavingsRate: document.getElementById('insightSavingsRate'),

  // Chart & Breakdown
  spendingChart: document.getElementById('spendingChart'),
  chartContainer: document.getElementById('chartContainer'),
  chartEmptyState: document.getElementById('chartEmptyState'),
  chartExpenseTotalBadge: document.getElementById('chartExpenseTotalBadge'),
  categoryBreakdownList: document.getElementById('categoryBreakdownList'),
  chartAddExpenseBtn: document.getElementById('chartAddExpenseBtn'),

  // Transactions View
  transactionCountBadge: document.getElementById('transactionCountBadge'),
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  categoryFilterSelect: document.getElementById('categoryFilterSelect'),
  sortSelect: document.getElementById('sortSelect'),
  transactionsList: document.getElementById('transactionsList'),
  emptyStateNoData: document.getElementById('emptyStateNoData'),
  emptyStateNoResults: document.getElementById('emptyStateNoResults'),
  exportCsvBtn: document.getElementById('exportCsvBtn'),

  // Analytics Forecast & Report
  forecastEndAmount: document.getElementById('forecastEndAmount'),
  forecastExplanation: document.getElementById('forecastExplanation'),
  monthlyReportContent: document.getElementById('monthlyReportContent'),
  exportReportBtn: document.getElementById('exportReportBtn'),

  // Budgets & Recurring
  budgetsGrid: document.getElementById('budgetsGrid'),
  openAddBudgetBtn: document.getElementById('openAddBudgetBtn'),
  budgetModal: document.getElementById('budgetModal'),
  budgetForm: document.getElementById('budgetForm'),
  budgetCategorySelect: document.getElementById('budgetCategorySelect'),
  budgetLimitInput: document.getElementById('budgetLimitInput'),
  closeBudgetModalBtn: document.getElementById('closeBudgetModalBtn'),
  cancelBudgetBtn: document.getElementById('cancelBudgetBtn'),

  recurringGrid: document.getElementById('recurringGrid'),
  openAddRecurringBtn: document.getElementById('openAddRecurringBtn'),
  recurringModal: document.getElementById('recurringModal'),
  recurringForm: document.getElementById('recurringForm'),
  recurringNameInput: document.getElementById('recurringNameInput'),
  recurringAmountInput: document.getElementById('recurringAmountInput'),
  recurringFrequencySelect: document.getElementById('recurringFrequencySelect'),
  recurringNextDateInput: document.getElementById('recurringNextDateInput'),
  closeRecurringModalBtn: document.getElementById('closeRecurringModalBtn'),
  cancelRecurringBtn: document.getElementById('cancelRecurringBtn'),

  // Goals
  goalsGrid: document.getElementById('goalsGrid'),
  openAddGoalBtn: document.getElementById('openAddGoalBtn'),
  goalModal: document.getElementById('goalModal'),
  goalForm: document.getElementById('goalForm'),
  goalTitleInput: document.getElementById('goalTitleInput'),
  goalTargetInput: document.getElementById('goalTargetInput'),
  goalDateInput: document.getElementById('goalDateInput'),
  closeGoalModalBtn: document.getElementById('closeGoalModalBtn'),
  cancelGoalBtn: document.getElementById('cancelGoalBtn'),

  // Contribution Modal
  contributionModal: document.getElementById('contributionModal'),
  contributionForm: document.getElementById('contributionForm'),
  contribGoalId: document.getElementById('contribGoalId'),
  contribGoalSubtitle: document.getElementById('contribGoalSubtitle'),
  contribAmountInput: document.getElementById('contribAmountInput'),
  closeContribModalBtn: document.getElementById('closeContribModalBtn'),
  cancelContribBtn: document.getElementById('cancelContribBtn'),

  // AI Assistant
  aiChatThread: document.getElementById('aiChatThread'),
  aiChatForm: document.getElementById('aiChatForm'),
  aiChatInput: document.getElementById('aiChatInput'),
  aiPromptChips: document.getElementById('aiPromptChips'),
  aiResetChatBtn: document.getElementById('aiResetChatBtn'),
  aiParseBtn: document.getElementById('aiParseBtn'),
  aiStatusPill: document.getElementById('aiStatusPill'),

  // Settings View
  exportJsonBtn: document.getElementById('exportJsonBtn'),
  loadDemoBtnSettings: document.getElementById('loadDemoBtnSettings'),
  clearAllBtnSettings: document.getElementById('clearAllBtnSettings'),
  storageMetricsText: document.getElementById('storageMetricsText'),

  // Modals (Transactions & Delete)
  openAddModalBtn: document.getElementById('openAddModalBtn'),
  transactionModal: document.getElementById('transactionModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),
  transactionForm: document.getElementById('transactionForm'),
  modalTitle: document.getElementById('modalTitle'),
  modalSubtitle: document.getElementById('modalSubtitle'),
  modalHeaderIcon: document.getElementById('modalHeaderIcon'),
  txEditId: document.getElementById('txEditId'),
  saveTransactionBtn: document.getElementById('saveTransactionBtn'),
  typeExpense: document.getElementById('typeExpense'),
  typeIncome: document.getElementById('typeIncome'),
  txTitle: document.getElementById('txTitle'),
  txTitleError: document.getElementById('txTitleError'),
  txAmount: document.getElementById('txAmount'),
  txAmountError: document.getElementById('txAmountError'),
  txCategory: document.getElementById('txCategory'),
  txCategoryError: document.getElementById('txCategoryError'),
  txDate: document.getElementById('txDate'),
  txDateError: document.getElementById('txDateError'),
  txNotes: document.getElementById('txNotes'),

  deleteConfirmModal: document.getElementById('deleteConfirmModal'),
  deleteTargetTitle: document.getElementById('deleteTargetTitle'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),

  // Toast Container
  toastContainer: document.getElementById('toastContainer')
};

/* ==============================================================================
   7. 7-VIEW CLIENT-SIDE ROUTER
   ============================================================================== */

function switchView(viewName) {
  const validViews = ['overview', 'transactions', 'analytics', 'budgets', 'goals', 'ai', 'settings'];
  if (!validViews.includes(viewName)) {
    viewName = 'overview';
  }

  state.activeView = viewName;

  // Toggle view panels
  document.querySelectorAll('.view-panel').forEach(panel => {
    if (panel.getAttribute('data-view') === viewName) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });

  // Sync nav active classes
  const updateNavActive = (nodeList) => {
    nodeList.forEach(item => {
      if (item.getAttribute('data-view-target') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  };

  updateNavActive(document.querySelectorAll('.sidebar-nav-item'));
  updateNavActive(document.querySelectorAll('.nav-links-desktop .nav-item'));
  updateNavActive(document.querySelectorAll('.drawer-links .drawer-link'));
  updateNavActive(document.querySelectorAll('.mobile-bottom-nav .bottom-nav-item'));

  // Trigger view-specific rendering
  if (viewName === 'overview') {
    renderOverview();
  } else if (viewName === 'transactions') {
    renderTransactionsList();
  } else if (viewName === 'analytics') {
    renderAnalyticsView();
  } else if (viewName === 'budgets') {
    renderBudgetsView();
    renderRecurringSubscriptions();
  } else if (viewName === 'goals') {
    renderGoalsView();
  } else if (viewName === 'ai') {
    renderAiMessages();
  } else if (viewName === 'settings') {
    renderSettingsView();
  }

  // Close mobile drawer if open
  closeMobileDrawer();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Refresh Lucide icons in newly rendered panels
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function closeMobileDrawer() {
  if (DOM.mobileDrawer && DOM.mobileDrawer.classList.contains('open')) {
    DOM.mobileDrawer.classList.remove('open');
    if (DOM.mobileDrawerBackdrop) DOM.mobileDrawerBackdrop.classList.remove('open');
    if (DOM.mobileMenuToggle) DOM.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
    document.body.classList.remove('drawer-locked');
  }
}

/* ==============================================================================
   8. OBSIDIAN CHROME 3D SPATIAL VISUALIZER & SPRING-LERPED CARD TILT
   ============================================================================== */

let chromeSculptureLoopId = null;

function initLiquidChromeSculpture() {
  const canvas = DOM.chromeSculptureCanvas;
  const orbFallback = DOM.spatialBalanceOrb;
  const wrap = DOM.chromeSculptureWrap;
  const card = document.getElementById('heroBalanceCard');

  if (!canvas || !wrap) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    if (canvas) canvas.style.display = 'none';
    if (orbFallback) orbFallback.style.display = 'block';
    return;
  }

  // Attempt WebGL context creation with high performance preference
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'high-performance' }) ||
             canvas.getContext('experimental-webgl', { alpha: true, antialias: true });

  if (!gl) {
    console.info('[Vaultly] WebGL unavailable, falling back to CSS spatial orb.');
    if (canvas) canvas.style.display = 'none';
    if (orbFallback) orbFallback.style.display = 'block';
    return;
  }

  // Reveal WebGL canvas and hide fallback orb
  if (orbFallback) orbFallback.style.display = 'none';
  canvas.style.display = 'block';

  // Raymarched Molten Liquid Chrome Shader
  const vsSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;

    float smin(float a, float b, float k) {
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
    }

    mat2 rot(float a) {
      float s = sin(a), c = cos(a);
      return mat2(c, -s, s, c);
    }

    float map(vec3 p) {
      // Idle harmonic float oscillation
      p.y += sin(u_time * 1.1) * 0.07;
      p.x += cos(u_time * 0.85) * 0.05;

      // Mouse rotation with smooth inertia
      p.yz *= rot(u_mouse.y * 0.55);
      p.xz *= rot(u_mouse.x * 0.75 + u_time * 0.22);

      // Liquid surface ripple harmonics
      float ripple = sin(p.x * 2.8 + u_time * 1.4) * cos(p.y * 2.8 + u_time * 1.2) * sin(p.z * 2.8 + u_time * 1.3) * 0.11;

      // Central molten chrome sphere
      float d1 = length(p) - 0.76 + ripple;

      // Orbital satellite droplet 1
      vec3 p2 = p - vec3(sin(u_time * 0.75) * 0.58, cos(u_time * 1.05) * 0.48, sin(u_time * 0.55) * 0.38);
      float d2 = length(p2) - 0.27;

      // Orbital satellite droplet 2
      vec3 p3 = p - vec3(-cos(u_time * 0.95) * 0.48, sin(u_time * 0.65) * 0.48, -cos(u_time * 0.85) * 0.38);
      float d3 = length(p3) - 0.22;

      return smin(smin(d1, d2, 0.32), d3, 0.28);
    }

    vec3 calcNormal(vec3 p) {
      const vec2 e = vec2(0.002, 0.0);
      return normalize(vec3(
        map(p + e.xyy) - map(p - e.xyy),
        map(p + e.yxy) - map(p - e.yxy),
        map(p + e.yyx) - map(p - e.yyx)
      ));
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
      vec3 ro = vec3(0.0, 0.0, 2.5);
      vec3 rd = normalize(vec3(uv, -1.35));

      float t = 0.0;
      for (int i = 0; i < 56; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        if (d < 0.001 || t > 5.0) break;
        t += d;
      }

      if (t < 5.0) {
        vec3 p = ro + rd * t;
        vec3 n = calcNormal(p);
        vec3 ref = reflect(rd, n);

        // Three-point studio lighting for obsidian chrome
        vec3 light1 = normalize(vec3(0.6, 0.8, 0.9));
        vec3 light2 = normalize(vec3(-0.7, -0.4, 0.6));
        vec3 light3 = normalize(vec3(0.1, 1.0, -0.4));

        float diff1 = max(dot(n, light1), 0.0);
        float spec1 = pow(max(dot(ref, light1), 0.0), 36.0);
        float spec2 = pow(max(dot(ref, light2), 0.0), 64.0);
        float spec3 = pow(max(dot(ref, light3), 0.0), 18.0);

        // Fresnel edge sheen
        float fresnel = pow(1.0 - max(dot(-rd, n), 0.0), 3.0);

        // Obsidian body + chrome specular highlights
        vec3 chrome = vec3(0.06, 0.07, 0.09) * (diff1 * 0.45 + 0.12);
        chrome += vec3(0.75, 0.78, 0.82) * (spec1 * 0.85 + spec3 * 0.35);
        chrome += vec3(1.0, 1.0, 1.0) * (spec2 * 1.3);
        chrome += vec3(0.88, 0.90, 0.96) * (fresnel * 0.7);

        gl_FragColor = vec4(chrome, 1.0);
      } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      }
    }
  `;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Shader compile failed:', gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const vs = compileShader(gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) {
    if (canvas) canvas.style.display = 'none';
    if (orbFallback) orbFallback.style.display = 'block';
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Program link failed:', gl.getProgramInfoLog(program));
    if (canvas) canvas.style.display = 'none';
    if (orbFallback) orbFallback.style.display = 'block';
    return;
  }

  gl.useProgram(program);

  // Screen quad buffer
  const positionLocation = gl.getAttribLocation(program, 'position');
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');

  // Mouse tracking with smooth spring lerping
  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;

  if (card) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = nx;
      targetMouseY = ny;
    });

    card.addEventListener('mouseleave', () => {
      targetMouseX = 0;
      targetMouseY = 0;
    });
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const displayWidth = canvas.clientWidth || 220;
    const displayHeight = canvas.clientHeight || 220;
    const w = Math.floor(displayWidth * dpr);
    const h = Math.floor(displayHeight * dpr);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  let startTime = performance.now();
  let isVisible = true;

  // IntersectionObserver to pause loop when scrolled off-screen
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !chromeSculptureLoopId) {
          render();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(canvas);
  }

  function render() {
    if (!isVisible) {
      chromeSculptureLoopId = null;
      return;
    }

    resizeCanvas();

    const elapsed = (performance.now() - startTime) * 0.001;

    // Smooth lerp mouse coordinates
    currentMouseX += (targetMouseX - currentMouseX) * 0.08;
    currentMouseY += (targetMouseY - currentMouseY) * 0.08;

    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uTime, elapsed);
    gl.uniform2f(uMouse, currentMouseX, currentMouseY);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    chromeSculptureLoopId = requestAnimationFrame(render);
  }

  render();
}

function initSpatialBalanceOrb() {
  const orb = DOM.spatialBalanceOrb;
  const balanceCard = document.querySelector('.balance-card');
  if (!orb || !balanceCard) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let ticking = false;

  balanceCard.addEventListener('mousemove', (e) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const rect = balanceCard.getBoundingClientRect();
        const cardX = e.clientX - rect.left;
        const cardY = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const deltaX = (cardX - centerX) / centerX;
        const deltaY = (cardY - centerY) / centerY;

        const rotateX = deltaY * -12;
        const rotateY = deltaX * 14;

        orb.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
        ticking = false;
      });
      ticking = true;
    }
  });

  balanceCard.addEventListener('mouseleave', () => {
    orb.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)';
  });
}

function initSpatialCardTilt() {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || window.innerWidth < 1024) return;

  const targetSelector = '.hero-balance-card, .metric-card, .safe-spend-card, .insights-card, .goal-preview-card, .spending-dist-card, .overview-recent-card, .budget-card, .goal-card';
  const cards = document.querySelectorAll(targetSelector);

  cards.forEach(card => {
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let isHovered = false;
    let animId = null;

    const maxTilt = 3.0; // Restrained 2-4 degrees as specified

    const updateTilt = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      card.style.transform = `perspective(1000px) rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg) translateY(${isHovered ? -2 : 0}px)`;

      if (!isHovered && Math.abs(currentX) < 0.05 && Math.abs(currentY) < 0.05) {
        card.style.transform = '';
        cancelAnimationFrame(animId);
        animId = null;
        return;
      }

      animId = requestAnimationFrame(updateTilt);
    };

    card.addEventListener('mouseenter', () => {
      isHovered = true;
      if (!animId) animId = requestAnimationFrame(updateTilt);
    });

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width) * 2 - 1;
      const normY = (y / rect.height) * 2 - 1;

      targetX = -normY * maxTilt;
      targetY = normX * maxTilt;

      const spotlight = card.querySelector('.card-spotlight');
      if (spotlight) {
        spotlight.style.setProperty('--spotlight-x', `${x}px`);
        spotlight.style.setProperty('--spotlight-y', `${y}px`);
      }
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      targetX = 0;
      targetY = 0;
    });
  });
}

/* ==============================================================================
   9. TRANSACTION MANAGEMENT & CRUD
   ============================================================================== */

function openAddTransactionModal() {
  state.editingTxId = null;
  DOM.modalTitle.textContent = 'Add Transaction';
  if (DOM.modalSubtitle) DOM.modalSubtitle.textContent = 'Record a new income or expense entry';
  DOM.txEditId.value = '';
  DOM.transactionForm.reset();
  DOM.typeExpense.checked = true;
  updateFormCategoryOptions('expense');
  DOM.txDate.value = getTodayDateString();
  clearFormValidationErrors();
  openModal(DOM.transactionModal);
}

function openEditTransactionModal(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;

  state.editingTxId = id;
  DOM.modalTitle.textContent = 'Edit Transaction';
  if (DOM.modalSubtitle) DOM.modalSubtitle.textContent = 'Update recorded details';
  DOM.txEditId.value = tx.id;
  DOM.txTitle.value = tx.title;
  DOM.txAmount.value = tx.amount;
  DOM.txDate.value = tx.date;
  DOM.txNotes.value = tx.notes || '';

  if (tx.type === 'income') {
    DOM.typeIncome.checked = true;
    updateFormCategoryOptions('income');
  } else {
    DOM.typeExpense.checked = true;
    updateFormCategoryOptions('expense');
  }

  DOM.txCategory.value = tx.category;
  clearFormValidationErrors();
  openModal(DOM.transactionModal);
}

function handleTransactionFormSubmit(e) {
  e.preventDefault();
  clearFormValidationErrors();

  const title = DOM.txTitle.value.trim();
  const amountStr = DOM.txAmount.value.trim();
  const amount = parseFloat(amountStr);
  const type = DOM.typeIncome.checked ? 'income' : 'expense';
  const category = DOM.txCategory.value;
  const date = DOM.txDate.value;
  const notes = DOM.txNotes.value.trim();

  let hasError = false;

  if (!title) {
    showFieldError(DOM.txTitleError, 'Please enter a title for the transaction.');
    hasError = true;
  } else if (title.length > 80) {
    showFieldError(DOM.txTitleError, 'Title cannot exceed 80 characters.');
    hasError = true;
  }

  if (!amountStr || isNaN(amount) || amount <= 0) {
    showFieldError(DOM.txAmountError, 'Please enter a valid amount greater than ₹0.');
    hasError = true;
  }

  if (!category) {
    showFieldError(DOM.txCategoryError, 'Please select a category.');
    hasError = true;
  }

  if (!date) {
    showFieldError(DOM.txDateError, 'Please select a date.');
    hasError = true;
  }

  if (hasError) return;

  if (state.editingTxId) {
    // Edit existing transaction
    const idx = state.transactions.findIndex(t => t.id === state.editingTxId);
    if (idx !== -1) {
      state.transactions[idx] = {
        ...state.transactions[idx],
        title,
        amount,
        type,
        category,
        date,
        notes
      };
      saveTransactions(state.transactions);
      showToast(`Updated "${title}" successfully.`, 'success');
    }
  } else {
    // Add new transaction
    const newTx = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      title,
      amount,
      type,
      category,
      date,
      notes
    };
    state.transactions.unshift(newTx);
    saveTransactions(state.transactions);
    showToast(`Added "${title}" (${formatCurrency(amount)}).`, 'success');
  }

  closeModal(DOM.transactionModal);
  renderDashboard();
}

function deleteTransaction(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;

  state.transactions = state.transactions.filter(t => t.id !== id);
  saveTransactions(state.transactions);
  showToast(`Deleted "${tx.title}".`, 'info');
  closeModal(DOM.deleteConfirmModal);
  renderDashboard();
}

function exportTransactionsCSV() {
  if (state.transactions.length === 0) {
    showToast('No transactions to export.', 'warning');
    return;
  }

  const headers = ['ID', 'Date', 'Title', 'Type', 'Category', 'Amount (INR)', 'Notes'];
  const rows = state.transactions.map(tx => [
    `"${tx.id}"`,
    `"${tx.date}"`,
    `"${tx.title.replace(/"/g, '""')}"`,
    `"${tx.type}"`,
    `"${tx.category.replace(/"/g, '""')}"`,
    tx.amount.toFixed(2),
    `"${(tx.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `vaultly_transactions_${getTodayDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Transactions exported as CSV.', 'success');
}

/* ==============================================================================
   10. SMART BUDGETS & RECURRING SUBSCRIPTIONS
   ============================================================================== */

function renderBudgetsView() {
  const grid = DOM.budgetsGrid;
  if (!grid) return;

  grid.innerHTML = '';
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate spent per category for current month
  const categorySpent = {};
  state.transactions.forEach(tx => {
    if (tx.type === 'expense') {
      const d = new Date(tx.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        categorySpent[tx.category] = (categorySpent[tx.category] || 0) + tx.amount;
      }
    }
  });

  if (state.budgets.length === 0) {
    grid.innerHTML = `
      <div class="cosmic-empty-card" style="grid-column: 1 / -1;">
        <div class="cosmic-empty-halo"><i data-lucide="wallet"></i></div>
        <h3 class="cosmic-empty-heading">No budgets established</h3>
        <p class="cosmic-empty-text">Create monthly spending limits per category to stay in complete control.</p>
      </div>
    `;
    return;
  }

  state.budgets.forEach(b => {
    const spent = categorySpent[b.category] || 0;
    const remaining = Math.max(0, b.limit - spent);
    const percent = Math.min(100, Math.round((spent / b.limit) * 100));
    const isWarning = percent >= 80 && percent < 100;
    const isOver = spent > b.limit;

    let fillClass = '';
    let badgeText = `${percent}% Used`;
    let badgeTagClass = '';

    if (isOver) {
      fillClass = 'danger';
      badgeText = 'Budget Exceeded';
      badgeTagClass = 'tag-danger';
    } else if (isWarning) {
      fillClass = 'warn';
      badgeText = 'Approaching Limit';
      badgeTagClass = 'tag-warning';
    }

    const card = document.createElement('article');
    card.className = 'glass-card budget-card';
    card.innerHTML = `
      <div class="budget-head">
        <div>
          <h3 class="budget-cat-name">${escapeHTML(b.category)}</h3>
          <span class="panel-subtitle">Monthly Limit: ${formatCurrency(b.limit)}</span>
        </div>
        <span class="glass-tag ${badgeTagClass}">${badgeText}</span>
      </div>
      <div>
        <div class="budget-progress-track">
          <div class="budget-progress-fill ${fillClass}" style="width: ${percent}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.82rem; color: var(--text-secondary);">
          <span>Spent: ${formatCurrency(spent)}</span>
          <span>Remaining: ${formatCurrency(remaining)}</span>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
        <button type="button" class="btn-ghost-glass btn-sm" data-action="delete-budget" data-category="${escapeHTML(b.category)}">
          <i data-lucide="trash-2" class="btn-icon-xs"></i>
          <span>Remove</span>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function handleBudgetFormSubmit(e) {
  e.preventDefault();
  const category = DOM.budgetCategorySelect.value;
  const limit = parseFloat(DOM.budgetLimitInput.value);

  if (!category || isNaN(limit) || limit <= 0) {
    showToast('Please enter a valid monthly limit amount.', 'danger');
    return;
  }

  const existingIdx = state.budgets.findIndex(b => b.category === category);
  if (existingIdx !== -1) {
    state.budgets[existingIdx].limit = limit;
  } else {
    state.budgets.push({ category, limit });
  }

  saveBudgets(state.budgets);
  closeModal(DOM.budgetModal);
  showToast(`Saved ${category} budget of ${formatCurrency(limit)}.`, 'success');
  renderBudgetsView();
}

function renderRecurringSubscriptions() {
  const grid = DOM.recurringGrid;
  if (!grid) return;

  grid.innerHTML = '';
  if (state.recurring.length === 0) {
    grid.innerHTML = `
      <div class="cosmic-empty-card" style="grid-column: 1 / -1;">
        <div class="cosmic-empty-halo"><i data-lucide="repeat"></i></div>
        <h3 class="cosmic-empty-heading">No recurring commitments</h3>
        <p class="cosmic-empty-text">Add subscriptions, fixed utilities, or rent to account for monthly fixed commitments.</p>
      </div>
    `;
    return;
  }

  state.recurring.forEach(rec => {
    const card = document.createElement('article');
    card.className = 'glass-card recurring-card';
    card.innerHTML = `
      <div class="recurring-head">
        <div>
          <h3 class="recurring-title">${escapeHTML(rec.name)}</h3>
          <span class="panel-subtitle">Frequency: ${rec.frequency.toUpperCase()} • Next Due: ${formatDate(rec.nextDate)}</span>
        </div>
        <span class="glass-tag ${rec.active !== false ? 'tag-emerald' : 'tag-muted'}">
          ${rec.active !== false ? 'Active' : 'Paused'}
        </span>
      </div>
      <div class="recurring-amount-stat">${formatCurrency(rec.amount)}</div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
        <button type="button" class="btn-ghost-glass btn-sm" data-action="toggle-recurring" data-id="${rec.id}">
          <span>${rec.active !== false ? 'Pause' : 'Activate'}</span>
        </button>
        <button type="button" class="btn-ghost-glass btn-sm btn-danger-glass" data-action="delete-recurring" data-id="${rec.id}">
          <i data-lucide="trash-2" class="btn-icon-xs"></i>
          <span>Delete</span>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function handleRecurringFormSubmit(e) {
  e.preventDefault();
  const name = DOM.recurringNameInput.value.trim();
  const amount = parseFloat(DOM.recurringAmountInput.value);
  const frequency = DOM.recurringFrequencySelect.value;
  const nextDate = DOM.recurringNextDateInput.value;

  if (!name || isNaN(amount) || amount <= 0 || !nextDate) {
    showToast('Please fill out all recurring commitment fields.', 'danger');
    return;
  }

  state.recurring.push({
    id: 'rec-' + Date.now(),
    name,
    amount,
    frequency,
    nextDate,
    active: true
  });

  saveRecurring(state.recurring);
  closeModal(DOM.recurringModal);
  showToast(`Recorded recurring commitment "${name}".`, 'success');
  renderRecurringSubscriptions();
  renderOverview();
}

/* ==============================================================================
   11. FINANCIAL GOALS & SAVINGS PLANNER
   ============================================================================== */

function renderGoalsView() {
  const grid = DOM.goalsGrid;
  if (!grid) return;

  grid.innerHTML = '';
  if (state.goals.length === 0) {
    grid.innerHTML = `
      <div class="cosmic-empty-card" style="grid-column: 1 / -1;">
        <div class="cosmic-empty-halo"><i data-lucide="target"></i></div>
        <h3 class="cosmic-empty-heading">No financial goals yet</h3>
        <p class="cosmic-empty-text">Create savings targets for an emergency fund, travel, or hardware.</p>
      </div>
    `;
    return;
  }

  state.goals.forEach(goal => {
    const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

    const card = document.createElement('article');
    card.className = 'glass-card goal-card';
    card.innerHTML = `
      <div class="goal-head">
        <div>
          <h3 class="goal-title">${escapeHTML(goal.title)}</h3>
          <span class="panel-subtitle">${goal.targetDate ? `Target: ${formatDate(goal.targetDate)}` : 'Open-ended Goal'}</span>
        </div>
        <span class="glass-tag ${percent >= 100 ? 'tag-emerald' : ''}">${percent}% Saved</span>
      </div>
      <div>
        <div class="goal-amount-stat">${formatCurrency(goal.currentAmount)} <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: normal;">/ ${formatCurrency(goal.targetAmount)}</span></div>
        <div class="goal-progress-track" style="margin-top: 10px;">
          <div class="goal-progress-fill" style="width: ${percent}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.82rem; color: var(--text-secondary);">
          <span>${formatCurrency(remaining)} to target</span>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
        <button type="button" class="btn-liquid-secondary btn-sm" data-action="contribute-goal" data-id="${goal.id}" data-title="${escapeHTML(goal.title)}">
          <i data-lucide="plus" class="btn-icon-xs"></i>
          <span>Add Funds</span>
        </button>
        <button type="button" class="btn-ghost-glass btn-sm btn-danger-glass" data-action="delete-goal" data-id="${goal.id}">
          <i data-lucide="trash-2" class="btn-icon-xs"></i>
          <span>Delete</span>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function handleGoalFormSubmit(e) {
  e.preventDefault();
  const title = DOM.goalTitleInput.value.trim();
  const targetAmount = parseFloat(DOM.goalTargetInput.value);
  const targetDate = DOM.goalDateInput.value;

  if (!title || isNaN(targetAmount) || targetAmount <= 0) {
    showToast('Please specify a valid title and target amount.', 'danger');
    return;
  }

  state.goals.push({
    id: 'goal-' + Date.now(),
    title,
    targetAmount,
    currentAmount: 0,
    targetDate
  });

  saveGoals(state.goals);
  closeModal(DOM.goalModal);
  showToast(`Created savings goal "${title}".`, 'success');
  renderGoalsView();
}

function handleContributionFormSubmit(e) {
  e.preventDefault();
  const goalId = DOM.contribGoalId.value;
  const amount = parseFloat(DOM.contribAmountInput.value);

  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid contribution amount.', 'danger');
    return;
  }

  const goal = state.goals.find(g => g.id === goalId);
  if (!goal) return;

  goal.currentAmount += amount;
  saveGoals(state.goals);
  closeModal(DOM.contributionModal);
  showToast(`Added ${formatCurrency(amount)} to "${goal.title}".`, 'success');
  renderGoalsView();
  renderOverview();
}

function openGoalContributionModal(goalId) {
  const goal = state.goals.find(g => g.id === goalId);
  if (!goal) return;
  DOM.contribGoalId.value = goal.id;
  DOM.contribGoalSubtitle.textContent = `Contribute to ${goal.title}`;
  DOM.contribAmountInput.value = '';
  openModal(DOM.contributionModal);
}

/* ==============================================================================
   12. AI SPENDING ANALYZER & FORECASTING
   ============================================================================== */

function renderAnalyticsView() {
  renderSpendingChart();
  renderCategoryBreakdown();

  const forecast = calculateSpendingForecast(state.transactions);
  if (DOM.forecastEndAmount) {
    DOM.forecastEndAmount.textContent = formatCurrency(forecast.projectedEnd);
  }
  if (DOM.forecastExplanation) {
    DOM.forecastExplanation.textContent = `Spent ${formatCurrency(forecast.spentSoFar)} over ${forecast.currentDay} days (avg ${formatCurrency(forecast.avgDaily)}/day). At this pace, projected month-end spend is ${formatCurrency(forecast.projectedEnd)}.`;
  }

  if (DOM.monthlyReportContent) {
    const totals = calculateTotals(state.transactions);
    const topCat = calculateCategoryBreakdown(state.transactions)[0] || { category: 'None', total: 0 };
    DOM.monthlyReportContent.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.9rem;">
        <p>• <strong>Total Cash Inflow:</strong> ${formatCurrency(totals.totalIncome)}</p>
        <p>• <strong>Total Cash Outflow:</strong> ${formatCurrency(totals.totalExpenses)}</p>
        <p>• <strong>Net Surplus:</strong> ${formatCurrency(totals.netBalance)}</p>
        <p>• <strong>Primary Spending Area:</strong> ${escapeHTML(topCat.category)} (${formatCurrency(topCat.total)})</p>
      </div>
    `;
  }
}

/* ==============================================================================
   13. VAULTLY AI ASSISTANT & NATURAL LANGUAGE PARSER
   ============================================================================== */

function renderAiMessages() {
  const thread = DOM.aiChatThread;
  if (!thread) return;

  thread.innerHTML = '';
  state.aiMessages.forEach(msg => {
    const div = document.createElement('div');
    div.className = `ai-msg ${msg.sender}`;
    div.innerHTML = `<div class="ai-msg-bubble">${msg.text}</div>`;
    thread.appendChild(div);
  });
  thread.scrollTop = thread.scrollHeight;
}

/**
 * Local Deterministic Financial AI Engine (Guaranteed zero-failure offline fallback).
 * Answers user questions with verified arithmetic directly from application state.
 */
function localDeterministicFinancialAI(userQuery, context) {
  const q = userQuery.toLowerCase();
  const totals = context.totals;
  const topCat = context.breakdown[0];

  if (q.includes('spend') && (q.includes('this month') || q.includes('how much'))) {
    return `According to your verified records, your total recorded expenses amount to **${formatCurrency(totals.totalExpenses)}** across ${totals.expenseCount} logged transactions.`;
  }

  if (q.includes('largest') || q.includes('top category') || q.includes('most')) {
    if (topCat) {
      return `Your largest expense category is **${topCat.category}**, accounting for **${formatCurrency(topCat.total)}** (${topCat.percentage}% of all your recorded spending).`;
    }
    return `You haven't recorded any expenses yet to determine a top category.`;
  }

  if (q.includes('balance') || q.includes('net') || q.includes('saved')) {
    return `Your recorded net balance is **${formatCurrency(totals.netBalance)}** (Total Income: ${formatCurrency(totals.totalIncome)} − Total Expenses: ${formatCurrency(totals.totalExpenses)}).`;
  }

  if (q.includes('safe') || q.includes('daily')) {
    const safe = calculateSafeToSpend(state.transactions, state.recurring);
    return `Based on your remaining net balance and commitments, your daily Safe-to-Spend allowance is approximately **${formatCurrency(safe.dailyAllowance)}/day** for the remaining ${safe.daysRemaining} days of this month.`;
  }

  if (q.includes('budget') || q.includes('limits')) {
    if (state.budgets.length === 0) {
      return `You haven't created any category budgets yet. Navigate to the **Budgets** view to establish monthly caps!`;
    }
    const list = state.budgets.map(b => `${b.category}: ${formatCurrency(b.limit)}`).join(', ');
    return `You have ${state.budgets.length} active budgets configured: ${list}.`;
  }

  if (q.includes('goal') || q.includes('savings')) {
    if (state.goals.length === 0) {
      return `No active savings goals found. Head over to the **Goals** tab to set a target for an emergency fund, laptop, or trip.`;
    }
    const g = state.goals[0];
    return `Your primary goal is **${g.title}** (${formatCurrency(g.currentAmount)} saved toward ${formatCurrency(g.targetAmount)}, ${Math.round((g.currentAmount / g.targetAmount) * 100)}%).`;
  }

  return `Based on your recorded transactions: Total Income is **${formatCurrency(totals.totalIncome)}**, Total Expenses are **${formatCurrency(totals.totalExpenses)}**, leaving a Net Balance of **${formatCurrency(totals.netBalance)}**. Ask me to compare categories, inspect budgets, or estimate your safe daily spend!`;
}

/**
 * Natural Language Transaction Parser
 * Parses inputs like "Spent 250 on lunch today" into structured transaction fields.
 */
function parseNaturalLanguageTransaction(text) {
  if (!text || typeof text !== 'string') return null;

  const t = text.trim();
  const lower = t.toLowerCase();

  // 1. Amount Extraction (₹250, 250, 250.50, rs 250)
  const amountMatch = t.match(/(?:(?:₹|rs\.?|inr)\s*)?([0-9]+(?:\.[0-9]{1,2})?)/i);
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
    if (lower.includes('lunch') || lower.includes('dinner') || lower.includes('food') || lower.includes('burger') || lower.includes('pizza') || lower.includes('grocery') || lower.includes('coffee') || lower.includes('cafe')) {
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
  let date = getTodayDateString();
  if (lower.includes('yesterday')) {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    date = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  }

  // 5. Clean Title
  let title = t.replace(/(?:spent|paid|received|earned|got|on|for|yesterday|today|rs\.?|inr|₹|[0-9]+(?:\.[0-9]{1,2})?)/gi, '').trim();
  if (!title) {
    title = category === 'Other' ? (type === 'income' ? 'Income Payment' : 'Expense Payment') : category;
  } else {
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return { amount, type, category, date, title };
}

async function handleAiChatSubmit(e) {
  if (e) e.preventDefault();
  const input = DOM.aiChatInput;
  if (!input) return;

  const userText = input.value.trim();
  if (!userText) return;

  input.value = '';

  // Append user message
  state.aiMessages.push({ sender: 'user', text: escapeHTML(userText) });
  renderAiMessages();

  // Add temporary typing indicator
  state.aiMessages.push({ sender: 'assistant', text: '<em>Analyzing financial records...</em>' });
  renderAiMessages();

  // Prepare minimized grounded context
  const totals = calculateTotals(state.transactions);
  const breakdown = calculateCategoryBreakdown(state.transactions);
  const context = {
    totals,
    breakdown,
    transactionCount: state.transactions.length,
    budgetCount: state.budgets.length,
    goalCount: state.goals.length
  };

  let replyText = '';

  try {
    // Attempt secure Vercel API endpoint
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText, context })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.reply) {
        replyText = data.reply;
      }
    }
  } catch (err) {
    // Graceful offline fallback
    console.info('[Vaultly AI] Offline / API fallback active:', err.message);
  }

  if (!replyText) {
    // Use verified local deterministic rules
    replyText = localDeterministicFinancialAI(userText, context);
  }

  // Replace typing indicator with real reply
  state.aiMessages.pop();
  state.aiMessages.push({ sender: 'assistant', text: replyText });
  renderAiMessages();
}

function handleAiPromptChipClick(promptText) {
  if (!DOM.aiChatInput) return;
  DOM.aiChatInput.value = promptText;
  handleAiChatSubmit();
}

function handleNaturalLanguageParseTrigger() {
  const rawText = DOM.aiChatInput.value.trim();
  if (!rawText) {
    showToast('Type a transaction description first, e.g. "Spent 300 on groceries"', 'warning');
    return;
  }

  const parsed = parseNaturalLanguageTransaction(rawText);
  if (!parsed || parsed.amount <= 0) {
    showToast('Could not detect an amount. Please specify a value like ₹250.', 'warning');
    return;
  }

  DOM.aiChatInput.value = '';

  // Pre-fill transaction modal for user confirmation
  openAddTransactionModal();
  DOM.txTitle.value = parsed.title;
  DOM.txAmount.value = parsed.amount;
  DOM.txDate.value = parsed.date;

  if (parsed.type === 'income') {
    DOM.typeIncome.checked = true;
    updateFormCategoryOptions('income');
  } else {
    DOM.typeExpense.checked = true;
    updateFormCategoryOptions('expense');
  }

  DOM.txCategory.value = parsed.category;
  showToast(`Parsed: ${parsed.title} (${formatCurrency(parsed.amount)}). Confirm to save.`, 'info');
}

/* ==============================================================================
   14. SETTINGS & DIAGNOSTICS
   ============================================================================== */

function renderSettingsView() {
  if (DOM.storageMetricsText) {
    const totalRecords = state.transactions.length;
    DOM.storageMetricsText.textContent = `100% Client-Side Local Storage active. Storing ${totalRecords} transaction records, ${state.budgets.length} budgets, ${state.goals.length} goals. Zero external trackers.`;
  }
}

function exportAllDataJSON() {
  const fullBackup = {
    exportDate: new Date().toISOString(),
    version: '2.0.0',
    transactions: state.transactions,
    budgets: state.budgets,
    goals: state.goals,
    recurring: state.recurring,
    customCategories: state.customCategories
  };

  const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vaultly_complete_backup_${getTodayDateString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Downloaded complete JSON data backup.', 'success');
}

/* ==============================================================================
   15. DASHBOARD RENDERING & OVERVIEW
   ============================================================================== */

function renderDashboard() {
  renderOverview();
  renderTransactionsList();
  renderAnalyticsView();
  renderBudgetsView();
  renderRecurringSubscriptions();
  renderGoalsView();
}

function renderOverview() {
  const totals = calculateTotals(state.transactions);
  const safeSpend = calculateSafeToSpend(state.transactions, state.recurring);
  const breakdown = calculateCategoryBreakdown(state.transactions);

  // Update Net Balance
  DOM.totalBalance.textContent = formatCurrency(totals.netBalance);

  if (totals.netBalance > 0) {
    DOM.balanceStatusBadge.innerHTML = `<span class="tag-dot tag-dot-positive" aria-hidden="true"></span><span>Net Positive Cashflow</span>`;
  } else if (totals.netBalance < 0) {
    DOM.balanceStatusBadge.innerHTML = `<span class="tag-dot tag-dot-negative" aria-hidden="true"></span><span>Net Deficit (Expenses exceed income)</span>`;
  } else {
    DOM.balanceStatusBadge.innerHTML = `<span class="tag-dot" aria-hidden="true"></span><span>Net Neutral (₹0.00 balance)</span>`;
  }

  // Update Totals
  DOM.totalIncome.textContent = formatCurrency(totals.totalIncome);
  DOM.incomeCountLabel.textContent = `${totals.incomeCount} income source${totals.incomeCount === 1 ? '' : 's'}`;
  DOM.totalExpense.textContent = formatCurrency(totals.totalExpenses);
  DOM.expenseCountLabel.textContent = `${totals.expenseCount} expense${totals.expenseCount === 1 ? '' : 's'} logged`;

  // Update Safe to Spend
  DOM.safeDailySpend.textContent = formatCurrency(safeSpend.dailyAllowance);
  DOM.monthDaysTag.textContent = `${safeSpend.daysRemaining} Day${safeSpend.daysRemaining === 1 ? '' : 's'} Left`;
  DOM.monthProgressBar.style.width = `${safeSpend.monthProgress}%`;
  DOM.monthProgressPercent.textContent = `${safeSpend.monthProgress}%`;

  // Update Insights
  if (breakdown.length > 0) {
    const top = breakdown[0];
    DOM.insightTopCategory.textContent = `${top.category} — ${formatCurrency(top.total)} (${top.percentage}% of all expenses)`;
  } else {
    DOM.insightTopCategory.textContent = 'No expense records yet to analyze.';
  }

  const allTx = state.transactions;
  if (allTx.length > 0) {
    const largest = [...allTx].sort((a, b) => b.amount - a.amount)[0];
    DOM.insightLargestTx.textContent = `${largest.title} (${formatCurrency(largest.amount)}) • ${formatDate(largest.date)}`;
  } else {
    DOM.insightLargestTx.textContent = 'No transactions recorded yet.';
  }

  if (totals.totalIncome > 0) {
    const retention = Math.max(0, Math.round((totals.netBalance / totals.totalIncome) * 100));
    DOM.insightSavingsRate.textContent = `${retention}% of your earned income is currently retained as net savings.`;
  } else {
    DOM.insightSavingsRate.textContent = 'Log income and expenses to view retention rate.';
  }

  // Update Net Savings Rate Card
  const savingsRate = totals.totalIncome > 0 ? Math.max(0, Math.round((totals.netBalance / totals.totalIncome) * 100)) : 0;
  if (DOM.overviewSavingsRate) DOM.overviewSavingsRate.textContent = `${savingsRate}%`;
  if (DOM.overviewSavingsCaption) {
    if (totals.totalIncome === 0) {
      DOM.overviewSavingsCaption.textContent = 'Log income to calculate retention';
    } else if (savingsRate >= 30) {
      DOM.overviewSavingsCaption.textContent = 'Healthy wealth accumulation';
    } else if (savingsRate > 0) {
      DOM.overviewSavingsCaption.textContent = 'Positive surplus retention';
    } else {
      DOM.overviewSavingsCaption.textContent = 'Expenses currently exceed income';
    }
  }

  // Update Goal Preview Card
  const activeGoal = state.goals.find(g => (g.currentAmount || 0) < g.targetAmount) || state.goals[0];
  if (activeGoal) {
    if (DOM.overviewGoalTitle) DOM.overviewGoalTitle.textContent = activeGoal.title;
    if (DOM.overviewGoalTarget) DOM.overviewGoalTarget.textContent = formatCurrency(activeGoal.targetAmount);
    if (DOM.overviewGoalCurrent) DOM.overviewGoalCurrent.textContent = formatCurrency(activeGoal.currentAmount || 0);
    const goalPct = Math.min(100, Math.round(((activeGoal.currentAmount || 0) / activeGoal.targetAmount) * 100));
    if (DOM.overviewGoalPercent) DOM.overviewGoalPercent.textContent = `${goalPct}%`;
    if (DOM.overviewGoalProgressBar) DOM.overviewGoalProgressBar.style.width = `${goalPct}%`;
    if (DOM.overviewGoalContribBtn) {
      DOM.overviewGoalContribBtn.onclick = () => openGoalContributionModal(activeGoal.id);
      DOM.overviewGoalContribBtn.hidden = false;
    }
  } else {
    if (DOM.overviewGoalTitle) DOM.overviewGoalTitle.textContent = 'No Active Goals';
    if (DOM.overviewGoalTarget) DOM.overviewGoalTarget.textContent = '₹0.00';
    if (DOM.overviewGoalCurrent) DOM.overviewGoalCurrent.textContent = '₹0.00';
    if (DOM.overviewGoalPercent) DOM.overviewGoalPercent.textContent = '0%';
    if (DOM.overviewGoalProgressBar) DOM.overviewGoalProgressBar.style.width = '0%';
    if (DOM.overviewGoalContribBtn) DOM.overviewGoalContribBtn.hidden = true;
  }

  // Update Spending Distribution Bars
  if (DOM.overviewSpendingBars) {
    if (breakdown.length === 0) {
      DOM.overviewSpendingBars.innerHTML = `<div class="chart-empty-state" style="padding: 1.5rem 0; text-align: center;"><p class="text-muted" style="font-size: 0.85rem;">No expense records yet to display breakdown.</p></div>`;
    } else {
      const top4 = breakdown.slice(0, 4);
      DOM.overviewSpendingBars.innerHTML = top4.map(b => `
        <div class="spending-bar-row">
          <div class="spending-bar-header">
            <span class="spending-bar-cat">${escapeHTML(b.category)}</span>
            <span class="spending-bar-amount">${formatCurrency(b.total)} <span style="color: var(--text-muted); font-size: 0.78rem;">(${b.percentage}%)</span></span>
          </div>
          <div class="spending-bar-track" role="progressbar" aria-valuenow="${b.percentage}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHTML(b.category)} spending percentage">
            <div class="spending-bar-fill" style="width: ${b.percentage}%"></div>
          </div>
        </div>
      `).join('');
    }
  }

  // Update Recent Transactions in Overview
  if (DOM.overviewRecentTxList) {
    const recentTx = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    if (recentTx.length === 0) {
      DOM.overviewRecentTxList.innerHTML = `<div style="text-align: center; padding: 1.5rem 0; color: var(--text-muted); font-size: 0.85rem;">No recent transactions logged yet.</div>`;
    } else {
      DOM.overviewRecentTxList.innerHTML = recentTx.map(tx => {
        const isIncome = tx.type === 'income';
        return `
          <div class="overview-recent-row">
            <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
              <div class="tx-icon-halo ${isIncome ? 'halo-income' : 'halo-expense'}" style="width: 32px; height: 32px; min-width: 32px;" aria-hidden="true">
                <i data-lucide="${isIncome ? 'arrow-down-left' : 'arrow-up-right'}" style="width: 16px; height: 16px;"></i>
              </div>
              <div style="min-width: 0;">
                <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(tx.title)}</div>
                <div style="font-size: 0.76rem; color: var(--text-muted);">${escapeHTML(tx.category)} • ${formatDate(tx.date)}</div>
              </div>
            </div>
            <div class="${isIncome ? 'text-income' : 'text-expense'}" style="font-family: var(--font-heading); font-size: 0.92rem; font-weight: 700; white-space: nowrap; margin-left: 12px;">
              ${isIncome ? '+' : '−'}${formatCurrency(tx.amount)}
            </div>
          </div>
        `;
      }).join('');
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: DOM.overviewRecentTxList });
      }
    }
  }

  // Update Badges
  if (DOM.sidebarTxCount) DOM.sidebarTxCount.textContent = totals.incomeCount + totals.expenseCount;
  if (DOM.transactionCountBadge) DOM.transactionCountBadge.textContent = totals.incomeCount + totals.expenseCount;
}

function renderTransactionsList() {
  const container = DOM.transactionsList;
  if (!container) return;

  const filtered = filterAndSortTransactions(
    state.transactions,
    state.activeTypeFilter,
    state.searchQuery,
    state.selectedCategory,
    state.sortBy
  );

  container.innerHTML = '';

  if (state.transactions.length === 0) {
    DOM.emptyStateNoData.hidden = false;
    DOM.emptyStateNoResults.hidden = true;
    return;
  }

  if (filtered.length === 0) {
    DOM.emptyStateNoData.hidden = true;
    DOM.emptyStateNoResults.hidden = false;
    return;
  }

  DOM.emptyStateNoData.hidden = true;
  DOM.emptyStateNoResults.hidden = true;

  filtered.forEach(tx => {
    const row = document.createElement('article');
    row.className = 'tx-row';
    const isIncome = tx.type === 'income';

    row.innerHTML = `
      <div class="tx-left">
        <div class="tx-icon-halo ${isIncome ? 'halo-income' : 'halo-expense'}" aria-hidden="true">
          <i data-lucide="${isIncome ? 'arrow-down-left' : 'arrow-up-right'}"></i>
        </div>
        <div class="tx-details">
          <div class="tx-title-row">
            <h3 class="tx-title">${escapeHTML(tx.title)}</h3>
            <span class="glass-tag tx-category-tag">${escapeHTML(tx.category)}</span>
          </div>
          <div class="tx-meta">
            <span>${formatDate(tx.date)}</span>
            ${tx.notes ? `<span class="tx-notes-preview">• ${escapeHTML(tx.notes)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="tx-right">
        <span class="tx-amount ${isIncome ? 'text-income' : 'text-expense'}">
          ${isIncome ? '+' : '−'}${formatCurrency(tx.amount)}
        </span>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="tx-edit-btn" data-action="edit" data-id="${tx.id}" aria-label="Edit transaction ${escapeHTML(tx.title)}">
            <i data-lucide="edit-3"></i>
          </button>
          <button type="button" class="tx-delete-btn" data-action="delete" data-id="${tx.id}" aria-label="Delete transaction ${escapeHTML(tx.title)}">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(row);
  });
}

function filterAndSortTransactions(list, typeFilter, query, categoryFilter, sortBy) {
  let result = list.filter(tx => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
    if (query.trim() !== '') {
      const q = query.toLowerCase().trim();
      const matchesTitle = tx.title.toLowerCase().includes(q);
      const matchesCategory = tx.category.toLowerCase().includes(q);
      const matchesNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
      if (!matchesTitle && !matchesCategory && !matchesNotes) return false;
    }
    return true;
  });

  result.sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  return result;
}

function renderSpendingChart() {
  const canvas = DOM.spendingChart;
  if (!canvas) return;

  const breakdown = calculateCategoryBreakdown(state.transactions);
  const totalExpense = breakdown.reduce((sum, item) => sum + item.total, 0);

  if (DOM.chartExpenseTotalBadge) {
    DOM.chartExpenseTotalBadge.textContent = `${formatCurrency(totalExpense)} Total`;
  }

  if (breakdown.length === 0) {
    if (state.chartInstance) {
      state.chartInstance.destroy();
      state.chartInstance = null;
    }
    canvas.style.display = 'none';
    if (DOM.chartEmptyState) DOM.chartEmptyState.style.display = 'flex';
    return;
  }

  canvas.style.display = 'block';
  if (DOM.chartEmptyState) DOM.chartEmptyState.style.display = 'none';

  if (typeof Chart === 'undefined') {
    canvas.style.display = 'none';
    return;
  }

  const labels = breakdown.map(b => b.category);
  const dataValues = breakdown.map(b => b.total);
  const colors = breakdown.map(b => b.color);

  if (state.chartInstance) {
    state.chartInstance.data.labels = labels;
    state.chartInstance.data.datasets[0].data = dataValues;
    state.chartInstance.data.datasets[0].backgroundColor = colors;
    state.chartInstance.update();
    return;
  }

  const ctx = canvas.getContext('2d');
  state.chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: dataValues,
        backgroundColor: colors,
        borderColor: '#08090B',
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111318',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1,
          titleColor: '#FFFFFF',
          bodyColor: '#E2E2E2',
          padding: 12,
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)}`
          }
        }
      }
    }
  });
}

function renderCategoryBreakdown() {
  const container = DOM.categoryBreakdownList;
  if (!container) return;

  const breakdown = calculateCategoryBreakdown(state.transactions);
  container.innerHTML = '';

  if (breakdown.length === 0) return;

  breakdown.forEach(item => {
    const chip = document.createElement('div');
    chip.className = 'cat-chip';
    chip.innerHTML = `
      <div class="cat-chip-left">
        <span class="cat-chip-dot" style="background-color: ${item.color};"></span>
        <span class="cat-chip-name">${escapeHTML(item.category)}</span>
      </div>
      <div class="cat-chip-right">
        <span class="cat-chip-amount">${formatCurrency(item.total)}</span>
        <span class="cat-chip-percent">${item.percentage}%</span>
      </div>
    `;
    container.appendChild(chip);
  });
}

/* ==============================================================================
   16. UI HELPERS & TOAST NOTIFICATIONS
   ============================================================================== */

function showToast(message, type = 'info') {
  const stage = DOM.toastContainer;
  if (!stage) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span>${escapeHTML(message)}</span>
    <button type="button" class="toast-close" aria-label="Dismiss notification">&times;</button>
  `;

  stage.appendChild(toast);

  const dismiss = () => {
    toast.style.animation = 'toastExit 0.3s forwards ease';
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  setTimeout(dismiss, 4000);
}

function openModal(modal) {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal(modal) {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function updateDynamicGreetingAndDate() {
  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  if (DOM.dynamicGreeting) DOM.dynamicGreeting.textContent = greeting;
  if (DOM.currentDateDisplay) {
    DOM.currentDateDisplay.textContent = now.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}

function updateFormCategoryOptions(type) {
  const select = DOM.txCategory;
  if (!select) return;

  select.innerHTML = '';
  const categories = type === 'income' ? INCOME_CATEGORIES : [...EXPENSE_CATEGORIES, ...state.customCategories];

  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.name;
    opt.textContent = cat.name;
    select.appendChild(opt);
  });

  const filterSelect = DOM.categoryFilterSelect;
  if (filterSelect) {
    filterSelect.innerHTML = '<option value="all">All Categories</option>';
    const allUnique = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, ...state.customCategories].map(c => c.name)));
    allUnique.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      filterSelect.appendChild(opt);
    });
  }

  const budgetCatSelect = DOM.budgetCategorySelect;
  if (budgetCatSelect) {
    budgetCatSelect.innerHTML = '';
    EXPENSE_CATEGORIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = c.name;
      budgetCatSelect.appendChild(opt);
    });
  }
}

function showFieldError(errorEl, message) {
  if (errorEl) errorEl.textContent = message;
}

function clearFormValidationErrors() {
  if (DOM.txTitleError) DOM.txTitleError.textContent = '';
  if (DOM.txAmountError) DOM.txAmountError.textContent = '';
  if (DOM.txCategoryError) DOM.txCategoryError.textContent = '';
  if (DOM.txDateError) DOM.txDateError.textContent = '';
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ==============================================================================
   17. CINEMATIC OPENING LOADER (<= 1.0s)
   ============================================================================== */

function dismissCinematicLoader() {
  const loader = document.getElementById('cinematicLoader');
  if (!loader || loader.classList.contains('loader-dismissed')) return;

  loader.classList.add('loader-dismissed');
  loader.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-loading');

  setTimeout(() => {
    if (loader && loader.parentElement) loader.remove();
  }, 380);
}

function initCinematicLoader() {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    dismissCinematicLoader();
    return;
  }

  const startTime = Date.now();
  const handleDismiss = () => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 650 - elapsed);
    setTimeout(dismissCinematicLoader, remaining);
  };

  if (document.readyState === 'complete') handleDismiss();
  else window.addEventListener('load', handleDismiss, { once: true });

  setTimeout(dismissCinematicLoader, 1000);
}

/* ==============================================================================
   18. CENTRALIZED EVENT LISTENERS
   ============================================================================== */

function setupEventListeners() {
  // Navigation / Router triggers
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-view-target]');
    if (btn) {
      const targetView = btn.getAttribute('data-view-target');
      switchView(targetView);
    }
  });

  // Mobile drawer controls
  if (DOM.mobileMenuToggle) {
    DOM.mobileMenuToggle.addEventListener('click', () => {
      DOM.mobileDrawer.classList.toggle('open');
      DOM.mobileDrawerBackdrop.classList.toggle('open');
      const isOpen = DOM.mobileDrawer.classList.contains('open');
      DOM.mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('drawer-open', isOpen);
      document.body.classList.toggle('drawer-locked', isOpen);
    });
  }

  if (DOM.closeDrawerBtn) DOM.closeDrawerBtn.addEventListener('click', closeMobileDrawer);
  if (DOM.mobileDrawerBackdrop) DOM.mobileDrawerBackdrop.addEventListener('click', closeMobileDrawer);

  // Add Transaction triggers
  const addButtons = [DOM.openAddModalBtn, DOM.sidebarAddTxBtn, DOM.txViewAddBtn, document.getElementById('emptyAddFirstBtn'), DOM.chartAddExpenseBtn, DOM.heroAddTxBtn];
  addButtons.forEach(btn => {
    if (btn) btn.addEventListener('click', openAddTransactionModal);
  });

  if (DOM.closeModalBtn) DOM.closeModalBtn.addEventListener('click', () => closeModal(DOM.transactionModal));
  if (DOM.cancelModalBtn) DOM.cancelModalBtn.addEventListener('click', () => closeModal(DOM.transactionModal));

  // Type toggle in form
  if (DOM.typeExpense) DOM.typeExpense.addEventListener('change', () => updateFormCategoryOptions('expense'));
  if (DOM.typeIncome) DOM.typeIncome.addEventListener('change', () => updateFormCategoryOptions('income'));

  // Transaction form submit
  if (DOM.transactionForm) DOM.transactionForm.addEventListener('submit', handleTransactionFormSubmit);

  // Transaction list delegation: Edit and Delete
  if (DOM.transactionsList) {
    DOM.transactionsList.addEventListener('click', e => {
      const editBtn = e.target.closest('[data-action="edit"]');
      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        openEditTransactionModal(id);
        return;
      }

      const delBtn = e.target.closest('[data-action="delete"]');
      if (delBtn) {
        const id = delBtn.getAttribute('data-id');
        const tx = state.transactions.find(t => t.id === id);
        if (tx) {
          state.pendingDeleteId = id;
          if (DOM.deleteTargetTitle) DOM.deleteTargetTitle.textContent = `"${tx.title}"`;
          openModal(DOM.deleteConfirmModal);
        }
      }
    });
  }

  if (DOM.cancelDeleteBtn) DOM.cancelDeleteBtn.addEventListener('click', () => closeModal(DOM.deleteConfirmModal));
  if (DOM.confirmDeleteBtn) {
    DOM.confirmDeleteBtn.addEventListener('click', () => {
      if (state.pendingDeleteId) deleteTransaction(state.pendingDeleteId);
    });
  }

  // Search & Filter
  if (DOM.searchInput) {
    DOM.searchInput.addEventListener('input', e => {
      state.searchQuery = e.target.value;
      if (DOM.clearSearchBtn) DOM.clearSearchBtn.hidden = !state.searchQuery;
      renderTransactionsList();
    });
  }

  if (DOM.clearSearchBtn) {
    DOM.clearSearchBtn.addEventListener('click', () => {
      DOM.searchInput.value = '';
      state.searchQuery = '';
      DOM.clearSearchBtn.hidden = true;
      renderTransactionsList();
    });
  }

  document.querySelectorAll('.filter-glass-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-glass-pill').forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-checked', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-checked', 'true');
      state.activeTypeFilter = pill.getAttribute('data-filter');
      renderTransactionsList();
    });
  });

  if (DOM.categoryFilterSelect) {
    DOM.categoryFilterSelect.addEventListener('change', e => {
      state.selectedCategory = e.target.value;
      renderTransactionsList();
    });
  }

  if (DOM.sortSelect) {
    DOM.sortSelect.addEventListener('change', e => {
      state.sortBy = e.target.value;
      renderTransactionsList();
    });
  }

  if (DOM.exportCsvBtn) DOM.exportCsvBtn.addEventListener('click', exportTransactionsCSV);

  // Budgets & Subscriptions Events
  if (DOM.openAddBudgetBtn) DOM.openAddBudgetBtn.addEventListener('click', () => openModal(DOM.budgetModal));
  if (DOM.closeBudgetModalBtn) DOM.closeBudgetModalBtn.addEventListener('click', () => closeModal(DOM.budgetModal));
  if (DOM.cancelBudgetBtn) DOM.cancelBudgetBtn.addEventListener('click', () => closeModal(DOM.budgetModal));
  if (DOM.budgetForm) DOM.budgetForm.addEventListener('submit', handleBudgetFormSubmit);

  if (DOM.budgetsGrid) {
    DOM.budgetsGrid.addEventListener('click', e => {
      const delBtn = e.target.closest('[data-action="delete-budget"]');
      if (delBtn) {
        const category = delBtn.getAttribute('data-category');
        state.budgets = state.budgets.filter(b => b.category !== category);
        saveBudgets(state.budgets);
        showToast(`Removed budget for ${category}.`, 'info');
        renderBudgetsView();
      }
    });
  }

  if (DOM.openAddRecurringBtn) DOM.openAddRecurringBtn.addEventListener('click', () => openModal(DOM.recurringModal));
  if (DOM.closeRecurringModalBtn) DOM.closeRecurringModalBtn.addEventListener('click', () => closeModal(DOM.recurringModal));
  if (DOM.cancelRecurringBtn) DOM.cancelRecurringBtn.addEventListener('click', () => closeModal(DOM.recurringModal));
  if (DOM.recurringForm) DOM.recurringForm.addEventListener('submit', handleRecurringFormSubmit);

  if (DOM.recurringGrid) {
    DOM.recurringGrid.addEventListener('click', e => {
      const toggleBtn = e.target.closest('[data-action="toggle-recurring"]');
      if (toggleBtn) {
        const id = toggleBtn.getAttribute('data-id');
        const rec = state.recurring.find(r => r.id === id);
        if (rec) {
          rec.active = rec.active === false ? true : false;
          saveRecurring(state.recurring);
          renderRecurringSubscriptions();
          renderOverview();
        }
        return;
      }

      const delBtn = e.target.closest('[data-action="delete-recurring"]');
      if (delBtn) {
        const id = delBtn.getAttribute('data-id');
        state.recurring = state.recurring.filter(r => r.id !== id);
        saveRecurring(state.recurring);
        showToast('Removed recurring subscription.', 'info');
        renderRecurringSubscriptions();
        renderOverview();
      }
    });
  }

  // Goals & Contribution Events
  if (DOM.openAddGoalBtn) DOM.openAddGoalBtn.addEventListener('click', () => openModal(DOM.goalModal));
  if (DOM.closeGoalModalBtn) DOM.closeGoalModalBtn.addEventListener('click', () => closeModal(DOM.goalModal));
  if (DOM.cancelGoalBtn) DOM.cancelGoalBtn.addEventListener('click', () => closeModal(DOM.goalModal));
  if (DOM.goalForm) DOM.goalForm.addEventListener('submit', handleGoalFormSubmit);

  if (DOM.goalsGrid) {
    DOM.goalsGrid.addEventListener('click', e => {
      const contribBtn = e.target.closest('[data-action="contribute-goal"]');
      if (contribBtn) {
        const id = contribBtn.getAttribute('data-id');
        const title = contribBtn.getAttribute('data-title');
        DOM.contribGoalId.value = id;
        DOM.contribGoalSubtitle.textContent = `Contribute to ${title}`;
        DOM.contribAmountInput.value = '';
        openModal(DOM.contributionModal);
        return;
      }

      const delBtn = e.target.closest('[data-action="delete-goal"]');
      if (delBtn) {
        const id = delBtn.getAttribute('data-id');
        state.goals = state.goals.filter(g => g.id !== id);
        saveGoals(state.goals);
        showToast('Removed savings goal.', 'info');
        renderGoalsView();
      }
    });
  }

  if (DOM.closeContribModalBtn) DOM.closeContribModalBtn.addEventListener('click', () => closeModal(DOM.contributionModal));
  if (DOM.cancelContribBtn) DOM.cancelContribBtn.addEventListener('click', () => closeModal(DOM.contributionModal));
  if (DOM.contributionForm) DOM.contributionForm.addEventListener('submit', handleContributionFormSubmit);

  // AI Chat Events
  if (DOM.aiChatForm) DOM.aiChatForm.addEventListener('submit', handleAiChatSubmit);
  if (DOM.aiParseBtn) DOM.aiParseBtn.addEventListener('click', handleNaturalLanguageParseTrigger);
  if (DOM.aiResetChatBtn) {
    DOM.aiResetChatBtn.addEventListener('click', () => {
      state.aiMessages = [
        {
          sender: 'assistant',
          text: 'Conversation reset. What questions do you have about your personal finances or budgets?'
        }
      ];
      renderAiMessages();
    });
  }

  if (DOM.aiPromptChips) {
    DOM.aiPromptChips.addEventListener('click', e => {
      const chip = e.target.closest('.ai-prompt-chip');
      if (chip) {
        const prompt = chip.getAttribute('data-prompt');
        handleAiPromptChipClick(prompt);
      }
    });
  }

  // Demo Data & Clear Tools
  const loadDemoHandler = () => {
    state.transactions = SAMPLE_TRANSACTIONS.map(tx => {
      const d = new Date();
      d.setDate(d.getDate() - tx.dateOffsetDays);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return { id: 'demo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4), title: tx.title, amount: tx.amount, type: tx.type, category: tx.category, date: dateStr, notes: tx.notes };
    });
    state.budgets = [...SAMPLE_BUDGETS];
    state.goals = [...SAMPLE_GOALS];
    state.recurring = [...SAMPLE_RECURRING];

    saveTransactions(state.transactions);
    saveBudgets(state.budgets);
    saveGoals(state.goals);
    saveRecurring(state.recurring);

    showToast('Loaded sample personal finance data.', 'success');
    renderDashboard();
    closeMobileDrawer();
  };

  const clearAllHandler = () => {
    if (confirm('Are you sure you want to reset all stored records? This will clear all transactions, budgets, and goals.')) {
      state.transactions = [];
      state.budgets = [];
      state.goals = [];
      state.recurring = [];
      localStorage.clear();
      showToast('All local storage records have been cleared.', 'info');
      renderDashboard();
      closeMobileDrawer();
    }
  };

  if (document.getElementById('loadDemoBtn')) document.getElementById('loadDemoBtn').addEventListener('click', loadDemoHandler);
  if (document.getElementById('loadDemoBtnMobile')) document.getElementById('loadDemoBtnMobile').addEventListener('click', loadDemoHandler);
  if (DOM.loadDemoBtnSettings) DOM.loadDemoBtnSettings.addEventListener('click', loadDemoHandler);
  if (document.getElementById('emptyLoadDemoBtn')) document.getElementById('emptyLoadDemoBtn').addEventListener('click', loadDemoHandler);

  if (document.getElementById('clearAllBtn')) document.getElementById('clearAllBtn').addEventListener('click', clearAllHandler);
  if (document.getElementById('clearAllBtnMobile')) document.getElementById('clearAllBtnMobile').addEventListener('click', clearAllHandler);
  if (DOM.clearAllBtnSettings) DOM.clearAllBtnSettings.addEventListener('click', clearAllHandler);
  if (DOM.exportJsonBtn) DOM.exportJsonBtn.addEventListener('click', exportAllDataJSON);

  // Global Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal(DOM.transactionModal);
      closeModal(DOM.deleteConfirmModal);
      closeModal(DOM.budgetModal);
      closeModal(DOM.goalModal);
      closeModal(DOM.contributionModal);
      closeModal(DOM.recurringModal);
      closeMobileDrawer();
    }
  });
}

/* ==============================================================================
   19. APPLICATION INITIALIZATION
   ============================================================================== */

function initApp() {
  initCinematicLoader();
  updateDynamicGreetingAndDate();

  // Load all persisted data
  state.transactions = loadTransactions();
  state.budgets = loadBudgets();
  state.goals = loadGoals();
  state.recurring = loadRecurring();
  state.customCategories = loadCustomCategories();

  // Setup options and views
  updateFormCategoryOptions('expense');
  setupEventListeners();
  initLiquidChromeSculpture();
  initSpatialBalanceOrb();
  initSpatialCardTilt();

  // Initial render
  renderDashboard();

  // Check URL hash for direct view routing
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    switchView(hash);
  } else {
    switchView('overview');
  }

  console.info('[Vaultly] Initialized with Obsidian Spatial Architecture.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
