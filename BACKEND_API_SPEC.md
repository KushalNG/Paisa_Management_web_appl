# Backend API Specification for Pai$@ Management

This document provides the complete API specification needed to build the backend for the Pai$@ Management frontend.

## Base URL
```
http://<LAN-IP>:5000
```

## Authentication
- JWT tokens sent in `Authorization: Bearer <token>` header
- Token returned on successful login/register
- Token expiry should trigger 401 response

---

## 📡 API Endpoints

### 1. Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "fullName": "John Doe",
  "phone": "9876543210",     // Must be unique, 10 digits
  "email": "john@example.com",
  "password": "password123",  // Min 6 characters
  "startingBalance": 50000    // Optional, default: 0
}

Response (201):
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "role": "user",           // "user" or "admin"
    "walletBalance": 50000
  }
}

Error Response (409 - Phone exists):
{
  "message": "Phone number already exists"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "phone": "9876543210",
  "password": "password123"
}

Response (200):
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "role": "user",
    "walletBalance": 45230.50
  }
}

Error Response (401):
{
  "message": "Invalid phone number or password"
}
```

---

### 2. User Profile Endpoints

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <token>

Response (200):
{
  "fullName": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "designation": "Software Engineer",
  "salary": 85000,
  "salaryDate": 1,            // Day of month (1-31)
  "startingBalance": 50000,
  "walletBalance": 45230.50
}
```

#### Update User Profile
```http
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "fullName": "John Doe Updated",
  "email": "john.new@example.com",
  "designation": "Senior Engineer",
  "salary": 95000,
  "salaryDate": 5,
  "startingBalance": 60000
}

Response (200):
{
  "fullName": "John Doe Updated",
  "phone": "9876543210",
  "email": "john.new@example.com",
  "designation": "Senior Engineer",
  "salary": 95000,
  "salaryDate": 5,
  "startingBalance": 60000,
  "walletBalance": 55230.50
}
```

---

### 3. Transaction Endpoints

#### Get All Transactions
```http
GET /api/transactions?category=Food&startDate=2025-01-01&endDate=2025-03-31
Authorization: Bearer <token>

Query Parameters (all optional):
- category: Filter by category/reason
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
- minAmount: Number
- maxAmount: Number

Response (200):
[
  {
    "id": "txn_id",
    "type": "spend",           // "spend" or "receive"
    "category": "Food & Dining", // For spend
    "reason": null,            // For receive
    "amount": 450,
    "date": "2025-03-10",
    "description": "Lunch at cafe",
    "createdAt": "2025-03-10T12:00:00Z"
  },
  {
    "id": "txn_id_2",
    "type": "receive",
    "category": null,
    "reason": "Salary",
    "amount": 50000,
    "date": "2025-03-01",
    "description": null,
    "createdAt": "2025-03-01T09:00:00Z"
  }
]
```

#### Create Transaction
```http
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

Request Body (Spend):
{
  "type": "spend",
  "category": "Food & Dining",
  "amount": 450,
  "date": "2025-03-10",
  "description": "Lunch at cafe"  // Optional
}

Request Body (Receive):
{
  "type": "receive",
  "reason": "Salary",
  "amount": 50000,
  "date": "2025-03-01",
  "description": "Monthly salary" // Optional
}

Response (201):
{
  "id": "txn_id",
  "type": "spend",
  "category": "Food & Dining",
  "amount": 450,
  "date": "2025-03-10",
  "description": "Lunch at cafe",
  "createdAt": "2025-03-10T12:00:00Z"
}

Note: Update walletBalance:
- For "spend": walletBalance -= amount
- For "receive": walletBalance += amount
```

#### Delete Transaction
```http
DELETE /api/transactions/:id
Authorization: Bearer <token>

Response (200):
{
  "message": "Transaction deleted successfully"
}

Note: Reverse the wallet balance change
```

#### Export Transactions
```http
GET /api/transactions/export?format=csv&startDate=2025-01-01&endDate=2025-03-31&category=Food
Authorization: Bearer <token>

Query Parameters:
- format: "csv" or "pdf"
- startDate: Optional
- endDate: Optional
- category: Optional

Response:
- Content-Type: text/csv or application/pdf
- Binary file download
```

---

### 4. Commitment Endpoints

#### Get All Commitments
```http
GET /api/commitments
Authorization: Bearer <token>

Response (200):
[
  {
    "id": "commit_id",
    "name": "Car EMI",          // Must be unique per user
    "type": "EMI",              // EMI, Subscription, Rent, Other
    "amount": 15000,
    "deductionDate": 5,         // Day of month (1-31)
    "endDate": "2027-03-01",    // Optional for ongoing
    "reminderEnabled": true,
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

#### Create Commitment
```http
POST /api/commitments
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "Car EMI",           // Must be unique per user
  "type": "EMI",
  "amount": 15000,
  "deductionDate": 5,          // 1-31
  "endDate": "2027-03-01",     // Optional, null for ongoing
  "reminderEnabled": true
}

Response (201):
{
  "id": "commit_id",
  "name": "Car EMI",
  "type": "EMI",
  "amount": 15000,
  "deductionDate": 5,
  "endDate": "2027-03-01",
  "reminderEnabled": true,
  "createdAt": "2025-01-01T00:00:00Z"
}

Error Response (409 - Name exists):
{
  "message": "A commitment with this name already exists"
}
```

#### Update Commitment
```http
PUT /api/commitments/:id
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "Car EMI Updated",
  "type": "EMI",
  "amount": 16000,
  "deductionDate": 10,
  "endDate": "2027-06-01",
  "reminderEnabled": false
}

Response (200):
{
  "id": "commit_id",
  "name": "Car EMI Updated",
  "type": "EMI",
  "amount": 16000,
  "deductionDate": 10,
  "endDate": "2027-06-01",
  "reminderEnabled": false,
  "updatedAt": "2025-03-14T00:00:00Z"
}
```

#### Delete Commitment
```http
DELETE /api/commitments/:id
Authorization: Bearer <token>

Response (200):
{
  "message": "Commitment deleted successfully"
}
```

---

### 5. Dashboard Endpoints

#### Get Dashboard Stats
```http
GET /api/dashboard/stats
Authorization: Bearer <token>

Response (200):
{
  "walletBalance": 45230.50,
  "totalIncome": 85000,
  "totalExpense": 39769.50,
  "categoryExpenses": [
    { "category": "Food & Dining", "amount": 12500 },
    { "category": "Transportation", "amount": 8500 },
    { "category": "Shopping", "amount": 6500 }
  ],
  "trends": [
    { "month": "Jan", "Food & Dining": 12000, "Transportation": 8000 },
    { "month": "Feb", "Food & Dining": 11500, "Transportation": 8500 },
    { "month": "Mar", "Food & Dining": 12500, "Transportation": 8500 }
  ],
  "budgets": [
    { "category": "Food & Dining", "budget": 15000, "spent": 12500 },
    { "category": "Transportation", "budget": 10000, "spent": 8500 }
  ],
  "upcomingCommitments": [
    { "name": "Car EMI", "amount": 15000, "dueDate": "2025-03-15" },
    { "name": "Netflix", "amount": 799, "dueDate": "2025-03-14" }
  ],
  "exceededBudgets": [
    { "category": "Shopping", "budget": 5000, "spent": 6500, "excess": 1500 }
  ]
}

Notes:
- totalIncome: Sum of all "receive" transactions
- totalExpense: Sum of all "spend" transactions
- categoryExpenses: Group by category, sum amounts
- trends: Last 3 months, breakdown by category
- budgets: User-defined budgets (if you implement budget feature)
- upcomingCommitments: Commitments due tomorrow (reminderEnabled=true)
- exceededBudgets: Categories where spent > budget
```

---

### 6. Admin Endpoints (Admin Role Only)

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <token>
Role: admin

Response (200):
[
  {
    "id": "user_id",
    "fullName": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "role": "user",
    "walletBalance": 45230.50,
    "createdAt": "2025-01-15T00:00:00Z"
  }
]

Error Response (403):
{
  "message": "Forbidden: Admin access required"
}
```

#### Get User Details
```http
GET /api/admin/users/:id
Authorization: Bearer <token>
Role: admin

Response (200):
{
  "id": "user_id",
  "fullName": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "role": "user",
  "walletBalance": 45230.50,
  "createdAt": "2025-01-15T00:00:00Z",
  "transactions": [
    {
      "id": "txn_id",
      "type": "spend",
      "category": "Food & Dining",
      "amount": 450,
      "date": "2025-03-10"
    }
  ],
  "commitments": [
    {
      "id": "commit_id",
      "name": "Car EMI",
      "type": "EMI",
      "amount": 15000,
      "deductionDate": 5
    }
  ],
  "stats": {
    "totalIncome": 85000,
    "totalExpense": 39769.50,
    "transactionCount": 45,
    "commitmentCount": 3
  }
}
```

#### Update User
```http
PUT /api/admin/users/:id
Authorization: Bearer <token>
Role: admin
Content-Type: application/json

Request Body:
{
  "fullName": "John Doe Updated",
  "email": "john.updated@example.com",
  "role": "admin"            // Can change user to admin
}

Response (200):
{
  "id": "user_id",
  "fullName": "John Doe Updated",
  "email": "john.updated@example.com",
  "role": "admin",
  "updatedAt": "2025-03-14T00:00:00Z"
}
```

#### Delete User
```http
DELETE /api/admin/users/:id
Authorization: Bearer <token>
Role: admin

Response (200):
{
  "message": "User deleted successfully"
}

Note: Also delete all user's transactions and commitments
```

#### Reset User Password
```http
PUT /api/admin/users/:id/reset-password
Authorization: Bearer <token>
Role: admin
Content-Type: application/json

Request Body:
{
  "newPassword": "newpassword123"  // Min 6 characters
}

Response (200):
{
  "message": "Password reset successfully"
}
```

---

## 🔒 Security Requirements

1. **JWT Authentication:**
   - Generate JWT on login/register
   - Include user ID and role in payload
   - Set expiration (e.g., 24 hours)
   - Verify token on protected endpoints

2. **Role-Based Access:**
   - Check role for admin endpoints
   - Return 403 Forbidden if not admin

3. **Data Isolation:**
   - Users can only access their own data
   - Admin can access all users' data

4. **Validation:**
   - Phone number: 10 digits, unique
   - Commitment name: unique per user
   - Password: minimum 6 characters
   - Amount: positive numbers
   - Deduction date: 1-31

5. **CORS:**
   - Allow LAN network origins
   - Allow credentials

---

## 📊 Database Schema Suggestions

### Users Table
```
- id (primary key)
- fullName
- phone (unique)
- email
- password (hashed)
- role (user/admin)
- designation
- salary
- salaryDate (1-31)
- startingBalance
- walletBalance
- createdAt
- updatedAt
```

### Transactions Table
```
- id (primary key)
- userId (foreign key)
- type (spend/receive)
- category (for spend)
- reason (for receive)
- amount
- date
- description
- createdAt
```

### Commitments Table
```
- id (primary key)
- userId (foreign key)
- name (unique per user)
- type (EMI/Subscription/Rent/Other)
- amount
- deductionDate (1-31)
- endDate (nullable)
- reminderEnabled (boolean)
- createdAt
- updatedAt
```

### Budgets Table (Optional)
```
- id (primary key)
- userId (foreign key)
- category
- budgetAmount
- createdAt
- updatedAt
```

---

## 🧪 Testing Endpoints

Use tools like:
- Postman
- cURL
- Thunder Client (VS Code)
- REST Client (VS Code)

Example cURL:
```bash
# Register
curl -X POST http://192.168.1.100:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","phone":"1234567890","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://192.168.1.100:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","password":"test123"}'

# Get Profile (with token)
curl http://192.168.1.100:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ✅ Checklist for Backend Developer

- [ ] Set up Node.js/Python backend framework
- [ ] Configure database (MongoDB/PostgreSQL/MySQL)
- [ ] Implement JWT authentication
- [ ] Create all API endpoints as specified
- [ ] Add input validation
- [ ] Implement role-based access control
- [ ] Add CORS configuration for LAN
- [ ] Test all endpoints with Postman
- [ ] Handle unique constraint violations
- [ ] Implement wallet balance updates on transactions
- [ ] Calculate dashboard statistics correctly
- [ ] Generate CSV/PDF exports
- [ ] Add error handling and logging
- [ ] Deploy on LAN accessible server

---

**Frontend is 100% ready and waiting for backend integration!** 🚀
