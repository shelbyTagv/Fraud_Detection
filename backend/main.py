# MAIN BACKEND — FastAPI Application
# Runs on localhost:8000
# Handles: auth, CSV upload, analysis, history, PDF export

import io
import json
from datetime import datetime, timedelta
from typing import Optional

import pandas as pd
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import bcrypt as bcrypt_lib
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
from database import engine, get_db, SessionLocal
from analysis.benfords import run_benfords_analysis
from analysis.ml_anomaly import run_ml_anomaly_detection
from utils.currency import get_exchange_rates, normalise_to_usd
from utils.pdf_export import generate_pdf_report

# Create all database tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Forensic Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Vercel frontend to connect
    allow_methods=["*"],
    allow_headers=["*"],
)

from dotenv import load_dotenv
import os

load_dotenv()

# --- AUTH CONFIG ---
SECRET_KEY = os.getenv("SECRET_KEY", "forensic-analytics-hit-2026-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# --- PYDANTIC SCHEMAS ---
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


# --- AUTH HELPERS ---
def hash_password(password: str) -> str:
    return bcrypt_lib.hashpw(password.encode("utf-8"), bcrypt_lib.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt_lib.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(models.User).filter(models.User.username == username).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# --- AUTH ROUTES ---
@app.post("/auth/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(models.User).filter(models.User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password)
    )
    db.add(user)
    db.commit()
    return {"message": "Account created successfully"}

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "username": user.username}


# --- MAIN ANALYSIS ENDPOINT ---
@app.post("/analyse")
async def analyse(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Read and parse CSV
    content = await file.read()
    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read CSV file. Ensure it is valid.")

    # Normalise column names
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    if "amount" not in df.columns:
        raise HTTPException(status_code=400, detail="CSV must have an 'amount' column.")

    if len(df) < 10:
        raise HTTPException(status_code=400, detail="Need at least 10 transactions for analysis.")

    # Get live exchange rates and convert to USD
    rate_result = get_exchange_rates()
    df = normalise_to_usd(df, rate_result["rates"])

    # Run the 2 forensic analytics techniques
    benford = run_benfords_analysis(df)
    ml = run_ml_anomaly_detection(df)

    # Overall risk is based on these 2 techniques only
    risks = [benford.get("risk"), ml.get("risk")]
    high_count = risks.count("HIGH")
    overall_risk = "HIGH" if high_count == 2 else "MEDIUM" if high_count == 1 else "LOW"

    results = {
        "filename":             file.filename,
        "total_rows":           len(df),
        "overall_risk":         overall_risk,
        "exchange_rate_source": rate_result["source"],
        "zig_rate_used":        rate_result["rates"].get("ZIG", "N/A"),
        "exchange_rates_used":  rate_result["rates"],
        "benford":              benford,
        "ml_anomalies":         ml,
    }

    # Save to database
    db_result = models.AnalysisResult(
        user_id=current_user.id,
        filename=file.filename,
        total_transactions=len(df),
        overall_risk=overall_risk,
        benford_mad=benford.get("mad"),
        benford_conformity=benford.get("conformity"),
        ml_flagged_count=ml.get("flagged_count", 0),
        full_results_json=json.dumps(results)
    )
    db.add(db_result)
    db.commit()
    db.refresh(db_result)

    results["analysis_id"] = db_result.id
    return results


# --- HISTORY ENDPOINT ---
@app.get("/history")
def get_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = (
        db.query(models.AnalysisResult)
        .filter(models.AnalysisResult.user_id == current_user.id)
        .order_by(models.AnalysisResult.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "total_transactions": r.total_transactions,
            "overall_risk": r.overall_risk,
            "benford_conformity": r.benford_conformity,
            "ml_flagged_count": r.ml_flagged_count,
            "created_at": r.created_at.strftime("%d %b %Y, %H:%M") if r.created_at else ""
        }
        for r in records
    ]


# --- PDF EXPORT ENDPOINT ---
@app.get("/export/{analysis_id}")
def export_pdf(
    analysis_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(models.AnalysisResult).filter(
        models.AnalysisResult.id == analysis_id,
        models.AnalysisResult.user_id == current_user.id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")

    results = json.loads(record.full_results_json)
    pdf_bytes = generate_pdf_report(results, current_user.username)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="forensic_report_{analysis_id}.pdf"'
        }
    )


# --- HEALTH CHECK ---
@app.get("/")
def root():
    return {"status": "Forensic Analytics API is running", "version": "1.0.0"}
