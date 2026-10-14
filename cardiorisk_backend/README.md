# CardioRisk 3D - backend
    pip install -r backend/requirements.txt
    cd backend && python train.py          # CV + saves artifacts/*.joblib, metrics.json
    uvicorn api:app --reload               # GET /schema, GET /metrics, POST /predict
Inputs exclude LAD, LCX, RCA, Cath (target leakage). Exertional CP is constant and dropped.
