import urllib.request
import json
import time
import pandas as pd

time.sleep(1)
base_url = "http://127.0.0.1:8000"

print("--- 1. Testing GET /schema ---")
req = urllib.request.Request(f"{base_url}/schema")
with urllib.request.urlopen(req, timeout=5) as res:
    schema = json.loads(res.read())
    print(f"Status: {res.getcode()} | Number of Features: {len(schema['features'])}")

print("\n--- 2. Testing GET /metrics ---")
req = urllib.request.Request(f"{base_url}/metrics")
with urllib.request.urlopen(req, timeout=5) as res:
    metrics = json.loads(res.read())
    print(f"Status: {res.getcode()}")
    print("Best Models Selected:", json.dumps(metrics.get("best_models"), indent=2))
    for t in ["CAD", "LAD", "LCX", "RCA"]:
        m = metrics["summary"][t]
        print(f"  {t:4s}: {m['model']:14s} | AUC: {m['roc_auc']:.3f} | F1: {m['f1']:.3f} | Acc: {m['accuracy']:.3f}")

print("\n--- 3. Testing POST /predict ---")
df = pd.read_excel("D:/3d cardiovasular/cardiorisk_backend/data/z_alizadeh_sani_extended.xlsx")
sample = df.iloc[0].to_dict()

req = urllib.request.Request(
    f"{base_url}/predict",
    data=json.dumps(sample).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(req, timeout=5) as res:
    result = json.loads(res.read())
    print(f"Status: {res.getcode()}")
    preds = result["predictions"]
    for t in ["CAD", "LAD", "LCX", "RCA"]:
        p = preds[t]
        print(f"  {t:4s} -> Probability: {p['probability']*100:5.1f}% [{p['risk_level'].upper():8s}] (Model: {p['model']})")
        print(f"         Leading factor: {p['top_factors'][0]['feature']} ({p['top_factors'][0]['direction']}, SHAP={p['top_factors'][0]['shap']})")
    print("\nDisclaimer:", result["disclaimer"])
