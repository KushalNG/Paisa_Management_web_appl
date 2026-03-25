# Local Hosting Guide (Frontend + Backend)

This guide explains how to run the Pai$@ Management app locally on Windows.

## 1) Prerequisites

- Node.js (18.x recommended)
- npm (comes with Node)
- Python 3.11+ (3.13 works if using the updated requirements)
- MongoDB running locally

## 2) Backend Setup (FastAPI)

### 2.1 Create backend .env
Create `backend/.env` with:

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=paisa_management
JWT_SECRET=change-this-to-a-strong-secret
JWT_EXPIRES_MINUTES=1440
CORS_ORIGINS=http://localhost:3000

# Optional: seed admin account
ADMIN_SEED_PHONE=admin
ADMIN_SEED_PASSWORD=admin@123
ADMIN_SEED_EMAIL=admin@paisa.com
ADMIN_SEED_NAME=Admin User
```

### 2.2 Create venv + install dependencies
From the project root:

```
cd C:\Users\Kushal\Desktop\Paisa-Management\backend
python -m venv .venv
. .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2.3 Start backend

```
uvicorn server:app --reload --host 0.0.0.0 --port 5000
```

Verify:

```
http://localhost:5000/api/
```

Expected:

```
{"message":"Hello World"}
```

## 3) Frontend Setup (React)

### 3.1 Create frontend .env
Create `frontend/.env`:

```
REACT_APP_API_URL=http://localhost:5000
```

### 3.2 Install dependencies

```
cd C:\Users\Kushal\Desktop\Paisa-Management\frontend
npm install
```

### 3.3 Start frontend

```
npm start
```

Frontend will be available at:

```
http://localhost:3000
```

## 4) Login

If you set the admin seed env vars, use:

```
phone: admin
password: admin@123
```

Or register a new user at `/register`.

## 5) Common Issues

### 5.1 "AxiosError: Network Error"
- Backend not running
- Wrong `REACT_APP_API_URL`
- Frontend not restarted after env change

### 5.2 Mongo errors (InvalidDocument: datetime.date)
- Restart backend after updates
- Clear collections if old invalid data exists

Mongo shell cleanup:

```
use paisa_management
db.transactions.deleteMany({})
db.commitments.deleteMany({})
```

### 5.3 npm dependency conflicts
- React 19 conflicts with react-day-picker
- Use React 18 (already patched in package.json)

## 6) Suggested Local Run Order

1. Start MongoDB
2. Start backend (FastAPI)
3. Start frontend (React)
4. Login/register and use the app

---

If you want LAN access for other devices, update:

- `REACT_APP_API_URL=http://<YOUR-LAN-IP>:5000`
- `CORS_ORIGINS=http://<YOUR-LAN-IP>:3000`

Then restart both services.
