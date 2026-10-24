const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "System Administrator";

    if (!adminEmail || !adminPassword) {
      console.log("No ADMIN_EMAIL or ADMIN_PASSWORD set in environment. Skipping admin seed.");
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        role: "admin",
        isActive: true
      });

      console.log(`Admin account automatically created for: ${adminEmail}`);
    } else {
      console.log(`Admin account already exists for: ${adminEmail}`);
    }
  } catch (error) {
    console.error("Admin seeding error:", error.message);
  }
};

module.exports = seedAdmin;