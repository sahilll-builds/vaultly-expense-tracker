"""
Vaultly PPTX Generator
Pure Python Standard Library (No 3rd-party dependencies required).
Generates an ECMA-376 OpenXML PowerPoint (.pptx) file containing all 11 project slides
with Obsidian Glass aesthetic, dark theme styling, and actual embedded screenshots.
"""

import os
import io
import zipfile
import xml.etree.ElementTree as ET

BASE_DIR = r"C:\Users\sahil\.gemini\antigravity\scratch\vaultly-expense-tracker"
ASSETS_DIR = os.path.join(BASE_DIR, "presentation_assets")
OUTPUT_PPTX = os.path.join(BASE_DIR, "Vaultly_Presentation.pptx")

SLIDES_DATA = [
    {
        "index": 1,
        "title": "VAULTLY — AI-Powered Personal Finance Platform",
        "subtitle": "Your Money. Your Control. • Next-Gen Luxury Spatial Expense System",
        "bullets": [
            "Obsidian Glass Spatial UI with 3D Physics-Based Cursor Tilt Visualizer",
            "Zero External Client Dependencies (0-Dependency Vanilla ES6+ Runtime)",
            "Dual-Tier Conversational AI with Deterministic Zero-Key Offline Fallback",
            "Live Production on Vercel: vaultly-expense-tracker-one.vercel.app"
        ],
        "image": "vaultly_overview.png",
        "badge": "TITLE & HERO"
    },
    {
        "index": 2,
        "title": "Executive Introduction & Core Philosophy",
        "subtitle": "Bridging Sovereign Local-First Privacy with Luxury Spatial Aesthetics",
        "bullets": [
            "Data Sovereignty: All transaction ledgers and budgets remain 100% on the user's client.",
            "Sub-Millisecond Reactivity: Pure modern web standards without framework hydration delay.",
            "Visual Poise: Obsidian spatial canvas (#08090B) and high-contrast typographic hierarchy.",
            "Actionable Pacing: Solves money management before deficit happens through daily runway limits."
        ],
        "image": "vaultly_overview.png",
        "badge": "01 • INTRODUCTION"
    },
    {
        "index": 3,
        "title": "Problem Statement: 4 Modern Budgeting Crises",
        "subtitle": "Why Traditional Personal Finance Apps Fail Within 14 Days",
        "bullets": [
            "1. Invasive Privacy Monetization: Apps sell user spending data to advertisers and lenders.",
            "2. Cluttered Bloatware & Upselling: Essential tracking is buried under credit card ads.",
            "3. Cloud Latency & Network Fragility: Heavy client bundles lock up when offline.",
            "4. Passive Historical Post-Mortems: Charts only tell you where you failed two weeks ago."
        ],
        "image": "ai_insights_card.png",
        "badge": "02 • PROBLEM STATEMENT"
    },
    {
        "index": 4,
        "title": "Project Objectives & Technical Benchmarks",
        "subtitle": "Strict Measurable Goals Established for Uncompromising Quality",
        "bullets": [
            "Zero Dependencies: Complete finance platform in HTML5, CSS3, and Vanilla JavaScript.",
            "Deterministic Arithmetic: Mathematically verified balances with 0 floating-point rounding errors.",
            "Safe-to-Spend Daily Engine: Dynamic velocity formula calculating real-time daily spend limit.",
            "Universal Responsiveness: 14/14 distinct viewports verified with 0px horizontal overflow.",
            "Full Data Portability: 1-click JSON backup export and RFC 4180 compliant CSV ledger export."
        ],
        "image": "vaultly_overview.png",
        "badge": "03 • OBJECTIVES"
    },
    {
        "index": 5,
        "title": "The Solution: Obsidian Glass Spatial Architecture",
        "subtitle": "Three-Layer Architecture Engineered for Precision, Privacy & Speed",
        "bullets": [
            "Layer 1 (Presentation): Spatial HUD with glassmorphism cards and accessible 7-view router.",
            "Layer 2 (Calculation): Deterministic math core and Safe-to-Spend daily pacing algorithm.",
            "Layer 3 (Intelligence): Regex/NLP fast parser paired with Vercel Serverless /api/chat.",
            "Safe Velocity Formula: Daily Allowance = (Net Balance - Recurring Commitments) / Days Left."
        ],
        "image": "ai_insights_card.png",
        "badge": "04 • SOLUTION ARCHITECTURE"
    },
    {
        "index": 6,
        "title": "Technology Stack & Language Breakdown",
        "subtitle": "Purpose-Selected Standards-Compliant Web Technologies",
        "bullets": [
            "HTML5 Semantic Core: Accessible landmarks (<aside>, <dialog>, <main>) with ARIA roles.",
            "CSS3 Custom Properties: Obsidian glass tokens, 3D transforms, clamp font sizing, @media print.",
            "Vanilla JavaScript (ES6+): 0-dependency runtime, event delegation, multi-store state engine.",
            "Visualizations & Icons: Chart.js 4.4 monochrome distribution & Lucide SVG vector icons.",
            "Cloud Intelligence: Node.js serverless on Vercel dispatching to Gemini 1.5/2.0 and OpenAI GPT-4o."
        ],
        "image": "vaultly_overview.png",
        "badge": "05 • TECH STACK"
    },
    {
        "index": 7,
        "title": "Key Features & 7-View Spatial Navigation",
        "subtitle": "Seven Integrated Workspaces Unified in One Fluid Interface",
        "bullets": [
            "1. Overview HUD: Balance gauge, 3D interactive liquid orb, and live financial summary.",
            "2. Transactions Ledger: Full CRUD, multi-criteria filtering, search, and CSV export.",
            "3. Smart Budgets: Real-time category spending caps and percentage utilization bars.",
            "4. Savings Goals: Target savings planner with liquid visual progress indicators.",
            "5. Vaultly AI: Natural-language conversational financial assistant and prompt starters."
        ],
        "image": "vaultly_transactions.png",
        "badge": "06 • KEY FEATURES"
    },
    {
        "index": 8,
        "title": "Deterministic Financial Engines & Intelligence",
        "subtitle": "Mathematical Pacing, Forecast Projections & Integrity Audits",
        "bullets": [
            "Spending Forecaster: Extrapolates daily burn rate across elapsed days to predict month-end outflow.",
            "Earned Income Retention: Tracks retained surplus ratio against the 30% financial wealth benchmark.",
            "Anomaly & Duplicate Watch: Flags statistical outliers (>3x std dev) and 48-hr duplicate charges.",
            "NLP Quick Parser: Translates natural text ('Spent 450 on lunch today') into structured records."
        ],
        "image": "vaultly_analytics.png",
        "badge": "07 • FINANCIAL ENGINES"
    },
    {
        "index": 9,
        "title": "Vaultly AI: Conversational Copilot & Offline Resilience",
        "subtitle": "Dual-Mode Intelligence Protocol with Zero-Key Deterministic Fallback",
        "bullets": [
            "Cloud Mode: Vercel Serverless /api/chat routing to Google Gemini & OpenAI models.",
            "Sanitized Privacy: Only mathematical aggregated metrics are shared, never raw credentials.",
            "Offline Deterministic Fallback: Local rule engine answers balances, runway, and pacing without keys.",
            "Affordability Testing: Evaluates immediate purchases against daily safe-to-spend limits."
        ],
        "image": "vaultly_ai.png",
        "badge": "08 • VAULTLY AI ASSISTANT"
    },
    {
        "index": 10,
        "title": "Future Scope & Strategic Roadmap",
        "subtitle": "The Next Frontier for Vaultly Personal Wealth Management",
        "bullets": [
            "Open Banking / AA Framework: RBI-compliant read-only statement fetching directly to device.",
            "On-Device OCR Receipt Ingestion: Client-side WebAssembly parser for itemized receipt scanning.",
            "PWA Offline Application: Home-screen installation and background push notification alerts.",
            "Multi-Currency & Real-Time Forex: Automated currency conversions with offline cached rates.",
            "E2EE Household Vaults: Cryptographic WebRTC peer-to-peer synchronization for family budgeting."
        ],
        "image": "vaultly_budgets.png",
        "badge": "09 • FUTURE SCOPE"
    },
    {
        "index": 11,
        "title": "Project Conclusion & Verification Scorecard",
        "subtitle": "Proving that Disciplined Engineering Delivers Luxury, Speed & Privacy",
        "bullets": [
            "100% Client-Side Privacy: Complete financial peace of mind without cloud tracking.",
            "Proactive Safe Pacing: Keeps users solvent with dynamic daily allowance velocity.",
            "Verification Rigor: 10/10 Unit Tests passed & 14/14 Viewports verified with 0px overflow.",
            "Live Production Deployment: Ready and accessible worldwide at vaultly-expense-tracker-one.vercel.app"
        ],
        "image": "vaultly_goals.png",
        "badge": "10 • CONCLUSION"
    }
]

def build_pptx():
    print("[Vaultly] Generating Vaultly_Presentation.pptx via pure Python standard library...")

    # Validate assets
    for s in SLIDES_DATA:
        img_path = os.path.join(ASSETS_DIR, s["image"])
        if not os.path.exists(img_path):
            print(f"Warning: Image missing {img_path}, using fallback overview")
            s["image"] = "vaultly_overview.png"

    # Slide dimensions: 16:9 widescreen in EMUs (1 inch = 914400 EMUs)
    # Width: 13.333 inches = 12192000 EMUs, Height: 7.5 inches = 6858000 EMUs
    SLIDE_WIDTH = 12192000
    SLIDE_HEIGHT = 6858000

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as z:
        # 1. [Content_Types].xml
        content_types = [
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
            '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
            '  <Default Extension="xml" ContentType="application/xml"/>',
            '  <Default Extension="png" ContentType="image/png"/>',
            '  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>',
            '  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>',
            '  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>',
            '  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>'
        ]
        for i in range(1, len(SLIDES_DATA) + 1):
            content_types.append(f'  <Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>')
        content_types.append('</Types>')
        z.writestr("[Content_Types].xml", "\n".join(content_types))

        # 2. _rels/.rels
        rels = [
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
            '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>',
            '</Relationships>'
        ]
        z.writestr("_rels/.rels", "\n".join(rels))

        # 3. ppt/presentation.xml
        pres_xml = [
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
            '<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">',
            f'  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/></p:sldMasterIdLst>',
            '  <p:sldIdLst>'
        ]
        for i in range(1, len(SLIDES_DATA) + 1):
            pres_xml.append(f'    <p:sldId id="{255 + i}" r:id="rId{i + 1}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>')
        pres_xml.extend([
            '  </p:sldIdLst>',
            f'  <p:sldSz cx="{SLIDE_WIDTH}" cy="{SLIDE_HEIGHT}" type="screen16x9"/>',
            '  <p:notesSz cx="6858000" cy="9144000"/>',
            '</p:presentation>'
        ])
        z.writestr("ppt/presentation.xml", "\n".join(pres_xml))

        # 4. ppt/_rels/presentation.xml.rels
        pres_rels = [
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
            '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>'
        ]
        for i in range(1, len(SLIDES_DATA) + 1):
            pres_rels.append(f'  <Relationship Id="rId{i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>')
        pres_rels.append('</Relationships>')
        z.writestr("ppt/_rels/presentation.xml.rels", "\n".join(pres_rels))

        # 5. ppt/theme/theme1.xml (Dark Obsidian Palette)
        theme_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Obsidian Glass Theme">
  <a:themeElements>
    <a:clrScheme name="Obsidian">
      <a:dk1><a:srgbClr val="07080A"/></a:dk1>
      <a:lt1><a:srgbClr val="F8FAFC"/></a:lt1>
      <a:dk2><a:srgbClr val="0E1015"/></a:dk2>
      <a:lt2><a:srgbClr val="94A3B8"/></a:lt2>
      <a:accent1><a:srgbClr val="38BDF8"/></a:accent1>
      <a:accent2><a:srgbClr val="10B981"/></a:accent2>
      <a:accent3><a:srgbClr val="A855F7"/></a:accent3>
      <a:accent4><a:srgbClr val="F59E0B"/></a:accent4>
      <a:accent5><a:srgbClr val="F43F5E"/></a:accent5>
      <a:accent6><a:srgbClr val="64748B"/></a:accent6>
      <a:hlink><a:srgbClr val="38BDF8"/></a:hlink>
      <a:folHlink><a:srgbClr val="10B981"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="ObsidianFonts">
      <a:majorFont><a:latin typeface="Space Grotesk"/></a:majorFont>
      <a:minorFont><a:latin typeface="Inter"/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="ObsidianFormat">
      <a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
      <a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
      <a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
      <a:bgFillStyleLst><a:solidFill><a:srgbClr val="07080A"/></a:solidFill></a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>"""
        z.writestr("ppt/theme/theme1.xml", theme_xml)

        # 6. ppt/slideMasters/slideMaster1.xml
        master_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="07080A"/></a:solidFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="dk1" tx1="lt1" bg2="dk2" tx2="lt2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
</p:sldMaster>"""
        z.writestr("ppt/slideMasters/slideMaster1.xml", master_xml)

        # ppt/slideMasters/_rels/slideMaster1.xml.rels
        master_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>"""
        z.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", master_rels)

        # 7. ppt/slideLayouts/slideLayout1.xml
        layout_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
</p:sldLayout>"""
        z.writestr("ppt/slideLayouts/slideLayout1.xml", layout_xml)

        # ppt/slideLayouts/_rels/slideLayout1.xml.rels
        layout_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>"""
        z.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", layout_rels)

        # Embed Images into ppt/media/
        unique_images = list({s["image"] for s in SLIDES_DATA})
        img_id_map = {}
        for idx, img_name in enumerate(unique_images):
            img_file_path = os.path.join(ASSETS_DIR, img_name)
            media_name = f"image{idx + 1}.png"
            img_id_map[img_name] = media_name
            with open(img_file_path, "rb") as f:
                z.writestr(f"ppt/media/{media_name}", f.read())

        # 8. Generate each slide XML and its relationship
        for s in SLIDES_DATA:
            idx = s["index"]
            img_name = s["image"]
            media_name = img_id_map[img_name]

            # Slide Relationship
            slide_rels = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/{media_name}"/>
</Relationships>"""
            z.writestr(f"ppt/slides/_rels/slide{idx}.xml.rels", slide_rels)

            # Build Bullet XML
            bullet_xml = []
            for b in s["bullets"]:
                bullet_xml.append(f"""          <a:p>
            <a:pPr marL="288000" indent="-288000">
              <a:buClr><a:srgbClr val="38BDF8"/></a:buClr>
              <a:buChar char="●"/>
            </a:pPr>
            <a:r>
              <a:rPr lang="en-US" sz="1500" b="0">
                <a:solidFill><a:srgbClr val="CBD5E1"/></a:solidFill>
              </a:rPr>
              <a:t>{escape_xml(b)}</a:t>
            </a:r>
          </a:p>""")
            bullets_joined = "\n".join(bullet_xml)

            # Slide XML
            slide_content = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="07080A"/></a:solidFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>

      <!-- Top Header Glass Panel -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="HeaderBox"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="609600" y="457200"/><a:ext cx="10972800" cy="1188720"/></a:xfrm>
          <a:solidFill><a:srgbClr val="0E1015"/></a:solidFill>
          <a:ln w="12700"><a:solidFill><a:srgbClr val="1E293B"/></a:solidFill></a:ln>
          <a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 8000"/></a:avLst></a:prstGeom>
        </p:spPr>
        <p:txBody>
          <a:bodyPr lIns="216000" tIns="144000" rIns="216000" bIns="144000"/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="1100" b="1">
                <a:solidFill><a:srgbClr val="38BDF8"/></a:solidFill>
              </a:rPr>
              <a:t>{escape_xml(s['badge'])}</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="2400" b="1">
                <a:solidFill><a:srgbClr val="F8FAFC"/></a:solidFill>
              </a:rPr>
              <a:t>{escape_xml(s['title'])}</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="1300">
                <a:solidFill><a:srgbClr val="94A3B8"/></a:solidFill>
              </a:rPr>
              <a:t>{escape_xml(s['subtitle'])}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

      <!-- Left Content / Bullet Points Card -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="ContentBox"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="609600" y="1828800"/><a:ext cx="5760000" cy="4572000"/></a:xfrm>
          <a:solidFill><a:srgbClr val="11141C"/></a:solidFill>
          <a:ln w="12700"><a:solidFill><a:srgbClr val="1E293B"/></a:solidFill></a:ln>
          <a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 6000"/></a:avLst></a:prstGeom>
        </p:spPr>
        <p:txBody>
          <a:bodyPr lIns="252000" tIns="252000" rIns="252000" bIns="252000"/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="1600" b="1">
                <a:solidFill><a:srgbClr val="10B981"/></a:solidFill>
              </a:rPr>
              <a:t>Key Architectural Highlights</a:t>
            </a:r>
          </a:p>
          <a:p><a:endParaRPr sz="1000"/></a:p>
{bullets_joined}
        </p:txBody>
      </p:sp>

      <!-- Right Picture Mockup Card (Actual Project Screenshot) -->
      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="4" name="ProjectScreenshot"/>
          <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="rId2"/>
          <a:stretch><a:fillRect/></a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm><a:off x="6629400" y="1828800"/><a:ext cx="4953000" cy="4572000"/></a:xfrm>
          <a:ln w="19050"><a:solidFill><a:srgbClr val="38BDF8"/></a:solidFill></a:ln>
          <a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 5000"/></a:avLst></a:prstGeom>
        </p:spPr>
      </p:pic>

      <!-- Footer Bar -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="5" name="FooterBox"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="609600" y="6492240"/><a:ext cx="10972800" cy="274320"/></a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr lIns="0" tIns="0" rIns="0" bIns="0"/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="1000">
                <a:solidFill><a:srgbClr val="64748B"/></a:solidFill>
              </a:rPr>
              <a:t>Vaultly • AI-Powered Personal Finance Platform | Live Production: vaultly-expense-tracker-one.vercel.app</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

    </p:spTree>
  </p:cSld>
</p:sld>"""
            z.writestr(f"ppt/slides/slide{idx}.xml", slide_content)

    # Write output PPTX file
    with open(OUTPUT_PPTX, "wb") as f:
        f.write(zip_buffer.getvalue())

    size_kb = os.path.getsize(OUTPUT_PPTX) / 1024
    print(f"[Vaultly] Successfully generated {OUTPUT_PPTX} ({size_kb:.1f} KB) with {len(SLIDES_DATA)} slides!")

def escape_xml(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("'", "&apos;")

if __name__ == "__main__":
    build_pptx()
