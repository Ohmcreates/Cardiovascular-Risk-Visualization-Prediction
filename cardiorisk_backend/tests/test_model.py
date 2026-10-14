import os
import sys
from pathlib import Path
import pytest
import pandas as pd
import numpy as np

# Ensure backend module is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from predictor import Predictor
from features import encode, encode_target, TARGETS

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "z_alizadeh_sani_extended.xlsx"

@pytest.fixture(scope="module")
def predictor():
    return Predictor()

@pytest.fixture(scope="module")
def dataset():
    assert DATA_PATH.exists(), f"Dataset not found at {DATA_PATH}"
    return pd.read_excel(DATA_PATH)

def test_predictor_initialization(predictor):
    assert predictor is not None
    assert set(predictor.bundles.keys()) == {"CAD", "LAD", "LCX", "RCA"}
    assert len(predictor.features) == 55
    assert len(predictor.explainers) == 4
    assert "summary" in predictor.metrics

def test_feature_encoding(dataset):
    sample = dataset.iloc[:5]
    encoded = encode(sample)
    assert encoded.shape[0] == 5
    # Leakage and constant columns should be dropped
    for col in ["Cath", "LAD", "LCX", "RCA", "Exertional CP", "BBB"]:
        assert col not in encoded.columns
    # Encoded numeric columns should exist
    assert "Sex" in encoded.columns
    assert "BBB_LBBB" in encoded.columns
    assert "BBB_RBBB" in encoded.columns
    assert np.issubdtype(encoded.values.dtype, np.number)

def test_target_encoding(dataset):
    y_cad = encode_target(dataset["Cath"])
    assert set(np.unique(y_cad)).issubset({0, 1})
    assert y_cad.mean() > 0.5 # CAD prevalence ~ 71%

def test_predict_positive_patient(predictor, dataset):
    # Patient with confirmed CAD & LAD stenosis
    cad_patient = dataset[(dataset["Cath"] == "CAD") & (dataset["LAD"] == "Stenotic")].iloc[0].to_dict()
    res = predictor.predict(cad_patient)
    
    assert set(res.keys()) == {"CAD", "LAD", "LCX", "RCA"}
    for target in ["CAD", "LAD", "LCX", "RCA"]:
        item = res[target]
        assert 0.0 <= item["probability"] <= 1.0
        assert item["risk_level"] in ["high", "moderate", "low"]
        assert len(item["top_factors"]) > 0
        for f in item["top_factors"]:
            assert "feature" in f
            assert "value" in f
            assert "shap" in f
            assert f["direction"] in ["increases risk", "decreases risk"]

    # CAD probability for this positive patient should classify as positive (>= 0.50)
    assert res["CAD"]["probability"] >= 0.50
    assert res["CAD"]["risk_level"] in ["high", "moderate"]

def test_predict_negative_patient(predictor, dataset):
    # Patient with Normal angiography across all vessels
    normal_patient = dataset[
        (dataset["Cath"] == "Normal") & 
        (dataset["LAD"] == "Normal") & 
        (dataset["LCX"] == "Normal") & 
        (dataset["RCA"] == "Normal")
    ].iloc[0].to_dict()
    
    res = predictor.predict(normal_patient)
    assert set(res.keys()) == {"CAD", "LAD", "LCX", "RCA"}
    # Normal patient should have lower CAD risk
    assert res["CAD"]["probability"] < 0.60

def test_shap_explanation_integrity(predictor, dataset):
    row = dataset.iloc[10].to_dict()
    res = predictor.predict(row, top_k=5)
    for target in ["CAD", "LAD", "LCX", "RCA"]:
        top = res[target]["top_factors"]
        assert len(top) == 5
        # Verify SHAP magnitudes are in descending order
        abs_shaps = [abs(f["shap"]) for f in top]
        assert abs_shaps == sorted(abs_shaps, reverse=True)
