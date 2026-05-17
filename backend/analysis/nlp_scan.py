# TECHNIQUE 5: NLP KEYWORD SCAN
# Scans transaction descriptions for red-flag language patterns
# associated with procurement fraud in Zimbabwean manufacturing context.
# Also checks payment method risk and flags cash transactions above threshold.

import pandas as pd

# Red flag keywords relevant to Zimbabwean procurement fraud context
RED_FLAG_KEYWORDS = [
    "urgent", "sole supplier", "sole source", "emergency",
    "confidential", "exception", "waiver", "no tender",
    "direct award", "advance payment", "cash only",
    "no receipt", "off the books", "personal favour",
    "no bid", "single source", "bypassing", "discretionary",
    "unbudgeted", "override", "informal"
]

# Payment methods ranked by fraud risk
PAYMENT_METHOD_RISK = {
    "Cash": "HIGH",
    "Mobile Money": "MEDIUM",
    "Cheque": "LOW",
    "EFT": "LOW"
}

# Threshold above which a cash transaction is automatically flagged
CASH_THRESHOLD_USD = 5000

def run_nlp_scan(df: pd.DataFrame) -> dict:
    """
    Scans the description column for red-flag keywords.
    Also flags high-value cash transactions.
    Returns flagged transactions with the specific keywords that triggered the flag.
    """
    flagged = []
    keyword_frequency = {kw: 0 for kw in RED_FLAG_KEYWORDS}

    if "description" not in df.columns:
        return {"error": "No description column found in the data"}

    for _, row in df.iterrows():
        description = str(row.get("description", "")).lower().strip()
        amount_usd = float(row.get("amount_usd", 0))
        payment_method = str(row.get("payment_method", "")).strip()

        triggered_keywords = []
        for keyword in RED_FLAG_KEYWORDS:
            if keyword in description:
                triggered_keywords.append(keyword)
                keyword_frequency[keyword] += 1

        # Also flag large cash transactions regardless of description
        cash_flag = (
            payment_method.lower() == "cash" and
            amount_usd >= CASH_THRESHOLD_USD
        )

        if triggered_keywords or cash_flag:
            flags = triggered_keywords[:]
            if cash_flag:
                flags.append(f"cash transaction above ${CASH_THRESHOLD_USD:,}")

            flagged.append({
                "transaction_id": str(row.get("transaction_id", "")),
                "date": str(row.get("date", "")),
                "vendor_name": str(row.get("vendor_name", "")),
                "employee_id": str(row.get("employee_id", "")),
                "amount_usd": round(amount_usd, 2),
                "description": str(row.get("description", "")),
                "payment_method": payment_method,
                "flags": flags,
                "flag_count": len(flags)
            })

    # Sort by number of flags — most suspicious first
    flagged.sort(key=lambda x: x["flag_count"], reverse=True)

    # Keyword frequency summary (only keywords that appeared)
    keyword_summary = [
        {"keyword": kw, "count": count}
        for kw, count in keyword_frequency.items()
        if count > 0
    ]
    keyword_summary.sort(key=lambda x: x["count"], reverse=True)

    return {
        "technique": "NLP Keyword Scan",
        "total_scanned": len(df),
        "flagged_count": len(flagged),
        "keyword_summary": keyword_summary,
        "flagged_transactions": flagged[:100],
        "risk": "HIGH" if len(flagged) > len(df) * 0.05 else "MEDIUM" if len(flagged) > 0 else "LOW",
        "suspicious": len(flagged) > 0
    }
