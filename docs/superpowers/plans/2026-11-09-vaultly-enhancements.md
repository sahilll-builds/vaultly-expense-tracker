# Vaultly Platform Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement high-value functional upgrades for Vaultly: Multi-Currency Support, Global Keyboard Navigation, Automated Recurring Due Detection, Progressive Web App (PWA) configuration, and CI Automation.

**Architecture:** Client-side modular JavaScript architecture adhering to Obsidian Glass UI principles. Pure Vanilla ES6+ without external framework dependencies, fully backed by automated unit tests in `test-runner.js`.

**Tech Stack:** HTML5, CSS3 Custom Properties, Vanilla JavaScript (ES6+), Web App Manifest, Service Worker API, GitHub Actions.

**Spec:** Improvements brainstormed in conversation on 2026-11-09.

## Global Constraints
- Zero external runtime library dependencies (Vanilla JS).
- Full backward compatibility with existing `localStorage` keys and data schemas.
- 100% test coverage maintained via `node test-runner.js`.
- Strictly adhere to Obsidian Glass design system tokens (`--bg-primary`, `--bg-surface-raised`, `--text-muted`, etc.).

## Review Focus
1. Currency switching updates formatted amounts across existing stored transactions and safe-to-spend allowance without data corruption.
2. Keyboard navigation triggers only when typing outside form inputs (`input`, `textarea`, `select`).
3. Recurring due detector correctly compares dates using local calendar time without time-zone drift.
4. Service Worker installs and caches shell assets gracefully without blocking first load or breaking fetch requests.
5. All test runner assertions pass reliably across all operating systems.

---

### Task 1: Multi-Currency Preference Engine
**Files:**
- Modify: `script.js`
- Modify: `index.html` (Settings view)
- Test: `test-runner.js`

**Interfaces:**
- Produces: `formatCurrency(amount: number, currencyCode?: string) -> string`
- Consumes: `localStorage.getItem('vaultly_currency')`

- [x] **Step 1: Write the failing unit test in `test-runner.js`**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement multi-currency support in `script.js` and Settings UI in `index.html`**
- [x] **Step 4: Run test to verify it passes**
- [x] **Step 5: Verify in browser context**

---

### Task 2: Global Keyboard Navigation System
**Files:**
- Modify: `script.js`
- Test: `test-runner.js`

**Interfaces:**
- Produces: `initKeyboardShortcuts()` handling `T`/`N` (New Tx), `1`-`7` (View navigation), `Cmd/Ctrl+K` (Search focus), `Esc` (Close modal)

- [x] **Step 1: Write test asserting hotkey mapping function logic in `test-runner.js`**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement `initKeyboardShortcuts()` in `script.js`**
- [x] **Step 4: Run test to verify it passes**

---

### Task 3: Automated Recurring Expense Due Detector
**Files:**
- Modify: `script.js`
- Test: `test-runner.js`

**Interfaces:**
- Produces: `checkDueRecurringSubscriptions(recurringList: Array, referenceDate?: Date) -> Array`

- [x] **Step 1: Write unit test in `test-runner.js` for due subscription detection**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement `checkDueRecurringSubscriptions()` and notification in `script.js`**
- [x] **Step 4: Run test to verify it passes**

---

### Task 4: Progressive Web App (PWA) Manifest & Service Worker
**Files:**
- Create: `manifest.json`
- Create: `sw.js`
- Modify: `index.html` (header links)
- Modify: `script.js` (service worker registration)

- [x] **Step 1: Create `manifest.json` with app metadata, theme colors, and icons**
- [x] **Step 2: Create lightweight `sw.js` for offline asset caching**
- [x] **Step 3: Register service worker in `script.js` with feature detection**
- [x] **Step 4: Link manifest and PWA meta tags in `index.html`**

---

### Task 5: GitHub Actions CI Workflow & Final Quality Gate
**Files:**
- Create: `.github/workflows/ci.yml`
- Test: Run complete `node test-runner.js`

- [x] **Step 1: Create GitHub Actions workflow file running unit tests on Node 20 & 22**
- [x] **Step 2: Run full test runner to verify 100% pass across all test suites**
- [x] **Step 3: Final verification and summary**
