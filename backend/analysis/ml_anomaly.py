# TECHNIQUE 2: ML ANOMALY DETECTION — XGBoost + Isolation Forest Ensemble
#
# HOW IT WORKS (no pre-training, no external dataset needed):
#   1. Isolation Forest runs first → generates pseudo-labels (0=normal, 1=suspicious)
#   2. XGBoost trains on those pseudo-labels in ~2 seconds
#   3. XGBoost re-scores every transaction with better probability estimates
#   4. Model is discarded after — nothing is saved between uploads
#
# This gives the accuracy benefits of XGBoost without requiring
# any labelled fraud dataset prepared in advance.

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Builds the numerical feature matrix from raw transaction data.
    XGBoost requires all features to be numerical.
    """
    features = pd.DataFrame()

    # Feature 1: Transaction amount in USD
    features["amount_usd"] = df["amount_usd"].fillna(0)

    # Feature 2 & 3: Time-based features — fraud clusters at period-end
    if "date" in df.columns:
        dates = pd.to_datetime(df["date"], errors="coerce")
        features["day_of_month"] = dates.dt.day.fillna(15)
        features["month"] = dates.dt.month.fillna(6)

    # Feature 4: Vendor identity encoding
    if "vendor_name" in df.columns:
        le = LabelEncoder()
        features["vendor_encoded"] = le.fit_transform(
            df["vendor_name"].fillna("unknown").astype(str)
        )

    # Feature 5: Employee identity encoding
    if "employee_id" in df.columns:
        le2 = LabelEncoder()
        features["employee_encoded"] = le2.fit_transform(
            df["employee_id"].fillna("unknown").astype(str)
        )

    # Feature 6: Payment method risk score
    # Cash=4 (highest risk), EFT=1 (lowest risk)
    if "payment_method" in df.columns:
        risk_map = {"Cash": 4, "Mobile Money": 3, "Cheque": 2, "EFT": 1}
        features["payment_risk"] = df["payment_method"].apply(
            lambda x: risk_map.get(str(x).strip(), 1)
        )

    # Feature 7: Round number flag
    # Fraudsters commonly use round numbers (50000, 100000)
    features["is_round_number"] = (
        (features["amount_usd"] % 1000 == 0) &
        (features["amount_usd"] >= 5000)
    ).astype(int)

    # Feature 8: Vendor frequency
    # A vendor appearing only once or twice is more suspicious
    if "vendor_name" in df.columns:
        vendor_counts = df["vendor_name"].value_counts()
        features["vendor_frequency"] = df["vendor_name"].map(vendor_counts).fillna(1)

    # Feature 9 & 10: Currency fraud features
    # Per the "complexity fog" finding — exchange rate deviation is a fraud signal
    if "exchange_rate_used" in df.columns:
        median_rate = df["exchange_rate_used"].median()
        std_rate = df["exchange_rate_used"].std()
        if std_rate > 0:
            features["rate_deviation"] = abs(
                df["exchange_rate_used"] - median_rate
            ) / std_rate
        else:
            features["rate_deviation"] = 0.0

    if "currency" in df.columns:
        features["is_zig"] = (
            df["currency"].str.upper() == "ZIG"
        ).astype(int)

    return features.fillna(0)


def run_ml_anomaly_detection(df: pd.DataFrame) -> dict:
    """
    Step 1: Isolation Forest generates pseudo-labels from the uploaded data.
    Step 2: XGBoost trains on those pseudo-labels (~2 seconds).
    Step 3: XGBoost scores every transaction with a 0-100 fraud probability.

    No external dataset required. No saved model files. Trains fresh on every upload.
    """

    if len(df) < 20:
        return {"error": "Need at least 20 transactions for ML analysis"}

    features = build_features(df)

    # ── STEP 1: ISOLATION FOREST → PSEUDO-LABELS ──────────────────────────
    iso_forest = IsolationForest(
        n_estimators=200,
        contamination=0.05,   # expect ~5% anomalies
        random_state=42
    )
    iso_predictions = iso_forest.fit_predict(features)

    # Convert Isolation Forest output: -1 (anomaly) → 1, 1 (normal) → 0
    pseudo_labels = (iso_predictions == -1).astype(int)

    n_fraud = int(pseudo_labels.sum())
    n_normal = len(pseudo_labels) - n_fraud

    # If not enough of both classes, fall back to Isolation Forest scores only
    if n_fraud < 3 or n_normal < 3:
        scores = iso_forest.decision_function(features)
        score_range = scores.max() - scores.min()
        if score_range == 0:
            fraud_prob = np.zeros(len(df))
        else:
            fraud_prob = ((scores.max() - scores) / score_range * 100)
        flagged_mask = iso_predictions == -1
        return _build_result(
            df, fraud_prob, flagged_mask,
            method="Isolation Forest (fallback — insufficient class variance)"
        )

    # ── STEP 2: XGBOOST TRAINS ON PSEUDO-LABELS ───────────────────────────
    # scale_pos_weight corrects for class imbalance (many more normal than fraud rows)
    scale = n_normal / n_fraud

    xgb_model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        scale_pos_weight=scale,
        eval_metric="logloss",
        random_state=42,
        verbosity=0            # suppress XGBoost console output
    )
    xgb_model.fit(features, pseudo_labels)

    # ── STEP 3: XGBOOST SCORES EVERY TRANSACTION ──────────────────────────
    # predict_proba returns [prob_normal, prob_fraud] per row
    fraud_probabilities = xgb_model.predict_proba(features)[:, 1]
    fraud_prob_100 = (fraud_probabilities * 100).round(1)

    # Flag transactions where XGBoost fraud probability exceeds 50%
    flagged_mask = fraud_probabilities > 0.5

    return _build_result(
        df, fraud_prob_100, flagged_mask,
        method="XGBoost + Isolation Forest"
    )


def _build_result(df, fraud_scores, flagged_mask, method):
    """Formats the final results dictionary returned to the API."""
    df = df.copy()
    df["fraud_score"] = fraud_scores
    df["is_flagged"] = flagged_mask

    flagged = df[df["is_flagged"]].sort_values("fraud_score", ascending=False)

    flagged_records = []
    for _, row in flagged.head(100).iterrows():
        flagged_records.append({
            "transaction_id": str(row.get("transaction_id", "")),
            "date": str(row.get("date", "")),
            "vendor_name": str(row.get("vendor_name", "")),
            "employee_id": str(row.get("employee_id", "")),
            "amount_usd": round(float(row.get("amount_usd", 0)), 2),
            "currency": str(row.get("currency", "USD")),
            "risk_score": float(row.get("fraud_score", 0)),
            "payment_method": str(row.get("payment_method", ""))
        })

    flagged_count = int(flagged_mask.sum())
    total = len(df)

    return {
        "technique": "ML Anomaly Detection",
        "method_used": method,
        "total_transactions": total,
        "flagged_count": flagged_count,
        "flagged_percentage": round(flagged_count / total * 100, 2),
        "risk": (
            "HIGH"   if flagged_count / total > 0.08 else
            "MEDIUM" if flagged_count / total > 0.04 else
            "LOW"
        ),
        "flagged_transactions": flagged_records,
        "suspicious": flagged_count > 0
    }
