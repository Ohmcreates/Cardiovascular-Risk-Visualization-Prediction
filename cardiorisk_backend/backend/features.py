"""Deterministic preprocessing shared by training and the API (no fitted state)."""
import numpy as np
import pandas as pd

TARGETS = {"CAD": "Cath", "LAD": "LAD", "LCX": "LCX", "RCA": "RCA"}
LEAKAGE_COLS = ["LAD", "LCX", "RCA", "Cath"]          # never model inputs (spec 1d)
CONSTANT_COLS = ["Exertional CP"]                      # all 'N' in the data -> no information

YN_COLS = ["Obesity", "CRF", "CVA", "Airway disease", "Thyroid Disease", "CHF", "DLP",
           "Weak Peripheral Pulse", "Lung rales", "Systolic Murmur", "Diastolic Murmur",
           "Dyspnea", "Atypical", "Nonanginal", "LowTH Ang", "LVH", "Poor R Progression"]
VHD_MAP = {"N": 0, "mild": 1, "Moderate": 2, "Severe": 3}

def encode(df: pd.DataFrame) -> pd.DataFrame:
    """Raw dataset-style frame -> numeric model matrix. Accepts the original column names."""
    d = df.copy()
    d["Sex"] = d["Sex"].map({"Male": 1, "Fmale": 0, "Female": 0}).astype(float)
    for c in YN_COLS:
        d[c] = d[c].map({"Y": 1, "N": 0}).astype(float)
    d["VHD"] = d["VHD"].map(VHD_MAP).astype(float)
    d["BBB_LBBB"] = (d["BBB"] == "LBBB").astype(float)
    d["BBB_RBBB"] = (d["BBB"] == "RBBB").astype(float)
    d = d.drop(columns=["BBB"] + [c for c in LEAKAGE_COLS + CONSTANT_COLS if c in d.columns])
    arr = np.ascontiguousarray(d.values, dtype=np.float64)
    return pd.DataFrame(arr, columns=d.columns, index=d.index)

def encode_target(series: pd.Series) -> np.ndarray:
    return series.isin(["CAD", "Stenotic"]).astype(int).to_numpy()
