# TECHNIQUE 1: BENFORD'S LAW ANALYSIS
# Checks if the first digits of transaction amounts follow Benford's expected distribution.
# Humans who fabricate numbers don't follow this natural pattern — deviation signals fraud.

import math
import pandas as pd

# Benford's expected frequency for digits 1 through 9
BENFORDS_EXPECTED = {d: math.log10(1 + 1 / d) for d in range(1, 10)}

def get_first_digit(value):
    """Extract the first significant digit from a number."""
    try:
        str_val = str(abs(float(value))).replace(".", "").lstrip("0")
        return int(str_val[0]) if str_val else None
    except Exception:
        return None

def run_benfords_analysis(df: pd.DataFrame) -> dict:
    """
    Runs Benford's Law analysis on the amount_usd column.
    Returns observed vs expected frequencies and a conformity verdict.
    """
    amounts = df["amount_usd"].dropna()
    amounts = amounts[amounts > 0]

    if len(amounts) < 50:
        return {"error": "Need at least 50 transactions for Benford's Law to be meaningful"}

    digits = amounts.apply(get_first_digit).dropna().astype(int)
    total = len(digits)

    observed = {}
    for d in range(1, 10):
        observed[d] = round((digits == d).sum() / total, 4)

    expected = {d: round(BENFORDS_EXPECTED[d], 4) for d in range(1, 10)}

    # Mean Absolute Deviation — the key conformity metric
    mad = sum(abs(observed[d] - expected[d]) for d in range(1, 10)) / 9
    mad = round(mad, 6)

    # Conformity thresholds from Nigrini (2012) — used in the research document
    if mad < 0.006:
        conformity = "Close Conformity"
        risk = "LOW"
    elif mad < 0.012:
        conformity = "Acceptable Conformity"
        risk = "LOW"
    elif mad < 0.015:
        conformity = "Marginal Conformity"
        risk = "MEDIUM"
    else:
        conformity = "Non-Conformity — Suspicious"
        risk = "HIGH"

    # Find which digits deviate most from expected
    deviations = [
        {
            "digit": d,
            "observed": observed[d],
            "expected": expected[d],
            "deviation": round(abs(observed[d] - expected[d]), 4)
        }
        for d in range(1, 10)
    ]
    deviations.sort(key=lambda x: x["deviation"], reverse=True)

    return {
        "technique": "Benford's Law",
        "total_analysed": total,
        "digits": list(range(1, 10)),
        "observed": [observed[d] for d in range(1, 10)],
        "expected": [expected[d] for d in range(1, 10)],
        "mad": mad,
        "conformity": conformity,
        "risk": risk,
        "top_deviations": deviations[:3],
        "suspicious": risk in ["MEDIUM", "HIGH"]
    }
