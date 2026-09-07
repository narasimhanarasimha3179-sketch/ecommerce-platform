import express from "express";

import {
  registerUser,
  loginUser,
} from "../controllers/authController.js";

import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Create test admin
router.post("/create-admin", async (req, res) => {
  try {
    const email = "admin@gmail.com";
    const password = "Admin@123";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin account already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: "Admin",
      email,
      password: hashedPassword,
      phone: "",
      role: "admin",
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;