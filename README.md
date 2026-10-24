# FinHabit — Financial Habit Builder & Wealth Growth Tracker

FinHabit is a full-stack personal finance and wealth management platform built with the MERN stack (MongoDB, Express, React, Node.js). It bridges the gap between daily money decisions and long-term financial growth by combining real-time expense tracking, category budget caps, streak-based financial habits, targeted savings goals, and visual wealth analytics into a single responsive dashboard.

---

## 🌐 Live Deployment Links

- **Live Frontend:** [https://finhabit-navy.vercel.app/](https://finhabit-navy.vercel.app/)
- **Live Backend API:** [https://finhabit.onrender.com](https://finhabit.onrender.com)
- **GitHub Repository:** [https://github.com/rutvik-tech/FinHabit-Financial-Tracker](https://github.com/rutvik-tech/FinHabit-Financial-Tracker)

> **Note on Render Free Tier:** The backend is hosted on Render's free tier. If the web service has been idle, the initial request might take roughly 30–50 seconds while the server spins up. Subsequent requests run at normal speed.

---

## 🚀 Key Features

### 1. User Dashboard & Financial Analytics
- **Live KPI Metrics:** Quick overview cards for Total Income, Total Expenses, Net Balance, and current Savings Rate percentage.
- **Visual Analytics:** Interactive category breakdown pie charts and monthly cash flow bar graphs built with Recharts.
- **Monthly Cash Flow Analysis:** Visual comparison of income versus expenses across monthly cycles.

### 2. Transaction Management & Budgeting
- **Categorized Incomes & Expenses:** Add, edit, and delete transactions with timestamps, category tags, and optional notes.
- **Category Budget Limits:** Set maximum monthly spending targets per category. Dynamic progress bars warn users as spending approaches or exceeds threshold limits.
- **CSV Data Export:** One-click download of transaction logs into formatted CSV files for external audits or spreadsheets.

### 3. Habit Building & Streaks
- **Daily Financial Habits:** Track everyday mindful actions (e.g., "Zero Impulse Buys", "Track Every Coffee", "Cook at Home").
- **Automatic Streak Engine:** Calculates active daily streaks and personal all-time best streaks based on completion logs.

### 4. Savings Goals & Wealth Tracking
- **Target Goals:** Set up specific savings targets with deadlines and progress bars updated on every deposit.
- **Net Worth History:** Log historical asset and liability snapshots to visualize true wealth trajectory over time.

### 5. Administration & Account Governance
- **Administrative Portal:** Platform-wide monitoring of total users, active accounts, and activity metrics.
- **User Status Control:** Administrators can activate or deactivate user accounts as needed.
- **Built-in Guardrails:** Administrative self-deactivation protection prevents admins from locking themselves out.
- **Deactivation Modal:** When a deactivated user attempts to log in, the application intercepts the request and presents a modal explaining their account status.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, React Router DOM, Recharts, Lucide Icons, Tailwind CSS
- **Backend:** Node.js, Express.js (REST API architecture)
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** Stateless JSON Web Tokens (JWT) & Bcrypt.js password hashing
- **Deployment:** 
  - Client: **Vercel**
  - Server: **Render**
  - Database: **MongoDB Atlas**

---

## 🔐 Security Architecture

- **Data Isolation (IDOR Prevention):** All database read, update, and delete queries strictly enforce tenancy boundaries using `req.user.id`. Users can never view or manipulate records belonging to another account.
- **Password Salting & Hashing:** Sensitive credentials are encrypted with `bcryptjs` using a salt round of 10 prior to storage.
- **Role-Based Access Control (RBAC):** Middleware validates administrative role claims before allowing access to user management and system metrics routes.
- **Controlled CORS:** Express is configured to accept requests solely from authorized origins (local development ports and the verified Vercel production domain).
- **Environment Separation:** Secret keys, database connection strings, and admin seed parameters are managed through environment variables and excluded from version control via `.gitignore`.

---

## 🧪 Testing & Evaluation Credentials

Evaluators can verify role-based flows using the following access methods:

### Standard User Access
- You can register a new account on the live app at `/register`, or log in with any existing user profile.
- **Recommended Test Flows:** Add an income/expense, define a category budget cap, check off a daily habit, add a savings goal deposit, and export transactions to CSV.

### Administrator Access
- **Email:** `finhabit@admin.com`
- **Password:** *(Provided privately in the project submission notes)*
- **Recommended Test Flows:** Navigate to the `/admin` routes, view registered accounts, toggle user activation states, and inspect system-wide activity logs.

---

## 💻 Local Installation & Setup

If you want to run this project locally, follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/rutvik-tech/FinHabit-Financial-Tracker.git
cd FinHabit-Financial-Tracker
```

### 2. Configure & Run Backend Server
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_NAME=System Administrator
ADMIN_EMAIL=finhabit@admin.com
ADMIN_PASSWORD=your_admin_password
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

### 3. Configure & Run Frontend Client
Open a second terminal window:
```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.