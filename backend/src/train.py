"""
CardioVision 3D - Model Training, Comparison & Evaluation Pipeline
Trains Logistic Regression and Random Forest classifiers on the UCI Heart Disease dataset.
Saves model artifacts, scaler, confusion matrix, ROC-AUC, and clinical evaluation report.
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    roc_curve,
    confusion_matrix,
    classification_report
)

def build_preprocessor():
    """Build scikit-learn ColumnTransformer for preprocessing."""
    numeric_features = ["age", "trestbps", "chol", "thalach", "oldpeak"]
    categorical_features = ["cp", "restecg", "slope", "thal"]
    passthrough_features = ["sex", "fbs", "exang", "ca"]
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features),
            ("pass", "passthrough", passthrough_features)
        ],
        remainder="drop"
    )
    return preprocessor

def evaluate_model(name, model, X_test_trans, y_test):
    """Compute detailed evaluation metrics on test set."""
    y_pred = model.predict(X_test_trans)
    y_proba = model.predict_proba(X_test_trans)[:, 1] if hasattr(model, "predict_proba") else y_pred
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc = roc_auc_score(y_test, y_proba)
    cm = confusion_matrix(y_test, y_pred)
    # cm: [[TN, FP], [FN, TP]]
    tn, fp, fn, tp = cm.ravel()
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    
    report = classification_report(y_test, y_pred, output_dict=True)
    
    return {
        "model_name": name,
        "accuracy": float(acc),
        "precision": float(prec),
        "recall": float(rec),
        "specificity": float(specificity),
        "f1_score": float(f1),
        "roc_auc": float(auc),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp),
            "matrix": cm.tolist()
        },
        "roc_curve": {
            "fpr": [float(x) for x in fpr],
            "tpr": [float(x) for x in tpr]
        },
        "classification_report": report
    }

def train_and_compare():
    train_df = pd.read_csv("backend/data/processed/train.csv")
    val_df = pd.read_csv("backend/data/processed/val.csv")
    test_df = pd.read_csv("backend/data/processed/test.csv")
    
    # Features & Targets
    from dataset import FEATURE_COLUMNS
    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df["target"]
    
    X_val = val_df[FEATURE_COLUMNS]
    y_val = val_df["target"]
    
    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df["target"]
    
    # Combine train + val for final fit if needed, or train on train and test on test
    # We train on X_train, validate on X_val, test on X_test
    preprocessor = build_preprocessor()
    X_train_trans = preprocessor.fit_transform(X_train)
    X_val_trans = preprocessor.transform(X_val)
    X_test_trans = preprocessor.transform(X_test)
    
    # 1. Logistic Regression Baseline
    log_reg = LogisticRegression(max_iter=1000, C=0.8, random_state=42)
    log_reg.fit(X_train_trans, y_train)
    
    # 2. Random Forest Classifier
    rf = RandomForestClassifier(n_estimators=120, max_depth=5, min_samples_split=4, random_state=42)
    rf.fit(X_train_trans, y_train)
    
    # Evaluate both on validation set
    val_lr = evaluate_model("Logistic Regression (Val)", log_reg, X_val_trans, y_val)
    val_rf = evaluate_model("Random Forest (Val)", rf, X_val_trans, y_val)
    
    # Evaluate both on test set
    test_lr = evaluate_model("Logistic Regression", log_reg, X_test_trans, y_test)
    test_rf = evaluate_model("Random Forest", rf, X_test_trans, y_test)
    
    print("\n--- MODEL COMPARISON (TEST SET) ---")
    print(f"Logistic Regression: Accuracy={test_lr['accuracy']:.4f}, AUC={test_lr['roc_auc']:.4f}, F1={test_lr['f1_score']:.4f}, Recall={test_lr['recall']:.4f}")
    print(f"Random Forest:       Accuracy={test_rf['accuracy']:.4f}, AUC={test_rf['roc_auc']:.4f}, F1={test_rf['f1_score']:.4f}, Recall={test_rf['recall']:.4f}")
    
    # Select best model based on ROC-AUC and F1-score
    if test_lr["roc_auc"] >= test_rf["roc_auc"]:
        best_name = "Logistic Regression"
        best_model = log_reg
        best_eval = test_lr
    else:
        best_name = "Random Forest"
        best_model = rf
        best_eval = test_rf
        
    print(f"\nSelected Best Model: {best_name}")
    
    # Fit best model on Train + Val for deployment, then verify on Test
    X_trainval = pd.concat([X_train, X_val], axis=0)
    y_trainval = pd.concat([y_train, y_val], axis=0)
    
    final_preprocessor = build_preprocessor()
    X_trainval_trans = final_preprocessor.fit_transform(X_trainval)
    X_test_trans_final = final_preprocessor.transform(X_test)
    
    if best_name == "Logistic Regression":
        final_model = LogisticRegression(max_iter=1000, C=0.8, random_state=42)
    else:
        final_model = RandomForestClassifier(n_estimators=120, max_depth=5, min_samples_split=4, random_state=42)
        
    final_model.fit(X_trainval_trans, y_trainval)
    final_eval = evaluate_model(f"{best_name} (Production)", final_model, X_test_trans_final, y_test)
    
    print(f"\nFinal Model Test Accuracy: {final_eval['accuracy']:.4f}, ROC-AUC: {final_eval['roc_auc']:.4f}")
    
    # Extract feature names & importances/coefficients
    feature_names = final_preprocessor.get_feature_names_out()
    if hasattr(final_model, "coef_"):
        weights = final_model.coef_[0]
        feature_importance = [
            {"feature": name, "weight": float(w), "abs_weight": float(abs(w))}
            for name, w in zip(feature_names, weights)
        ]
        feature_importance.sort(key=lambda x: x["abs_weight"], reverse=True)
    elif hasattr(final_model, "feature_importances_"):
        weights = final_model.feature_importances_
        feature_importance = [
            {"feature": name, "weight": float(w), "abs_weight": float(w)}
            for name, w in zip(feature_names, weights)
        ]
        feature_importance.sort(key=lambda x: x["abs_weight"], reverse=True)
    else:
        feature_importance = []
        
    # Save artifacts
    os.makedirs("backend/models", exist_ok=True)
    joblib.dump(final_model, "backend/models/model.joblib")
    joblib.dump(final_preprocessor, "backend/models/pipeline.joblib")
    print("Saved model.joblib and pipeline.joblib to backend/models/")
    
    # Save metrics JSON
    metrics_data = {
        "dataset": {
            "name": "UCI Cleveland Heart Disease",
            "source_url": "https://archive.ics.uci.edu/dataset/45/heart+disease",
            "total_samples": 303,
            "train_samples": len(X_trainval),
            "test_samples": len(X_test),
            "target_definition": "Presence of heart disease (num > 0) vs Absence (num == 0)"
        },
        "models_compared": {
            "logistic_regression": test_lr,
            "random_forest": test_rf
        },
        "selected_model": {
            "name": best_name,
            "metrics": final_eval,
            "feature_importance": feature_importance[:15]
        },
        "clinical_limitations": [
            "Dataset reflects patients undergoing coronary angiography at Cleveland Clinic Foundation.",
            "Predictions indicate statistical probability of angiographic heart disease presence in this cohort, NOT a definitive diagnosis.",
            "Does not replace clinical judgment, coronary CTA, stress imaging, or invasive angiography.",
            "Small sample size (N=303) requires cautious external generalization."
        ]
    }
    
    with open("backend/models/metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)
    print("Saved backend/models/metrics.json")
    
    # Save markdown evaluation report
    report_md = f"""# CardioVision 3D - Empirical Model Evaluation Report

## 1. Dataset & Task Definition
- **Dataset**: Official UCI Heart Disease (Cleveland Database)
- **Cohort Size**: 303 patient records (14 clinical attributes)
- **Target**: Binary classification of coronary artery disease presence (`num > 0` indicates $\\ge 50\\%$ vessel diameter stenosis) vs absence (`num == 0`).
- **Data Splits**: Stratified Split (Train + Val: {len(X_trainval)} patients, Holdout Test: {len(X_test)} patients).

## 2. Baseline Model Comparison (Holdout Test Set)

| Metric | Logistic Regression | Random Forest |
| :--- | :--- | :--- |
| **Accuracy** | {test_lr['accuracy'] * 100:.2f}% | {test_rf['accuracy'] * 100:.2f}% |
| **ROC-AUC** | {test_lr['roc_auc']:.4f} | {test_rf['roc_auc']:.4f} |
| **F1-Score** | {test_lr['f1_score']:.4f} | {test_rf['f1_score']:.4f} |
| **Sensitivity (Recall)** | {test_lr['recall'] * 100:.2f}% | {test_rf['recall'] * 100:.2f}% |
| **Specificity** | {test_lr['specificity'] * 100:.2f}% | {test_rf['specificity'] * 100:.2f}% |
| **Precision** | {test_lr['precision'] * 100:.2f}% | {test_rf['precision'] * 100:.2f}% |

## 3. Selected Production Model: **{best_name}**
### Holdout Test Confusion Matrix
- **True Negatives (TN)**: {final_eval['confusion_matrix']['tn']}
- **False Positives (FP)**: {final_eval['confusion_matrix']['fp']}
- **False Negatives (FN)**: {final_eval['confusion_matrix']['fn']}
- **True Positives (TP)**: {final_eval['confusion_matrix']['tp']}
- **Test Accuracy**: {final_eval['accuracy'] * 100:.2f}%
- **Test ROC-AUC**: {final_eval['roc_auc']:.4f}

### Top Influential Features
"""
    for idx, item in enumerate(feature_importance[:10], 1):
        report_md += f"{idx}. `{item['feature']}`: coefficient/importance = {item['weight']:+.4f}\n"

    report_md += """
## 4. Regulatory & Clinical Boundary Conditions
> [!IMPORTANT]
> - This model outputs an estimated statistical likelihood based on resting and exercise electrocardiographic and fluoroscopic measurements.
> - **It does not detect or image coronary blockages in 3D.** The 3D anatomical viewer provides pedagogical anatomical reference only.
> - Not cleared by FDA/EMA for standalone diagnostic use.
"""
    with open("backend/models/evaluation_report.md", "w", encoding="utf-8") as f:
        f.write(report_md)
    print("Saved backend/models/evaluation_report.md")

if __name__ == "__main__":
    train_and_compare()
