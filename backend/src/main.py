"""
CardioVision 3D - FastAPI Application
Provides REST API endpoints for model inference, model metrics, clinical explanations, and sample data.
"""
import os
import json
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from predict import InferenceEngine

from contextlib import asynccontextmanager

# Initialize Inference Engine
engine: Optional[InferenceEngine] = None

def get_engine() -> InferenceEngine:
    global engine
    if engine is None:
        engine = InferenceEngine()
    return engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model at startup
    try:
        get_engine()
        print("Inference Engine loaded successfully.")
    except Exception as e:
        print(f"Warning: Failed to load inference engine at startup: {e}")
    yield

app = FastAPI(
    title="CardioVision 3D API",
    description="Machine Learning & Cardiovascular Visualization API based on the UCI Heart Disease Dataset",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PatientInput(BaseModel):
    age: float = Field(..., ge=18.0, le=100.0, description="Patient age in years (18-100)")
    sex: float = Field(..., ge=0.0, le=1.0, description="Sex (1 = male; 0 = female)")
    cp: float = Field(..., ge=1.0, le=4.0, description="Chest pain type (1: typical angina, 2: atypical angina, 3: non-anginal pain, 4: asymptomatic)")
    trestbps: float = Field(..., ge=70.0, le=250.0, description="Resting blood pressure in mm Hg (70-250)")
    chol: float = Field(..., ge=80.0, le=700.0, description="Serum cholesterol in mg/dl (80-700)")
    fbs: float = Field(..., ge=0.0, le=1.0, description="Fasting blood sugar > 120 mg/dl (1 = true; 0 = false)")
    restecg: float = Field(..., ge=0.0, le=2.0, description="Resting ECG (0: normal, 1: ST-T wave abnormality, 2: left ventricular hypertrophy)")
    thalach: float = Field(..., ge=50.0, le=230.0, description="Maximum heart rate achieved (50-230 bpm)")
    exang: float = Field(..., ge=0.0, le=1.0, description="Exercise induced angina (1 = yes; 0 = no)")
    oldpeak: float = Field(..., ge=0.0, le=10.0, description="ST depression induced by exercise relative to rest (0.0-10.0 mm)")
    slope: float = Field(..., ge=1.0, le=3.0, description="Slope of the peak exercise ST segment (1: upsloping, 2: flat, 3: downsloping)")
    ca: float = Field(..., ge=0.0, le=3.0, description="Number of major vessels (0-3) colored by fluoroscopy")
    thal: float = Field(..., description="Thallium scintigraphy (3: normal, 6: fixed defect, 7: reversible defect)")

    @field_validator("thal")
    @classmethod
    def validate_thal(cls, v):
        if float(v) not in [3.0, 6.0, 7.0]:
            raise ValueError("thal must be 3.0 (normal), 6.0 (fixed defect), or 7.0 (reversible defect)")
        return float(v)

    model_config = {
        "json_schema_extra": {
            "example": {
                "age": 58.0,
                "sex": 1.0,
                "cp": 4.0,
                "trestbps": 140.0,
                "chol": 260.0,
                "fbs": 0.0,
                "restecg": 0.0,
                "thalach": 142.0,
                "exang": 1.0,
                "oldpeak": 2.2,
                "slope": 2.0,
                "ca": 1.0,
                "thal": 7.0
            }
        }
    }

SAMPLE_PATIENTS = [
    {
        "id": "low_risk_female",
        "name": "Sarah J. (42y Female)",
        "clinical_summary": "Active 42-year-old female presenting for routine physical. Non-anginal atypical chest sensation, normal resting ECG, excellent exercise tolerance.",
        "expected_risk": "Low (< 15%)",
        "is_demo": True,
        "data": {
            "age": 42.0,
            "sex": 0.0,
            "cp": 3.0,
            "trestbps": 115.0,
            "chol": 178.0,
            "fbs": 0.0,
            "restecg": 0.0,
            "thalach": 172.0,
            "exang": 0.0,
            "oldpeak": 0.2,
            "slope": 1.0,
            "ca": 0.0,
            "thal": 3.0
        }
    },
    {
        "id": "high_risk_male",
        "name": "Robert M. (63y Male)",
        "clinical_summary": "63-year-old male with silent ischemia presentation, asymptomatic chest discomfort, hypertension, hyperlipidemia, and reversible perfusion defect on stress scan.",
        "expected_risk": "High (> 80%)",
        "is_demo": True,
        "data": {
            "age": 63.0,
            "sex": 1.0,
            "cp": 4.0,
            "trestbps": 152.0,
            "chol": 285.0,
            "fbs": 1.0,
            "restecg": 2.0,
            "thalach": 118.0,
            "exang": 1.0,
            "oldpeak": 2.6,
            "slope": 2.0,
            "ca": 2.0,
            "thal": 7.0
        }
    },
    {
        "id": "intermediate_male",
        "name": "David K. (54y Male)",
        "clinical_summary": "54-year-old male with mild exertional shortness of breath, borderline blood pressure, moderate cholesterol, flat ST slope on stress ECG.",
        "expected_risk": "Intermediate (35% - 55%)",
        "is_demo": True,
        "data": {
            "age": 54.0,
            "sex": 1.0,
            "cp": 2.0,
            "trestbps": 134.0,
            "chol": 236.0,
            "fbs": 0.0,
            "restecg": 0.0,
            "thalach": 148.0,
            "exang": 0.0,
            "oldpeak": 1.2,
            "slope": 2.0,
            "ca": 0.0,
            "thal": 3.0
        }
    },
    {
        "id": "atypical_elderly",
        "name": "Eleanor T. (71y Female)",
        "clinical_summary": "71-year-old female with typical anginal chest episodes, controlled blood pressure, 1 fluoroscopic calcified vessel, and fixed apical perfusion defect.",
        "expected_risk": "Elevated (~60% - 75%)",
        "is_demo": True,
        "data": {
            "age": 71.0,
            "sex": 0.0,
            "cp": 1.0,
            "trestbps": 128.0,
            "chol": 242.0,
            "fbs": 0.0,
            "restecg": 1.0,
            "thalach": 130.0,
            "exang": 0.0,
            "oldpeak": 1.4,
            "slope": 2.0,
            "ca": 1.0,
            "thal": 6.0
        }
    }
]

@app.get("/api/health")
def health_check():
    eng = get_engine()
    return {
        "status": "healthy",
        "service": "CardioVision 3D Backend",
        "model_loaded": eng is not None and eng.model is not None,
        "version": "1.0.0"
    }

@app.get("/api/model-info")
def get_model_info():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    metrics_path = os.path.join(base_dir, "models", "metrics.json")
    if not os.path.exists(metrics_path):
        raise HTTPException(status_code=404, detail="Model metrics file not found. Please train model first.")
    with open(metrics_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

@app.get("/api/sample-patients")
def get_sample_patients():
    return {"samples": SAMPLE_PATIENTS}

@app.post("/api/predict")
def predict_heart_disease(patient: PatientInput):
    try:
        eng = get_engine()
        result = eng.predict_patient(patient.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Inference execution failed: {str(e)}")

# Mount static frontend build if present for unified production serving
from fastapi.staticfiles import StaticFiles
dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="frontend")

