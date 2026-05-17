from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    total_transactions = Column(Integer)
    overall_risk = Column(String)  # LOW, MEDIUM, HIGH
    benford_mad = Column(Float)
    benford_conformity = Column(String)
    ml_flagged_count = Column(Integer)
    network_suspicious_nodes = Column(Integer)
    duplicates_found = Column(Integer)
    nlp_flagged_count = Column(Integer)
    full_results_json = Column(Text)  # store full JSON as text
    created_at = Column(DateTime(timezone=True), server_default=func.now())
