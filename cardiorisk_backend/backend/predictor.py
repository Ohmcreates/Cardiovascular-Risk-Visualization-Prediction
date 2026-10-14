"""Load trained models, predict probabilities for CAD/LAD/LCX/RCA and explain with SHAP."""
import json
from pathlib import Path
import joblib, numpy as np, pandas as pd, shap
from features import TARGETS, encode

ART = Path(__file__).resolve().parent / "artifacts"

class Predictor:
    def __init__(self):
        self.bundles = {t: joblib.load(ART / f"{t}.joblib") for t in TARGETS}
        self.features = self.bundles["CAD"]["features"]
        self.meta = json.load(open(ART / "feature_meta.json"))["meta"]
        self.metrics = json.load(open(ART / "metrics.json"))
        bg = pd.read_csv(ART / "background.csv")[self.features]
        self.explainers = {}
        for t, b in self.bundles.items():
            m = b["model"]
            if hasattr(m, "steps"):   # scaled linear model fallback
                self.explainers[t] = shap.LinearExplainer(m[-1], m[0].transform(bg))
            else:
                self.explainers[t] = shap.TreeExplainer(m)

    @staticmethod
    def _class1(sv):
        sv = np.asarray(sv[1] if isinstance(sv, list) else sv)
        return sv[..., 1] if sv.ndim == 3 else sv

    def predict(self, raw: dict, top_k: int = 10) -> dict:
        X = encode(pd.DataFrame([raw]))[self.features]
        out = {}
        for t, b in self.bundles.items():
            m = b["model"]
            p = float(m.predict_proba(X)[0, 1])
            Xe = m[0].transform(X) if hasattr(m, "steps") else X
            sv = self._class1(self.explainers[t].shap_values(Xe))[0]
            order = np.argsort(-np.abs(sv))[:top_k]
            out[t] = {
                "probability": round(p, 4),
                "risk_level": "high" if p >= 0.7 else "moderate" if p >= 0.4 else "low",
                "model": b["name"],
                "cv_roc_auc": round(self.metrics["summary"][t]["roc_auc"], 3),
                "top_factors": [{"feature": self.features[i], "value": float(X.iloc[0, i]),
                                 "shap": round(float(sv[i]), 4),
                                 "direction": "increases risk" if sv[i] > 0 else "decreases risk"}
                                for i in order],
            }
        return out
