import os
import pandas as pd
import pytest
from dataset import download_raw_data, load_and_validate_data, prepare_splits, FEATURE_COLUMNS

def test_raw_data_exists():
    path = download_raw_data()
    assert os.path.exists(path)
    assert os.path.getsize(path) > 1000

def test_load_and_validate_data():
    df = load_and_validate_data()
    assert df.shape[0] == 303
    assert df.shape[1] == 15 # 13 features + num + target
    assert df.isnull().sum().sum() == 0
    assert set(df["target"].unique()).issubset({0, 1})

def test_prepare_splits():
    df = load_and_validate_data()
    X_tr, X_v, X_te, y_tr, y_v, y_te = prepare_splits(df)
    assert len(X_tr) + len(X_v) + len(X_te) == 303
    assert len(y_tr) == len(X_tr)
    assert len(y_v) == len(X_v)
    assert len(y_te) == len(X_te)
    for col in FEATURE_COLUMNS:
        assert col in X_tr.columns
