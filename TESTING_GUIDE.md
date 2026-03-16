# Testing Guide - How to Navigate the App

## 🚀 Quick Start

### Step 1: Access the Application
Open your browser and go to:
```
http://localhost:3000
```

This will redirect you to the login page since you're not authenticated.

---

## 🔑 Authentication Flow

### Register a New Account

1. On the login page, click **"Register here"** link at the bottom
2. Or directly visit: `http://localhost:3000/register`

3. Fill in the registration form:
   ```
   Full Name: Test User
   Phone: 1234567890 (must be unique, 10 digits)
   Email: test@example.com
   Password: test123 (min 6 characters)
   Starting Balance: 50000 (optional)
   ```

4. Click **"Create Account"**

5. You'll be automatically logged in and redirected to the Dashboard!

---

## 📱 Navigating the App

Once logged in, you'll see a **sidebar on the left** with navigation:

### Available Pages:

1. **Dashboard** 📊
   - View wallet balance
   - See expense charts (bar, pie, line)
   - Monitor budget progress
   - Check commitment reminders

2. **Transactions** 💰
   - Toggle between Spend and Receive
   - Add new transactions
   - Filter by category, date, amount
   - Export to CSV/PDF

3. **Commitments** 📅
   - View all commitments as cards
   - Create new commitments (EMI, Subscription, Rent, Other)
   - Edit or delete existing ones
   - See next deduction dates

4. **Profile** 👤
   - View your personal information
   - Click "Edit Profile" to modify details
   - Update salary, designation, starting balance

5. **Admin Panel** 👨‍💼 (Only for Admin users)
   - View all users
   - Edit user details
   - Delete users
   - Reset passwords

---

## 🧪 Testing Different User Roles

### Regular User (Default)
- Register normally as shown above
- You'll have access to: Dashboard, Transactions, Commitments, Profile
- No Admin Panel access

### Admin User (To Test Admin Features)
Since the app uses mock data, you can manually set yourself as admin:

**Option 1: Via Browser Console**
1. After logging in, open Browser Developer Tools (F12)
2. Go to "Application" tab → "Local Storage"
3. Find the `user` key
4. Edit the JSON and change `"role": "user"` to `"role": "admin"`
5. Refresh the page
6. You'll now see "Admin Panel" in the sidebar!

**Option 2: Register with Backend**
Once you build the backend, you can set the role to 'admin' in the database.

---

## 🎨 Exploring Features

### On Dashboard:
- Check the summary cards (Wallet, Income, Expense)
- Scroll down to see different charts
- Look for yellow/red alert banners (if any)

### On Transactions:
- Click "Add Transaction" button
- Try toggling between "Spend" and "Receive" tabs
- Add a transaction
- Use filters to search
- Click "Export" to see export options

### On Commitments:
- Click "Add Commitment" button
- Fill in the form (name must be unique)
- Try different types (EMI, Subscription, Rent, Other)
- Edit a commitment by clicking the edit icon
- Delete by clicking the trash icon

### On Profile:
- See your information in display mode
- Click "Edit Profile" to switch to edit mode
- Try updating some fields
- Click "Save Changes" or "Cancel"

---

## 🔓 Direct URL Access (For Testing)

You can manually type these URLs to jump to specific pages:

```
http://localhost:3000/register       → Register page
http://localhost:3000/login          → Login page
http://localhost:3000/               → Dashboard (needs login)
http://localhost:3000/transactions   → Transactions (needs login)
http://localhost:3000/commitments    → Commitments (needs login)
http://localhost:3000/profile        → Profile (needs login)
http://localhost:3000/admin          → Admin Panel (needs admin role)
```

**Note:** Protected pages will redirect you to login if not authenticated.

---

## 💡 Testing Tips

### Mock Data Available
The app includes mock data, so you'll see:
- Sample transactions on the Transactions page
- Sample commitments on the Commitments page
- Sample dashboard statistics with charts
- Sample users in Admin Panel (if admin)

### Multiple Test Accounts
You can register multiple accounts with different phone numbers:
- Account 1: Phone 1234567890
- Account 2: Phone 9876543210
- Account 3: Phone 5555555555

### Logout and Login Again
- Click "Logout" button at the bottom of the sidebar
- You'll be redirected to login
- Try logging in with the same phone number and password

---

## 🐛 Troubleshooting

### "I only see the login page"
- Make sure you click "Register here" link to create an account first
- Or check if you typed the URL correctly

### "Admin Panel not showing"
- Admin Panel only shows for users with `role: 'admin'`
- Use Browser Console method above to change your role
- Or wait for backend to create admin users

### "Page not loading"
- Make sure frontend is running: `sudo supervisorctl status frontend`
- Check for errors in browser console (F12)
- Clear browser cache and try again

### "Can't see sidebar"
- Sidebar only appears on protected pages (after login)
- Login/Register pages don't have sidebar (by design)

---

## 📸 What You Should See

### Before Login:
- Login page with blue gradient background
- Or Register page with form fields

### After Login:
- Blue sidebar on the left with:
  - Logo and app name at top
  - Your user avatar and name
  - Navigation menu items
  - Logout button at bottom
- Main content area on the right showing the current page

---

## ✅ Quick Test Checklist

- [ ] Visit http://localhost:3000
- [ ] Click "Register here" link
- [ ] Register with phone: 1234567890
- [ ] See Dashboard with charts
- [ ] Click "Transactions" in sidebar
- [ ] Click "Add Transaction" button
- [ ] Try adding a Spend transaction
- [ ] Click "Commitments" in sidebar
- [ ] Click "Add Commitment" button
- [ ] Try creating a commitment
- [ ] Click "Profile" in sidebar
- [ ] Click "Edit Profile" button
- [ ] Click "Logout" button
- [ ] Try logging back in

---

**Happy Testing! 🎉**

If you get stuck on any step, let me know!
