import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
import pandas as pd

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from api import app, DISCLAIMER
DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "z_alizadeh_sani_extended.xlsx"

@pytest.fixture(scope="module")
def client():
    return TestClient(app)

@pytest.fixture(scope="module")
def dataset():
    return pd.read_excel(DATA_PATH)

def test_schema_endpoint(client):
    response = client.get("/schema")
    assert response.status_code == 200
    data = response.json()
    assert "features" in data
    assert len(data["features"]) == 55
    assert "meta" in data
    assert "disclaimer" in data
    assert data["disclaimer"] == DISCLAIMER

def test_metrics_endpoint(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "best_models" in data
    assert "summary" in data
    for target in ["CAD", "LAD", "LCX", "RCA"]:
        assert target in data["summary"]
        assert "roc_auc" in data["summary"][target]

def test_predict_endpoint(client, dataset):
    row = dataset.iloc[0].to_dict()
    response = client.post("/predict", json=row)
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert "disclaimer" in data
    preds = data["predictions"]
    for target in ["CAD", "LAD", "LCX", "RCA"]:
        assert target in preds
        assert "probability" in preds[target]
        assert "risk_level" in preds[target]
        assert "top_factors" in preds[target]
