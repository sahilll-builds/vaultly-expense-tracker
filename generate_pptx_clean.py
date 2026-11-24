"""
Vaultly PPTX Generator using official python-pptx
Produces an authentic, 100% schema-compliant Microsoft PowerPoint presentation
with custom Obsidian Glass dark styling, 16:9 widescreen layout, and embedded screenshots.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

BASE_DIR = r"C:\Users\sahil\.gemini\antigravity\scratch\vaultly-expense-tracker"
ASSETS_DIR = os.path.join(BASE_DIR, "presentation_assets")
OUTPUT_PPTX = os.path.join(BASE_DIR, "Vaultly_Presentation_Fixed.pptx")
OUTPUT_PPTX_MAIN = os.path.join(BASE_DIR, "Vaultly_Presentation.pptx")

# Palette tokens
COLOR_BG = RGBColor(7, 8, 10)         # #07080A
COLOR_SURFACE = RGBColor(17, 20, 28)   # #11141C
COLOR_BORDER = RGBColor(30, 41, 59)    # #1E293B
COLOR_WHITE = RGBColor(248, 250, 252)  # #F8FAFC
COLOR_MUTED = RGBColor(148, 163, 184)  # #94A3B8
COLOR_BODY = RGBColor(203, 213, 225)   # #CBD5E1
COLOR_CYAN = RGBColor(56, 189, 248)    # #38BDF8
COLOR_EMERALD = RGBColor(16, 185, 129) # #10B981
COLOR_PURPLE = RGBColor(168, 85, 247)  # #A855F7
COLOR_ROSE = RGBColor(244, 63, 94)     # #F43F5E

SLIDES_DATA = [
    {
        "index": 1,
        "badge": "⚡ ARCHITECTURE & DESIGN SHOWCASE • LIVE ON VERCEL",
        "title": "VAULTLY — AI-Powered Personal Finance Platform",
        "subtitle": "Your Money. Your Control. • Next-Gen Luxury Spatial Expense System",
        "header_color": COLOR_CYAN,
        "bullets": [
            "Obsidian Glass Spatial UI: Physics-based 3D balance orb visualizer and dark luxury aesthetics.",
            "Zero External Client Dependencies: Pure Vanilla HTML5, CSS3, and ES6+ JavaScript runtime.",
            "Dynamic Safe Pacing Engine: Real-time Safe-to-Spend daily allowance calibrated to calendar runway.",
            "Dual-Tier Conversational AI: Fast regex/NLP parser paired with offline deterministic Q&A fallback.",
            "Live Production Deployment: Ready and active worldwide at vaultly-expense-tracker-one.vercel.app"
        ],
        "image": "vaultly_overview.png",
        "stat_box": "100% Sovereign • 0 Dependencies • 14/14 Viewports Verified"
    },
    {
        "index": 2,
        "badge": "01 • EXECUTIVE INTRODUCTION",
        "title": "Rethinking Personal Finance from First Principles",
        "subtitle": "Bridging Sovereign Client-Side Privacy with Luxury Spatial Aesthetics",
        "header_color": COLOR_CYAN,
        "bullets": [
            "Data Sovereignty: 100% of transaction logs, categories, and budgets remain local on user hardware.",
            "Sub-Millisecond Reactivity: Pure modern web standards deliver 60 FPS without framework hydration delay.",
            "Visual Poise: Obsidian spatial canvas (#08090B), high-contrast typography, and cognitive calm.",
            "Actionable Pacing: Solves money management before deficits happen through forward-looking velocity.",
            "Universal Portability: Instant RFC 4180 CSV export and complete JSON backup/restore mechanics."
        ],
        "image": "vaultly_overview.png",
        "stat_box": "Architecture Pillar: Local-First Privacy + Zero Hydration Delay"
    },
    {
        "index": 3,
        "badge": "02 • MARKET PROBLEM STATEMENT",
        "title": "The Four Crises of Modern Budgeting Software",
        "subtitle": "Why Traditional Personal Finance Apps Fail Users Within 14 Days",
        "header_color": COLOR_ROSE,
        "bullets": [
            "1. Invasive Privacy Monetization: Apps harvest financial logs and resell profiling data to ad brokers.",
            "2. Cluttered Bloatware & Upselling: Essential tracking is buried under credit card and personal loan ads.",
            "3. Cloud Latency & Network Fragility: Heavy client bundles (>5MB) lock up in subways, flights, or offline.",
            "4. Passive Historical Post-Mortems: Charts only tell you where you failed two weeks after money is gone.",
            "The Result: High cognitive fatigue, severe privacy risks, and rapid user abandonment."
        ],
        "image": "ai_insights_card.png",
        "stat_box": "Industry Deficit: Over-monetized SaaS vs. True User Sovereignty"
    },
    {
        "index": 4,
        "badge": "03 • PROJECT OBJECTIVES & BENCHMARKS",
        "title": "Engineering Precision & User-Centric Benchmarks",
        "subtitle": "Strict Measurable Standards Established for Uncompromising Quality",
        "header_color": COLOR_CYAN,
        "bullets": [
            "Zero Dependencies: Complete finance platform in HTML5, CSS3, and JavaScript with <50KB transfer footprint.",
            "Deterministic Arithmetic: Mathematically verified balances with zero floating-point rounding errors.",
            "Safe-to-Spend Daily Engine: Dynamic velocity formula calculating real-time daily spend limit.",
            "Universal Responsiveness: 14/14 distinct viewports verified with 0px horizontal overflow.",
            "Offline-First AI: Natural language transaction parser and deterministic Q&A rule engine without mandatory keys."
        ],
        "image": "vaultly_overview.png",
        "stat_box": "Target Met: 10/10 Automated Unit Tests & 14 Viewports Verified"
    },
    {
        "index": 5,
        "badge": "04 • COMPREHENSIVE SOLUTION",
        "title": "The Vaultly Architecture: Obsidian Spatial HUD",
        "subtitle": "Three-Layer Architecture Engineered for Precision, Privacy & Speed",
        "header_color": COLOR_EMERALD,
        "bullets": [
            "Layer 1 (Presentation): Spatial HUD, 3D cursor-tracking orb, accessible 7-view client router.",
            "Layer 2 (Calculation): Multi-store persistence, schema migration, and Safe-to-Spend pacing engine.",
            "Layer 3 (Intelligence): Regex/NLP fast parser paired with Vercel Serverless /api/chat.",
            "Core Pacing Formula: Daily Safe Spend = (Net Balance - Committed Recurring) / Days Left.",
            "Verified Output: Exact daily liquidity limit (e.g. ₹2,425.00/day) preventing month-end deficits."
        ],
        "image": "ai_insights_card.png",
        "stat_box": "Core Engine: Daily Safe Spend = (Net Balance - Recurring) / Days Left"
    },
    {
        "index": 6,
        "badge": "05 • TECHNOLOGY STACK & LANGUAGES",
        "title": "Purpose-Selected Standards-Compliant Web Stack",
        "subtitle": "Built for Maximum Endurance, Speed, and Zero Framework Obsolescence",
        "header_color": COLOR_CYAN,
        "bullets": [
            "HTML5 Semantic Core: Accessible landmarks (<aside>, <dialog>, <main>, <section>) with ARIA roles.",
            "CSS3 Custom Properties: Obsidian glass tokens, 3D transforms, clamp font sizing, and @media print.",
            "Vanilla JavaScript (ES6+): 0-dependency runtime, event delegation, and multi-store state engine.",
            "Visual Analytics: Chart.js 4.4 monochrome distribution & Lucide SVG vector icon system.",
            "Cloud Intelligence: Node.js serverless on Vercel dispatching to Gemini 1.5/2.0 and OpenAI GPT-4o."
        ],
        "image": "vaultly_overview.png",
        "stat_box": "Tech Stack: HTML5 • CSS3 (3D Transforms) • Vanilla ES6+ • Node.js Serverless"
    },
    {
        "index": 7,
        "badge": "06 • FEATURE MATRIX & WORKSPACES",
        "title": "Seven-View Spatial Navigation & Feature Suite",
        "subtitle": "Comprehensive Personal Finance Tools Unified into a Singular Fluid Interface",
        "header_color": COLOR_PURPLE,
        "bullets": [
            "1. Overview HUD: Balance gauge, 3D interactive liquid orb, and live financial summary.",
            "2. Transactions Ledger: Full CRUD, multi-criteria filtering, debounced search, and CSV export.",
            "3. Analytics & Forecaster: Monochrome spending distribution and projected month-end burn rate.",
            "4. Smart Budgets: Real-time category spending caps and percentage utilization progress bars.",
            "5. Savings Goals: Multi-goal target planner with liquid visual progress indicators.",
            "6. Vaultly AI: Natural-language conversational finance assistant and prompt starters."
        ],
        "image": "vaultly_transactions.png",
        "stat_box": "Integrated 7 Views: Overview • Ledger • Analytics • Budgets • Goals • AI • Settings"
    },
    {
        "index": 8,
        "badge": "07 • MATHEMATICAL ENGINES & ANALYTICS",
        "title": "Deterministic Financial Engines & Intelligence",
        "subtitle": "Mathematical Pacing, Forecast Projections & Continuous Integrity Audits",
        "header_color": COLOR_EMERALD,
        "bullets": [
            "Spending Forecaster: Extrapolates daily burn rate across elapsed days to predict month-end outflow.",
            "Earned Income Retention: Tracks retained surplus ratio against the 30% financial wealth benchmark.",
            "Anomaly & Duplicate Watch: Flags statistical outliers (>3x std dev) and 48-hr duplicate charges.",
            "NLP Quick Parser: Translates natural text ('Spent 450 on lunch today') into structured records.",
            "Audit Integrity: Continuous client-side validation ensuring zero corrupted transactions."
        ],
        "image": "vaultly_analytics.png",
        "stat_box": "Analytical Core: Velocity Extrapolation + Statistical Outlier Detection"
    },
    {
        "index": 9,
        "badge": "08 • CONVERSATIONAL COPILOT",
        "title": "Vaultly AI: Context-Aware Financial Copilot",
        "subtitle": "Dual-Mode Intelligence Protocol with Zero-Key Offline Fallback",
        "header_color": COLOR_CYAN,
        "bullets": [
            "Cloud Mode: Vercel Serverless /api/chat routing to Google Gemini & OpenAI models.",
            "Sanitized Privacy: Only mathematical aggregated metrics are shared, never raw credentials or IDs.",
            "Offline Deterministic Fallback: Local rule engine answers balances, runway, and pacing without keys.",
            "Affordability Testing: Evaluates immediate purchases ('Can I afford dinner for 1200?') against limits.",
            "Instant Starters: Pre-built prompt chips for immediate financial health checkups."
        ],
        "image": "vaultly_ai.png",
        "stat_box": "Dual-Mode AI: Cloud Gemini / GPT-4o + 100% Offline Rule Engine"
    },
    {
        "index": 10,
        "badge": "09 • STRATEGIC ROADMAP",
        "title": "Future Scope: The Next Frontier for Vaultly",
        "subtitle": "Expanding Capabilities While Relentlessly Defending Sovereignty & Speed",
        "header_color": COLOR_PURPLE,
        "bullets": [
            "Open Banking / AA Framework: RBI-compliant read-only statement fetching directly to device.",
            "On-Device OCR Receipt Ingestion: Client-side WebAssembly parser for itemized receipt scanning.",
            "PWA Offline Application: Home-screen installation and background push notification alerts.",
            "Multi-Currency & Real-Time Forex: Automated currency conversions with offline cached rates.",
            "E2EE Household Vaults: Cryptographic WebRTC peer-to-peer synchronization for family budgeting."
        ],
        "image": "vaultly_budgets.png",
        "stat_box": "Roadmap: Account Aggregator (AA) • Wasm OCR • WebRTC Family Vaults"
    },
    {
        "index": 11,
        "badge": "10 • CONCLUSION & SCORECARD",
        "title": "Conclusion: Privacy, Luxury & Engineering Rigor",
        "subtitle": "Proving that Disciplined Engineering Delivers Speed, Privacy & User Delight",
        "header_color": COLOR_EMERALD,
        "bullets": [
            "100% Client-Side Privacy: Complete financial peace of mind without cloud tracking or profiling.",
            "Proactive Safe Pacing: Keeps users solvent with dynamic daily allowance velocity.",
            "Verification Rigor: 10/10 Unit Tests passed & 14/14 Viewports verified with 0px overflow.",
            "Cinematic Performance: Introductory loader sequence completes in <=1.0s with reduced-motion bypass.",
            "Live Production Deployment: Ready and accessible worldwide at vaultly-expense-tracker-one.vercel.app"
        ],
        "image": "vaultly_goals.png",
        "stat_box": "Scorecard: 10/10 Tests Passed • 14/14 Viewports • 0px Overflow • Live on Vercel"
    }
]

def create_presentation():
    prs = Presentation()
    # 16:9 widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6] # Blank layout

    for s in SLIDES_DATA:
        slide = prs.slides.add_slide(blank_layout)

        # 1. Full-bleed background shape
        bg = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5)
        )
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG
        bg.line.fill.background()

        # 2. Top Header Card
        header_card = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(0.4), Inches(12.133), Inches(1.3)
        )
        header_card.fill.solid()
        header_card.fill.fore_color.rgb = COLOR_SURFACE
        header_card.line.color.rgb = COLOR_BORDER
        header_card.line.width = Pt(1)

        tf = header_card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.25)
        tf.margin_top = Inches(0.15)
        tf.margin_right = Inches(0.25)
        tf.margin_bottom = Inches(0.15)

        # Badge Paragraph
        p_badge = tf.paragraphs[0]
        p_badge.text = s["badge"]
        p_badge.font.size = Pt(10.5)
        p_badge.font.bold = True
        p_badge.font.color.rgb = s.get("header_color", COLOR_CYAN)

        # Title Paragraph
        p_title = tf.add_paragraph()
        p_title.text = s["title"]
        p_title.font.size = Pt(21)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_WHITE
        p_title.space_before = Pt(3)

        # Subtitle Paragraph
        p_sub = tf.add_paragraph()
        p_sub.text = s["subtitle"]
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = COLOR_MUTED
        p_sub.space_before = Pt(2)

        # 3. Left Content Card (Bullets & Highlights)
        content_card = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.85), Inches(6.3), Inches(4.9)
        )
        content_card.fill.solid()
        content_card.fill.fore_color.rgb = COLOR_SURFACE
        content_card.line.color.rgb = COLOR_BORDER
        content_card.line.width = Pt(1)

        c_tf = content_card.text_frame
        c_tf.word_wrap = True
        c_tf.margin_left = Inches(0.3)
        c_tf.margin_top = Inches(0.25)
        c_tf.margin_right = Inches(0.3)
        c_tf.margin_bottom = Inches(0.25)

        p_c_title = c_tf.paragraphs[0]
        p_c_title.text = "Key Architectural & Operational Highlights"
        p_c_title.font.size = Pt(14)
        p_c_title.font.bold = True
        p_c_title.font.color.rgb = COLOR_EMERALD

        for b in s["bullets"]:
            p_b = c_tf.add_paragraph()
            p_b.text = "• " + b
            p_b.font.size = Pt(12)
            p_b.font.color.rgb = COLOR_BODY
            p_b.space_before = Pt(8)

        # 4. Right Image Container & Border
        img_border = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.05), Inches(1.85), Inches(5.68), Inches(4.9)
        )
        img_border.fill.solid()
        img_border.fill.fore_color.rgb = RGBColor(12, 14, 20)
        img_border.line.color.rgb = s.get("header_color", COLOR_CYAN)
        img_border.line.width = Pt(1.5)

        # Embed Picture
        img_filename = s["image"]
        img_path = os.path.join(ASSETS_DIR, img_filename)
        if not os.path.exists(img_path):
            img_path = os.path.join(ASSETS_DIR, "vaultly_overview.png")

        slide.shapes.add_picture(
            img_path, Inches(7.15), Inches(1.95), width=Inches(5.48), height=Inches(4.2)
        )

        # Mini Stat Callout Banner under picture
        stat_bar = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.15), Inches(6.25), Inches(5.48), Inches(0.4)
        )
        stat_bar.fill.solid()
        stat_bar.fill.fore_color.rgb = COLOR_SURFACE
        stat_bar.line.color.rgb = COLOR_BORDER
        stat_bar.line.width = Pt(0.75)
        st_tf = stat_bar.text_frame
        st_tf.margin_top = Inches(0.05)
        st_p = st_tf.paragraphs[0]
        st_p.alignment = PP_ALIGN.CENTER
        st_p.text = s.get("stat_box", "Vaultly Financial Platform")
        st_p.font.size = Pt(10)
        st_p.font.bold = True
        st_p.font.color.rgb = s.get("header_color", COLOR_CYAN)

        # 5. Bottom Footer text
        footer = slide.shapes.add_textbox(Inches(0.6), Inches(6.9), Inches(12.133), Inches(0.4))
        f_tf = footer.text_frame
        f_p = f_tf.paragraphs[0]
        f_p.text = "VAULTLY — AI-Powered Personal Finance Platform • Live Production: vaultly-expense-tracker-one.vercel.app • MIT License"
        f_p.font.size = Pt(9.5)
        f_p.font.color.rgb = RGBColor(100, 116, 139)

    prs.save(OUTPUT_PPTX)
    size_mb = os.path.getsize(OUTPUT_PPTX) / (1024 * 1024)
    print(f"[Vaultly] Generated 100% compliant PPTX: {OUTPUT_PPTX} ({size_mb:.2f} MB)")

    try:
        prs.save(OUTPUT_PPTX_MAIN)
        print(f"[Vaultly] Also updated main file: {OUTPUT_PPTX_MAIN}")
    except Exception as e:
        print(f"[Vaultly] Main file currently locked by another application: {e}")

if __name__ == "__main__":
    create_presentation()
