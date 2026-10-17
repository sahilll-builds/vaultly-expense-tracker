# Vaultly — Personal Finance & Expense Tracker

> **Tagline:** Your money. Your control.  
> 🌐 **Live Demo:** [https://sahilll-builds.github.io/vaultly-expense-tracker/](https://sahilll-builds.github.io/vaultly-expense-tracker/)  
> 📦 **GitHub Repository:** [https://github.com/sahilll-builds/vaultly-expense-tracker](https://github.com/sahilll-builds/vaultly-expense-tracker)

Vaultly is a modern, responsive client-side personal finance and expense-tracking web application built with pure HTML5, CSS3, and Vanilla JavaScript. Designed around the refined **Midnight Emerald** visual aesthetic, Vaultly empowers users to gain clear insights into their cash flow, track income and expenses, monitor spending distribution across categories, and maintain full privacy by keeping all financial data locally in their own browser.

---

## 📸 Overview

Vaultly serves as an intuitive personal finance dashboard where users can:
- Instantly view their **Total Net Balance** calculated strictly from logged cash flow ($$\text{Net Balance} = \text{Total Income} - \text{Total Expenses}$$).
- Track incoming cash with positive indicator badges and outgoing expenditures with restrained coral indicators.
- Analyze spending habits visually through an interactive **Chart.js Doughnut Chart** and detailed category percentage breakdown chips.
- Perform real-time instant searches across transaction titles, categories, and personal notes.
- Filter transactions by type (**All**, **Income**, **Expenses**) and category, or sort chronologically and by transaction value.
- Rest assured with full **Local Storage** persistence, robust input validation, and an accidental-deletion safety confirmation dialog.

---

## 🚀 Key Features

1. **Midnight Emerald Design System**
   - Built on carefully curated CSS custom properties (`:root`).
   - Deep canvas background (`#0C0F0E`), rich elevated surfaces (`#171B19`, `#1D2420`), crisp emerald accents (`#8FE3B0`), and accessible coral indicators (`#F87171`).
   - Smooth transitions, tactile button states, and WCAG AA contrast compliance.

2. **Real-Time Financial Arithmetic**
   - Dynamic currency formatting using modern `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
   - Guaranteed correct arithmetic with zero hard-coded summary values.
   - Example scenario: Income of ₹10,000 with expenses of ₹2,000 and ₹500 accurately calculates ₹10,000 Total Income, ₹2,500 Total Expenses, and ₹7,500 Net Balance.

3. **Dynamic Category Allocation**
   - Context-aware categories that switch dynamically when toggling between **Expense** (*Food & Dining, Transport, Shopping, Bills & Utilities, Education, Entertainment, Health, Other*) and **Income** (*Salary, Freelance, Allowance, Business, Other*).

4. **Visual Analytics & Chart Fallback**
   - Chart.js doughnut chart with customized Midnight Emerald palette and dynamic hover tooltips.
   - Proper lifecycle management: existing chart instances are cleanly destroyed before re-instantiating to prevent canvas memory leaks.
   - **Graceful CDN Fallback:** If internet access is lost or Chart.js fails to load, the UI seamlessly displays the category breakdown cards and percentage indicators.

5. **Local Storage Persistence & Defensive Error Recovery**
   - Automatically saves all entries under the dedicated `vaultly_transactions` key.
   - Built with defensive `try...catch` blocks that safely detect missing or corrupted JSON and fall back cleanly without crashing the interface.

6. **Interactive Toolbar & Empty States**
   - Live debounced/instant search input with a clear button.
   - Multi-criteria filtering by transaction type and category.
   - Sort by Newest, Oldest, Highest Amount, or Lowest Amount.
   - Thoughtful empty states guiding new users with a "Welcome to Vaultly" call-to-action and a "No matching transactions found" reset state.

7. **Sample Demo Data & Reset Controls**
   - Includes a one-click **"Load Demo Data"** feature with realistic relative dates to quickly explore all dashboard capabilities.
   - Includes a **"Reset All Data"** button with confirmation to clear records cleanly.

8. **Fully Responsive & Accessible**
   - Mobile-first responsive layout with breakpoints tested across 320px, 375px, 768px, 1024px, and 1440px.
   - Slide-out navigation drawer with backdrop on small screens.
   - Accessible keyboard navigation (`Escape` closes modals, `Enter` submits forms, visible `:focus-visible` emerald rings, and `@media (prefers-reduced-motion)` support).

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
├── index.html        # Semantic HTML5 markup, modal dialogs, accessible containers
├── style.css         # Midnight Emerald design tokens, layout grids, responsive rules
├── script.js         # Modular application logic, calculation engine, event handlers
├── test-runner.js    # Automated unit tests for math, validation, and filter pipelines
└── README.md         # Comprehensive project documentation
```

---

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
