import sys
from pathlib import Path
import pandas as pd
import json

backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))
from predictor import Predictor

df = pd.read_excel(Path(__file__).resolve().parent / "data" / "z_alizadeh_sani_extended.xlsx")
p = Predictor()

print("=" * 60)
print("CARDIORISK BACKEND — MODEL VERIFICATION & INFERENCE AUDIT")
print("=" * 60)
print("Models Loaded & Cross-Validation Metrics:")
for target, bundle in p.bundles.items():
    m = p.metrics["summary"][target]
    print(f"  Target: {target:4s} | Model: {bundle['name']:14s} | CV ROC-AUC: {m['roc_auc']:.3f} | F1: {m['f1']:.3f} | Acc: {m['accuracy']:.3f}")

# Sample 1: Positive CAD patient (Row 0)
row0 = df.iloc[0].to_dict()
pred0 = p.predict(row0)
print("\n" + "-" * 60)
print(f"CASE 1 — Confirmed CAD Patient (Actual: Cath=CAD, LAD=Stenotic)")
print(f"Demographics: Age={row0['Age']}, Sex={row0['Sex']}, BMI={row0['BMI']}, DM={row0['DM']}, HTN={row0['HTN']}")
for t in ["CAD", "LAD", "LCX", "RCA"]:
    top = pred0[t]["top_factors"][0]
    prob = pred0[t]["probability"] * 100
    level = pred0[t]["risk_level"]
    print(f"  {t:4s} -> Predicted Probability: {prob:5.1f}% [{level.upper():8s}] | Leading SHAP: {top['feature']} ({top['direction']}, val={top['value']})")

# Sample 2: Normal angiography patient
normal_idx = df[(df["Cath"] == "Normal") & (df["LAD"] == "Normal") & (df["LCX"] == "Normal") & (df["RCA"] == "Normal")].index[0]
row_norm = df.iloc[normal_idx].to_dict()
pred_norm = p.predict(row_norm)
print("\n" + "-" * 60)
print(f"CASE 2 — Normal Patient (Actual: Cath=Normal, All Vessels Normal)")
print(f"Demographics: Age={row_norm['Age']}, Sex={row_norm['Sex']}, BMI={row_norm['BMI']}, DM={row_norm['DM']}, HTN={row_norm['HTN']}")
for t in ["CAD", "LAD", "LCX", "RCA"]:
    top = pred_norm[t]["top_factors"][0]
    prob = pred_norm[t]["probability"] * 100
    level = pred_norm[t]["risk_level"]
    print(f"  {t:4s} -> Predicted Probability: {prob:5.1f}% [{level.upper():8s}] | Leading SHAP: {top['feature']} ({top['direction']}, val={top['value']})")
print("=" * 60)
