# Run this file directly to generate sample_data.csv
# python data_generator.py
# Generates 500 realistic manufacturing transactions with ~8% fraud signals injected

import pandas as pd
import random
from datetime import datetime, timedelta

random.seed(42)

VENDORS = [
    "Harare Steel Supplies", "Bulawayo Metals Ltd", "ZimBuild Materials",
    "African Procurement Co", "Msasa Trading", "Chitungwiza Parts",
    "H@rare Steel Supplies",   # near-duplicate vendor (fraud signal)
    "Shell Vendor A",          # suspicious
    "Shell Vendor B",          # suspicious — same owner as A
    "Mutare Fabricators", "Gweru Components", "Kwekwe Foundry",
    "Norton Chemicals", "Kadoma Industrial", "Redcliff Supplies"
]

EMPLOYEES = [
    "EMP001", "EMP002", "EMP003", "EMP004", "EMP005",
    "EMP006", "EMP007", "EMP008", "EMP009", "EMP010"
]

CURRENCIES = ["USD", "ZIG", "USD", "USD", "ZIG"]  # USD more common

CLEAN_DESCRIPTIONS = [
    "Raw materials purchase", "Equipment maintenance", "Office supplies",
    "Factory consumables", "Cleaning materials", "Spare parts",
    "Stationery", "Safety equipment", "Workshop tools", "Packaging materials"
]

FRAUD_DESCRIPTIONS = [
    "Urgent sole supplier payment",
    "Emergency procurement no tender",
    "Confidential direct award",
    "Exception waiver approved",
    "Advance payment cash only",
    "No receipt provided emergency",
    "Off the books adjustment",
    "Sole source no tender required"
]

def generate_sample_data(n=500):
    rows = []
    base_date = datetime(2023, 1, 1)

    # Generate a few exact duplicate invoice numbers to trigger duplicate detection
    duplicate_invoices = ["INV-0042", "INV-0087", "INV-0123"]

    for i in range(n):
        is_fraud = random.random() < 0.08  # 8% fraud rate
        is_duplicate = random.random() < 0.04  # 4% duplicates

        transaction_date = base_date + timedelta(days=random.randint(0, 700))

        # Fraud transactions tend to be large round numbers or very high amounts
        if is_fraud:
            amount = random.choice([
                round(random.uniform(90000, 999999), 2),
                round(random.uniform(100, 500)) * 1000,  # suspiciously round
            ])
            vendor = random.choice(["Shell Vendor A", "Shell Vendor B", "H@rare Steel Supplies"])
            employee = random.choice(["EMP001", "EMP002"])  # concentrated in few employees
            description = random.choice(FRAUD_DESCRIPTIONS)
            currency = "USD"
            invoice = f"INV-FRAUD-{str(i).zfill(4)}"
        elif is_duplicate:
            amount = random.choice([5500.00, 12000.00, 8750.00])
            vendor = random.choice(VENDORS[:6])
            employee = random.choice(EMPLOYEES)
            description = random.choice(CLEAN_DESCRIPTIONS)
            currency = random.choice(CURRENCIES)
            invoice = random.choice(duplicate_invoices)  # reused invoice = duplicate
        else:
            amount = round(random.uniform(200, 45000), 2)
            vendor = random.choice(VENDORS[:12])
            employee = random.choice(EMPLOYEES)
            description = random.choice(CLEAN_DESCRIPTIONS)
            currency = random.choice(CURRENCIES)
            invoice = f"INV-{str(random.randint(1, 300)).zfill(4)}"

        rows.append({
            "transaction_id": f"T{str(i + 1).zfill(5)}",
            "date": transaction_date.strftime("%Y-%m-%d"),
            "vendor_name": vendor,
            "employee_id": employee,
            "amount": amount,
            "currency": currency,
            "description": description,
            "invoice_number": invoice,
            "department": random.choice(["Procurement", "Finance", "Operations", "Maintenance"]),
            "payment_method": random.choice(["EFT", "Cash", "Cheque", "Mobile Money"])
        })

    df = pd.DataFrame(rows)
    df.to_csv("sample_data.csv", index=False)
    print(f"Generated {n} transactions → sample_data.csv")
    print(f"Fraud rows injected: ~{int(n * 0.08)}")
    print(f"Duplicate rows injected: ~{int(n * 0.04)}")

if __name__ == "__main__":
    generate_sample_data(500)
