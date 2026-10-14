"""
CardioVision 3D - Model Inference & Attribution Engine
"""
import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODEL_PATH = os.path.join(BASE_DIR, "models", "model.joblib")
PIPELINE_PATH = os.path.join(BASE_DIR, "models", "pipeline.joblib")

class InferenceEngine:
    def __init__(self, model_path: str = MODEL_PATH, pipeline_path: str = PIPELINE_PATH):
        if not os.path.exists(model_path) or not os.path.exists(pipeline_path):
            raise FileNotFoundError("Model artifacts not found. Please run backend/src/train.py first.")
        self.model = joblib.load(model_path)
        self.pipeline = joblib.load(pipeline_path)
        
    def predict_patient(self, patient_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs patient data through preprocessing and model.
        Returns probability, binary classification, confidence, clinical risk category,
        and methodologically supported feature attributions.
        """
        # Ensure correct column order
        from dataset import FEATURE_COLUMNS
        df = pd.DataFrame([{col: float(patient_dict[col]) for col in FEATURE_COLUMNS}])
        
        # Transform features
        X_trans = self.pipeline.transform(df)
        
        # Probability & prediction
        proba = float(self.model.predict_proba(X_trans)[0, 1])
        pred = int(self.model.predict(X_trans)[0])
        
        # Risk categorization based on clinical guidelines (framingham-style thresholds)
        if proba < 0.25:
            risk_category = "Low Estimated Probability"
            risk_color = "#10B981" # Green
        elif proba < 0.55:
            risk_category = "Borderline / Intermediate Probability"
            risk_color = "#F59E0B" # Amber
        elif proba < 0.75:
            risk_category = "Elevated Probability"
            risk_color = "#F97316" # Orange
        else:
            risk_category = "High Estimated Probability"
            risk_color = "#EF4444" # Red
            
        # Model attribution: For Logistic Regression, log-odds = sum(w_i * x_i) + intercept
        attributions = []
        if hasattr(self.model, "coef_"):
            feature_names = self.pipeline.get_feature_names_out()
            weights = self.model.coef_[0]
            values = X_trans[0]
            contributions = weights * values
            
            # Map transformed feature names back to clinical terms
            for name, w, val, cont in zip(feature_names, weights, values, contributions):
                # Clean up name: e.g., 'num__age' -> 'age', 'cat__cp_4.0' -> 'cp: asymptomatic'
                clean_name = name.replace("num__", "").replace("cat__", "").replace("pass__", "")
                attributions.append({
                    "raw_feature": name,
                    "display_name": self._format_feature_name(clean_name),
                    "coefficient": float(w),
                    "transformed_value": float(val),
                    "log_odds_contribution": float(cont),
                    "impact": "Increases Risk" if cont > 0.05 else ("Decreases Risk" if cont < -0.05 else "Neutral")
                })
            # Sort by absolute log-odds contribution
            attributions.sort(key=lambda x: abs(x["log_odds_contribution"]), reverse=True)

        # Clinical factor observations (evidence-based criteria)
        clinical_flags = self._evaluate_clinical_flags(patient_dict)
        
        return {
            "predicted_class": pred,
            "prediction_label": "Presence of Heart Disease Detected (≥50% diameter narrowing)" if pred == 1 else "Absence of Significant Heart Disease (<50% diameter narrowing)",
            "probability": round(proba, 4),
            "probability_percentage": round(proba * 100, 1),
            "risk_category": risk_category,
            "risk_color": risk_color,
            "confidence_margin": round(abs(proba - 0.5) * 2, 4), # 0 (uncertain) to 1.0 (very certain)
            "model_type": type(self.model).__name__,
            "feature_attributions": attributions[:8],
            "clinical_observations": clinical_flags
        }

    def _format_feature_name(self, name: str) -> str:
        mapping = {
            "age": "Patient Age",
            "trestbps": "Resting Blood Pressure",
            "chol": "Serum Cholesterol",
            "thalach": "Max Heart Rate Achieved",
            "oldpeak": "ST Depression (Exercise)",
            "sex": "Sex (Male)",
            "fbs": "Fasting Blood Sugar > 120",
            "exang": "Exercise-Induced Angina",
            "ca": "Major Vessels Colored (Fluoroscopy)",
            "cp_1.0": "Typical Anginal Chest Pain",
            "cp_2.0": "Atypical Anginal Chest Pain",
            "cp_3.0": "Non-Anginal Chest Pain",
            "cp_4.0": "Asymptomatic Chest Presentation",
            "restecg_0.0": "Resting ECG: Normal",
            "restecg_1.0": "Resting ECG: ST-T Wave Abnormality",
            "restecg_2.0": "Resting ECG: Left Ventricular Hypertrophy",
            "slope_1.0": "Peak Exercise ST: Upsloping",
            "slope_2.0": "Peak Exercise ST: Flat",
            "slope_3.0": "Peak Exercise ST: Downsloping",
            "thal_3.0": "Thallium: Normal Perfusion",
            "thal_6.0": "Thallium: Fixed Perfusion Defect",
            "thal_7.0": "Thallium: Reversible Perfusion Defect"
        }
        return mapping.get(name, name)

    def _evaluate_clinical_flags(self, p: Dict[str, Any]) -> List[Dict[str, str]]:
        flags = []
        # Blood pressure
        bp = float(p.get("trestbps", 0))
        if bp >= 140:
            flags.append({"factor": "Resting Blood Pressure", "value": f"{int(bp)} mmHg", "status": "Stage 2 Hypertension", "level": "warning"})
        elif bp >= 130:
            flags.append({"factor": "Resting Blood Pressure", "value": f"{int(bp)} mmHg", "status": "Stage 1 Hypertension", "level": "caution"})
        else:
            flags.append({"factor": "Resting Blood Pressure", "value": f"{int(bp)} mmHg", "status": "Normal / Controlled", "level": "normal"})
            
        # Cholesterol
        chol = float(p.get("chol", 0))
        if chol >= 240:
            flags.append({"factor": "Serum Cholesterol", "value": f"{int(chol)} mg/dL", "status": "High (Hypercholesterolemia)", "level": "warning"})
        elif chol >= 200:
            flags.append({"factor": "Serum Cholesterol", "value": f"{int(chol)} mg/dL", "status": "Borderline High", "level": "caution"})
        else:
            flags.append({"factor": "Serum Cholesterol", "value": f"{int(chol)} mg/dL", "status": "Desirable (<200 mg/dL)", "level": "normal"})
            
        # ST Depression
        oldpeak = float(p.get("oldpeak", 0))
        if oldpeak >= 2.0:
            flags.append({"factor": "Exercise ST Depression", "value": f"{oldpeak:.1f} mm", "status": "Significant Exercise Ischemia Marker", "level": "warning"})
        elif oldpeak >= 1.0:
            flags.append({"factor": "Exercise ST Depression", "value": f"{oldpeak:.1f} mm", "status": "Mild ST Depression", "level": "caution"})
        else:
            flags.append({"factor": "Exercise ST Depression", "value": f"{oldpeak:.1f} mm", "status": "Physiological / Minimal", "level": "normal"})
            
        # Exercise Angina
        if float(p.get("exang", 0)) == 1.0:
            flags.append({"factor": "Exertional Angina", "value": "Present", "status": "Provoked with Exercise", "level": "warning"})
            
        # Fluoroscopy Vessels
        ca = int(float(p.get("ca", 0)))
        if ca > 0:
            flags.append({"factor": "Fluoroscopy Vessels Colored", "value": f"{ca} vessels", "status": f"{ca} major vessels with fluoroscopic opacity", "level": "warning"})
        else:
            flags.append({"factor": "Fluoroscopy Vessels Colored", "value": "0 vessels", "status": "No major vessels with contrast opacity", "level": "normal"})
            
        # Thallium Scan
        thal = int(float(p.get("thal", 3)))
        if thal == 7:
            flags.append({"factor": "Thallium Scintigraphy", "value": "Reversible Defect", "status": "Exercise-induced ischemia", "level": "warning"})
        elif thal == 6:
            flags.append({"factor": "Thallium Scintigraphy", "value": "Fixed Defect", "status": "Likely prior infarcted tissue", "level": "caution"})
        else:
            flags.append({"factor": "Thallium Scintigraphy", "value": "Normal (3.0)", "status": "Homogeneous myocardial perfusion", "level": "normal"})
            
        return flags
