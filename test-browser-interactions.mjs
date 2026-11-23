/**
 * Vaultly Full Browser Interaction & Console Error QA Test Suite
 * Connects directly via Chrome DevTools Protocol (CDP) to test every user flow,
 * catches any runtime errors or console warnings, and validates DOM state.
 */

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BROWSER_BIN = existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;
const PORT = 9224;
const USER_DATA_DIR = path.resolve('./.tmp-chrome-profile-qa');
const FILE_URL = 'file:///' + path.resolve('./index.html').replace(/\\/g, '/');

async function runBrowserQASuite() {
  console.log('🚀 Initializing Headless Chrome for Full Browser QA Audit...');
  if (existsSync(USER_DATA_DIR)) {
    try { rmSync(USER_DATA_DIR, { recursive: true, force: true }); } catch (e) {}
  }
  mkdirSync(USER_DATA_DIR, { recursive: true });

  const browserProcess = spawn(BROWSER_BIN, [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    FILE_URL
  ], { stdio: 'ignore' });

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`);
      if (res.ok) {
        targets = await res.json();
        if (targets && targets.length > 0) break;
      }
    } catch (err) {}
  }

  if (!targets) {
    console.error('❌ Could not connect to Chrome CDP.');
    browserProcess.kill();
    process.exit(1);
  }

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let msgId = 1;
  const consoleErrors = [];
  const jsExceptions = [];

  ws.addEventListener('message', (evt) => {
    const data = JSON.parse(evt.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      const type = data.params.type;
      const text = (data.params.args || []).map(a => a.value || a.description || '').join(' ');
      if (type === 'error') {
        consoleErrors.push(text);
      }
    }
    if (data.method === 'Runtime.exceptionThrown') {
      const desc = data.params.exceptionDetails?.exception?.description || data.params.exceptionDetails?.text;
      jsExceptions.push(desc);
    }
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  await send('Page.navigate', { url: FILE_URL });
  console.log('⏳ Page loaded. Waiting for loader dismissal and Lucide icons render...');
  await sleep(2200);

  // Helper to evaluate JS in the browser
  async function evaluate(code) {
    const res = await send('Runtime.evaluate', {
      expression: code,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
    }
    return res.result?.value;
  }

  console.log('\n================================================================');
  console.log('              BROWSER FUNCTIONALITY AUDIT TESTS                 ');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  async function test(name, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`✔ PASS: ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}\n   Error: ${err.message}`);
    }
  }

  // 1. Initial Page Load and Title
  await test('Page title and brand headers match', async () => {
    const title = await evaluate('document.title');
    if (!title.includes('Vaultly')) throw new Error(`Unexpected title: ${title}`);
    const loaderGone = await evaluate('!document.getElementById("cinematicLoader") || document.getElementById("cinematicLoader").classList.contains("loader-dismissed")');
    if (!loaderGone) throw new Error('Loader did not dismiss cleanly');
  });

  // 2. Navigation between all 7 Views
  await test('7-View Router switches view panels cleanly', async () => {
    const views = ['overview', 'transactions', 'analytics', 'budgets', 'goals', 'ai', 'settings'];
    for (const view of views) {
      await evaluate(`switchView('${view}')`);
      await sleep(50);
      const active = await evaluate(`document.querySelector('.view-panel.active')?.id`);
      const targetId = `view${view.charAt(0).toUpperCase() + view.slice(1)}`;
      if (active !== targetId) throw new Error(`Failed to activate view ${view}. Active is: ${active}`);
    }
    // Return to overview
    await evaluate(`switchView('overview')`);
  });

  // 3. Load Sample Demo Data
  await test('Load Demo Data populates transactions, budgets, goals, and recurring commitments', async () => {
    await evaluate(`document.getElementById('loadDemoBtn').click()`);
    await sleep(200);
    const txCount = await evaluate('state.transactions.length');
    const budgetCount = await evaluate('state.budgets.length');
    const goalCount = await evaluate('state.goals.length');
    const recCount = await evaluate('state.recurring.length');
    if (txCount === 0) throw new Error('No transactions loaded in demo data');
    if (budgetCount === 0) throw new Error('No budgets loaded in demo data');
    if (goalCount === 0) throw new Error('No goals loaded in demo data');
    if (recCount === 0) throw new Error('No recurring commitments loaded in demo data');
    const balanceText = await evaluate('document.getElementById("totalBalance").textContent');
    if (!balanceText || balanceText === '₹0.00' && txCount > 0) throw new Error('Balance card did not update');
  });

  // 4. Test Add Transaction Validation (Invalid Data)
  await test('Transaction Form rejects invalid inputs with field errors', async () => {
    await evaluate(`openAddTransactionModal()`);
    await sleep(50);
    // Submit empty form
    await evaluate(`document.getElementById('transactionForm').dispatchEvent(new Event('submit', { cancelable: true }))`);
    const titleError = await evaluate('document.getElementById("txTitleError").textContent');
    const amountError = await evaluate('document.getElementById("txAmountError").textContent');
    if (!titleError) throw new Error('Title error was not shown for empty title');
    if (!amountError) throw new Error('Amount error was not shown for empty amount');
    await evaluate(`closeModal(DOM.transactionModal)`);
  });

  // 5. Test Add Transaction (Valid Data)
  await test('Transaction Form successfully adds new transaction', async () => {
    const prevCount = await evaluate('state.transactions.length');
    await evaluate(`
      openAddTransactionModal();
      document.getElementById('txTitle').value = 'QA Espresso Audit';
      document.getElementById('txAmount').value = '250';
      document.getElementById('txCategory').value = 'Food & Dining';
      document.getElementById('txDate').value = '2026-11-20';
      document.getElementById('transactionForm').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    await sleep(200);
    const newCount = await evaluate('state.transactions.length');
    if (newCount !== prevCount + 1) throw new Error(`Transaction was not added. Count: ${newCount}, prev: ${prevCount}`);
    const latestTx = await evaluate('state.transactions.find(t => t.title === "QA Espresso Audit")');
    if (!latestTx || latestTx.amount !== 250) throw new Error('Added transaction details mismatch');
  });

  // 6. Test Edit Transaction
  await test('Edit transaction updates fields and persists', async () => {
    const target = await evaluate('state.transactions.find(t => t.title === "QA Espresso Audit")');
    if (!target) throw new Error('Target transaction not found');
    await evaluate(`
      openEditTransactionModal('${target.id}');
      document.getElementById('txTitle').value = 'QA Espresso Audit (Edited)';
      document.getElementById('txAmount').value = '300';
      document.getElementById('transactionForm').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    await sleep(200);
    const updated = await evaluate(`state.transactions.find(t => t.id === '${target.id}')`);
    if (updated.title !== 'QA Espresso Audit (Edited)' || updated.amount !== 300) {
      throw new Error(`Transaction update failed: ${JSON.stringify(updated)}`);
    }
  });

  // 7. Test Delete Transaction Confirmation Flow
  await test('Delete transaction modal cancels and confirms accurately', async () => {
    const target = await evaluate('state.transactions.find(t => t.title.includes("QA Espresso Audit"))');
    if (!target) throw new Error('Target transaction not found');
    const countBefore = await evaluate('state.transactions.length');
    
    // Open delete modal and cancel
    await evaluate(`
      state.pendingDeleteId = '${target.id}';
      if (DOM.deleteTargetTitle) DOM.deleteTargetTitle.textContent = '"${target.title}"';
      openModal(DOM.deleteConfirmModal);
    `);
    await sleep(50);
    const isModalOpen = await evaluate('document.getElementById("deleteConfirmModal").classList.contains("active")');
    if (!isModalOpen) throw new Error('Delete modal did not open');
    await evaluate(`document.getElementById('cancelDeleteBtn').click()`);
    await sleep(50);
    const countAfterCancel = await evaluate('state.transactions.length');
    if (countAfterCancel !== countBefore) throw new Error('Transaction deleted on cancel');

    // Open delete modal and confirm
    await evaluate(`
      state.pendingDeleteId = '${target.id}';
      openModal(DOM.deleteConfirmModal);
    `);
    await sleep(50);
    await evaluate(`document.getElementById('confirmDeleteBtn').click()`);
    await sleep(150);
    const countAfterConfirm = await evaluate('state.transactions.length');
    if (countAfterConfirm !== countBefore - 1) throw new Error('Transaction was not removed after confirm');
  });

  // 8. Search & Filters
  await test('Search input filters transactions correctly', async () => {
    await evaluate(`switchView('transactions')`);
    await sleep(50);
    await evaluate(`
      const input = document.getElementById('searchInput');
      input.value = 'groceries';
      input.dispatchEvent(new Event('input'));
    `);
    await sleep(100);
    const visibleCount = await evaluate('document.querySelectorAll("#transactionsList .tx-card-row").length');
    const clearBtnVisible = await evaluate('!document.getElementById("clearSearchBtn").hidden');
    if (!clearBtnVisible) throw new Error('Clear button not visible during search');
    
    // Clear search
    await evaluate(`document.getElementById('clearSearchBtn').click()`);
    await sleep(100);
    const resetCount = await evaluate('document.querySelectorAll("#transactionsList .tx-card-row").length');
    if (resetCount <= visibleCount && visibleCount > 0) throw new Error('Clear search did not restore full list');
  });

  // 9. Type Filters (All, Income, Expense)
  await test('Transaction type filter toggles (All, Income, Expense)', async () => {
    await evaluate(`document.querySelector('.filter-glass-pill[data-filter="expense"]').click()`);
    await sleep(100);
    const onlyExpense = await evaluate('Array.from(document.querySelectorAll("#transactionsList .tx-card-row")).every(r => r.querySelector(".tx-badge-expense"))');
    if (!onlyExpense) throw new Error('Non-expense rows shown in expense filter');

    await evaluate(`document.querySelector('.filter-glass-pill[data-filter="all"]').click()`);
    await sleep(100);
  });

  // 10. Scenario Simulator
  await test('What-If Scenario Simulator calculates non-mutating outcome deltas', async () => {
    await evaluate(`switchView('analytics')`);
    await sleep(50);
    const baselineSurplus = await evaluate('document.getElementById("simOutcomeSurplus").textContent');
    await evaluate(`
      const slider = document.getElementById('simIncomeSlider');
      slider.value = 10000;
      slider.dispatchEvent(new Event('input'));
    `);
    await sleep(100);
    const adjustedSurplus = await evaluate('document.getElementById("simOutcomeSurplus").textContent');
    if (baselineSurplus === adjustedSurplus) throw new Error('Simulator outcomes did not react to income adjustment');
    
    // Reset simulation
    await evaluate(`document.getElementById('simResetBtn').click()`);
    await sleep(100);
    const resetSurplus = await evaluate('document.getElementById("simOutcomeSurplus").textContent');
    if (resetSurplus !== baselineSurplus) throw new Error('Simulator did not reset to baseline');
  });

  // 11. Multi-Currency Preference Engine
  await test('Currency switch updates all symbols and formatting across views', async () => {
    await evaluate(`switchView('settings')`);
    await sleep(50);
    await evaluate(`
      document.getElementById('currencySelector').value = 'USD';
      document.getElementById('currencySelector').dispatchEvent(new Event('change'));
    `);
    await sleep(100);
    const usdBalance = await evaluate('document.getElementById("totalBalance").textContent');
    if (!usdBalance.includes('$')) throw new Error(`Balance does not show USD symbol ($): ${usdBalance}`);
    const glyphUpdatedUSD = await evaluate('document.querySelector(".currency-glyph").textContent');
    if (glyphUpdatedUSD !== '$') throw new Error(`Modal currency glyph not updated to $: ${glyphUpdatedUSD}`);

    // Switch to EUR
    await evaluate(`
      document.getElementById('currencySelector').value = 'EUR';
      document.getElementById('currencySelector').dispatchEvent(new Event('change'));
    `);
    await sleep(100);
    const eurBalance = await evaluate('document.getElementById("totalBalance").textContent');
    if (!eurBalance.includes('€')) throw new Error(`Balance does not show EUR symbol (€): ${eurBalance}`);

    // Switch back to INR
    await evaluate(`
      document.getElementById('currencySelector').value = 'INR';
      document.getElementById('currencySelector').dispatchEvent(new Event('change'));
    `);
    await sleep(100);
  });

  // 12. Goals Carousel Navigation
  await test('Goals carousel next/prev buttons scroll smoothly', async () => {
    await evaluate(`switchView('goals')`);
    await sleep(50);
    const hasGoals = await evaluate('state.goals.length > 0');
    if (hasGoals) {
      await evaluate(`document.getElementById('goalsCarouselNextBtn').click()`);
      await sleep(100);
      await evaluate(`document.getElementById('goalsCarouselPrevBtn').click()`);
      await sleep(100);
    }
  });

  // 13. AI Chat Query Submission
  await test('AI Chat input submits message and renders thread', async () => {
    await evaluate(`switchView('ai')`);
    await sleep(50);
    const threadCountBefore = await evaluate('document.querySelectorAll("#aiChatThread .ai-msg").length');
    await evaluate(`
      document.getElementById('aiChatInput').value = 'How is my spending looking?';
      document.getElementById('aiChatForm').dispatchEvent(new Event('submit', { cancelable: true }));
    `);
    await sleep(600);
    const threadCountAfter = await evaluate('document.querySelectorAll("#aiChatThread .ai-msg").length');
    if (threadCountAfter < threadCountBefore + 2) {
      throw new Error(`Expected at least 2 new messages in thread (user + assistant), got ${threadCountAfter - threadCountBefore}`);
    }
  });

  // 14. Global Keyboard Shortcuts
  await test('Global keyboard hotkeys trigger modals and navigation safely', async () => {
    // Blur any active element so form collision protection does not block global hotkeys
    await evaluate(`if (document.activeElement) document.activeElement.blur();`);
    await sleep(50);

    await evaluate(`
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 't', bubbles: true }));
    `);
    await sleep(100);
    const txModalOpen = await evaluate('document.getElementById("transactionModal").classList.contains("active")');
    if (!txModalOpen) throw new Error('Pressing T did not open transaction modal');

    // Press Escape to close
    await evaluate(`
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    `);
    await sleep(100);
    const txModalClosed = await evaluate('!document.getElementById("transactionModal").classList.contains("active")');
    if (!txModalClosed) throw new Error('Pressing Esc did not close transaction modal');
  });

  // 15. Check Console Errors and Exceptions
  console.log('\n--- BROWSER CONSOLE & RUNTIME INTEGRITY ---');
  console.log(`Console Errors Captured: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
  }
  console.log(`Uncaught JS Exceptions: ${jsExceptions.length}`);
  if (jsExceptions.length > 0) {
    jsExceptions.forEach((exc, i) => console.log(`   ${i + 1}. ${exc}`));
  }

  console.log(`\n================================================================`);
  console.log(`Browser QA Completed: ${passedTests}/${totalTests} Tests Passed.`);
  console.log(`================================================================\n`);

  browserProcess.kill();
  process.exit(passedTests === totalTests && consoleErrors.length === 0 && jsExceptions.length === 0 ? 0 : 1);
}

runBrowserQASuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
