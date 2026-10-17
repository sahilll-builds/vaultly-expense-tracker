# Vaultly — Personal Finance & Expense Tracker

> **Tagline:** Your money. Your control.  
> ⚡ **Vercel Production:** [https://vaultly-expense-tracker-one.vercel.app](https://vaultly-expense-tracker-one.vercel.app)  
> 🌐 **GitHub Pages Demo:** [https://sahilll-builds.github.io/vaultly-expense-tracker/](https://sahilll-builds.github.io/vaultly-expense-tracker/)  
> 📦 **GitHub Repository:** [https://github.com/sahilll-builds/vaultly-expense-tracker](https://github.com/sahilll-builds/vaultly-expense-tracker)

Vaultly is a modern, responsive client-side personal finance and expense-tracking web application built with pure HTML5, CSS3, and Vanilla JavaScript. Designed around a luxury **Minimalist Monochrome Glassmorphism** aesthetic, Vaultly empowers users to gain crystal-clear insights into their cash flow, track income and expenses, monitor spending distribution across categories, compute daily safe-to-spend allowances, and maintain full privacy by keeping all financial data locally in their own browser.

---

## 📸 Overview

Vaultly serves as an intuitive personal finance dashboard where users can:
- Instantly view their **Total Net Balance** calculated strictly from logged cash flow ($$\text{Net Balance} = \text{Total Income} - \text{Total Expenses}$$).
- Monitor a dynamic **Safe to Spend** daily allowance engine that calculates how much you can spend per day based on your current net savings and days remaining in the month.
- Gain actionable **Spending Insights** derived directly from actual recorded transactions (top spending category, largest single expenditure, and savings retention percentage).
- Track incoming cash with high-contrast pure white (`+₹...`) and outgoing expenditures with elegant silver (`−₹...`).
- Analyze spending habits visually through an interactive **Chart.js Monochrome Doughnut Chart** and detailed category percentage breakdown chips.
- Perform real-time instant searches across transaction titles, categories, and personal notes.
- Filter transactions by type (**All**, **Income**, **Expenses**) and category, or sort chronologically and by transaction value.
- Rest assured with full **Local Storage** persistence, robust input validation, and an accidental-deletion safety confirmation dialog.

---

## 🚀 Key Features

1. **Luxury Monochrome Glassmorphism Design System**
   - Built on a celestial foundation: layered deep-space canvas (`#050505`), silver nebula clouds, multi-depth twinkling star layers, and ambient water-white liquid orbs.
   - High-contrast glass surfaces with `backdrop-filter: blur()`, ultra-fine translucent luminous borders (`rgba(255, 255, 255, 0.10)`), top-edge refraction highlights (`::before`), and water-white reflection sweeps.
   - Typography pairing: **Space Grotesk** (700) for the bold **VAULTLY** wordmark and **Manrope** for clean hierarchy across headings, metrics, navigation, body, and forms.
   - 70% clarity / 30% visual atmosphere balance: data and numbers always remain the primary hero focus with WCAG AA compliance.

2. **Safe to Spend Daily Allowance Engine**
   - Calculates a realistic daily spending budget: $$\text{Daily Allowance} = \frac{\text{Net Balance}}{\text{Days Remaining in Month}}$$.
   - Includes an animated liquid month progress bar showing exactly where you are in the current calendar cycle.

3. **Live Spending Insights Panel**
   - Calculates key financial metrics from your active transaction history:
     - **Largest Spending Category:** Shows dominant category with spending percentage and formatted rupee total.
     - **Largest Single Transaction:** Highlights highest individual ticket item.
     - **Savings Retention Rate:** Shows what percentage of total earned income is retained as net savings.

4. **Real-Time Financial Arithmetic**
   - Dynamic currency formatting using modern `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
   - Guaranteed correct arithmetic with zero hard-coded summary values.
   - Example scenario: Income of ₹10,000 with expenses of ₹2,000 and ₹500 accurately calculates ₹10,000 Total Income, ₹2,500 Total Expenses, and ₹7,500 Net Balance.

5. **Dynamic Category Allocation**
   - Context-aware categories that switch dynamically when toggling between **Expense** (*Food & Dining, Transport, Shopping, Bills & Utilities, Education, Entertainment, Health, Other*) and **Income** (*Salary, Freelance, Allowance, Business, Other*).

6. **Visual Analytics & Chart Fallback**
   - Chart.js doughnut chart with cosmic glass cutouts, luxury grayscale data series, and dark glass tooltips.
   - Proper lifecycle management: existing chart instances are cleanly destroyed before re-instantiating to prevent canvas memory leaks.
   - **Graceful CDN Fallback:** If internet access is lost or Chart.js fails to load, the UI seamlessly displays the category breakdown cards and percentage indicators.

7. **Local Storage Persistence & Defensive Error Recovery**
   - Automatically saves all entries under the dedicated `vaultly_transactions` key.
   - Built with defensive `try...catch` blocks that safely detect missing or corrupted JSON and fall back cleanly without crashing the interface.

8. **Interactive Toolbar & Empty States**
   - Live debounced/instant search input with a clear button.
   - Multi-criteria filtering by transaction type and category.
   - Sort by Newest, Oldest, Highest Amount, or Lowest Amount.
   - Thoughtful empty states guiding new users with a "Welcome to Vaultly" call-to-action and a "No matching transactions found" reset state.

9. **Sample Demo Data & Reset Controls**
   - Includes a one-click **"Demo Data"** feature with realistic relative dates to quickly explore all dashboard capabilities.
   - Includes a **"Reset All Data"** button with confirmation to clear records cleanly.

10. **Fully Responsive & Accessible**
    - Mobile-first responsive layout with breakpoints tested across 320px, 480px, 768px, 1024px, and 1440px.
    - Slide-out glass navigation drawer with backdrop on small screens.
    - Accessible keyboard navigation (`Escape` closes modals, `Enter` submits forms, visible `:focus-visible` white/silver rings, and `@media (prefers-reduced-motion)` support).

---

## 🛠️ Technologies Used

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic structure (`<header>`, `<nav>`, `<aside>`, `<main>`, `<article>`, `<dialog>`) |
| **CSS3** | Flexbox, CSS Grid, Custom Properties (`:root`), Media Queries, Animations |
| **Vanilla JavaScript (ES6+)** | State management, calculations, DOM manipulation, storage serialization |
| **Browser Local Storage** | Client-side persistent data storage across browser refreshes |
| **Chart.js (v4.4)** | Interactive spending category doughnut chart (loaded via CDN) |
| **Lucide Icons** | Crisp UI icons (loaded via CDN with an embedded offline SVG fallback engine) |

---

## 📁 Project Folder Structure

```text
vaultly-expense-tracker/
│
├── index.html            # Semantic HTML5 markup, 1s cinematic loading screen, bottom sheet dialogs
├── style.css             # Monochrome Glassmorphism, Space Grotesk & Manrope typography, responsive breakpoints
├── script.js             # Modular application logic, calculation engine, event handlers, 1s loader lifecycle
├── test-runner.js        # Automated unit tests for math, validation, and filter pipelines
├── verify-responsive.mjs # Headless browser CDP test suite validating 14 viewports (320px to 1920px)
└── README.md             # Comprehensive project documentation
```

---

## 📱 Responsive Design & Device Architecture

Vaultly was architected from the ground up for seamless usability across all device form factors:

| Device Category | Target Viewports | Layout Behavior & Adaptation |
| :--- | :--- | :--- |
| **Ultra-Compact Mobile** | 320px – 360px | Zero horizontal overflow, compact 10px padding, vertically stacked dropdowns, hidden micro-tagline, fluid clamp typography. |
| **Standard Mobile** | 375px – 480px | 1-column summary stack, fluid balance display, full-width search & type filter pills, 2-tier transaction cards. |
| **Large Mobile / Phablets**| 480px – 640px | Bottom-sheet modal dialog with tactile pull handle, comfortable touch targets, stacked action buttons. |
| **Small & Medium Tablets** | 768px – 1024px | 2-column grid (`Total Net Balance` full-width; `Income` & `Expense` side-by-side), compact horizontal navigation. |
| **Laptops & Desktops** | 1280px – 1440px | 3-column financial summary grid, horizontal navigation bar, 3D mouse tilt with interactive spotlights. |
| **Ultra-Wide & 4K Displays** | 1600px – 2560px | Bounded 1440px max-width container, centered cosmic background, balanced optical alignment. |
| **Landscape Mobile** | <= 520px height | Compact sticky header, scrollable bottom-sheet modal with max 94vh height. |
| **Touch Devices** | `pointer: coarse` | Enforced `>= 44px` tap target hitboxes on all interactive buttons, selects, and toggles. |

### 🎬 Fast Cinematic Loading Screen (1.0s Max)
- **Pure Typographic Wordmark:** Centered **VAULTLY** in bold Space Grotesk (700) with a refined monochrome light sweep reflection. No icons, emblems, or badges.
- **Precision Silver Line Indicator:** Minimalist horizontal line indicating asset readiness without jarring spinners or orbital rings.
- **Strict 1-Second Budget:** 650ms presentation phase followed by a 350ms smooth CSS fade-out (`opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)`), completely revealing the interactive dashboard at or under 1000ms.
- **Defensive Timeouts & Accessibility:** Enforced 1000ms hard safety timeout so the UI never hangs, with instantaneous (0ms) dismissal when `prefers-reduced-motion: reduce` is detected.

## 💻 Running the Application Locally

Vaultly is a purely client-side static application. It requires no backend, database setup, or npm installation.

### Method 1: VS Code Live Server (Recommended)
1. Open the `vaultly-expense-tracker` folder in **Visual Studio Code**.
2. Install the **Live Server** extension by *Ritwick Dey* (if not already installed).
3. Right-click `index.html` and choose **"Open with Live Server"**.
4. The application will launch at `http://127.0.0.1:5500`.

### Method 2: Python Built-In HTTP Server
If Python is installed on your computer:
```bash
# In your terminal, navigate to the vaultly-expense-tracker directory:
cd vaultly-expense-tracker

# For Python 3:
python -m http.server 8000
```
Open your browser and navigate to: `http://localhost:8000`.

### Method 3: Direct Browser Launch
Double-click `index.html` or drag it into any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari).

---

## 🧪 Running Automated Tests

A dedicated test runner is included to verify the calculation engine and input constraints:

```bash
node test-runner.js
```

This verifies:
- Mathematical accuracy for net balance, income totals, and expense totals.
- Category spending percentage calculations.
- Input validation (rejection of empty titles, negative/zero amounts, missing categories/dates).
- Search query and multi-filter behavior.
- Storage corruption recovery.

---

## 🔒 Data Storage & Privacy

- **Client-Side Only:** Vaultly stores all transactions strictly within the browser's `localStorage` on your local device.
- **No Remote Servers:** No transaction data, personal details, or analytics are ever transmitted to any external server.
- **Browser-Specific:** Because data is tied to your browser's local cache, clearing your browser's browsing data or site cookies will erase the stored records.
- **Educational Context:** Vaultly demonstrates client-side data persistence; it is not an encrypted banking vault or synchronized multi-device cloud service.

---

## 💡 What I Learned Building Vaultly

Building Vaultly as my first serious portfolio project provided hands-on experience in core software engineering principles:

1. **Separation of Concerns:**  
   Keeping application state (`state = { transactions: [...] }`) separate from DOM rendering ensures a predictable *unidirectional data flow*. When state changes, dedicated render functions update the view.

2. **Defensive Programming & Safe DOM APIs:**  
   Avoiding direct `innerHTML` injection with user-supplied strings prevents Cross-Site Scripting (XSS) vulnerabilities. Constructing DOM nodes via `document.createElement()` and `textContent` guarantees safe rendering.

3. **Modern JavaScript Formatting (`Intl`):**  
   Replacing manual string formatting with `Intl.NumberFormat('en-IN')` handles localized currency standards (₹ formatting with Indian comma placement: thousands, lakhs, crores) accurately.

4. **Lifecycle Management in Third-Party Libraries:**  
   Learning that canvases require explicit destruction (`chartInstance.destroy()`) before re-rendering prevents visual glitches and memory buildup in single-page interfaces.

5. **Graceful Degradation:**  
   Building fallback SVG dictionaries ensures that third-party CDN downtime never leaves the interface missing icons or broken for offline users.

---

## 🔮 Future Improvements

- [ ] **Data Export & Import:** Allow users to export transactions as CSV or JSON and restore backups.
- [ ] **Monthly Budget Limits:** Set spending caps per category and display visual progress alerts when approaching thresholds.
- [ ] **Date Range Filters:** Filter records by custom date ranges (e.g., *This Month*, *Last 30 Days*, *Custom Range*).
- [ ] **Optional Light Theme:** Implement a toggleable daytime color scheme using CSS variables.
- [ ] **Receipt Attachment Previews:** Store local image previews using the HTML5 FileReader API.

---

## 📄 License

This project was built for educational and portfolio demonstration purposes. Feel free to study, fork, and adapt it!
