import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True

def test_model_info_endpoint():
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "dataset" in data
    assert "selected_model" in data
    assert "clinical_limitations" in data

def test_sample_patients_endpoint():
    response = client.get("/api/sample-patients")
    assert response.status_code == 200
    data = response.json()
    assert "samples" in data
    assert len(data["samples"]) >= 3

def test_predict_endpoint_valid():
    sample = {
        "age": 55.0,
        "sex": 1.0,
        "cp": 2.0,
        "trestbps": 130.0,
        "chol": 220.0,
        "fbs": 0.0,
        "restecg": 0.0,
        "thalach": 150.0,
        "exang": 0.0,
        "oldpeak": 1.0,
        "slope": 2.0,
        "ca": 0.0,
        "thal": 3.0
    }
    response = client.post("/api/predict", json=sample)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_class" in data
    assert "probability" in data
    assert "risk_category" in data
    assert "feature_attributions" in data
    assert "clinical_observations" in data

def test_predict_endpoint_invalid_values():
    # Out of range age and invalid thal value
    invalid_sample = {
        "age": 150.0,
        "sex": 1.0,
        "cp": 2.0,
        "trestbps": 130.0,
        "chol": 220.0,
        "fbs": 0.0,
        "restecg": 0.0,
        "thalach": 150.0,
        "exang": 0.0,
        "oldpeak": 1.0,
        "slope": 2.0,
        "ca": 0.0,
        "thal": 99.0
    }
    response = client.post("/api/predict", json=invalid_sample)
    assert response.status_code == 422 # Unprocessable Entity validation error
