"""
CardioVision 3D - Production Database & EHR API Test Suite
Verifies relational database persistence, longitudinal vitals, medications, 12 reports, and patient dossier exports.
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_probe_with_subsystems():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "subsystems" in data
    assert data["subsystems"]["relational_database"]["status"] == "connected"
    assert data["subsystems"]["relational_database"]["counts"]["patients"] >= 4
    assert data["subsystems"]["relational_database"]["counts"]["reports"] >= 12

def test_list_and_get_patient():
    res = client.get("/api/patients")
    assert res.status_code == 200
    patients = res.json()["patients"]
    assert len(patients) >= 4
    
    # Verify David Berg exists
    david = next((p for p in patients if "david" in p["slug"] or "David" in p["name"]), None)
    assert david is not None
    
    # Retrieve detail
    detail_res = client.get(f"/api/patients/{david['id']}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert "latest_vitals" in detail
    assert "medications" in detail
    assert detail["name"] == "David Berg"

def test_create_and_delete_patient():
    new_patient = {
        "name": "Alex Mercer",
        "age": 49,
        "sex": 1,
        "email": "alex.m@health.org",
        "trestbps": 135.0,
        "chol": 215.0,
        "cp": 2.0,
        "thalach": 155.0,
        "oldpeak": 0.8,
        "ca": 0.0,
        "thal": 3.0
    }
    create_res = client.post("/api/patients", json=new_patient)
    assert create_res.status_code == 201
    created = create_res.json()
    patient_id = created["id"]
    assert created["name"] == "Alex Mercer"

    # Verify patient has initial vital log
    vitals_res = client.get(f"/api/patients/{patient_id}/vitals")
    assert vitals_res.status_code == 200
    assert len(vitals_res.json()["vitals"]) >= 1

    # Cleanup / Delete
    del_res = client.delete(f"/api/patients/{patient_id}")
    assert del_res.status_code == 200

def test_log_vital_and_retrieve_history():
    # Log vital for David Berg
    vital_payload = {
        "systolic_bp": 138,
        "diastolic_bp": 88,
        "heart_rate": 74,
        "cholesterol": 245,
        "st_depression": 1.8,
        "oxygen_saturation": 98.5,
        "respiratory_rate": 15,
        "notes": "Automated clinical test log"
    }
    log_res = client.post("/api/patients/patient-david-berg/vitals", json=vital_payload)
    assert log_res.status_code == 201
    vital_data = log_res.json()
    assert vital_data["systolic_bp"] == 138
    assert vital_data["heart_rate"] == 74

    # Verify history
    history_res = client.get("/api/patients/patient-david-berg/vitals?limit=10")
    assert history_res.status_code == 200
    history = history_res.json()["vitals"]
    assert len(history) >= 1

def test_medication_regimen_and_adherence():
    res = client.get("/api/patients/patient-david-berg/medications")
    assert res.status_code == 200
    meds = res.json()["medications"]
    assert len(meds) >= 3

    # Mark dose as taken
    first_med = meds[0]
    initial_adh = first_med["adherence_pct"]
    take_res = client.patch(f"/api/medications/{first_med['id']}/take")
    assert take_res.status_code == 200
    updated = take_res.json()
    assert updated["last_taken_at"] is not None
    assert updated["adherence_pct"] >= initial_adh

def test_clinical_reports_archive():
    res = client.get("/api/reports")
    assert res.status_code == 200
    data = res.json()
    assert data["total_reports"] >= 12
    assert len(data["reports"]) >= 12

    # Filter by report type
    ccta_res = client.get("/api/reports?report_type=Coronary CTA")
    assert ccta_res.status_code == 200
    ccta_data = ccta_res.json()
    assert len(ccta_data["reports"]) >= 1

def test_export_patient_dossier():
    res = client.get("/api/export/patient-david-berg")
    assert res.status_code == 200
    dossier = res.json()
    assert dossier["export_metadata"]["system"] == "CardioVision 3D Intelligence Platform"
    assert dossier["patient"]["name"] == "David Berg"
    assert len(dossier["clinical_reports"]) >= 1
    assert len(dossier["vitals_history"]) >= 1
