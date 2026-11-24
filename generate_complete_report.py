# -*- coding: utf-8 -*-
"""
Complete Academic Mini Project Report Generator for:
VAULTLY: AN AI-POWERED PERSONAL EXPENSE TRACKER AND FINANCE MANAGEMENT SYSTEM
Department of Artificial Intelligence & Data Science
Dr. J. J. Magdum College of Engineering, Jaysingpur
Academic Year 2026 - 2027 (Sem 3)
Author: Sahil Pawar (Roll No: 42)
"""

import os
import zipfile
from xml.sax.saxutils import escape

BASE_DIR = r"C:\Users\sahil\.gemini\antigravity\scratch\vaultly-expense-tracker"
UPLOADED_DOCX = r"C:\Users\sahil\.gemini\antigravity\brain\ad82c620-4b5a-4556-b047-84e26c7b143f\.user_uploaded\media_1793167414382_4546a302.docx"
OUTPUT_DOCX = os.path.join(BASE_DIR, "Vaultly_Mini_Project_Report.docx")
OUTPUT_HTML = os.path.join(BASE_DIR, "Vaultly_Mini_Project_Report.html")

def p(text="", style=None, align=None, bold=False, italic=False, underline=False, font_size=24, space_after=120, line_spacing=360, page_break=False):
    pPr = []
    if style: pPr.append(f'<w:pStyle w:val="{style}"/>')
    if align: pPr.append(f'<w:jc w:val="{align}"/>')
    if space_after or line_spacing: pPr.append(f'<w:spacing w:after="{space_after}" w:line="{line_spacing}" w:lineRule="auto"/>')
    if page_break: pPr.append('<w:pageBreakBefore/>')
    pPr_xml = f'<w:pPr>{"".join(pPr)}</w:pPr>' if pPr else ''
    if not text: return f'<w:p>{pPr_xml}</w:p>'
    rPr = ['<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>']
    if bold: rPr.append('<w:b/>')
    if italic: rPr.append('<w:i/>')
    if underline: rPr.append('<w:u w:val="single"/>')
    if font_size: rPr.append(f'<w:sz w:val="{font_size}"/>')
    rPr_xml = f'<w:rPr>{"".join(rPr)}</w:rPr>'
    return f'<w:p>{pPr_xml}<w:r>{rPr_xml}<w:t xml:space="preserve">{escape(text)}</w:t></w:r></w:p>'

def h1(text, page_break=True):
    return p(text, style="Heading1", align="left", bold=True, font_size=30, space_after=180, line_spacing=380, page_break=page_break)

def h2(text):
    return p(text, style="Heading2", align="left", bold=True, font_size=26, space_after=140, line_spacing=360)

def h3(text):
    return p(text, style="Heading3", align="left", bold=True, italic=True, font_size=24, space_after=100, line_spacing=320)

def body(text):
    return p(text, align="both", font_size=24, space_after=120, line_spacing=360)

def bullet(text):
    return f'''<w:p><w:pPr><w:pStyle w:val="ListBullet"/><w:spacing w:after="80" w:line="320" w:lineRule="auto"/><w:ind w:left="720" w:hanging="360"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr><w:t xml:space="preserve">•  {escape(text)}</w:t></w:r></w:p>'''

def code_box(code_lines):
    out = []
    for line in code_lines:
        out.append(f'''<w:p><w:pPr><w:shd w:val="clear" w:color="auto" w:fill="F8F9FA"/><w:spacing w:after="40" w:line="240" w:lineRule="auto"/><w:ind w:left="400" w:right="400"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="18"/><w:color w:val="1E293B"/></w:rPr><w:t xml:space="preserve">{escape(line)}</w:t></w:r></w:p>''')
    return "".join(out)

def table(headers, rows, col_widths=None):
    tbl = ['<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/><w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/></w:tblBorders><w:jc w:val="center"/></w:tblPr>']
    tbl.append('<w:tr><w:trPr><w:tblHeader/></w:trPr>')
    for i, h in enumerate(headers):
        w_dxa = col_widths[i] if col_widths and i < len(col_widths) else int(9360 / len(headers))
        tbl.append(f'''<w:tc><w:tcPr><w:tcW w:w="{w_dxa}" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/><w:tcMar><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:left w:w="160" w:type="dxa"/><w:right w:w="160" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>{escape(h)}</w:t></w:r></w:p></w:tc>''')
    tbl.append('</w:tr>')
    for row in rows:
        tbl.append('<w:tr>')
        for i, val in enumerate(row):
            w_dxa = col_widths[i] if col_widths and i < len(col_widths) else int(9360 / len(headers))
            align = "center" if (i == 0 or len(str(val)) <= 6) else "left"
            tbl.append(f'''<w:tc><w:tcPr><w:tcW w:w="{w_dxa}" w:type="dxa"/><w:tcMar><w:top w:w="100" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:left w:w="160" w:type="dxa"/><w:right w:w="160" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="{align}"/><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="22"/></w:rPr><w:t>{escape(str(val))}</w:t></w:r></w:p></w:tc>''')
        tbl.append('</w:tr>')
    tbl.append('</w:tbl>')
    tbl.append(p('', space_after=120))
    return "".join(tbl)

print("Generator skeleton loaded.")
