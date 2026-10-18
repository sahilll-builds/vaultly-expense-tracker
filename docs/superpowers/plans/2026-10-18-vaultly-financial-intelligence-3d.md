# Vaultly Financial Intelligence Platform & 3D Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve Vaultly into a premium, AI-powered financial intelligence platform with exactly two specialized carousels (Horizontal Goals and Vertical AI Insights), a distinct 3-tier interaction system (cursor, hover, click), performance-first adaptive visual architecture, and strict financial correctness.

**Architecture:** Pure CSS and vanilla JavaScript architecture leveraging native CSS scroll-snapping, requestAnimationFrame-throttled pointer tracking, deterministic 4-layer financial intelligence calculations, zero external heavy dependencies, and client-side data privacy with responsive design across 320px–1920px.

**Tech Stack:** Vanilla JavaScript (ES2022+), CSS Custom Properties, WebGL (lightweight raymarching), Web Storage API, Vercel Serverless Functions (`api/chat.js`).

**Spec:** `# VAULTLY — MASTER DEVELOPMENT PROMPT: AI-Powered Financial Intelligence Platform with Premium 3D Interactions`

## Global Constraints

- Preserve all existing financial calculation engines, local storage schemas, and transaction CRUD operations.
- Maintain the Obsidian Chrome monochrome design direction (#08090B deep black, #111318 obsidian, #F5F5F5 soft white, #9297A1 silver/gray).
- Implement EXACTLY TWO carousels across the entire application:
  1. Horizontal Goals Carousel in `#viewGoals`
  2. Vertical AI Insights Carousel in `#viewOverview`
  No third carousel allowed anywhere.
- Hero Net Balance card and Desktop Sidebar remain fixed and stationary as verified in recent requests.
- All interactions must be distinct (Cursor movement !== Hover !== Click/Press).
- Support reduced motion (`prefers-reduced-motion: reduce`) and touchscreens (`pointer: coarse`).
- 0 horizontal overflow across all 14 responsive viewports (320px to 1920px).

## Review Focus

1. Goals Carousel with 0 goals: renders a helpful empty state without broken arrows or pagination errors.
2. AI Insights Carousel with 1 insight: renders normally without broken vertical scroll or navigation loops.
3. Rapid vertical wheel scrolling inside the AI Insights viewport: does not hijack the main window page scroll.
4. Touchscreen mobile devices: cursor-movement tilt gracefully disables, while touch swipe on both carousels remains smooth.
5. Zero layout shift (CLS < 0.1) during carousel slide transitions and hover elevation.

---

### Task 1: Horizontal Goals Carousel (`#viewGoals`)

**Files:**
- Modify: `index.html:1008-1027`
- Modify: `style.css:2910-2960`
- Modify: `script.js:1710-1765`
- Test: `test-runner.js`

**Interfaces:**
- Consumes: `state.goals`, `formatCurrency`, `formatDate`, `escapeHTML`
- Produces: `renderGoalsCarousel()` with prev/next navigation, page indicators, keyboard navigation (ArrowLeft/ArrowRight), and CSS scroll-snapping (`scroll-snap-type: x mandatory`).

- [ ] **Step 1: Write failing test in `test-runner.js` for Goals Carousel DOM structure and behavior**
- [ ] **Step 2: Run test-runner to verify test fails**
- [ ] **Step 3: Update `index.html` with Carousel 1 container, navigation arrows, and indicator dots**
- [ ] **Step 4: Update `style.css` with horizontal carousel track, scroll-snap-align, and responsive card sizing**
- [ ] **Step 5: Update `script.js` with `renderGoalsCarousel()`, wheel-delta handling, scroll listener, and arrow controls**
- [ ] **Step 6: Run test-runner to verify test passes**
- [ ] **Step 7: Commit task deliverable**

---

### Task 2: Vertical AI Insights Carousel (`#viewOverview`)

**Files:**
- Modify: `index.html:533-575`
- Modify: `style.css:2800-2860`
- Modify: `script.js:1850-1920`
- Test: `test-runner.js`

**Interfaces:**
- Consumes: `calculateTotals`, `calculateDiagnosticAnalytics`, `calculateSafeToSpend`, `calculateAnomaliesAndDuplicates`, `state.recurring`, `state.goals`
- Produces: `renderVerticalAiInsightsCarousel()` with dynamic real-data slide generation, vertical navigation buttons (Up/Down), counter indicator ("Insight 1 of 5"), touch swipe, and rAF-controlled scroll snapping.

- [ ] **Step 1: Write failing test in `test-runner.js` for Vertical AI Insights Carousel structure and data generation**
- [ ] **Step 2: Run test-runner to verify test fails**
- [ ] **Step 3: Update `index.html` with Vertical Carousel viewport, slide track, counter, and Up/Down navigation buttons**
- [ ] **Step 4: Update `style.css` with vertical carousel track, scroll-snap-type: y mandatory, slide dimensions, and elevation**
- [ ] **Step 5: Update `script.js` with dynamic insight generation, Up/Down scroll handlers, keyboard navigation (ArrowUp/ArrowDown), and interaction pause**
- [ ] **Step 6: Run test-runner to verify test passes**
- [ ] **Step 7: Commit task deliverable**

---

### Task 3: Distinct 3-Tier Interaction System (Cursor vs Hover vs Click)

**Files:**
- Modify: `style.css:518-535`, `style.css:1165-1185`
- Modify: `script.js:1300-1360`
- Test: `test-runner.js`

**Interfaces:**
- Cursor-movement: rAF-throttled spotlight and subtle depth on interactive cards; hero card and sidebar stay stationary.
- Hover: subtle silver elevation, border illumination, and smooth transitions without layout shifts.
- Click/Press: tactile `active: scale(0.97)` on buttons and `active: scale(0.99)` on interactive cards.

- [ ] **Step 1: Write failing test in `test-runner.js` verifying distinct interaction rules**
- [ ] **Step 2: Run test-runner to verify test fails**
- [ ] **Step 3: Implement tactile click/press states and refined hover elevations in `style.css`**
- [ ] **Step 4: Enhance pointer-movement listener in `script.js` with coarse-pointer detection and rAF throttling**
- [ ] **Step 5: Run test-runner to verify test passes**
- [ ] **Step 6: Commit task deliverable**

---

### Task 4: Performance, Responsive Verification & Production Deployment

**Files:**
- Modify: `test-runner.js`
- Test: `verify-responsive.mjs`

- [ ] **Step 1: Run full automated unit test suite (`node test-runner.js`) ensuring all tests pass**
- [ ] **Step 2: Run comprehensive responsive test suite (`node verify-responsive.mjs`) across 14 viewports**
- [ ] **Step 3: Push commits to GitHub `origin main`**
- [ ] **Step 4: Deploy to Vercel production and verify live deployment**
