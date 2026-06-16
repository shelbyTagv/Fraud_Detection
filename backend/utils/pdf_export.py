# Generates a professional PDF report of analysis results using ReportLab.
# Includes: report metadata, risk summary (Benford's + ML), ML flagged transactions.

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

    techniques = ["benford", "ml_anomalies"]
    technique_names = {
        "benford": "Benford's Law",
        "ml_anomalies": "XGBoost ML Anomaly Detection"
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

    # --- ML FLAGGED TRANSACTIONS (TOP 20) ---
    ml_flagged = results.get("ml_anomalies", {}).get("flagged_transactions", [])[:20]
    if ml_flagged:
        elements.append(Paragraph(
            "ML-FLAGGED TRANSACTIONS",
            ParagraphStyle("SectionHead", fontSize=12, textColor=dark_blue,
                           fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=6)
        ))
        flagged_data = [["ID", "Vendor", "Amount (USD)", "Risk Score", "Date"]]
        for t in ml_flagged:
            flagged_data.append([
                t.get("transaction_id", ""),
                t.get("vendor_name", "")[:25],
                f"${t.get('amount_usd', 0):,.2f}",
                str(t.get("risk_score", "")),
                t.get("date", "")
            ])
        flagged_table = Table(flagged_data, colWidths=[2.5*cm, 5.5*cm, 3*cm, 2.5*cm, 3.5*cm])
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
