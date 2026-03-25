from app.db.mongo import mongo


def _create_admin(client):
    payload = {
        "fullName": "Admin User",
        "phone": "9998887777",
        "email": "admin@test.com",
        "password": "admin123",
        "startingBalance": 0,
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 201
    user_id = res.json()["user"]["id"]
    mongo.db.users.update_one({"id": user_id}, {"$set": {"role": "admin"}})
    token = client.post(
        "/api/auth/login", json={"phone": payload["phone"], "password": payload["password"]}
    ).json()["token"]
    return token


def test_admin_list_users(client):
    token = _create_admin(client)
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/admin/users", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
