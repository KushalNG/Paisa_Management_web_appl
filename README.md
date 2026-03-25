# Paisa Management - Personal Expense Tracker

A modern, full-featured personal expense tracking web application designed for multiple users on a local LAN network.

## Features

### User Features
- Dashboard
- Wallet balance display
- Category-wise expense visualization (Bar and Pie charts)
- Expense trend analysis (Line charts)
- Budget progress tracking with color-coded indicators (Green/Yellow/Red)
- Commitment reminders for upcoming deductions
- Budget exceeded alerts

- Transactions
- Toggle between Spend and Receive modes
- Category management (predefined and custom categories)
- Date-based transaction tracking
- Advanced filtering (category, date range, amount range)
- Export functionality (CSV/PDF) with customizable filters
- Transaction history with visual indicators

- Commitments
- Create, Edit, and Delete commitments
- Types: EMI, Subscription, Rent, Other
- Monthly deduction date tracking
- End date management for fixed-term commitments
- Reminder toggle (on/off)
- Automatic next deduction date calculation
- Remaining months display

- Profile
- Display and Edit modes
- Personal information management
- Financial details (Designation, Salary, Salary date)
- Starting Balance updates (for promotions or major changes)

### Admin Features
- Admin Panel (accessible only to admin role)
- View all users in a comprehensive table
- Click any user to view full account details
- View user's dashboard, transactions, and commitments
- Edit user details (name, email, role)
- Delete users
- Reset user passwords

### Security
- JWT-based authentication stored in localStorage
- Role-based access control (admin vs regular user)
- Protected routes with automatic redirection
- Token expiration handling

## Tech Stack

Frontend:
- React 19
- React Router DOM
- Tailwind CSS
- Recharts (for data visualization)
- Lucide React (icons)
- Axios (API calls)
- ShadCN UI components

Backend API Configuration:
- API Base URL: http://<LAN-IP>:5000 (configurable)
- RESTful API design
- JWT token authentication

## Project Structure

```
/app/frontend/
+-- src/
¦   +-- components/
¦   ¦   +-- Layout.js          # Main layout with sidebar
¦   ¦   +-- Sidebar.js         # Navigation sidebar
¦   ¦   +-- ProtectedRoute.js  # Route protection wrapper
¦   +-- contexts/
¦   ¦   +-- AuthContext.js     # Authentication context and JWT management
¦   +-- pages/
¦   ¦   +-- Register.js        # User registration
¦   ¦   +-- Login.js           # User login
¦   ¦   +-- Dashboard.js       # Main dashboard with charts
¦   ¦   +-- Transactions.js    # Transaction management
¦   ¦   +-- Commitments.js     # Commitment management
¦   ¦   +-- Profile.js         # User profile
¦   ¦   +-- AdminPanel.js      # Admin user management
¦   +-- services/
¦   ¦   +-- api.js             # API service layer with all endpoints
¦   +-- utils/
¦   ¦   +-- categories.js      # Category definitions and colors
¦   ¦   +-- exportUtils.js     # Export and formatting utilities
¦   +-- App.js                 # Main app with routing
¦   +-- index.js               # Entry point
```

## Getting Started

### Prerequisites
- Node.js 16+
- Yarn package manager
- Backend API running on http://<LAN-IP>:5000

### Installation

1. Install dependencies:
   ```bash
   cd /app/frontend
   yarn install
   ```

2. Configure API URL:
   Edit /app/frontend/.env:
   ```env
   # Replace with your LAN IP address
   REACT_APP_API_URL=http://192.168.1.100:5000
   ```

3. Start the development server:
   ```bash
   yarn start
   ```

4. Access the application:
   - Local: http://localhost:3000
   - LAN: http://<YOUR-IP>:3000

## API Endpoints

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login

### User
- GET /api/user/profile - Get user profile
- PUT /api/user/profile - Update user profile

### Transactions
- GET /api/transactions - Get all transactions
- POST /api/transactions - Create transaction
- DELETE /api/transactions/:id - Delete transaction
- GET /api/transactions/export - Export transactions

### Commitments
- GET /api/commitments - Get all commitments
- POST /api/commitments - Create commitment
- PUT /api/commitments/:id - Update commitment
- DELETE /api/commitments/:id - Delete commitment

### Dashboard
- GET /api/dashboard/stats - Get dashboard statistics
- GET /api/dashboard/category-expenses - Get category-wise expenses
- GET /api/dashboard/trends - Get expense trends
- GET /api/dashboard/budgets - Get budget data

### Admin (Admin role only)
- GET /api/admin/users - Get all users
- GET /api/admin/users/:id - Get user details
- PUT /api/admin/users/:id - Update user
- DELETE /api/admin/users/:id - Delete user
- PUT /api/admin/users/:id/reset-password - Reset user password

## Features Breakdown

### 1. Register Page
- Full Name, Phone (unique), Email, Password
- Starting Balance (optional)
- Phone uniqueness validation
- Error display for duplicate phones

### 2. Login Page
- Phone and Password authentication
- Remember user session (JWT)
- Automatic redirect on success

### 3. Dashboard
- Wallet Balance Card: Current balance
- Income/Expense Cards: Total income and expenses
- Category Bar Chart: Visual breakdown of spending
- Expense Pie Chart: Distribution view
- Trend Line Chart: Month-over-month category trends
- Budget Progress Bars: Color-coded (Green <70%, Yellow 70-89%, Red >=90%)
- Commitment Reminders: Banner for deductions due tomorrow
- Budget Alerts: Red banner for exceeded budgets

### 4. Transactions Page
- Toggle Tabs: Switch between Spend and Receive
- Spend Form: Category dropdown + Add custom category, Amount, Date
- Receive Form: Reason, Amount, Date
- Filters: Category, Date range, Amount range
- Export Modal: Date range, Category filter, CSV/PDF format selection
- Transaction List: Scrollable history with type indicators

### 5. Commitments Page
- Grid View: Cards showing all commitments
- Create/Edit Form: Name (unique), Type, Amount, Deduction date (1-31), End date, Reminder toggle
- Card Details: Next deduction date, Remaining months (for fixed-term), Reminder status
- Actions: Edit and Delete buttons on each card

### 6. Profile Page
- Display Mode: Shows all information in read-only format
- Edit Mode: All fields editable except phone
- Fields: Name, Phone (read-only), Email, Designation, Salary, Salary Date, Starting Balance
- Starting Balance Note: Update when promoted or major income change

### 7. Admin Panel
- User Table: All users with key information
- Actions per user:
- View: Open user's full account (transactions, commitments, stats)
- Edit: Modify name, email, role
- Reset Password: Set new password for user
- Delete: Remove user from system
- User Detail Modal: Comprehensive view of selected user's data

## Design Highlights

- Modern UI: Clean, professional design with Tailwind CSS
- Sidebar Navigation: Fixed sidebar with active state indicators
- Color-Coded Feedback: Green (good), Yellow (warning), Red (danger)
- Responsive Design: Works on desktop and tablet
- Visual Hierarchy: Clear separation of sections and data
- Interactive Charts: Recharts library for data visualization
- Modal Dialogs: For forms and confirmations
- Loading States: User feedback during API calls

## Authentication Flow

1. User registers -> Server creates account -> Returns JWT token
2. User logs in -> Server validates -> Returns JWT token
3. Token stored in localStorage
4. Token added to all API requests via interceptor
5. 401 responses trigger automatic logout and redirect to login
6. Protected routes check for token before rendering

## Testing the App

### Mock Data
The app includes mock data fallbacks for testing without a backend:
- Sample transactions
- Sample commitments
- Sample dashboard statistics
- Sample users (for admin panel)

### Test Accounts (Mock)
- Regular User: Any registered account
- Admin User: Set role: 'admin' in user data

## Notes

- Phone numbers must be unique (10 digits)
- Commitment names must be unique
- Budget thresholds: 70% (yellow), 90% (red)
- All currency displayed in Indian Rupees (INR)
- Dates formatted in DD-MMM-YYYY
- Charts use category-specific colors for consistency

## Customization

### Adding New Categories
Categories are defined in /app/frontend/src/utils/categories.js. You can add more categories and their colors there.

### Changing Theme Colors
Primary colors can be modified in Tailwind config or inline classes. Main theme uses blue (bg-blue-600, etc.).

### API URL Configuration
Update REACT_APP_API_URL in /app/frontend/.env to point to your backend server.

## Troubleshooting

### Frontend won't start
- Check if port 3000 is available
- Verify all dependencies are installed: yarn install
- Check logs: tail -f /var/log/supervisor/frontend.*.log

### API calls failing
- Verify REACT_APP_API_URL is correct in .env
- Check backend is running on the specified port
- Check CORS settings on backend
- Open browser console to see detailed errors

### Token expired errors
- Tokens are stored in localStorage
- Clear browser localStorage and login again
- Check JWT expiration time on backend

## License

This project is for personal or educational use.
