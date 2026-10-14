from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from predictor import Predictor

DISCLAIMER = ("Decision-support / educational use only. Not a substitute for formal diagnostic "
              "imaging (e.g. coronary angiography) or clinical judgement.")
app = FastAPI(title="CardioRisk 3D API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
P = Predictor()

@app.get("/schema")
def schema():
    return {"features": P.features, "meta": P.meta, "disclaimer": DISCLAIMER}

@app.get("/metrics")
def metrics():
    return P.metrics

@app.post("/predict")
def predict(patient: dict):
    """patient: dict with the ORIGINAL dataset columns (Age, Sex='Male'/'Fmale', DM, ... VHD, BBB)."""
    return {"predictions": P.predict(patient), "disclaimer": DISCLAIMER}
