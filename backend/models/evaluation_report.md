# CardioVision 3D - Empirical Model Evaluation Report

## 1. Dataset & Task Definition
- **Dataset**: Official UCI Heart Disease (Cleveland Database)
- **Cohort Size**: 303 patient records (14 clinical attributes)
- **Target**: Binary classification of coronary artery disease presence (`num > 0` indicates $\ge 50\%$ vessel diameter stenosis) vs absence (`num == 0`).
- **Data Splits**: Stratified Split (Train + Val: 242 patients, Holdout Test: 61 patients).

## 2. Baseline Model Comparison (Holdout Test Set)

| Metric | Logistic Regression | Random Forest |
| :--- | :--- | :--- |
| **Accuracy** | 85.25% | 88.52% |
| **ROC-AUC** | 0.9524 | 0.9513 |
| **F1-Score** | 0.8475 | 0.8814 |
| **Sensitivity (Recall)** | 89.29% | 92.86% |
| **Specificity** | 81.82% | 84.85% |
| **Precision** | 80.65% | 83.87% |

## 3. Selected Production Model: **Logistic Regression**
### Holdout Test Confusion Matrix
- **True Negatives (TN)**: 27
- **False Positives (FP)**: 6
- **False Negatives (FN)**: 2
- **True Positives (TP)**: 26
- **Test Accuracy**: 86.89%
- **Test ROC-AUC**: 0.9589

### Top Influential Features
1. `pass__sex`: coefficient/importance = +1.2146
2. `pass__ca`: coefficient/importance = +1.2047
3. `cat__cp_4.0`: coefficient/importance = +0.9363
4. `cat__thal_7.0`: coefficient/importance = +0.7906
5. `cat__thal_3.0`: coefficient/importance = -0.5979
6. `cat__cp_1.0`: coefficient/importance = -0.5932
7. `cat__slope_2.0`: coefficient/importance = +0.5635
8. `pass__exang`: coefficient/importance = +0.5325
9. `cat__cp_3.0`: coefficient/importance = -0.4685
10. `cat__slope_1.0`: coefficient/importance = -0.4454

## 4. Regulatory & Clinical Boundary Conditions
> [!IMPORTANT]
> - This model outputs an estimated statistical likelihood based on resting and exercise electrocardiographic and fluoroscopic measurements.
> - **It does not detect or image coronary blockages in 3D.** The 3D anatomical viewer provides pedagogical anatomical reference only.
> - Not cleared by FDA/EMA for standalone diagnostic use.
