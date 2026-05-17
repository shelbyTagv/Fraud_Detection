# Forensic Analytics Prototype — Setup Guide

## Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows
pip install -r requirements.txt
python utils/data_generator.py  # generates sample_data.csv
uvicorn main:app --reload
```

## Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm start
```

## Access
- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

## Test Data
Use `sample_data.csv` (generated above) to test the system.
The file contains 500 synthetic Zimbabwean manufacturing transactions with ~8% fraud signals injected.

## How it Works
1. Register an account and log in
2. Upload the CSV file on the Dashboard
3. The system automatically:
   - Fetches live exchange rates (ZiG/USD) and normalises all amounts to USD
   - Runs all 5 forensic techniques simultaneously
   - Saves results to the database
4. Explore each technique tab to see detailed findings
5. Export a PDF report for academic submission
6. View past analyses on the History page

## The 5 Forensic Techniques
| # | Technique | What it detects |
|---|-----------|-----------------|
| 1 | Benford's Law | Fabricated/manipulated transaction amounts |
| 2 | ML Isolation Forest | Statistical outliers — unusual transactions |
| 3 | Network Analysis | Collusion rings and suspicious payment hubs |
| 4 | Duplicate Detection | Double payments and shell company name variants |
| 5 | NLP Keyword Scan | Red-flag language in transaction descriptions |
