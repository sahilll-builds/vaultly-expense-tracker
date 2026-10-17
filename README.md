# VAULTLY — AI-Powered Personal Finance Platform

> **Tagline:** Your money. Your control.  
> ⚡ **Live Production (Vercel):** [https://vaultly-expense-tracker-one.vercel.app](https://vaultly-expense-tracker-one.vercel.app)  
> 📦 **GitHub Repository:** [https://github.com/sahilll-builds/vaultly-expense-tracker](https://github.com/sahilll-builds/vaultly-expense-tracker)  
> 🌐 **GitHub Pages Mirror:** [https://sahilll-builds.github.io/vaultly-expense-tracker/](https://sahilll-builds.github.io/vaultly-expense-tracker/)

Vaultly is a luxury, AI-powered personal finance and expense management platform built with modern HTML5, CSS3 Custom Properties, and Vanilla JavaScript (ES6+). Styled with an obsidian-glass spatial design system, Vaultly combines client-side privacy, multi-store persistence, real-time financial arithmetic, smart budgeting, goal planning, and conversational AI assistance.

---

## 📸 Key Capabilities & Architecture

### 1. Obsidian Glass Spatial UI
- **Color Architecture:** Layered celestial canvas (`#08090B`), dark card backgrounds (`#111318`), elevated active panels (`#17191F`), ultra-bright text (`#F5F5F5`), and muted secondary tones (`#9297A1`).
- **Interactive 3D Balance Visualizer:** A liquid-glass reflective sphere in the Overview panel with dynamic specular highlights and physics-based cursor tilt powered by `requestAnimationFrame`.
- **Typographic Wordmark:** Strictly typographic **VAULTLY** brand identity set in bold Space Grotesk (700) with zero arbitrary icon badges.
- **Cinematic Loader:** Lightning-fast introductory sequence completing in $\le 1.0\text{s}$ with instant 0ms bypass when `prefers-reduced-motion` is detected.

### 2. 7-View Spatial Navigation
1. **Overview:** At-a-glance financial summary, interactive 3D balance orb, safe-to-spend allowance, quick budget status, active savings goal progress, and recent transactions.
2. **Transactions:** Complete transaction ledger with full CRUD (create, view, edit, delete), multi-criteria filtering (Type, Category), sort options (Date, Amount), instant debounced search, and RFC 4180 CSV export.
3. **Analytics:** Chart.js monochrome spending breakdown, category distribution chips, deterministic spending forecast, and monthly financial summary reports.
4. **Budgets:** Category spending caps with live utilization percentage bars, remaining allowances, and over-budget alert chips.
5. **Goals:** Target savings planner with target dates, liquid progress bars, remaining target chips, and quick contribution logging.
6. **Vaultly AI:** Natural-language conversational financial assistant backed by Vercel serverless integration and an offline deterministic financial Q&A engine.
7. **Settings:** Complete data backup JSON export, reset tools, active storage diagnostics, and currency settings.

### 3. Smart Financial Engines
- **Safe-to-Spend Daily Allowance:** Calculates your daily spending allowance based on your remaining net balance, recurring commitments, and days left in the month:
  $$\text{Daily Allowance} = \frac{\text{Net Balance} - \text{Committed Recurring}}{\text{Days Remaining in Month}}$$
- **Natural-Language Transaction Parser:** Automatically interprets queries like *"Spent 350 on lunch today"* or *"Received 45000 salary yesterday"*, pre-fills the transaction form, and requests explicit user confirmation before writing to storage.
- **Spending Forecaster:** Calculates daily average burn rate and extrapolates end-of-month projected outflow.

### 4. Dual-Mode Serverless AI Integration (`/api/chat`)
- **Serverless Endpoint:** Hosted on Vercel Node.js serverless architecture (`api/chat.js`).
- **Multi-Provider Support:** Automatically queries **Google Gemini** (`GEMINI_API_KEY`) or **OpenAI** (`OPENAI_API_KEY`) using secure server-side environment variables.
- **Zero-Key Deterministic Fallback:** If API keys are unconfigured or the network is offline, Vaultly AI automatically falls back to an internal deterministic financial Q&A engine that answers verified totals, top spending categories, and allowances directly from local data without throwing errors.
- **Security & Privacy:** API keys are never exposed in client bundles. Rate limiting (30 req/min) and payload validation safeguard the endpoint.

---

## 🛠️ Technology Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Markup** | HTML5 Semantic Elements | Accessible document layout (`<aside>`, `<header>`, `<main>`, `<dialog>`) |
| **Styling** | CSS3 Custom Properties | Obsidian Glass theme tokens, responsive clamp sizing, 3D CSS transforms |
| **Logic** | Vanilla JavaScript (ES6+) | 0-dependency client runtime, fast DOM rendering, view router |
| **Charts** | Chart.js (v4.4) | Grayscale doughnut chart with graceful HTML/CSS chip fallback |
| **Icons** | Lucide Icons | Clean SVG icons with embedded offline fallback |
| **AI Backend** | Node.js Serverless (`api/chat.js`) | Multi-provider AI dispatch with offline deterministic fallback |
| **Testing** | Node Test Runner & Chrome CDP | 100% passing test coverage across 14 responsive viewports |

---

## 📁 Repository Structure

```text
vaultly-expense-tracker/
├── index.html            # Semantic 7-view architecture, modals, and spatial HUD
├── style.css             # Obsidian Glass design tokens, 3D orb, and responsive grid
├── script.js             # Router, multi-store state engine, NLP parser, and math core
├── vercel.json           # Vercel deployment headers and clean URL routing
├── api/
│   └── chat.js           # Serverless AI assistant endpoint (Gemini/OpenAI/Fallback)
├── test-runner.js        # Automated unit tests for math, budgets, NLP, and API routes
├── verify-responsive.mjs # Headless Chrome CDP suite validating 14 viewports (0px overflow)
└── README.md             # Architecture documentation and usage guide
```

---

## 🧪 Testing & Verification

### 1. Automated Unit & Logic Tests
Run the comprehensive test suite covering mathematical calculations, category allocation, corrupted storage fallback, multi-store schemas, budget utilization, NLP parsing, and serverless API route handlers:
```bash
node test-runner.js
```
*Result: 10/10 test checks pass.*

### 2. Responsive Viewport Verification (CDP)
Verify that all 14 desktop, tablet, and mobile viewports render with **0px horizontal overflow** and accessible touch targets:
```bash
node verify-responsive.mjs
```
*Tested Viewports:*
- 320x600 (Small Mobile)
- 360x740 (Android Compact)
- 375x812 (Standard Mobile)
- 390x844 (Modern Mobile)
- 430x932 (Large Mobile)
- 600x960 (Small Tablet)
- 768x1024 (Standard Tablet)
- 820x1180 (Medium Tablet)
- 1024x768 (Large Tablet Landscape)
- 1280x800 (Standard Laptop)
- 1366x768 (Widescreen Laptop)
- 1440x900 (Desktop Monitor)
- 1920x1080 (Large Desktop)
- 740x360 (Mobile Landscape)

---

## 🚀 Deployment

### Deploy to Vercel
```bash
vercel --prod
```

### Configure Optional AI Provider Keys
Set these environment variables in your Vercel Project Dashboard:
- `GEMINI_API_KEY`: Your Google Gemini API Key
- `OPENAI_API_KEY`: Your OpenAI API Key

*(Note: If no keys are configured, Vaultly automatically and seamlessly uses its built-in deterministic financial AI engine).*

---

## 🔒 Privacy Guarantee
All personal transaction records, category configurations, budgets, goals, and recurring commitments are stored strictly in client-side `localStorage`. Financial data is never transmitted to any third-party analytics service or tracking network.
