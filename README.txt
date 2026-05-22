FORENSIC ANALYTICS PROTOTYPE
Harare Institute of Technology — Department of Forensic Accounting and Auditing
Research Project HIT 0800 — Kelvin Mushayiwedu (H240803Y)
Developed by: Antigravity
================================================================


WHAT YOU NEED BEFORE STARTING
----------------------------------------------------------------
You need two programs installed on your computer:

1. Python (version 3.10 or newer)
   Download from: https://www.python.org/downloads/
   IMPORTANT: When installing, tick "Add Python to PATH"

2. Node.js (LTS version)
   Download from: https://nodejs.org/

If you are not sure whether these are installed, run setup.bat
and it will tell you.


FIRST TIME SETUP (do this once only)
----------------------------------------------------------------
1. Double-click setup.bat
2. Wait for it to finish (3 to 5 minutes)
3. You will see "SETUP COMPLETE" when it is done


RUNNING THE SYSTEM (after setup is done)
----------------------------------------------------------------
EASIEST METHOD:
   Double-click START_ALL.bat
   This opens everything automatically.

MANUAL METHOD:
   Step 1: Double-click START_BACKEND.bat  (keep this window open)
   Step 2: Double-click START_FRONTEND.bat (keep this window open)

The system will open in your browser at: http://localhost:3000

STOPPING THE SYSTEM:
   Double-click STOP_ALL.bat
   OR simply close both server windows


USING THE SYSTEM
----------------------------------------------------------------
1. The browser opens at http://localhost:3000
2. Click "Register here" to create an account
3. Log in with your username and password
4. Click "Choose CSV File" and select your transactions file
5. Click "Run Analysis"
6. Wait about 5 seconds for the analysis to complete
7. Browse results using the tabs at the top
8. Click "Export PDF Report" to download a report
9. Click "History" in the top menu to see past analyses


TEST DATA
----------------------------------------------------------------
A sample transactions file is included for testing:
   backend/sample_data.csv

This file contains 500 synthetic manufacturing transactions
with fraud signals injected for demonstration purposes.


TABS IN THE SYSTEM
----------------------------------------------------------------
Benford's Law     - Digit distribution analysis
XGBoost ML        - Machine learning anomaly detection
Network           - Vendor/employee relationship analysis
Duplicates        - Duplicate payment detection
NLP Scan          - Red-flag language detection
Journal Entries   - After-hours and period-end entry testing
Performance Matrix- Which technique detects which fraud type
Risk Table        - Transactions flagged by multiple techniques
Maturity Model    - Organisational forensic analytics maturity


TROUBLESHOOTING
----------------------------------------------------------------
"Python is not installed" error:
   Install Python from https://www.python.org/downloads/
   Make sure to tick "Add Python to PATH" during installation

"Node.js is not installed" error:
   Install Node.js from https://nodejs.org/ (choose LTS version)

Backend window closes immediately:
   A Python package may have failed to install.
   Run setup.bat again to reinstall.

Browser shows "Cannot connect":
   Make sure START_BACKEND.bat is running first.
   Wait 10 seconds after starting the backend before opening the browser.

Port already in use error:
   Another program is using port 8000 or 3000.
   Run STOP_ALL.bat then try START_ALL.bat again.

Analysis returns error after uploading CSV:
   Make sure your CSV has at least these columns:
   transaction_id, date, vendor_name, employee_id,
   amount, currency, description, invoice_number
   Column names must be in the first row of the file.


SYSTEM REQUIREMENTS
----------------------------------------------------------------
Operating System: Windows 10 or Windows 11
RAM: 4GB minimum (8GB recommended)
Disk Space: 500MB free
Internet: Required for live exchange rate lookup
          (system works without internet using fallback rates)


================================================================
For technical support contact the developer.
================================================================
