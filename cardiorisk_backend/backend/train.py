"""Train CAD / LAD / LCX / RCA classifiers with repeated stratified CV, save weights + metadata."""
import json, warnings
from pathlib import Path
import joblib, numpy as np, pandas as pd, shap
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, precision_score, recall_score, f1_score,
                             roc_auc_score, brier_score_loss)
from sklearn.model_selection import RepeatedStratifiedKFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from features import TARGETS, encode, encode_target

warnings.filterwarnings("ignore")
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "backend" / "artifacts"; OUT.mkdir(exist_ok=True)
SEED = 42

def candidates():
    return {
        "LogisticRegression": lambda: make_pipeline(StandardScaler(),
            LogisticRegression(C=0.3, max_iter=5000, class_weight="balanced")),
        "RandomForest": lambda: RandomForestClassifier(n_estimators=400, min_samples_leaf=2,
            class_weight="balanced", random_state=SEED, n_jobs=-1),
        "XGBoost": lambda: XGBClassifier(n_estimators=250, max_depth=3, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.7, eval_metric="logloss", random_state=SEED, n_jobs=4),
        "LightGBM": lambda: LGBMClassifier(n_estimators=250, num_leaves=8, learning_rate=0.05,
            subsample=0.8, subsample_freq=1, colsample_bytree=0.7, min_child_samples=8,
            random_state=SEED, verbose=-1, n_jobs=4),
    }

def metrics(y, p):
    yhat = (p >= 0.5).astype(int)
    return dict(accuracy=accuracy_score(y, yhat), precision=precision_score(y, yhat, zero_division=0),
                recall=recall_score(y, yhat), f1=f1_score(y, yhat), roc_auc=roc_auc_score(y, p),
                brier=brier_score_loss(y, p))

def main():
    raw = pd.read_excel(ROOT / "data" / "z_alizadeh_sani_extended.xlsx", sheet_name=0)
    X = encode(raw); feats = list(X.columns)
    print(f"{len(raw)} patients, {len(feats)} input features (LAD/LCX/RCA/Cath excluded)")
    cv = RepeatedStratifiedKFold(n_splits=5, n_repeats=3, random_state=SEED)
    rows, best = [], {}
    for tname, col in TARGETS.items():
        y = encode_target(raw[col])
        print(f"\n== {tname}: prevalence {y.mean():.2f}")
        for mname, mk in candidates().items():
            fold = []
            for tr, te in cv.split(X, y):
                m = mk().fit(X.iloc[tr], y[tr])
                fold.append(metrics(y[te], m.predict_proba(X.iloc[te])[:, 1]))
            f = pd.DataFrame(fold)
            r = {"target": tname, "model": mname, **{k: f[k].mean() for k in f}, **{k + "_sd": f[k].std() for k in f}}
            rows.append(r)
            print(f"  {mname:18s} AUC {r['roc_auc']:.3f}±{r['roc_auc_sd']:.3f}  F1 {r['f1']:.3f}  acc {r['accuracy']:.3f}")
        sub = pd.DataFrame([r for r in rows if r["target"] == tname])
        best[tname] = sub.loc[sub.roc_auc.idxmax(), "model"]
    res = pd.DataFrame(rows); res.to_csv(OUT / "cv_results.csv", index=False)

    # Fit final models on all data, save weights
    for tname, col in TARGETS.items():
        y = encode_target(raw[col])
        model = candidates()[best[tname]]().fit(X, y)
        joblib.dump({"model": model, "name": best[tname], "features": feats}, OUT / f"{tname}.joblib")
    summary = {t: res[(res.target == t) & (res.model == best[t])].iloc[0].to_dict() for t in TARGETS}
    json.dump({"best_models": best, "cv": "5-fold x3 repeated stratified", "summary": summary},
              open(OUT / "metrics.json", "w"), indent=2, default=float)

    # Feature metadata for the UI form + SHAP background
    meta = {f: {"min": float(X[f].min()), "max": float(X[f].max()), "median": float(X[f].median()),
                "binary": bool(set(X[f].unique()) <= {0.0, 1.0})} for f in feats}
    json.dump({"features": feats, "meta": meta}, open(OUT / "feature_meta.json", "w"), indent=2)
    X.sample(100, random_state=SEED).to_csv(OUT / "background.csv", index=False)
    print("\nBest per target:", best)

if __name__ == "__main__":
    main()
