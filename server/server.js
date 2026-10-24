const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const seedAdmin = require("./utils/seedAdmin");

const app = express();

// Allowed Origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: This origin is not allowed."));
      }
    },
    credentials: true
  })
);

app.use(express.json());

// Route Mounts
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/income", require("./routes/incomeRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/habits", require("./routes/habitRoutes"));
app.use("/api/goals", require("./routes/goalRoutes"));
app.use("/api/wealth", require("./routes/wealthRoutes"));
app.use("/api/budgets", require("./routes/budgetRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Serve static frontend in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../client/dist");
  app.use(express.static(distPath));

  app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("SERVER UNHANDLED ERROR:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error."
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and seed admin on startup
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB successfully.");
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(
        `FinHabit server running on port ${PORT} in ${
          process.env.NODE_ENV || "development"
        } mode`
      );
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });