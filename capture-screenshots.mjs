import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BROWSER_BIN = existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;
const PORT = 9223;
const USER_DATA_DIR = path.resolve('./.tmp-chrome-profile-shots');
const FILE_URL = 'file:///' + path.resolve('./index.html').replace(/\\/g, '/');
const OUTPUT_DIR = path.resolve('./presentation_assets');

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Copy user uploaded image
const userUpload = 'C:/Users/sahil/.gemini/antigravity/brain/605a0c3d-51a3-4d3f-9d54-9b6a25d8f405/.user_uploaded/media_1793163688429_f9c5758a.png';
if (existsSync(userUpload)) {
  copyFileSync(userUpload, path.join(OUTPUT_DIR, 'ai_insights_card.png'));
  console.log('✅ Copied user uploaded AI insights card');
}

async function capture() {
  console.log('🚀 Launching headless browser for screenshot capture...');
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
    console.error('Failed to connect to CDP');
    browserProcess.kill();
    return;
  }

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let msgId = 1;
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

  // Set 1600x960 viewport
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1600,
    height: 960,
    deviceScaleFactor: 1.5,
    mobile: false
  });

  await send('Page.navigate', { url: FILE_URL });
  // Wait for loader dismissal and chart rendering
  await sleep(2500);

  // Take Overview screenshot
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(path.join(OUTPUT_DIR, '01_dashboard_overview.png'), Buffer.from(shot1.data, 'base64'));
  console.log('📸 Captured 01_dashboard_overview.png');

  // Navigate to Transactions
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('[data-view="transactions"]');
      if (btn) btn.click();
    })()`
  });
  await sleep(600);
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(path.join(OUTPUT_DIR, '02_transactions_ledger.png'), Buffer.from(shot2.data, 'base64'));
  console.log('📸 Captured 02_transactions_ledger.png');

  // Navigate to Analytics
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('[data-view="analytics"]');
      if (btn) btn.click();
    })()`
  });
  await sleep(800);
  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(path.join(OUTPUT_DIR, '03_analytics_charts.png'), Buffer.from(shot3.data, 'base64'));
  console.log('📸 Captured 03_analytics_charts.png');

  // Navigate to Budgets
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('[data-view="budgets"]');
      if (btn) btn.click();
    })()`
  });
  await sleep(600);
  const shot4 = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(path.join(OUTPUT_DIR, '04_budgets_tracking.png'), Buffer.from(shot4.data, 'base64'));
  console.log('📸 Captured 04_budgets_tracking.png');

  // Navigate to Goals
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('[data-view="goals"]');
      if (btn) btn.click();
    })()`
  });
  await sleep(600);
  const shot5 = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(path.join(OUTPUT_DIR, '05_savings_goals.png'), Buffer.from(shot5.data, 'base64'));
  console.log('📸 Captured 05_savings_goals.png');

  // Navigate to Vaultly AI
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('[data-view="ai"]');
      if (btn) btn.click();
    })()`
  });
  await sleep(600);
  const shot6 = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(path.join(OUTPUT_DIR, '06_vaultly_ai.png'), Buffer.from(shot6.data, 'base64'));
  console.log('📸 Captured 06_vaultly_ai.png');

  browserProcess.kill();
  console.log('🎉 All live screenshots captured successfully into presentation_assets/');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
