import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "CerebellumBot Platform API"


def test_health_check():
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "app" in data


def test_white_label_config():
    response = client.get("/config/white-label")
    assert response.status_code == 200
    data = response.json()
    assert "brand_name" in data
    assert "primary_color" in data
    assert "secondary_color" in data
    assert "accent_color" in data
