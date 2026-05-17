# Fetches real-time USD exchange rates from the internet
# ZiG (Zimbabwe Gold) rate is fetched or falls back to a hardcoded rate
# All transaction amounts are converted to USD before analysis

import requests

ZIG_FALLBACK_RATE = 13.56  # ZiG per 1 USD fallback if API doesn't have it

def get_exchange_rates():
    """
    Fetches live exchange rates with USD as base.
    Returns a dict like: {"ZAR": 18.5, "GBP": 0.79, "ZIG": 13.56, ...}
    Falls back to hardcoded rates if internet is unavailable.
    """
    try:
        response = requests.get(
            "https://api.exchangerate-api.com/v4/latest/USD",
            timeout=5
        )
        rates = response.json().get("rates", {})
        # ZiG is not in most free APIs, add it manually
        rates["ZIG"] = ZIG_FALLBACK_RATE
        rates["USD"] = 1.0
        return {"success": True, "rates": rates, "source": "live"}
    except Exception:
        # Fallback rates if no internet
        return {
            "success": False,
            "rates": {"USD": 1.0, "ZIG": ZIG_FALLBACK_RATE, "ZAR": 18.5, "GBP": 0.79},
            "source": "fallback"
        }

def normalise_to_usd(df, rates):
    """
    Adds a new column 'amount_usd' to the dataframe.
    Uses the currency column to convert each transaction amount to USD.
    """
    import pandas as pd

    if "currency" not in df.columns:
        df["amount_usd"] = df["amount"]
        df["exchange_rate_used"] = 1.0
        return df

    def convert_row(row):
        currency = str(row.get("currency", "USD")).strip().upper()
        amount = float(row.get("amount", 0))
        rate = rates.get(currency, 1.0)
        return round(amount / rate, 2)

    def get_rate(currency):
        return rates.get(str(currency).strip().upper(), 1.0)

    df["amount_usd"] = df.apply(convert_row, axis=1)
    df["exchange_rate_used"] = df["currency"].apply(get_rate)
    return df
