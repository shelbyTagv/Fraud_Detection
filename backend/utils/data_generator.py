# Run this file directly to generate sample_data.csv
# python utils/data_generator.py
#
# Generates 500 realistic Zimbabwean manufacturing transactions.
# Fraud distribution based on Chapter 4 empirical findings:
#   Procurement fraud:        ~8% of rows  (80.9% of fraud cases)
#   Currency manipulation:    ~3% of rows  (38.1% of fraud-reporting orgs)
#   Duplicate payments:       ~4% of rows
#   Payroll fraud:            ~2% of rows
#   After-hours entries:      ~3% of rows  (journal entry testing signal)

import pandas as pd
import random
from datetime import datetime, timedelta

random.seed(42)

VENDORS = [
    "Harare Steel Supplies",
    "Bulawayo Metals Ltd",
    "ZimBuild Materials",
    "African Procurement Co",
    "Msasa Trading",
    "Chitungwiza Parts",
    "H@rare Steel Supplies",    # near-duplicate of vendor 1 (fraud signal)
    "Shell Vendor A",           # suspicious vendor
    "Shell Vendor B",           # suspicious — same owner as A
    "Mutare Fabricators",
    "Gweru Components",
    "Kwekwe Foundry",
    "Norton Chemicals",
    "Kadoma Industrial",
    "Redcliff Supplies"
]

EMPLOYEES = [
    "EMP001", "EMP002", "EMP003", "EMP004", "EMP005",
    "EMP006", "EMP007", "EMP008", "EMP009", "EMP010"
]

CURRENCIES        = ["USD", "ZIG", "USD", "USD", "ZIG"]
DEPARTMENTS       = ["Procurement", "Finance", "Operations", "Maintenance"]
PAYMENT_METHODS   = ["EFT", "Cash", "Cheque", "Mobile Money"]

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

# Duplicate invoice numbers — reusing these triggers duplicate detection
DUPLICATE_INVOICES = ["INV-0042", "INV-0087", "INV-0123"]


def generate_sample_data(n=500):
    rows = []
    base_date = datetime(2023, 1, 1)

    for i in range(n):

        # Determine which fraud type this row is (mutually exclusive, prioritised)
        rand = random.random()

        if rand < 0.08:
            # ── PROCUREMENT FRAUD ──
            transaction_date = base_date + timedelta(days=random.randint(0, 700))
            amount      = random.choice([
                round(random.uniform(90000, 999999), 2),
                round(random.randint(100, 500)) * 1000   # round number signal
            ])
            vendor      = random.choice(["Shell Vendor A", "Shell Vendor B",
                                         "H@rare Steel Supplies"])
            employee    = random.choice(["EMP001", "EMP002"])
            description = random.choice(FRAUD_DESCRIPTIONS)
            currency    = "USD"
            invoice     = f"INV-FRAUD-{str(i).zfill(4)}"
            payment     = random.choice(["Cash", "Mobile Money"])

        elif rand < 0.11:
            # ── CURRENCY / EXCHANGE RATE FRAUD ──
            # Uses ZiG with a manipulated (inflated) exchange rate
            transaction_date = base_date + timedelta(days=random.randint(0, 700))
            amount      = round(random.uniform(10000, 80000), 2)
            vendor      = random.choice(VENDORS[:6])
            employee    = random.choice(["EMP001", "EMP003"])
            description = random.choice(CLEAN_DESCRIPTIONS)
            currency    = "ZIG"   # ZiG transaction — rate deviation is the signal
            invoice     = f"INV-CUR-{str(i).zfill(4)}"
            payment     = "EFT"

        elif rand < 0.15:
            # ── DUPLICATE PAYMENT ──
            transaction_date = base_date + timedelta(days=random.randint(0, 700))
            amount      = random.choice([5500.00, 12000.00, 8750.00])
            vendor      = random.choice(VENDORS[:6])
            employee    = random.choice(EMPLOYEES)
            description = random.choice(CLEAN_DESCRIPTIONS)
            currency    = random.choice(CURRENCIES)
            invoice     = random.choice(DUPLICATE_INVOICES)   # reused invoice
            payment     = random.choice(PAYMENT_METHODS)

        elif rand < 0.17:
            # ── PAYROLL FRAUD — after-hours entry ──
            # Set hour to after 19:00 to trigger journal entry testing
            base_day   = base_date + timedelta(days=random.randint(0, 700))
            transaction_date = base_day.replace(hour=random.choice([21, 22, 23, 0, 1]))
            amount      = round(random.uniform(3000, 15000), 2)
            vendor      = random.choice(VENDORS[:6])
            employee    = random.choice(["EMP002", "EMP004"])
            description = "Salary adjustment"
            currency    = "USD"
            invoice     = f"INV-PAY-{str(i).zfill(4)}"
            payment     = "EFT"

        elif rand < 0.20:
            # ── PERIOD-END JOURNAL ENTRY (financial statement fraud signal) ──
            # Set day to 28-31 to trigger period-end flag
            month  = random.randint(1, 12)
            year   = random.choice([2023, 2024])
            day    = random.choice([28, 29, 30, 31])
            try:
                transaction_date = datetime(year, month, day)
            except ValueError:
                transaction_date = datetime(year, month, 28)
            amount      = round(random.randint(50, 900)) * 1000   # round number
            vendor      = random.choice(VENDORS[:8])
            employee    = random.choice(EMPLOYEES)
            description = random.choice(CLEAN_DESCRIPTIONS)
            currency    = random.choice(["USD", "ZIG"])
            invoice     = f"INV-PE-{str(i).zfill(4)}"
            payment     = random.choice(PAYMENT_METHODS)

        else:
            # ── CLEAN TRANSACTION ──
            transaction_date = base_date + timedelta(days=random.randint(0, 700))
            amount      = round(random.uniform(200, 45000), 2)
            vendor      = random.choice(VENDORS[:12])
            employee    = random.choice(EMPLOYEES)
            description = random.choice(CLEAN_DESCRIPTIONS)
            currency    = random.choice(CURRENCIES)
            invoice     = f"INV-{str(random.randint(1, 300)).zfill(4)}"
            payment     = random.choice(PAYMENT_METHODS)

        rows.append({
            "transaction_id": f"T{str(i + 1).zfill(5)}",
            "date":           transaction_date.strftime("%Y-%m-%d %H:%M"),
            "vendor_name":    vendor,
            "employee_id":    employee,
            "amount":         amount,
            "currency":       currency,
            "description":    description,
            "invoice_number": invoice,
            "department":     random.choice(DEPARTMENTS),
            "payment_method": payment
        })

    df = pd.DataFrame(rows)
    import os

    # Save to the backend folder regardless of where the script is run from
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(script_dir)  # goes up from utils/ to backend/
    output_path = os.path.join(backend_dir, "sample_data.csv")

    df.to_csv(output_path, index=False)

    # Print a summary so you can verify the fraud distribution
    print(f"Generated {n} transactions → {output_path}")
    print(f"  Procurement fraud rows:  ~{int(n * 0.08)}")
    print(f"  Currency fraud rows:     ~{int(n * 0.03)}")
    print(f"  Duplicate rows:          ~{int(n * 0.04)}")
    print(f"  Payroll/after-hours:     ~{int(n * 0.02)}")
    print(f"  Period-end entries:      ~{int(n * 0.03)}")
    print(f"  Clean rows:              ~{int(n * 0.80)}")


if __name__ == "__main__":
    generate_sample_data(500)
