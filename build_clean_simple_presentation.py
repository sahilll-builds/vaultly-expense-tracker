"""
Vaultly Clean & Simple Presentation Generator
Generates a clean, simple, 100% schema-compliant 14-slide PowerPoint (.pptx) file
WITHOUT animations, using the user's exact text outline and actual website screenshots.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

BASE_DIR = r"C:\Users\sahil\.gemini\antigravity\scratch\vaultly-expense-tracker"
ASSETS_DIR = os.path.join(BASE_DIR, "presentation_assets")
OUTPUT_PPTX = os.path.join(BASE_DIR, "Vaultly_Presentation.pptx")
OUTPUT_FIXED_PPTX = os.path.join(BASE_DIR, "Vaultly_Presentation_Fixed.pptx")

# Elegant, clean, professional dark palette
COLOR_BG = RGBColor(12, 14, 20)          # Clean deep canvas #0C0E14
COLOR_SURFACE = RGBColor(20, 24, 34)     # Clean card #141822
COLOR_BORDER = RGBColor(38, 44, 60)      # Clean subtle border #262C3C
COLOR_WHITE = RGBColor(255, 255, 255)    # Pure white #FFFFFF
COLOR_TEXT_MAIN = RGBColor(241, 245, 249)# Off-white text #F1F5F9
COLOR_MUTED = RGBColor(148, 163, 184)    # Slate muted #94A3B8
COLOR_BODY = RGBColor(218, 226, 237)     # Crisp body text #DAE2ED
COLOR_ACCENT = RGBColor(56, 189, 248)    # Clean Sky Cyan #38BDF8
COLOR_EMERALD = RGBColor(16, 185, 129)   # Mint Emerald #10B981
COLOR_AMBER = RGBColor(245, 158, 11)     # Amber #F59E0B

SLIDES = [
    # 01: Title
    {
        "slide_num": "01",
        "badge": "FINANCE / 01 • PROJECT PRESENTATION",
        "title": "VAULTLY",
        "subtitle": "Your money. Your control. • A modern personal finance management web application",
        "left_title": "Project Summary",
        "bullets": [
            "A modern personal finance and expense management web application.",
            "Designed to give users clear visibility and sovereign control over their daily cash flow.",
            "Combines income/expense tracking, category budgets, savings goals, and AI assistance.",
            "Hosted on Vercel with zero required third-party trackers or data selling.",
            "Presented by Sahil Pawar • AI & Data Science",
            "Live demo: vaultly-expense-tracker-one.vercel.app"
        ],
        "image": "vaultly_overview.png",
        "caption": "Vaultly Live Dashboard Overview • vaultly-expense-tracker-one.vercel.app"
    },
    # 02: Introduction
    {
        "slide_num": "02",
        "badge": "01 / INTRODUCTION • VAULTLY",
        "title": "Meet Vaultly",
        "subtitle": "A focused workspace for understanding personal cash flow.",
        "left_title": "Core Functional Pillars",
        "bullets": [
            "Track: Record income and expenses in one place with instant categorization.",
            "Understand: Turn recorded entries into readable financial summaries and runway insights.",
            "Plan: Use category budgets and savings targets to guide informed everyday decisions.",
            "The Core Idea: When financial information is organized, everyday money decisions become easier to review.",
            "Sections: The live site includes an overview, transactions, analytics, budgets, goals, Vaultly AI, and settings."
        ],
        "image": "vaultly_overview.png",
        "caption": "Live Workspace Interface • Focused on Financial Clarity"
    },
    # 03: The Problem
    {
        "slide_num": "03",
        "badge": "02 / THE PROBLEM • VAULTLY",
        "title": "Why expense tracking matters",
        "subtitle": "Small daily decisions can be hard to understand without a clear record.",
        "left_title": "Current Challenges in Personal Finance",
        "bullets": [
            "Scattered records: Spending details may be spread across notes, messages, bank SMS, and memory.",
            "Low visibility: It is easy to lose sight of total income, true expenses, and real remaining balance.",
            "Hard to spot patterns: Without categories and summaries, repeated spending leaks can be difficult to notice.",
            "Planning feels abstract: Budgets and goals are much easier to follow when visual progress is visible.",
            "Vaultly's approach: Bring the transaction records and the financial overview together in one interface."
        ],
        "image": "ai_insights_card.png",
        "caption": "Safe Liquidity & Financial Pattern Intelligence • Verified Data"
    },
    # 04: Objectives
    {
        "slide_num": "04",
        "badge": "03 / OBJECTIVES • VAULTLY",
        "title": "Project objectives",
        "subtitle": "Designed around clarity, control, and practical financial awareness.",
        "left_title": "Key Engineering & Usability Goals",
        "bullets": [
            "01 Centralize records: Keep all income and expense entries organized in one place.",
            "02 Summarize cash flow: Clearly show net balance, total income, expenses, and savings rate.",
            "03 Support planning: Set category budgets, recurring commitments, and savings goals.",
            "04 Make insights readable: Use category breakdowns and forward-looking monthly estimates.",
            "05 Respect local privacy: Keep financial records in browser storage, as described by the site.",
            "06 Offer an AI assistant: Provide a conversational entry point for questions and guidance."
        ],
        "image": "vaultly_overview.png",
        "caption": "Live Application Objectives • Built for Practical Usability"
    },
    # 05: Product Tour
    {
        "slide_num": "05",
        "badge": "04 / PRODUCT TOUR • VAULTLY",
        "title": "Inside the Vaultly interface",
        "subtitle": "The live application organizes its tools into clear sections.",
        "left_title": "Interface Architecture & Structure",
        "bullets": [
            "Live URL: vaultly-expense-tracker-one.vercel.app",
            "Navigation: Overview, Transactions, Analytics, Budgets, Goals, Vaultly AI, Settings.",
            "Core Summary HUD: Net Balance, Total Income, Total Expenses, and Active Savings Rate.",
            "Quick actions: Add a transaction, ask AI, export records, or load demo data.",
            "Designed for clarity: Dark interface, concise labels, and finance-focused information.",
            "Illustrative layout based on live page text; current empty-state values shown."
        ],
        "image": "vaultly_overview.png",
        "caption": "Vaultly Live Application Interface • Overview Section"
    },
    # 06: Features
    {
        "slide_num": "06",
        "badge": "05 / FEATURES • VAULTLY",
        "title": "What Vaultly can do",
        "subtitle": "Feature areas visible in the live application.",
        "left_title": "Complete Functional Feature Set",
        "bullets": [
            "Transactions: Add income or expense entries; search, filter, edit, and export records.",
            "Analytics: View spending by category and an end-of-month projected spending estimate.",
            "Smart budgets: Set monthly spending caps by category with visual progress bars.",
            "Savings goals: Create target goals and record contributions toward them over time.",
            "Recurring bills: Track monthly subscriptions and regular financial commitments.",
            "Vaultly AI: Open a conversational assistant for finance and general assistance.",
            "Data controls: Export JSON backups, load sample data, or reset local records.",
            "Local currency: Display financial amounts in Indian rupees (₹ INR)."
        ],
        "image": "vaultly_transactions.png",
        "caption": "Transactions Ledger • Full CRUD, Filtering, Search & Export"
    },
    # 07: User Experience
    {
        "slide_num": "07",
        "badge": "06 / USER EXPERIENCE • VAULTLY",
        "title": "A dashboard built for quick understanding",
        "subtitle": "The overview puts key money metrics before detailed records.",
        "left_title": "Hierarchy & Information Flow",
        "bullets": [
            "NET BALANCE: Income − expenses (Overall available capital).",
            "TOTAL INCOME: Money received across all active revenue streams.",
            "TOTAL EXPENSES: Money spent across essential and discretionary categories.",
            "SAVINGS RATE: Share of earned income retained as surplus.",
            "A simple reading order: 1. Check balance → 2. Review cash flow → 3. Spot spending patterns.",
            "UX Principle: Show the most useful summary first, then let the user move into detailed transactions."
        ],
        "image": "vaultly_overview.png",
        "caption": "Dashboard Information Hierarchy • Key Metrics First"
    },
    # 08: Technology
    {
        "slide_num": "08",
        "badge": "07 / TECHNOLOGY • VAULTLY",
        "title": "Technology and implementation",
        "subtitle": "Confirmed deployment and storage details separated from unverified internals.",
        "left_title": "Implementation & Engineering Stack",
        "bullets": [
            "Deployment: Hosted on Vercel, based on the live production URL.",
            "Data storage: The interface states that records are stored locally in the browser.",
            "Currency formatting: Formatted for Indian rupees using Intl.NumberFormat('en-IN').",
            "Confirmed from repository code:",
            "  • Semantic HTML5 structure and CSS3 custom properties (Obsidian theme).",
            "  • Vanilla JavaScript (ES6+) zero-dependency client logic.",
            "  • Chart.js 4.4 for monochrome spending breakdown visualization.",
            "  • Node.js Vercel Serverless (/api/chat) for dual-mode AI integration."
        ],
        "image": "vaultly_analytics.png",
        "caption": "Analytics Visualization & Responsive Layout Implementation"
    },
    # 09: Architecture
    {
        "slide_num": "09",
        "badge": "08 / ARCHITECTURE • VAULTLY",
        "title": "How the data flow is organized",
        "subtitle": "A simplified view based on the site's stated client-side storage model.",
        "left_title": "Data Flow Pipeline",
        "bullets": [
            "USER: Enters or reviews transactions, budgets, goals, and inquiries.",
            "WEB APP: Validates inputs, calculates balances, and runs formatting routines.",
            "BROWSER STORAGE: Keeps records safely inside client localStorage multi-store.",
            "DASHBOARD: Displays live summaries, visual charts, and actionable pacing.",
            "Privacy Model: Financial data stays in local browser storage; no external database is indicated.",
            "Architecture is conceptual and grounded in confirmed repository code."
        ],
        "image": "vaultly_overview.png",
        "caption": "Sovereign Client-Side Data Flow • Browser-First Model"
    },
    # 10: Workflow
    {
        "slide_num": "10",
        "badge": "09 / WORKFLOW • VAULTLY",
        "title": "From entry to insight",
        "subtitle": "A typical workflow for using a personal expense tracker.",
        "left_title": "Four-Stage User Journey",
        "bullets": [
            "01 Record: Enter transaction type (income/expense), title, amount, category, and date.",
            "02 Organize: Search or filter records by category, type, and group expenses logically.",
            "03 Review: Read totals, category spending breakdowns, and month-end estimates.",
            "04 Plan: Adjust budget limits, create savings goals, and track committed recurring bills.",
            "Quality Note: The quality of insights depends on the quality and completeness of transactions entered."
        ],
        "image": "vaultly_transactions.png",
        "caption": "Transaction Logging & Record Management Workflow"
    },
    # 11: Analytics
    {
        "slide_num": "11",
        "badge": "10 / ANALYTICS • VAULTLY",
        "title": "Make spending easier to read",
        "subtitle": "Visual summaries can turn a list of transactions into useful context.",
        "left_title": "Analytical Capabilities",
        "bullets": [
            "Category breakdown: Helps users easily see where recorded spending is concentrated.",
            "Example categories: Food & Dining, Transport, Bills & Utilities, Shopping, Entertainment.",
            "Month-end estimate: Projects total monthly spending from current daily spending velocity.",
            "Financial report: Provides a consolidated summary of inflows and outflows for the month.",
            "Forecasts are estimates, not guarantees; they depend on recorded data and assumptions."
        ],
        "image": "vaultly_analytics.png",
        "caption": "Spending Breakdown & End-of-Month Outflow Forecaster"
    },
    # 12: Trust & Performance
    {
        "slide_num": "12",
        "badge": "11 / TRUST & PERFORMANCE • VAULTLY",
        "title": "Privacy, usability, and performance",
        "subtitle": "A good finance tool should be understandable, responsive, and transparent.",
        "left_title": "Operational Trust Factors",
        "bullets": [
            "Local-first data: The website confirms that financial records remain in local browser storage.",
            "Backup controls: Users can export a complete JSON backup of records, budgets, and goals.",
            "Responsive experience: The interface remains usable across mobile, tablet, and desktop screens.",
            "Responsible claims to remember:",
            "  • Local storage is not the same as encrypted cloud backup; export backups periodically.",
            "  • Do not enter sensitive credentials or secrets into an AI chat assistant.",
            "  • Test data export, reset, and recovery flows before relying exclusively on local records."
        ],
        "image": "vaultly_budgets.png",
        "caption": "Smart Budgets View • Transparent Utilization Caps"
    },
    # 13: Next Steps
    {
        "slide_num": "13",
        "badge": "12 / NEXT STEPS • VAULTLY",
        "title": "Challenges and future scope",
        "subtitle": "Potential improvements that can make Vaultly more useful over time.",
        "left_title": "Evolution & Phased Roadmap",
        "bullets": [
            "Current design considerations: Local-only data needs clear backup guidance; analytics depend on entry consistency.",
            "Potential enhancements: Optional secure sync, scheduled reminders, richer filters, recurring automation.",
            "NOW: Verify core tracking, calculations, and responsive layout across devices.",
            "NEXT: Improve automated test coverage, accessibility standards (WCAG), and error handling.",
            "LATER: Explore opt-in secure sync, receipt scanning, and advanced multi-month comparisons.",
            "Future scope items are proposals, not claims about current functionality."
        ],
        "image": "vaultly_goals.png",
        "caption": "Savings Goals Tracker • Future Planning Interface"
    },
    # 14: Conclusion
    {
        "slide_num": "14",
        "badge": "CONCLUSION • VAULTLY",
        "title": "Understand your spending. Take control of your finances.",
        "subtitle": "Vaultly brings transactions, summaries, budgets, goals, bills, and AI into one interface.",
        "left_title": "Final Summary & Acknowledgements",
        "bullets": [
            "Brings transaction records, summaries, budgets, goals, recurring bills, and an AI assistant together.",
            "Clean dark aesthetic designed for cognitive focus and fast understanding.",
            "Transparent client-side architecture respecting user privacy and data sovereignty.",
            "THANK YOU",
            "Presented by Sahil Pawar • AI & Data Science",
            "Live project: https://vaultly-expense-tracker-one.vercel.app/"
        ],
        "image": "vaultly_ai.png",
        "caption": "Vaultly AI Assistant • Natural Language Financial Dialogue"
    }
]

def generate_presentation():
    print("[Vaultly] Initializing clean 14-slide presentation...")
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    for s in SLIDES:
        slide = prs.slides.add_slide(blank_layout)

        # 1. Full-bleed background shape (Clean solid dark)
        bg = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5)
        )
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG
        bg.line.fill.background()

        # 2. Header Container
        header_box = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(0.4), Inches(12.133), Inches(1.25)
        )
        header_box.fill.solid()
        header_box.fill.fore_color.rgb = COLOR_SURFACE
        header_box.line.color.rgb = COLOR_BORDER
        header_box.line.width = Pt(1)

        htf = header_box.text_frame
        htf.word_wrap = True
        htf.margin_left = Inches(0.25)
        htf.margin_top = Inches(0.12)
        htf.margin_right = Inches(0.25)
        htf.margin_bottom = Inches(0.12)

        # Badge
        p_badge = htf.paragraphs[0]
        p_badge.text = s["badge"]
        p_badge.font.size = Pt(10)
        p_badge.font.bold = True
        p_badge.font.color.rgb = COLOR_ACCENT

        # Title
        p_title = htf.add_paragraph()
        p_title.text = s["title"]
        p_title.font.size = Pt(20)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_WHITE
        p_title.space_before = Pt(2)

        # Subtitle
        p_sub = htf.add_paragraph()
        p_sub.text = s["subtitle"]
        p_sub.font.size = Pt(11.5)
        p_sub.font.color.rgb = COLOR_MUTED
        p_sub.space_before = Pt(2)

        # 3. Left Text Content Card
        content_box = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(1.8), Inches(6.35), Inches(4.95)
        )
        content_box.fill.solid()
        content_box.fill.fore_color.rgb = COLOR_SURFACE
        content_box.line.color.rgb = COLOR_BORDER
        content_box.line.width = Pt(1)

        ctf = content_box.text_frame
        ctf.word_wrap = True
        ctf.margin_left = Inches(0.28)
        ctf.margin_top = Inches(0.22)
        ctf.margin_right = Inches(0.28)
        ctf.margin_bottom = Inches(0.22)

        p_ctitle = ctf.paragraphs[0]
        p_ctitle.text = s["left_title"]
        p_ctitle.font.size = Pt(13.5)
        p_ctitle.font.bold = True
        p_ctitle.font.color.rgb = COLOR_EMERALD

        for b in s["bullets"]:
            pb = ctf.add_paragraph()
            pb.text = "• " + b
            pb.font.size = Pt(11.5)
            pb.font.color.rgb = COLOR_BODY
            pb.space_before = Pt(6)

        # 4. Right Image Frame (Actual Website Image)
        img_frame = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.1), Inches(1.8), Inches(5.633), Inches(4.95)
        )
        img_frame.fill.solid()
        img_frame.fill.fore_color.rgb = RGBColor(15, 18, 26)
        img_frame.line.color.rgb = COLOR_BORDER
        img_frame.line.width = Pt(1)

        # Embed Picture
        img_name = s.get("image", "vaultly_overview.png")
        img_path = os.path.join(ASSETS_DIR, img_name)
        if not os.path.exists(img_path):
            img_path = os.path.join(ASSETS_DIR, "vaultly_overview.png")

        slide.shapes.add_picture(
            img_path, Inches(7.2), Inches(1.9), width=Inches(5.433), height=Inches(4.25)
        )

        # Caption Bar beneath Image
        caption_box = slide.shapes.add_textbox(Inches(7.2), Inches(6.25), Inches(5.433), Inches(0.4))
        cpt_tf = caption_box.text_frame
        cpt_tf.margin_top = Inches(0.02)
        cpt_p = cpt_tf.paragraphs[0]
        cpt_p.alignment = PP_ALIGN.CENTER
        cpt_p.text = s.get("caption", "Vaultly Web Application Interface")
        cpt_p.font.size = Pt(10)
        cpt_p.font.bold = True
        cpt_p.font.color.rgb = COLOR_ACCENT

        # 5. Clean Bottom Footer
        footer_box = slide.shapes.add_textbox(Inches(0.6), Inches(6.9), Inches(12.133), Inches(0.35))
        ftf = footer_box.text_frame
        fp = ftf.paragraphs[0]
        fp.text = f"VAULTLY • Slide {s['slide_num']} of 14 • Presented by Sahil Pawar • Live Demo: vaultly-expense-tracker-one.vercel.app"
        fp.font.size = Pt(9.5)
        fp.font.color.rgb = COLOR_MUTED

    # Save to both file names
    prs.save(OUTPUT_PPTX)
    print(f"[Vaultly] Saved clean presentation to: {OUTPUT_PPTX}")
    try:
        prs.save(OUTPUT_FIXED_PPTX)
        print(f"[Vaultly] Also saved to: {OUTPUT_FIXED_PPTX}")
    except Exception as e:
        print(f"[Vaultly] Note on secondary file: {e}")

if __name__ == "__main__":
    generate_presentation()
