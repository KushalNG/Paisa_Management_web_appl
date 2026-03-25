def _register_and_token(client):
    payload = {
        "fullName": "Txn User",
        "phone": "1112223333",
        "email": "txn@example.com",
        "password": "test123",
        "startingBalance": 0,
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 201
    return res.json()["token"]


def test_create_and_list_transactions(client):
    token = _register_and_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    create = client.post(
        "/api/transactions",
        json={
            "type": "spend",
            "category": "Food & Dining",
            "amount": 100,
            "date": "2025-03-10",
            "description": "Lunch",
        },
        headers=headers,
    )
    assert create.status_code == 201

    listing = client.get("/api/transactions", headers=headers)
    assert listing.status_code == 200
    assert len(listing.json()) == 1
