# VAULTLY — AI-Powered Personal Finance Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Vaultly into a premium, AI-powered personal finance platform with Obsidian Glass spatial UI, 7-view navigation, Smart Budgets, Financial Goals, full Transaction CRUD, CSV export, natural language entry, and a secure Vercel-compatible serverless AI assistant with deterministic local fallback.

**Architecture:** Maintain a fast, 100% client-side Vanilla JavaScript and semantic HTML5 architecture with view-swapping navigation for zero-build speed and offline-first LocalStorage persistence. Add a single Vercel Node.js serverless endpoint (`api/chat.js`) to securely communicate with the AI model (Google Gemini/OpenAI) using server-side environment variables, paired with a deterministic local financial Q&A engine when unconfigured.

**Tech Stack:** Vanilla JavaScript (ES6+), HTML5, CSS3 Custom Properties (Obsidian Glass Design System), Chart.js (v4.4), Lucide Icons, Google Fonts (Space Grotesk & Manrope), Vercel Serverless Functions (`api/chat.js`).

**Spec:** Current session prompt (VAULTLY — AI-POWERED PERSONAL FINANCE PLATFORM).

---

## Global Constraints
- Primary brand text is strictly the pure typographic wordmark **VAULTLY** (no separate logo icons beside it).
- Color palette strictly follows Obsidian Glass: `#08090B` (main canvas), `#111318` (secondary), `#17191F` (elevated cards), `#F5F5F5` (primary text), `#9297A1` (secondary text).
- Font pairings: **Space Grotesk** (700) for brand wordmark; **Manrope** (400–800) for interface, metrics, and navigation.
- All currency values must be formatted using `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
- Never expose AI API keys in frontend code; use server-side environment variables (`GEMINI_API_KEY` / `OPENAI_API_KEY`).
- AI must be grounded in actual calculated totals and never hallucinate transaction amounts or categories.
- Natural-language transaction entry must always require explicit user review and confirmation before saving.
- Complete backward compatibility with existing saved transactions in `localStorage.getItem('vaultly_transactions')`.
- All 14 viewports (320px to 1920px+) must maintain 0px horizontal page overflow and full touch accessibility.
- Initial loading screen duration must remain $\le 1.0\text{s}$ maximum with 0ms bypass for `prefers-reduced-motion`.

## Review Focus
1. **Unconfigured / Missing API Key:** App must seamlessly fall back to local deterministic rule-based assistant answering financial questions accurately without crashing or exposing errors.
2. **Corrupted or Missing Local Storage Keys:** Robust defensive JSON parsing for transactions, budgets, goals, and recurring items, gracefully restoring defaults without wiping unrelated keys.
3. **Budget Overflow (>100%):** Handled with clear, accessible warning tags without breaking UI progress bars or confusing negative allowances.
4. **Natural Language Parsing Ambiguities:** Missing amounts, unknown categories, or ambiguous phrases must open the confirmation modal with pre-filled guesses marked for user editing, rather than failing silently or auto-saving.
5. **Mobile Viewport Bottom Navigation:** Mobile drawer and bottom view switcher must never overlap modal dialogs, inputs, or virtual keyboards on iOS/Android.

---

## Tasks

### Task 1: Design Tokens, Obsidian Glass Theme & 7-View Layout Architecture
**Files:**
- Modify: `style.css:1-350`
- Modify: `index.html:60-180`
- Test: `test-runner.js`

**Interfaces:**
- Produces: Obsidian palette `:root` tokens, `.app-shell` with desktop sidebar navigation and mobile bottom/drawer navigation for 7 views (`overview`, `transactions`, `analytics`, `budgets`, `goals`, `ai`, `settings`).

- [ ] **Step 1: Write failing test in `test-runner.js` for view-state constants and navigation mapping**
- [ ] **Step 2: Run test suite to verify failure**
  Run: `node test-runner.js`
- [ ] **Step 3: Update `style.css` with Obsidian Glass color tokens (`#08090B`, `#111318`, `#17191F`, `#F5F5F5`, `#9297A1`), sidebar navigation styles, and view panels**
- [ ] **Step 4: Update `index.html` structure to support the 7 distinct view containers (`data-view`)**
- [ ] **Step 5: Run tests and verify view containers exist and pass**
- [ ] **Step 6: Commit changes**
  `git commit -m "feat: implement obsidian glass theme tokens and 7-view layout architecture"`

---

### Task 2: Core State Engine, Multi-Store Persistence & View Router
**Files:**
- Modify: `script.js:100-350`
- Test: `test-runner.js`

**Interfaces:**
- Consumes: `localStorage` keys (`vaultly_transactions`, `vaultly_budgets`, `vaultly_goals`, `vaultly_recurring`, `vaultly_custom_categories`)
- Produces: `state` object holding transactions, budgets, goals, recurring items, activeView (`overview` | `transactions` | `analytics` | `budgets` | `goals` | `ai` | `settings`), and `switchView(viewName)` router function.

- [ ] **Step 1: Write tests in `test-runner.js` for multi-store validation (budgets, goals, recurring items, custom categories)**
- [ ] **Step 2: Run test suite to verify tests fail before implementation**
- [ ] **Step 3: Implement `state` expansions, safe storage loaders, and `switchView(viewName)` in `script.js`**
- [ ] **Step 4: Connect sidebar, mobile drawer, and bottom navigation click events to `switchView`**
- [ ] **Step 5: Verify tests pass**
- [ ] **Step 6: Commit changes**
  `git commit -m "feat: implement multi-store local storage engine and client-side view router"`

---

### Task 3: Interactive 3D Balance Visualizer & Overview View Polish
**Files:**
- Modify: `index.html:180-320`
- Modify: `style.css:350-500`
- Modify: `script.js:350-500`

**Interfaces:**
- Produces: `initSpatialBalanceOrb()` - lightweight CSS/canvas 3D liquid-glass reflective sphere that subtly tilts and shifts specular highlights based on mouse coordinates on desktop, with touch-safe static fallback.

- [ ] **Step 1: Add HTML markup for 3D balance container `.spatial-balance-stage` in the Overview balance card**
- [ ] **Step 2: Implement 3D spatial tilt styling with CSS transform-style: preserve-3d and specular reflection in `style.css`**
- [ ] **Step 3: Add pointermove listener in `script.js` with requestAnimationFrame throttling and reduced-motion check**
- [ ] **Step 4: Add summary cards for Quick Budgets snapshot, Mini Goals progress, and Recent Transactions in Overview**
- [ ] **Step 5: Verify interactive tilt and responsive layout across mobile and desktop**
- [ ] **Step 6: Commit changes**
  `git commit -m "feat: add interactive 3d balance visualizer and overview summary cards"`

---

### Task 4: Complete Transaction Management (CRUD, Custom Categories & CSV Export)
**Files:**
- Modify: `index.html:410-530`
- Modify: `script.js:500-800`
- Modify: `style.css:500-700`
- Test: `test-runner.js`

**Interfaces:**
- Produces: `openEditTransactionModal(id)`, `exportTransactionsCSV()`, `addCustomCategory(name, type)`, `deleteTransaction(id)`.

- [ ] **Step 1: Write test for CSV serialization formatting and custom category registration in `test-runner.js`**
- [ ] **Step 2: Run test runner to verify failure**
- [ ] **Step 3: Add Edit button to transaction cards and wire edit mode into `transactionModal` in `index.html`**
- [ ] **Step 4: Implement edit transaction submission and CSV data export blob generator in `script.js`**
- [ ] **Step 5: Add custom category input option in transaction modal**
- [ ] **Step 6: Run tests to verify CSV export and edit calculations pass**
- [ ] **Step 7: Commit changes**
  `git commit -m "feat: complete transaction edit flow, custom categories and csv export"`

---

### Task 5: Smart Budgets & Recurring Subscriptions Engine
**Files:**
- Modify: `index.html` (Budgets view section)
- Modify: `script.js:800-1100`
- Modify: `style.css:700-900`
- Test: `test-runner.js`

**Interfaces:**
- Produces: `calculateBudgetUtilization(category, month)`, `addBudget(category, limit)`, `renderBudgetsView()`, `renderRecurringSubscriptions()`.

- [ ] **Step 1: Write tests for budget utilization calculations, over-budget warnings, and recurring schedule forecasting**
- [ ] **Step 2: Run test runner to verify failure**
- [ ] **Step 3: Build markup for Budgets & Recurring Subscriptions in `index.html`**
- [ ] **Step 4: Implement budget cards with dynamic percentage bars, remaining allowance chips, and alert tags in `script.js`**
- [ ] **Step 5: Implement Recurring Subscriptions list with frequency toggles (weekly/monthly/yearly) and next billing date calculations**
- [ ] **Step 6: Run tests and verify 100% pass**
- [ ] **Step 7: Commit changes**
  `git commit -m "feat: implement smart category budgets and recurring subscription tracker"`

---

### Task 6: Financial Goals & Savings Planner
**Files:**
- Modify: `index.html` (Goals view section)
- Modify: `script.js:1100-1350`
- Modify: `style.css:900-1100`
- Test: `test-runner.js`

**Interfaces:**
- Produces: `createGoal(name, targetAmount, targetDate)`, `addGoalContribution(goalId, amount)`, `renderGoalsView()`.

- [ ] **Step 1: Write tests for savings goal progress calculation and contribution logging in `test-runner.js`**
- [ ] **Step 2: Run test runner to verify failure**
- [ ] **Step 3: Add Financial Goals markup in `index.html` with target cards and Contribution modal**
- [ ] **Step 4: Implement goal cards with animated liquid progress bars, remaining target chips, and contribution history in `script.js`**
- [ ] **Step 5: Run tests to verify mathematical accuracy and persistence**
- [ ] **Step 6: Commit changes**
  `git commit -m "feat: implement financial goals savings planner and contribution logger"`

---

### Task 7: AI Spending Analyzer & Advanced Analytics View
**Files:**
- Modify: `index.html` (Analytics view section)
- Modify: `script.js:1350-1600`
- Modify: `style.css:1100-1300`
- Test: `test-runner.js`

**Interfaces:**
- Produces: `generateSpendingForecast()`, `detectSpendingPatterns()`, `renderAnalyticsView()`.

- [ ] **Step 1: Write tests for spending forecasting algorithm and category surge detection in `test-runner.js`**
- [ ] **Step 2: Run test runner to verify failure**
- [ ] **Step 3: Build Analytics view layout in `index.html` with period switcher (This Month, Last 30 Days, All Time), forecast panel, and category doughnut**
- [ ] **Step 4: Implement deterministic spending pattern detector and end-of-month spending forecast engine in `script.js`**
- [ ] **Step 5: Add monthly financial summary generator with downloadable report**
- [ ] **Step 6: Verify tests pass**
- [ ] **Step 7: Commit changes**
  `git commit -m "feat: implement ai spending analyzer, pattern detection and end-of-month forecast"`

---

### Task 8: Secure Vercel Serverless AI Endpoint (`api/chat.js`)
**Files:**
- Create: `api/chat.js`
- Modify: `vercel.json`
- Test: `test-runner.js`

**Interfaces:**
- Consumes: POST `/api/chat` with `{ message: string, financialSummary: Object }`
- Produces: JSON `{ reply: string, proposedTransaction?: Object, source: 'ai' | 'fallback' }`

- [ ] **Step 1: Write test for API request handler, input validation, context minimization, and error handling**
- [ ] **Step 2: Run test runner to verify failure**
- [ ] **Step 3: Create `api/chat.js` using Node.js runtime supporting Google Gemini API (`GEMINI_API_KEY`) and OpenAI API (`OPENAI_API_KEY`)**
- [ ] **Step 4: Implement rate limiting and defensive validation so invalid requests are rejected safely**
- [ ] **Step 5: Ensure strict error handling that never exposes secret keys in response messages**
- [ ] **Step 6: Verify API route passes automated unit test in `test-runner.js`**
- [ ] **Step 7: Commit changes**
  `git commit -m "feat: create secure vercel serverless ai endpoint with multi-provider support"`

---

### Task 9: Vaultly AI Conversational Assistant & Natural Language Transaction Parser
**Files:**
- Modify: `index.html` (Vaultly AI view section & floating widget)
- Modify: `script.js:1600-1950`
- Modify: `style.css:1300-1550`
- Test: `test-runner.js`

**Interfaces:**
- Produces: `sendAIMessage(userText)`, `parseNaturalLanguageTransaction(text)`, `renderAIChat()`, local deterministic fallback financial Q&A engine.

- [ ] **Step 1: Write tests for natural language parsing (e.g. "Spent 250 on lunch today" -> { amount: 250, type: 'expense', category: 'Food & Dining' }) and local fallback query matching**
- [ ] **Step 2: Run test runner to verify failure**
- [ ] **Step 3: Implement chat UI in `index.html` with suggested prompt pills, conversation thread, message input, and retry button**
- [ ] **Step 4: Implement `sendAIMessage()` in `script.js` with loading state, `/api/chat` fetch, and intelligent local rule-based fallback when offline or unconfigured**
- [ ] **Step 5: Implement natural language transaction pre-filling: extracts amount, category, date, description and opens `transactionModal` for user confirmation**
- [ ] **Step 6: Run tests and verify 100% pass**
- [ ] **Step 7: Commit changes**
  `git commit -m "feat: implement vaultly ai assistant and natural language transaction entry"`

---

### Task 10: Production Verification, Testing Suite & Responsive Auditing
**Files:**
- Modify: `test-runner.js`
- Modify: `verify-responsive.mjs`
- Modify: `README.md`

**Interfaces:**
- Produces: Full passing test suite for all mathematical, budgeting, goal, AI fallback, and storage resilience features; verification across 14 viewports.

- [ ] **Step 1: Run comprehensive unit test runner `node test-runner.js` and verify all checks pass**
- [ ] **Step 2: Run headless Chrome responsive verification across 14 viewports (320px to 1920px+) with 0px horizontal overflow**
- [ ] **Step 3: Update `README.md` with full documentation of Obsidian Glass, 7-view architecture, Smart Budgets, Goals, and AI integration**
- [ ] **Step 4: Commit changes**
  `git commit -m "test: verify responsive viewports, unit test suite and update documentation"`

---

### Task 11: GitHub Push & Vercel Production Deployment
**Files:**
- All modified repository files

- [ ] **Step 1: Verify `git status` clean working tree**
- [ ] **Step 2: Push changes to GitHub repository `main` branch**
- [ ] **Step 3: Deploy to Vercel production using `vercel.cmd --prod --yes`**
- [ ] **Step 4: Verify live deployment URL and headers with `curl.exe`**
- [ ] **Step 5: Deliver final comprehensive summary with verified live links**
