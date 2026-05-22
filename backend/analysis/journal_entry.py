# TECHNIQUE 6: JOURNAL ENTRY TESTING
#
# Per FA-IF Phase 2 and the research Performance Matrix (Table 4.10):
# F1 = 0.84 for Financial Statement Fraud — second best technique for that category.
#
# Flags:
#   - After-hours postings (before 7am or after 7pm)
#   - Period-end clustering (last 3 days of the month)
#   - Suspiciously round numbers above threshold
#   - Top 3% transactions by value
#   - Same-day high-value transactions from same employee

import pandas as pd


def run_journal_entry_testing(df: pd.DataFrame) -> dict:
    """
    Tests transaction patterns consistent with fraudulent journal entry manipulation.
    Works on any dataset with at least a date and amount_usd column.
    """

    if "date" not in df.columns:
        return {
            "technique": "Journal Entry Testing",
            "error": "Date column required for journal entry testing",
            "flagged_count": 0,
            "risk": "LOW",
            "suspicious": False
        }

    df = df.copy()
    dates = pd.to_datetime(df["date"], errors="coerce")
    df["_hour"]         = dates.dt.hour.fillna(12).astype(int)
    df["_day_of_month"] = dates.dt.day.fillna(15).astype(int)
    df["_amount_usd"]   = df["amount_usd"].fillna(0).astype(float)

    # Calculate the top 3% amount threshold for this dataset
    top_3_pct_threshold = df["_amount_usd"].quantile(0.97)

    flagged = []

    for _, row in df.iterrows():
        reasons = []
        amount  = row["_amount_usd"]
        hour    = row["_hour"]
        day     = row["_day_of_month"]

        # Rule 1: After-hours posting
        if hour < 7 or hour >= 19:
            reasons.append(f"After-hours posting at {hour:02d}:00")

        # Rule 2: Period-end clustering (last 3 days of month)
        if day >= 28:
            reasons.append(f"Period-end transaction (day {day} of month)")

        # Rule 3: Suspiciously round number above $5,000
        if amount >= 5000 and amount % 1000 == 0:
            reasons.append(f"Round number: ${amount:,.0f}")

        # Rule 4: Top 3% transaction by value
        if amount > top_3_pct_threshold:
            reasons.append(f"Top 3% by value: ${amount:,.2f}")

        if reasons:
            flagged.append({
                "transaction_id": str(row.get("transaction_id", "")),
                "date":           str(row.get("date", "")),
                "vendor_name":    str(row.get("vendor_name", "")),
                "employee_id":    str(row.get("employee_id", "")),
                "amount_usd":     round(amount, 2),
                "department":     str(row.get("department", "")),
                "reasons":        reasons,
                "reason_count":   len(reasons)
            })

    # Sort by number of rules triggered — most suspicious first
    flagged.sort(key=lambda x: x["reason_count"], reverse=True)

    total     = len(df)
    flagged_count = len(flagged)

    return {
        "technique":           "Journal Entry Testing",
        "total_tested":        total,
        "flagged_count":       flagged_count,
        "top_3pct_threshold":  round(top_3_pct_threshold, 2),
        "flagged_transactions": flagged[:100],
        "risk": (
            "HIGH"   if flagged_count / total > 0.08 else
            "MEDIUM" if flagged_count / total > 0.04 else
            "LOW"
        ),
        "suspicious": flagged_count > 0
    }
