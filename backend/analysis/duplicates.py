# TECHNIQUE 4: DUPLICATE PAYMENT DETECTION
# Finds exact duplicate transactions (same invoice paid twice)
# and near-duplicate vendor names (possible shell companies with similar names).

import pandas as pd
from fuzzywuzzy import fuzz

def run_duplicate_detection(df: pd.DataFrame) -> dict:
    """
    1. Exact duplicates: same invoice_number + vendor_name + amount
    2. Near-duplicate vendors: vendor names that are 80-99% similar (typo or shell company)
    """

    exact_duplicates = []
    fuzzy_matches = []

    # --- EXACT DUPLICATE DETECTION ---
    check_cols = [c for c in ["invoice_number", "vendor_name", "amount_usd"] if c in df.columns]
    if check_cols:
        dupes = df[df.duplicated(subset=check_cols, keep=False)].copy()
        dupes_sorted = dupes.sort_values("invoice_number") if "invoice_number" in dupes.columns else dupes

        for _, row in dupes_sorted.head(100).iterrows():
            exact_duplicates.append({
                "transaction_id": str(row.get("transaction_id", "")),
                "invoice_number": str(row.get("invoice_number", "")),
                "vendor_name": str(row.get("vendor_name", "")),
                "amount_usd": round(float(row.get("amount_usd", 0)), 2),
                "date": str(row.get("date", "")),
                "employee_id": str(row.get("employee_id", ""))
            })

    # --- FUZZY VENDOR NAME MATCHING ---
    # Catches shell companies registered with slightly different names
    vendors = df["vendor_name"].dropna().astype(str).unique().tolist()

    for i in range(len(vendors)):
        for j in range(i + 1, len(vendors)):
            score = fuzz.ratio(vendors[i].lower(), vendors[j].lower())
            if 75 <= score < 100:  # Similar but not identical
                fuzzy_matches.append({
                    "vendor_1": vendors[i],
                    "vendor_2": vendors[j],
                    "similarity_score": score,
                    "risk": "HIGH" if score >= 90 else "MEDIUM"
                })

    fuzzy_matches.sort(key=lambda x: x["similarity_score"], reverse=True)

    total_issues = len(exact_duplicates) + len(fuzzy_matches)

    return {
        "technique": "Duplicate Detection",
        "exact_duplicate_count": len(exact_duplicates),
        "fuzzy_match_count": len(fuzzy_matches),
        "total_issues": total_issues,
        "exact_duplicates": exact_duplicates[:50],
        "fuzzy_vendor_matches": fuzzy_matches[:30],
        "risk": "HIGH" if len(exact_duplicates) > 5 else "MEDIUM" if total_issues > 0 else "LOW",
        "suspicious": total_issues > 0
    }
