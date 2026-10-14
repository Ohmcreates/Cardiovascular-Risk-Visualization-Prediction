import pytest
from predict import InferenceEngine

@pytest.fixture
def engine():
    return InferenceEngine()

def test_inference_low_risk(engine):
    patient = {
        "age": 35.0,
        "sex": 0.0,
        "cp": 3.0,
        "trestbps": 110.0,
        "chol": 160.0,
        "fbs": 0.0,
        "restecg": 0.0,
        "thalach": 180.0,
        "exang": 0.0,
        "oldpeak": 0.0,
        "slope": 1.0,
        "ca": 0.0,
        "thal": 3.0
    }
    result = engine.predict_patient(patient)
    assert "probability" in result
    assert "predicted_class" in result
    assert result["predicted_class"] == 0
    assert result["probability"] < 0.35
    assert len(result["feature_attributions"]) > 0

def test_inference_high_risk(engine):
    patient = {
        "age": 67.0,
        "sex": 1.0,
        "cp": 4.0,
        "trestbps": 160.0,
        "chol": 290.0,
        "fbs": 1.0,
        "restecg": 2.0,
        "thalach": 105.0,
        "exang": 1.0,
        "oldpeak": 3.2,
        "slope": 2.0,
        "ca": 3.0,
        "thal": 7.0
    }
    result = engine.predict_patient(patient)
    assert result["predicted_class"] == 1
    assert result["probability"] > 0.65
    assert result["risk_category"] in ["Elevated Probability", "High Estimated Probability"]
