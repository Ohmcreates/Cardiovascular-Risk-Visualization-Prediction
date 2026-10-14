import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_demo_users_endpoint():
    response = client.get("/api/auth/demo-users")
    assert response.status_code == 200
    data = response.json()
    assert "personas" in data
    assert len(data["personas"]) >= 3
    doctor = next((u for u in data["personas"] if "Sarah" in u["name"]), None)
    assert doctor is not None
    assert "Cardiologist" in doctor["role"]

def test_login_success():
    payload = {
        "email": "sarah.scott@cardiovision.care",
        "password": "CardioPass2026!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert "user" in data
    assert data["user"]["email"] == "sarah.scott@cardiovision.care"
    assert data["user"]["role"] == "cardiologist"

def test_login_invalid_password():
    payload = {
        "email": "sarah.scott@cardiovision.care",
        "password": "WrongPassword123!"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    assert "Invalid email credentials or clinical password" in response.json()["detail"]

def test_auth_me_with_bearer_token():
    # Login first
    login_res = client.post("/api/auth/login", json={
        "email": "david.berg@healthsync.care",
        "password": "DavidCardio2026!"
    })
    token = login_res.json()["token"]

    # Call /api/auth/me
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    user = response.json()
    assert user["name"] == "David Berg"
    assert user["role"] == "patient"

def test_auth_logout():
    # Login
    login_res = client.post("/api/auth/login", json={
        "email": "sarah.scott@cardiovision.care",
        "password": "CardioPass2026!"
    })
    token = login_res.json()["token"]

    # Logout
    logout_res = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_res.status_code == 200
    assert "Session terminated" in logout_res.json()["message"]
