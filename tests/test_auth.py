def test_register_and_login(client):
    payload = {
        "fullName": "Test User",
        "phone": "1234567890",
        "email": "test@example.com",
        "password": "test123",
        "startingBalance": 1000,
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert "token" in data
    assert data["user"]["phone"] == payload["phone"]

    login = client.post("/api/auth/login", json={"phone": payload["phone"], "password": payload["password"]})
    assert login.status_code == 200
    assert "token" in login.json()
