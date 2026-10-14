"""
CardioVision 3D - Production FastAPI Application
Provides REST API endpoints for model inference, patient EHR database management,
longitudinal vitals, medications, 12 clinical reports, laboratory biomarkers, and audit logs.
"""
import os
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Query, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import engine, get_db, Base
from models_db import (
    PatientModel, AssessmentRecordModel, VitalLogModel,
    MedicationModel, LabResultModel, ClinicalReportModel, AuditLogModel,
    UserModel, hash_password, verify_password
)
from seed_data import seed_database
from predict import InferenceEngine

# Global Inference Engine
inference_engine: Optional[InferenceEngine] = None

def get_engine() -> InferenceEngine:
    global inference_engine
    if inference_engine is None:
        inference_engine = InferenceEngine()
    return inference_engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize and Seed Database
    try:
        seed_database()
        print("Database schema verified and initial clinical records seeded.")
    except Exception as e:
        print(f"Warning: Database seeding notice: {e}")

    # 2. Pre-warm Inference Engine
    try:
        get_engine()
        print("Inference Engine loaded successfully.")
    except Exception as e:
        print(f"Warning: Inference Engine startup notice: {e}")

    yield

app = FastAPI(
    title="CardioVision 3D API",
    description="Production-grade AI Cardiovascular Intelligence Platform based on the UCI Heart Disease Dataset",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Enable CORS for local development and production web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# PYDANTIC SCHEMAS
# -------------------------------------------------------------
class PatientInput(BaseModel):
    age: float = Field(..., ge=18.0, le=100.0, description="Patient age in years (18-100)")
    sex: float = Field(..., ge=0.0, le=1.0, description="Sex (1 = male; 0 = female)")
    cp: float = Field(..., ge=1.0, le=4.0, description="Chest pain type (1: typical, 2: atypical, 3: non-anginal, 4: asymptomatic)")
    trestbps: float = Field(..., ge=70.0, le=250.0, description="Resting blood pressure in mm Hg (70-250)")
    chol: float = Field(..., ge=80.0, le=700.0, description="Serum cholesterol in mg/dl (80-700)")
    fbs: float = Field(..., ge=0.0, le=1.0, description="Fasting blood sugar > 120 mg/dl (1 = true; 0 = false)")
    restecg: float = Field(..., ge=0.0, le=2.0, description="Resting ECG (0: normal, 1: ST-T wave abnormality, 2: LV hypertrophy)")
    thalach: float = Field(..., ge=50.0, le=230.0, description="Maximum heart rate achieved (50-230 bpm)")
    exang: float = Field(..., ge=0.0, le=1.0, description="Exercise induced angina (1 = yes; 0 = no)")
    oldpeak: float = Field(..., ge=0.0, le=10.0, description="ST depression induced by exercise (0.0-10.0 mm)")
    slope: float = Field(..., ge=1.0, le=3.0, description="Slope of the peak exercise ST segment (1: upsloping, 2: flat, 3: downsloping)")
    ca: float = Field(..., ge=0.0, le=3.0, description="Number of major vessels (0-3) colored by fluoroscopy")
    thal: float = Field(..., description="Thallium scintigraphy (3: normal, 6: fixed defect, 7: reversible defect)")
    patient_id: Optional[str] = Field(None, description="Optional patient ID to automatically record assessment into database")

    @field_validator("thal")
    @classmethod
    def validate_thal(cls, v):
        if float(v) not in [3.0, 6.0, 7.0]:
            raise ValueError("thal must be 3.0 (normal), 6.0 (fixed defect), or 7.0 (reversible defect)")
        return float(v)

class CreatePatientSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=128)
    age: int = Field(..., ge=18, le=100)
    sex: int = Field(..., ge=0, le=1)
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    clinical_summary: Optional[str] = None
    primary_condition: Optional[str] = None
    expected_risk: Optional[str] = None
    cp: float = 4.0
    trestbps: float = 140.0
    chol: float = 240.0
    fbs: float = 0.0
    restecg: float = 0.0
    thalach: float = 140.0
    exang: float = 0.0
    oldpeak: float = 1.0
    slope: float = 2.0
    ca: float = 0.0
    thal: float = 3.0

class UpdatePatientSchema(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[int] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    clinical_summary: Optional[str] = None
    primary_condition: Optional[str] = None
    cp: Optional[float] = None
    trestbps: Optional[float] = None
    chol: Optional[float] = None
    fbs: Optional[float] = None
    restecg: Optional[float] = None
    thalach: Optional[float] = None
    exang: Optional[float] = None
    oldpeak: Optional[float] = None
    slope: Optional[float] = None
    ca: Optional[float] = None
    thal: Optional[float] = None

class CreateVitalSchema(BaseModel):
    systolic_bp: int = Field(..., ge=60, le=260)
    diastolic_bp: int = Field(..., ge=40, le=160)
    heart_rate: int = Field(..., ge=40, le=220)
    cholesterol: Optional[int] = Field(None, ge=80, le=600)
    st_depression: Optional[float] = Field(None, ge=0.0, le=10.0)
    oxygen_saturation: Optional[float] = Field(None, ge=70.0, le=100.0)
    respiratory_rate: Optional[int] = Field(None, ge=8, le=45)
    notes: Optional[str] = None

class CreateMedicationSchema(BaseModel):
    name: str = Field(..., min_length=2)
    dosage: str
    frequency: str
    time_of_day: str
    indication: Optional[str] = None
    prescribed_by: Optional[str] = "Dr. Sarah Scott, Cardiologist"

class CreateReportSchema(BaseModel):
    title: str = Field(..., min_length=4)
    report_type: str = "Cardiology Consultation"
    physician_name: str = "Dr. Sarah Scott, MD, FACC"
    department: str = "Division of Cardiovascular Medicine"
    findings: str
    impression: str
    recommendations: str
    status: str = "Finalized"

class LoginRequest(BaseModel):
    email: str
    password: str

# -------------------------------------------------------------
# 0. AUTHENTICATION & CLINICAL SESSION MANAGEMENT
# -------------------------------------------------------------
@app.post("/api/auth/login", tags=["Authentication"])
def login(payload: LoginRequest, req: Request, db: Session = Depends(get_db)):
    """Authenticate clinician or patient and issue session token."""
    user = db.query(UserModel).filter(UserModel.email.ilike(payload.email.strip())).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email credentials or clinical password."
        )

    # Issue secure session token
    import secrets
    session_token = secrets.token_urlsafe(32)
    user.token = session_token
    user.last_login = datetime.utcnow()
    
    # Audit trail
    db.add(AuditLogModel(
        action="user_login",
        patient_id=user.patient_id or user.id,
        details_json=json.dumps({"email": user.email, "role": user.role, "name": user.name}),
        ip_address=req.client.host if req.client else "127.0.0.1"
    ))
    db.commit()
    db.refresh(user)

    return {
        "status": "authenticated",
        "token": session_token,
        "user": user.to_dict()
    }

@app.get("/api/auth/me", tags=["Authentication"])
def get_current_user(token: Optional[str] = None, req: Request = None, db: Session = Depends(get_db)):
    """Retrieve profile of authenticated clinician or patient from token."""
    auth_header = req.headers.get("Authorization") if req else None
    user_token = token
    if auth_header and auth_header.startswith("Bearer "):
        user_token = auth_header.split(" ")[1]

    if not user_token:
        # Default to Dr. Sarah Scott for seamless clinical preview if no token
        demo_user = db.query(UserModel).first()
        return demo_user.to_dict() if demo_user else {"role": "guest"}

    user = db.query(UserModel).filter(UserModel.token == user_token).first()
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid token.")

    return user.to_dict()

@app.post("/api/auth/logout", tags=["Authentication"])
def logout(req: Request, db: Session = Depends(get_db)):
    """Revoke active user session."""
    auth_header = req.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        user = db.query(UserModel).filter(UserModel.token == token).first()
        if user:
            user.token = None
            db.commit()
    return {"message": "Session terminated successfully."}

@app.get("/api/auth/demo-users", tags=["Authentication"])
def get_demo_users():
    """Return quick credentials for 1-click clinical login and patient portal."""
    return {
        "personas": [
            {
                "id": "user-sarah-scott",
                "email": "sarah.scott@cardiovision.care",
                "password": "CardioPass2026!",
                "name": "Dr. Sarah Scott, MD, FACC",
                "role": "Lead Cardiologist",
                "portal_type": "clinical",
                "hospital": "Division of Cardiovascular Medicine",
                "badge": "Attending Physician",
                "avatar_url": "https://images.unsplash.com/photo-1594824813639-5094252a16d5?w=120&auto=format&fit=crop&q=80"
            },
            {
                "id": "user-robert-sterling",
                "email": "robert.sterling@cardiovision.care",
                "password": "CardioPass2026!",
                "name": "Dr. Robert Sterling, MD, FSCAI",
                "role": "Interventional Cardiologist",
                "portal_type": "clinical",
                "hospital": "Interventional Catheterization Lab",
                "badge": "Surgical Specialist",
                "avatar_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80"
            },
            {
                "id": "user-david-berg",
                "email": "david.berg@healthsync.care",
                "password": "DavidCardio2026!",
                "name": "David Berg",
                "role": "Patient Portal",
                "portal_type": "patient",
                "patient_id": "patient-david-berg",
                "hospital": "Stage 1 Hypertension & Ischemia",
                "badge": "Patient Account",
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
            },
            {
                "id": "user-eleanor-turner",
                "email": "eleanor.turner@seniorcare.org",
                "password": "EleanorCardio2026!",
                "name": "Eleanor T.",
                "role": "Patient Portal",
                "portal_type": "patient",
                "patient_id": "patient-eleanor-t",
                "hospital": "Microvascular Care & Fixed Defect",
                "badge": "Patient Account",
                "avatar_url": "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=120&auto=format&fit=crop&q=80"
            }
        ]
    }

# -------------------------------------------------------------
# 1. SYSTEM HEALTH & MONITORING ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    """Advanced production health probe verifying ML engine, DB connectivity, and database row counts."""
    eng = get_engine()
    model_loaded = eng is not None and eng.model is not None

    db_healthy = False
    counts = {}
    try:
        patient_count = db.query(PatientModel).count()
        report_count = db.query(ClinicalReportModel).count()
        vitals_count = db.query(VitalLogModel).count()
        db_healthy = True
        counts = {
            "patients": patient_count,
            "reports": report_count,
            "vitals": vitals_count
        }
    except Exception as e:
        counts["error"] = str(e)

    overall_status = "healthy" if (model_loaded and db_healthy) else "degraded"

    return {
        "status": overall_status,
        "model_loaded": model_loaded,
        "timestamp": datetime.utcnow().isoformat(),
        "service": "CardioVision 3D Intelligence Platform",
        "version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "production"),
        "subsystems": {
            "machine_learning_engine": {
                "status": "ready" if model_loaded else "unavailable",
                "model_version": "Cleveland-Ensemble-v1.0",
                "metrics": {
                    "roc_auc": 0.852,
                    "sensitivity": 0.88,
                    "specificity": 0.82
                }
            },
            "relational_database": {
                "status": "connected" if db_healthy else "disconnected",
                "dialect": engine.dialect.name,
                "counts": counts
            }
        }
    }

@app.get("/api/model-info", tags=["Machine Learning"])
def get_model_info():
    """Retrieve full ML training metadata, cross-validation metrics, and feature importances."""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    metrics_path = os.path.join(base_dir, "models", "metrics.json")
    if not os.path.exists(metrics_path):
        raise HTTPException(status_code=404, detail="Model metrics file not found.")
    with open(metrics_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

# -------------------------------------------------------------
# 2. PATIENTS CRUD API
# -------------------------------------------------------------
@app.get("/api/patients", tags=["Patients"])
def list_patients(db: Session = Depends(get_db)):
    """List all registered cardiovascular patients with clinical metadata."""
    patients = db.query(PatientModel).order_by(PatientModel.name).all()
    return {"patients": [p.to_dict() for p in patients]}

@app.get("/api/sample-patients", tags=["Patients"])
def get_sample_patients(db: Session = Depends(get_db)):
    """Compatibility endpoint returning active patients formatted for frontend selectors."""
    patients = db.query(PatientModel).order_by(PatientModel.name).all()
    return {"samples": [p.to_dict() for p in patients]}

@app.get("/api/patients/{patient_id}", tags=["Patients"])
def get_patient_detail(patient_id: str, db: Session = Depends(get_db)):
    """Get single patient complete profile including latest vitals, medications, and risk score."""
    patient = db.query(PatientModel).filter(
        (PatientModel.id == patient_id) | (PatientModel.slug == patient_id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient '{patient_id}' not found.")

    p_dict = patient.to_dict()
    # Add recent summary objects
    p_dict["latest_vitals"] = [v.to_dict() for v in patient.vitals[:5]]
    p_dict["medications"] = [m.to_dict() for m in patient.medications]
    p_dict["reports_count"] = len(patient.reports)
    p_dict["latest_assessment"] = patient.assessments[0].to_dict() if patient.assessments else None
    return p_dict

@app.post("/api/patients", status_code=status.HTTP_201_CREATED, tags=["Patients"])
def create_patient(payload: CreatePatientSchema, req: Request, db: Session = Depends(get_db)):
    """Register a new patient into the clinical database."""
    slug_candidate = payload.name.lower().replace(" ", "-")
    existing = db.query(PatientModel).filter(PatientModel.slug == slug_candidate).first()
    slug = f"{slug_candidate}-{int(datetime.utcnow().timestamp())}" if existing else slug_candidate

    patient = PatientModel(
        name=payload.name,
        slug=slug,
        age=payload.age,
        sex=payload.sex,
        email=payload.email,
        phone=payload.phone,
        avatar_url=payload.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        clinical_summary=payload.clinical_summary or f"{payload.age}y patient registered for cardiovascular assessment.",
        primary_condition=payload.primary_condition or "Cardiovascular Evaluation",
        expected_risk=payload.expected_risk or "To Be Determined",
        is_demo=False,
        cp=payload.cp,
        trestbps=payload.trestbps,
        chol=payload.chol,
        fbs=payload.fbs,
        restecg=payload.restecg,
        thalach=payload.thalach,
        exang=payload.exang,
        oldpeak=payload.oldpeak,
        slope=payload.slope,
        ca=payload.ca,
        thal=payload.thal
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # Initial vital log
    initial_vital = VitalLogModel(
        patient_id=patient.id,
        systolic_bp=int(payload.trestbps),
        diastolic_bp=int(80 + (payload.trestbps - 120) * 0.25),
        heart_rate=int(payload.thalach * 0.55),
        cholesterol=int(payload.chol),
        st_depression=float(payload.oldpeak),
        oxygen_saturation=98.0,
        notes="Initial intake recording"
    )
    db.add(initial_vital)

    # Audit log
    db.add(AuditLogModel(
        action="patient_created",
        patient_id=patient.id,
        details_json=json.dumps({"name": patient.name, "age": patient.age}),
        ip_address=req.client.host if req.client else "127.0.0.1"
    ))
    db.commit()

    return patient.to_dict()

@app.put("/api/patients/{patient_id}", tags=["Patients"])
def update_patient(patient_id: str, payload: UpdatePatientSchema, db: Session = Depends(get_db)):
    """Update patient demographic and baseline clinical markers."""
    patient = db.query(PatientModel).filter(
        (PatientModel.id == patient_id) | (PatientModel.slug == patient_id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(patient, key, value)
    
    patient.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(patient)
    return patient.to_dict()

@app.delete("/api/patients/{patient_id}", tags=["Patients"])
def delete_patient(patient_id: str, db: Session = Depends(get_db)):
    """Delete patient and cascade delete associated records."""
    patient = db.query(PatientModel).filter(
        (PatientModel.id == patient_id) | (PatientModel.slug == patient_id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    
    db.delete(patient)
    db.commit()
    return {"message": f"Patient '{patient.name}' successfully deleted."}

# -------------------------------------------------------------
# 3. PREDICTION & ASSESSMENTS API
# -------------------------------------------------------------
@app.post("/api/predict", tags=["Machine Learning"])
def predict_heart_disease(patient_input: PatientInput, req: Request, db: Session = Depends(get_db)):
    """
    Run real Cleveland Ensemble machine learning model inference.
    If `patient_id` is supplied, automatically persists assessment record and updates audit logs.
    """
    try:
        eng = get_engine()
        input_dict = patient_input.model_dump(exclude={"patient_id"})
        result = eng.predict_patient(input_dict)

        # Automatically persist assessment to database if patient_id is present
        if patient_input.patient_id:
            patient = db.query(PatientModel).filter(
                (PatientModel.id == patient_input.patient_id) | (PatientModel.slug == patient_input.patient_id)
            ).first()

            if patient:
                assessment = AssessmentRecordModel(
                    patient_id=patient.id,
                    age=patient_input.age,
                    sex=patient_input.sex,
                    cp=patient_input.cp,
                    trestbps=patient_input.trestbps,
                    chol=patient_input.chol,
                    fbs=patient_input.fbs,
                    restecg=patient_input.restecg,
                    thalach=patient_input.thalach,
                    exang=patient_input.exang,
                    oldpeak=patient_input.oldpeak,
                    slope=patient_input.slope,
                    ca=patient_input.ca,
                    thal=patient_input.thal,
                    prediction_label=result.get("predicted_class", result.get("prediction", 0)),
                    probability=result.get("probability", 0.5),
                    risk_tier=result.get("risk_category", result.get("risk_tier", "Intermediate Risk")),
                    model_version="Cleveland-Ensemble-v1.0",
                    shap_drivers_json=json.dumps(result.get("feature_attributions", result.get("top_factors", []))),
                    clinical_recommendations_json=json.dumps(result.get("clinical_observations", result.get("clinical_recommendations", []))),
                    notes="Automated prediction run via UI workspace."
                )
                db.add(assessment)

                # Log audit
                db.add(AuditLogModel(
                    action="inference_run",
                    patient_id=patient.id,
                    details_json=json.dumps({
                        "probability": result.get("probability"),
                        "risk_tier": result.get("risk_tier")
                    }),
                    ip_address=req.client.host if req.client else "127.0.0.1"
                ))
                db.commit()
                result["saved_assessment_id"] = assessment.id

        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Inference execution failed: {str(e)}")

@app.get("/api/patients/{patient_id}/assessments", tags=["Assessments"])
def get_patient_assessments(patient_id: str, db: Session = Depends(get_db)):
    """Retrieve historical risk assessments and SHAP factor trends for a patient."""
    patient = db.query(PatientModel).filter(
        (PatientModel.id == patient_id) | (PatientModel.slug == patient_id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    return {
        "patient_id": patient.id,
        "patient_name": patient.name,
        "assessments": [a.to_dict() for a in patient.assessments]
    }

# -------------------------------------------------------------
# 4. LONGITUDINAL VITALS API
# -------------------------------------------------------------
@app.get("/api/patients/{patient_id}/vitals", tags=["Vitals"])
def get_patient_vitals(patient_id: str, limit: int = 30, db: Session = Depends(get_db)):
    """Get chronological longitudinal vital sign readings for charting and trend evaluation."""
    patient = db.query(PatientModel).filter(
        (PatientModel.id == patient_id) | (PatientModel.slug == patient_id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    vitals = db.query(VitalLogModel).filter(
        VitalLogModel.patient_id == patient.id
    ).order_by(VitalLogModel.logged_at.desc()).limit(limit).all()

    return {
        "patient_id": patient.id,
        "patient_name": patient.name,
        "vitals": [v.to_dict() for v in reversed(vitals)] # Return chronological (oldest to newest)
    }

@app.post("/api/patients/{patient_id}/vitals", status_code=status.HTTP_201_CREATED, tags=["Vitals"])
def log_vital_reading(patient_id: str, payload: CreateVitalSchema, db: Session = Depends(get_db)):
    """Log a new vital sign observation for a patient."""
    patient = db.query(PatientModel).filter(
        (PatientModel.id == patient_id) | (PatientModel.slug == patient_id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    vital = VitalLogModel(
        patient_id=patient.id,
        systolic_bp=payload.systolic_bp,
        diastolic_bp=payload.diastolic_bp,
        heart_rate=payload.heart_rate,
        cholesterol=payload.cholesterol,
        st_depression=payload.st_depression,
        oxygen_saturation=payload.oxygen_saturation or 98.0,
        respiratory_rate=payload.respiratory_rate or 16,
        notes=payload.notes,
        logged_at=datetime.utcnow()
    )
    db.add(vital)

    # Synchronize patient baseline markers
    patient.trestbps = float(payload.systolic_bp)
    patient.thalach = float(payload.heart_rate)
    if payload.cholesterol:
        patient.chol = float(payload.cholesterol)
    if payload.st_depression is not None:
        patient.oldpeak = float(payload.st_depression)

    db.commit()
    db.refresh(vital)
    return vital.to_dict()

# -------------------------------------------------------------
# 5. MEDICATIONS API
# -------------------------------------------------------------
@app.get("/api/patients/{patient_id}/medications", tags=["Medications"])
def get_patient_medications(patient_id: str, db: Session = Depends(get_db)):
    """Retrieve full prescription regimen and adherence statistics."""
    patient = db.query(PatientModel).filter(
        (PatientModel.id == patient_id) | (PatientModel.slug == patient_id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    return {
        "patient_id": patient.id,
        "medications": [m.to_dict() for m in patient.medications]
    }

@app.post("/api/patients/{patient_id}/medications", status_code=status.HTTP_201_CREATED, tags=["Medications"])
def add_patient_medication(patient_id: str, payload: CreateMedicationSchema, db: Session = Depends(get_db)):
    """Add a new prescription medication to a patient's regimen."""
    patient = db.query(PatientModel).filter(
        (PatientModel.id == patient_id) | (PatientModel.slug == patient_id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    med = MedicationModel(
        patient_id=patient.id,
        name=payload.name,
        dosage=payload.dosage,
        frequency=payload.frequency,
        time_of_day=payload.time_of_day,
        indication=payload.indication,
        prescribed_by=payload.prescribed_by
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return med.to_dict()

@app.patch("/api/medications/{med_id}/take", tags=["Medications"])
def mark_medication_taken(med_id: str, db: Session = Depends(get_db)):
    """Mark a daily dose as taken, updating adherence rate and timestamp."""
    med = db.query(MedicationModel).filter(MedicationModel.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found.")

    med.last_taken_at = datetime.utcnow()
    med.adherence_pct = min(100.0, med.adherence_pct + 1.5)
    db.commit()
    db.refresh(med)
    return med.to_dict()

# -------------------------------------------------------------
# 6. LAB RESULTS & BIOMARKERS API
# -------------------------------------------------------------
@app.get("/api/patients/{patient_id}/labs", tags=["Laboratory"])
def get_patient_labs(patient_id: str, db: Session = Depends(get_db)):
    """Get laboratory panels (Troponin, hs-CRP, Lipid Profile, HbA1c, NT-proBNP)."""
    patient = db.query(PatientModel).filter(
        (PatientModel.id == patient_id) | (PatientModel.slug == patient_id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    return {
        "patient_id": patient.id,
        "labs": [l.to_dict() for l in patient.lab_results]
    }

# -------------------------------------------------------------
# 7. CLINICAL REPORTS ARCHIVE API (12 Reports!)
# -------------------------------------------------------------
@app.get("/api/reports", tags=["Reports"])
def list_clinical_reports(
    report_type: Optional[str] = None,
    patient_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Retrieve diagnostic reports archive across patients with filtering."""
    query = db.query(ClinicalReportModel)
    if report_type:
        query = query.filter(ClinicalReportModel.report_type.ilike(f"%{report_type}%"))
    if patient_id:
        p = db.query(PatientModel).filter(
            (PatientModel.id == patient_id) | (PatientModel.slug == patient_id)
        ).first()
        if p:
            query = query.filter(ClinicalReportModel.patient_id == p.id)

    reports = query.order_by(ClinicalReportModel.created_at.desc()).limit(limit).all()
    
    result = []
    for r in reports:
        d = r.to_dict()
        d["patient_name"] = r.patient.name if r.patient else "Unknown"
        result.append(d)

    return {
        "total_reports": len(result),
        "reports": result
    }

@app.get("/api/patients/{patient_id}/reports", tags=["Reports"])
def get_patient_reports(patient_id: str, db: Session = Depends(get_db)):
    """Get clinical reports for a specific patient."""
    patient = db.query(PatientModel).filter(
        (PatientModel.id == patient_id) | (PatientModel.slug == patient_id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    return {
        "patient_id": patient.id,
        "patient_name": patient.name,
        "reports": [r.to_dict() for r in patient.reports]
    }

@app.post("/api/patients/{patient_id}/reports", status_code=status.HTTP_201_CREATED, tags=["Reports"])
def create_clinical_report(patient_id: str, payload: CreateReportSchema, db: Session = Depends(get_db)):
    """Generate and file an official clinical report for a patient."""
    patient = db.query(PatientModel).filter(
        (PatientModel.id == patient_id) | (PatientModel.slug == patient_id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    report = ClinicalReportModel(
        patient_id=patient.id,
        title=payload.title,
        report_type=payload.report_type,
        physician_name=payload.physician_name,
        department=payload.department,
        findings=payload.findings,
        impression=payload.impression,
        recommendations=payload.recommendations,
        status=payload.status,
        created_at=datetime.utcnow()
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report.to_dict()

# -------------------------------------------------------------
# 8. AUDIT LOGS & EXPORT DOSSIER
# -------------------------------------------------------------
@app.get("/api/audit-logs", tags=["Compliance"])
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    """Retrieve HIPAA/clinical compliance audit trail."""
    logs = db.query(AuditLogModel).order_by(AuditLogModel.timestamp.desc()).limit(limit).all()
    return {"audit_logs": [l.to_dict() for l in logs]}

@app.get("/api/export/{patient_id}", tags=["Export"])
def export_patient_dossier(patient_id: str, db: Session = Depends(get_db)):
    """Export complete longitudinal medical dossier in JSON format for EMR transmission."""
    patient = db.query(PatientModel).filter(
        (PatientModel.id == patient_id) | (PatientModel.slug == patient_id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    return {
        "export_metadata": {
            "system": "CardioVision 3D Intelligence Platform",
            "version": "2.0.0",
            "exported_at": datetime.utcnow().isoformat(),
            "format": "JSON-EHR-Standard"
        },
        "patient": patient.to_dict(),
        "assessments": [a.to_dict() for a in patient.assessments],
        "vitals_history": [v.to_dict() for v in patient.vitals],
        "medications": [m.to_dict() for m in patient.medications],
        "lab_results": [l.to_dict() for l in patient.lab_results],
        "clinical_reports": [r.to_dict() for r in patient.reports]
    }

# -------------------------------------------------------------
# 9. STATIC FRONTEND MOUNT FOR PRODUCTION
# -------------------------------------------------------------
dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="frontend")
