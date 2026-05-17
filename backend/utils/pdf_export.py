# Generates a professional PDF report of analysis results using ReportLab.
# Includes: summary, exchange rate used, results from all 5 techniques,
# and the Fraud Type-Technique Performance Matrix.

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import io

def generate_pdf_report(results: dict, username: str) -> bytes:
    """
    Generates a complete PDF forensic analytics report.
    Returns the PDF as bytes so FastAPI can stream it to the browser.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    elements = []

    # Colour definitions
    dark_blue = colors.HexColor("#1a2744")
    medium_blue = colors.HexColor("#2c4a8c")
    light_blue = colors.HexColor("#e8eef7")
    red = colors.HexColor("#c0392b")
    green = colors.HexColor("#27ae60")
    amber = colors.HexColor("#e67e22")
    light_grey = colors.HexColor("#f5f5f5")

    def risk_color(risk):
        return red if risk == "HIGH" else amber if risk == "MEDIUM" else green

    # --- HEADER ---
    elements.append(Paragraph(
        "FORENSIC ANALYTICS FRAUD DETECTION REPORT",
        ParagraphStyle("Title", fontSize=18, textColor=dark_blue,
                       alignment=TA_CENTER, fontName="Helvetica-Bold", spaceAfter=6)
    ))
    elements.append(Paragraph(
        "Harare Institute of Technology — Department of Forensic Accounting and Auditing",
        ParagraphStyle("Sub", fontSize=10, textColor=medium_blue,
                       alignment=TA_CENTER, spaceAfter=4)
    ))
    elements.append(HRFlowable(width="100%", thickness=2, color=dark_blue))
    elements.append(Spacer(1, 0.4*cm))

    # --- REPORT METADATA ---
    meta_data = [
        ["Report Generated:", datetime.now().strftime("%d %B %Y, %H:%M")],
        ["Analyst:", username],
        ["File Analysed:", results.get("filename", "N/A")],
        ["Total Transactions:", str(results.get("total_rows", 0))],
        ["Overall Risk Level:", results.get("overall_risk", "N/A")],
        ["Exchange Rate Source:", results.get("exchange_rate_source", "N/A")],
        ["ZiG/USD Rate Used:", f"1 USD = {results.get('zig_rate_used', 'N/A')} ZiG"],
    ]
    meta_table = Table(meta_data, colWidths=[5*cm, 12*cm])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), light_blue),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 0.5*cm))

    # --- OVERALL RISK SUMMARY ---
    elements.append(Paragraph(
        "OVERALL RISK ASSESSMENT",
        ParagraphStyle("SectionHead", fontSize=12, textColor=dark_blue,
                       fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=6)
    ))

    techniques = ["benford", "ml_anomalies", "network", "duplicates", "nlp"]
    technique_names = {
        "benford": "Benford's Law",
        "ml_anomalies": "ML Isolation Forest",
        "network": "Network Analysis",
        "duplicates": "Duplicate Detection",
        "nlp": "NLP Keyword Scan"
    }

    summary_data = [["Technique", "Risk Level", "Key Finding"]]
    for tech in techniques:
        r = results.get(tech, {})
        risk = r.get("risk", "N/A")
        finding = ""
        if tech == "benford":
            finding = f"MAD={r.get('mad','N/A')} — {r.get('conformity','N/A')}"
        elif tech == "ml_anomalies":
            finding = f"{r.get('flagged_count',0)} of {r.get('total_transactions',0)} flagged"
        elif tech == "network":
            finding = f"{r.get('suspicious_node_count',0)} suspicious nodes found"
        elif tech == "duplicates":
            finding = f"{r.get('total_issues',0)} issues ({r.get('exact_duplicate_count',0)} exact)"
        elif tech == "nlp":
            finding = f"{r.get('flagged_count',0)} transactions with red-flag language"
        summary_data.append([technique_names[tech], risk, finding])

    summary_table = Table(summary_data, colWidths=[5.5*cm, 3*cm, 8.5*cm])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), dark_blue),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, light_grey]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("ALIGN", (1, 1), (1, -1), "CENTER"),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.5*cm))

    # --- FRAUD TYPE-TECHNIQUE PERFORMANCE MATRIX ---
    elements.append(Paragraph(
        "FRAUD TYPE-TECHNIQUE PERFORMANCE MATRIX",
        ParagraphStyle("SectionHead", fontSize=12, textColor=dark_blue,
                       fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=6)
    ))
    elements.append(Paragraph(
        "This matrix shows which forensic analytics technique is most effective "
        "at detecting each category of accounting fraud, based on the analysis results above.",
        ParagraphStyle("Body", fontSize=8, textColor=colors.grey, spaceAfter=6)
    ))

    matrix = results.get("performance_matrix", {})
    matrix_data = [
        ["Fraud Type", "Benford's", "ML/Isolation\nForest", "Network\nAnalysis",
         "Duplicate\nDetection", "NLP Scan"]
    ]
    fraud_types = [
        "Procurement Fraud",
        "Payroll Fraud",
        "Inventory Manipulation",
        "Financial Statement Fraud",
        "Shell Company Fraud"
    ]
    for ft in fraud_types:
        row_data = matrix.get(ft, {})
        matrix_data.append([
            ft,
            row_data.get("benford", "N/A"),
            row_data.get("ml", "N/A"),
            row_data.get("network", "N/A"),
            row_data.get("duplicates", "N/A"),
            row_data.get("nlp", "N/A"),
        ])

    matrix_table = Table(matrix_data, colWidths=[4.5*cm, 2.5*cm, 2.5*cm, 2.5*cm, 2.5*cm, 2.5*cm])
    matrix_style = [
        ("BACKGROUND", (0, 0), (-1, 0), dark_blue),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("PADDING", (0, 0), (-1, -1), 5),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, light_grey]),
    ]
    # Colour-code HIGH/MEDIUM/LOW cells
    rating_colors = {"HIGH": colors.HexColor("#c8f7c5"),
                     "MEDIUM": colors.HexColor("#fdebd0"),
                     "LOW": colors.HexColor("#fadbd8")}
    for row_i, row in enumerate(matrix_data[1:], start=1):
        for col_i, cell in enumerate(row[1:], start=1):
            if cell in rating_colors:
                matrix_style.append(
                    ("BACKGROUND", (col_i, row_i), (col_i, row_i), rating_colors[cell])
                )
    matrix_table.setStyle(TableStyle(matrix_style))
    elements.append(matrix_table)
    elements.append(Paragraph(
        "HIGH = Most effective  |  MEDIUM = Moderately effective  |  LOW = Less effective for this fraud type",
        ParagraphStyle("Legend", fontSize=7, textColor=colors.grey, spaceAfter=10)
    ))

    # --- FLAGGED TRANSACTIONS (TOP 20) ---
    flagged_all = results.get("combined_risk_table", [])[:20]
    if flagged_all:
        elements.append(Paragraph(
            "TOP FLAGGED TRANSACTIONS",
            ParagraphStyle("SectionHead", fontSize=12, textColor=dark_blue,
                           fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=6)
        ))
        flagged_data = [["ID", "Vendor", "Amount (USD)", "Techniques Flagged", "Risk"]]
        for t in flagged_all:
            flagged_data.append([
                t.get("transaction_id", ""),
                t.get("vendor_name", "")[:25],
                f"${t.get('amount_usd', 0):,.2f}",
                str(t.get("flagged_by_count", 0)) + " technique(s)",
                t.get("overall_risk", "")
            ])
        flagged_table = Table(flagged_data, colWidths=[2.5*cm, 5.5*cm, 3*cm, 4*cm, 2*cm])
        flagged_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), dark_blue),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, light_grey]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        elements.append(flagged_table)

    # Footer
    elements.append(Spacer(1, 1*cm))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
    elements.append(Paragraph(
        "This report was generated by the Forensic Analytics Prototype System. "
        "For academic research purposes only — Harare Institute of Technology 2026.",
        ParagraphStyle("Footer", fontSize=7, textColor=colors.grey, alignment=TA_CENTER)
    ))

    doc.build(elements)
    return buffer.getvalue()
