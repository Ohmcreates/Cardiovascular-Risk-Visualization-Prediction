"""
CardioVision 3D - UCI Heart Disease Dataset Acquisition & Preprocessing Pipeline
"""
import os
import urllib.request
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

UCI_CLEVELAND_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"

FEATURE_COLUMNS = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal"
]

ALL_COLUMNS = FEATURE_COLUMNS + ["num"]

def download_raw_data(output_path: str = "backend/data/raw/processed.cleveland.data") -> str:
    """Download the official UCI Cleveland heart disease dataset."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
        print(f"Downloading UCI Cleveland dataset from {UCI_CLEVELAND_URL}...")
        req = urllib.request.Request(UCI_CLEVELAND_URL, headers={"User-Agent": "CardioVision3D/1.0"})
        with urllib.request.urlopen(req, timeout=30) as response:
            content = response.read().decode("utf-8")
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Downloaded {len(content)} bytes to {output_path}")
    else:
        print(f"Raw data already exists at {output_path}")
    return output_path

def load_and_validate_data(raw_path: str = "backend/data/raw/processed.cleveland.data") -> pd.DataFrame:
    """
    Load raw CSV data, replace missing sentinel '?' with NaN, validate schema,
    impute missing values appropriately, and create binary target (target = 1 if num > 0 else 0).
    """
    df = pd.read_csv(raw_path, names=ALL_COLUMNS, na_values="?", skipinitialspace=True)
    print(f"Loaded dataset with shape: {df.shape}")
    
    # Check null counts
    nulls = df.isnull().sum()
    if nulls.sum() > 0:
        print("Missing values detected per column:")
        print(nulls[nulls > 0])
    
    # In UCI Cleveland, 'ca' has 4 missing values and 'thal' has 2 missing values.
    # Impute 'ca' with median (0.0) and 'thal' with mode (3.0 - normal)
    if "ca" in df.columns:
        ca_median = df["ca"].median()
        df["ca"] = df["ca"].fillna(ca_median)
    if "thal" in df.columns:
        thal_mode = df["thal"].mode()[0]
        df["thal"] = df["thal"].fillna(thal_mode)
        
    # Convert types
    for col in ["age", "trestbps", "chol", "thalach", "oldpeak"]:
        df[col] = df[col].astype(float)
    for col in ["sex", "cp", "fbs", "restecg", "exang", "slope", "ca", "thal"]:
        df[col] = df[col].astype(float)
        
    # Target: 0 (no disease), 1-4 (presence of disease) -> binary classification
    # 0 = absence, 1 = presence
    df["target"] = (df["num"] > 0).astype(int)
    
    # Verify no remaining NaNs
    assert df.isnull().sum().sum() == 0, "Data validation failed: unexpected NaNs remaining"
    print(f"Target distribution: \n{df['target'].value_counts(normalize=True).round(4) * 100}%")
    return df

def prepare_splits(df: pd.DataFrame, test_size: float = 0.2, val_size: float = 0.15, random_state: int = 42):
    """
    Split into train, validation, and test sets with stratification on target.
    Train: ~68%, Validation: ~12% (15% of train/val), Test: 20%
    """
    X = df[FEATURE_COLUMNS]
    y = df["target"]
    
    # First split off test set (20%)
    X_temp, X_test, y_temp, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    # Second split off validation set (15% of remaining)
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp, test_size=val_size, random_state=random_state, stratify=y_temp
    )
    
    print(f"Splits created: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")
    return X_train, X_val, X_test, y_train, y_val, y_test

if __name__ == "__main__":
    raw_file = download_raw_data()
    data = load_and_validate_data(raw_file)
    X_tr, X_v, X_te, y_tr, y_v, y_te = prepare_splits(data)
    
    # Save processed splits
    os.makedirs("backend/data/processed", exist_ok=True)
    X_tr.assign(target=y_tr).to_csv("backend/data/processed/train.csv", index=False)
    X_v.assign(target=y_v).to_csv("backend/data/processed/val.csv", index=False)
    X_te.assign(target=y_te).to_csv("backend/data/processed/test.csv", index=False)
    print("Saved train.csv, val.csv, and test.csv to backend/data/processed/")
