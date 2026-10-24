const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully.");
  } catch {
    console.error("MongoDB connection failed. Check your database connection and settings.");

    process.exit(1);
  }
};

module.exports = connectDB;