# TECHNIQUE 2: MACHINE LEARNING — ISOLATION FOREST
# Unsupervised anomaly detection. No pre-training needed.
# Trains on each uploaded dataset and flags transactions that deviate from normal patterns.
# Also provides a simple risk score per flagged transaction.

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder

def run_ml_anomaly_detection(df: pd.DataFrame) -> dict:
    """
    Trains Isolation Forest on the uploaded transactions and flags anomalies.
    Uses: amount_usd, hour of day, day of week, vendor encoding, payment method encoding.
    Contamination is set to 0.05 meaning it expects ~5% of data to be anomalous.
    """
    features = pd.DataFrame()

    # Feature 1: transaction amount in USD (most important)
    features["amount_usd"] = df["amount_usd"].fillna(0)

    # Feature 2 and 3: time-based features — fraud often happens at odd hours
    if "date" in df.columns:
        dates = pd.to_datetime(df["date"], errors="coerce")
        features["day_of_week"] = dates.dt.dayofweek.fillna(0)
        features["month"] = dates.dt.month.fillna(0)

    # Feature 4: vendor encoding — some vendors appear in more suspicious transactions
    if "vendor_name" in df.columns:
        le_vendor = LabelEncoder()
        features["vendor_encoded"] = le_vendor.fit_transform(
            df["vendor_name"].fillna("unknown").astype(str)
        )

    # Feature 5: employee encoding — some employees process more flagged transactions
    if "employee_id" in df.columns:
        le_emp = LabelEncoder()
        features["employee_encoded"] = le_emp.fit_transform(
            df["employee_id"].fillna("unknown").astype(str)
        )

    # Feature 6: payment method risk encoding
    if "payment_method" in df.columns:
        payment_risk = {"EFT": 1, "Cheque": 2, "Mobile Money": 3, "Cash": 4}
        features["payment_risk"] = df["payment_method"].map(
            lambda x: payment_risk.get(str(x), 1)
        )

    # Feature 7: amount is suspiciously round (round numbers are a fraud signal)
    features["is_round_number"] = (features["amount_usd"] % 1000 == 0).astype(int)

    # Train Isolation Forest
    model = IsolationForest(
        n_estimators=200,       # more trees = more stable results
        contamination=0.05,     # expect ~5% anomalies
        random_state=42,
        max_samples="auto"
    )
    predictions = model.fit_predict(features)
    scores = model.decision_function(features)

    # -1 = anomaly, 1 = normal
    df = df.copy()
    df["is_anomaly"] = predictions
    df["anomaly_score"] = scores

    # Convert score to a 0-100 risk score (higher = more suspicious)
    min_score = scores.min()
    max_score = scores.max()
    score_range = max_score - min_score if max_score != min_score else 1
    df["risk_score"] = ((max_score - scores) / score_range * 100).round(1)

    flagged = df[df["is_anomaly"] == -1].copy()
    flagged_sorted = flagged.sort_values("risk_score", ascending=False)

    flagged_records = []
    for _, row in flagged_sorted.head(100).iterrows():
        flagged_records.append({
            "transaction_id": str(row.get("transaction_id", "")),
            "date": str(row.get("date", "")),
            "vendor_name": str(row.get("vendor_name", "")),
            "employee_id": str(row.get("employee_id", "")),
            "amount_usd": round(float(row.get("amount_usd", 0)), 2),
            "currency": str(row.get("currency", "USD")),
            "risk_score": float(row.get("risk_score", 0)),
            "payment_method": str(row.get("payment_method", ""))
        })

    return {
        "technique": "ML Isolation Forest",
        "total_transactions": len(df),
        "flagged_count": len(flagged),
        "flagged_percentage": round(len(flagged) / len(df) * 100, 2),
        "risk": "HIGH" if len(flagged) / len(df) > 0.08 else "MEDIUM" if len(flagged) / len(df) > 0.04 else "LOW",
        "flagged_transactions": flagged_records,
        "suspicious": len(flagged) > 0
    }
