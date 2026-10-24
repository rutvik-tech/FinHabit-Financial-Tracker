require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!MONGO_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "Missing required environment variables: MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD."
      );
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
    }

    await mongoose.connect(MONGO_URI);

    const email = ADMIN_EMAIL.trim().toLowerCase();

    let user = await User.findOne({ email });

    if (user) {
      user.role = "admin";
      user.isActive = true;
      user.name = ADMIN_NAME.trim();

      await user.save();

      console.log("Existing account has been granted administrator access.");
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

      user = await User.create({
        name: ADMIN_NAME.trim(),
        email,
        password: hashedPassword,
        role: "admin",
        isActive: true
      });

      console.log("Administrator account created successfully.");
    }

    console.log(`Administrator email: ${user.email}`);
    console.log("You can now log in through the FinHabit login page.");
  } catch (error) {
    console.error("Administrator setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

createAdmin();