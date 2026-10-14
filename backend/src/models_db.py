"""
CardioVision 3D - SQLAlchemy Database Models
Production relational schema for patients, assessments, longitudinal vitals, lab markers, medications, reports, and audit logs.
"""
from datetime import datetime
import json
import uuid
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class PatientModel(Base):
    __tablename__ = "patients"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(128), nullable=False, index=True)
    slug = Column(String(64), unique=True, index=True)
    age = Column(Integer, nullable=False)
    sex = Column(Integer, nullable=False) # 1 = Male, 0 = Female
    email = Column(String(128), nullable=True)
    phone = Column(String(32), nullable=True)
    avatar_url = Column(String(256), nullable=True)
    clinical_summary = Column(Text, nullable=True)
    primary_condition = Column(String(128), nullable=True)
    expected_risk = Column(String(64), nullable=True)
    is_demo = Column(Boolean, default=False)
    
    # Baseline clinical markers (UCI Heart Disease 13 attributes)
    cp = Column(Float, default=4.0)
    trestbps = Column(Float, default=140.0)
    chol = Column(Float, default=260.0)
    fbs = Column(Float, default=0.0)
    restecg = Column(Float, default=0.0)
    thalach = Column(Float, default=142.0)
    exang = Column(Float, default=1.0)
    oldpeak = Column(Float, default=2.2)
    slope = Column(Float, default=2.0)
    ca = Column(Float, default=1.0)
    thal = Column(Float, default=7.0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assessments = relationship("AssessmentRecordModel", back_populates="patient", cascade="all, delete-orphan", order_by="desc(AssessmentRecordModel.created_at)")
    vitals = relationship("VitalLogModel", back_populates="patient", cascade="all, delete-orphan", order_by="desc(VitalLogModel.logged_at)")
    medications = relationship("MedicationModel", back_populates="patient", cascade="all, delete-orphan")
    lab_results = relationship("LabResultModel", back_populates="patient", cascade="all, delete-orphan", order_by="desc(LabResultModel.tested_at)")
    reports = relationship("ClinicalReportModel", back_populates="patient", cascade="all, delete-orphan", order_by="desc(ClinicalReportModel.created_at)")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "age": self.age,
            "sex": self.sex,
            "email": self.email,
            "phone": self.phone,
            "avatar_url": self.avatar_url,
            "clinical_summary": self.clinical_summary,
            "primary_condition": self.primary_condition,
            "expected_risk": self.expected_risk,
            "is_demo": self.is_demo,
            "data": {
                "age": float(self.age),
                "sex": float(self.sex),
                "cp": float(self.cp),
                "trestbps": float(self.trestbps),
                "chol": float(self.chol),
                "fbs": float(self.fbs),
                "restecg": float(self.restecg),
                "thalach": float(self.thalach),
                "exang": float(self.exang),
                "oldpeak": float(self.oldpeak),
                "slope": float(self.slope),
                "ca": float(self.ca),
                "thal": float(self.thal),
            },
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class AssessmentRecordModel(Base):
    __tablename__ = "assessments"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    patient_id = Column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # 13 clinical inputs used for this prediction run
    age = Column(Float, nullable=False)
    sex = Column(Float, nullable=False)
    cp = Column(Float, nullable=False)
    trestbps = Column(Float, nullable=False)
    chol = Column(Float, nullable=False)
    fbs = Column(Float, nullable=False)
    restecg = Column(Float, nullable=False)
    thalach = Column(Float, nullable=False)
    exang = Column(Float, nullable=False)
    oldpeak = Column(Float, nullable=False)
    slope = Column(Float, nullable=False)
    ca = Column(Float, nullable=False)
    thal = Column(Float, nullable=False)

    # Prediction outcomes
    prediction_label = Column(Integer, nullable=False) # 0 = No Disease, 1 = Disease Present
    probability = Column(Float, nullable=False)
    risk_tier = Column(String(64), nullable=False)
    model_version = Column(String(64), default="Cleveland-Ensemble-v1.0")
    
    # Serialized JSON attributes
    shap_drivers_json = Column(Text, nullable=True) # Top contributing risk factors
    clinical_recommendations_json = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationship
    patient = relationship("PatientModel", back_populates="assessments")

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "inputs": {
                "age": self.age,
                "sex": self.sex,
                "cp": self.cp,
                "trestbps": self.trestbps,
                "chol": self.chol,
                "fbs": self.fbs,
                "restecg": self.restecg,
                "thalach": self.thalach,
                "exang": self.exang,
                "oldpeak": self.oldpeak,
                "slope": self.slope,
                "ca": self.ca,
                "thal": self.thal,
            },
            "prediction": self.prediction_label,
            "probability": round(self.probability, 4),
            "risk_tier": self.risk_tier,
            "model_version": self.model_version,
            "shap_drivers": json.loads(self.shap_drivers_json) if self.shap_drivers_json else [],
            "clinical_recommendations": json.loads(self.clinical_recommendations_json) if self.clinical_recommendations_json else [],
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class VitalLogModel(Base):
    __tablename__ = "vitals_logs"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    patient_id = Column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    systolic_bp = Column(Integer, nullable=False) # mm Hg
    diastolic_bp = Column(Integer, nullable=False) # mm Hg
    heart_rate = Column(Integer, nullable=False) # bpm
    cholesterol = Column(Integer, nullable=True) # mg/dl
    st_depression = Column(Float, nullable=True) # mm
    oxygen_saturation = Column(Float, nullable=True) # %
    respiratory_rate = Column(Integer, nullable=True) # breaths/min
    notes = Column(String(256), nullable=True)

    logged_at = Column(DateTime, default=datetime.utcnow, index=True)

    patient = relationship("PatientModel", back_populates="vitals")

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "systolic_bp": self.systolic_bp,
            "diastolic_bp": self.diastolic_bp,
            "heart_rate": self.heart_rate,
            "cholesterol": self.cholesterol,
            "st_depression": self.st_depression,
            "oxygen_saturation": self.oxygen_saturation,
            "respiratory_rate": self.respiratory_rate,
            "notes": self.notes,
            "logged_at": self.logged_at.isoformat() if self.logged_at else None,
        }

class MedicationModel(Base):
    __tablename__ = "medications"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    patient_id = Column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name = Column(String(128), nullable=False)
    dosage = Column(String(64), nullable=False) # e.g. "20 mg"
    frequency = Column(String(64), nullable=False) # e.g. "Once daily"
    time_of_day = Column(String(64), nullable=False) # e.g. "08:00 AM", "08:00 PM"
    indication = Column(String(128), nullable=True) # e.g. "Hyperlipidemia / Plaque Stabilization"
    status = Column(String(32), default="active") # "active", "completed", "paused"
    adherence_pct = Column(Float, default=94.0) # 0.0 - 100.0%
    last_taken_at = Column(DateTime, nullable=True)
    prescribed_by = Column(String(128), default="Dr. Sarah Scott, Cardiologist")

    patient = relationship("PatientModel", back_populates="medications")

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "name": self.name,
            "dosage": self.dosage,
            "frequency": self.frequency,
            "time_of_day": self.time_of_day,
            "indication": self.indication,
            "status": self.status,
            "adherence_pct": self.adherence_pct,
            "last_taken_at": self.last_taken_at.isoformat() if self.last_taken_at else None,
            "prescribed_by": self.prescribed_by,
        }

class LabResultModel(Base):
    __tablename__ = "lab_results"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    patient_id = Column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    test_name = Column(String(128), nullable=False) # e.g. "High-Sensitivity Cardiac Troponin-I (hs-cTnI)"
    category = Column(String(64), nullable=False) # "Cardiac Markers", "Lipid Profile", "Inflammatory", "Glycemic"
    value = Column(Float, nullable=False)
    unit = Column(String(32), nullable=False) # e.g. "ng/L", "mg/dL", "%"
    reference_range = Column(String(64), nullable=False) # e.g. "< 14 ng/L", "< 100 mg/dL"
    status = Column(String(32), default="normal") # "normal", "elevated", "critical", "borderline"
    interpretation = Column(Text, nullable=True)
    tested_at = Column(DateTime, default=datetime.utcnow, index=True)

    patient = relationship("PatientModel", back_populates="lab_results")

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "test_name": self.test_name,
            "category": self.category,
            "value": self.value,
            "unit": self.unit,
            "reference_range": self.reference_range,
            "status": self.status,
            "interpretation": self.interpretation,
            "tested_at": self.tested_at.isoformat() if self.tested_at else None,
        }

class ClinicalReportModel(Base):
    __tablename__ = "clinical_reports"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    patient_id = Column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(256), nullable=False)
    report_type = Column(String(64), nullable=False) # "Cardiology Consultation", "Exercise Stress Echocardiogram", "Coronary CTA", "Biomarker Review"
    physician_name = Column(String(128), default="Dr. Sarah Scott, MD, FACC")
    department = Column(String(128), default="Division of Cardiovascular Medicine")
    findings = Column(Text, nullable=False)
    impression = Column(Text, nullable=False)
    recommendations = Column(Text, nullable=False)
    status = Column(String(32), default="Finalized") # "Finalized", "Addendum", "Preliminary"
    is_confidential = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    patient = relationship("PatientModel", back_populates="reports")

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "title": self.title,
            "report_type": self.report_type,
            "physician_name": self.physician_name,
            "department": self.department,
            "findings": self.findings,
            "impression": self.impression,
            "recommendations": self.recommendations,
            "status": self.status,
            "is_confidential": self.is_confidential,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    action = Column(String(64), nullable=False, index=True) # "inference_run", "vital_logged", "patient_created", "report_exported"
    patient_id = Column(String(64), nullable=True)
    details_json = Column(Text, nullable=True)
    ip_address = Column(String(64), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "action": self.action,
            "patient_id": self.patient_id,
            "details": json.loads(self.details_json) if self.details_json else {},
            "ip_address": self.ip_address,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }

# -------------------------------------------------------------
# USER AUTHENTICATION & CLINICIAN PROFILE MODEL
# -------------------------------------------------------------
import hashlib
import secrets

def hash_password(password: str, salt: str = None) -> str:
    """Generate salted SHA-256 hash for password verification."""
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return f"{salt}${hashed}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Safely compare password against stored salted hash using constant-time comparison."""
    if not stored_hash or "$" not in stored_hash:
        return False
    salt, hashed = stored_hash.split("$", 1)
    test_hashed = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return secrets.compare_digest(hashed, test_hashed)

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    email = Column(String(128), unique=True, nullable=False, index=True)
    password_hash = Column(String(256), nullable=False)
    name = Column(String(128), nullable=False)
    role = Column(String(32), default="cardiologist") # "cardiologist", "physician", "patient", "researcher"
    license_number = Column(String(64), nullable=True)
    hospital_affiliation = Column(String(128), default="Division of Cardiovascular Medicine")
    avatar_url = Column(String(256), nullable=True)
    patient_id = Column(String(64), nullable=True) # Linked patient ID if role is patient
    token = Column(String(128), nullable=True, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "license_number": self.license_number,
            "hospital_affiliation": self.hospital_affiliation,
            "avatar_url": self.avatar_url,
            "patient_id": self.patient_id,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }

