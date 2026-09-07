import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper function to sign JWT tokens
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role || "customer",
    },
    process.env.JWT_SECRET || "fallback_super_secret_key_123",
    {
      expiresIn: "30d",
    }
  );
};

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, fullName, email, password, phone, address, city, state, pincode } = req.body;

    const finalName = (name || fullName || "").trim();
    const finalEmail = (email || "").toLowerCase().trim();
    const finalPassword = password || "";

    if (!finalName || !finalEmail || !finalPassword) {
      return res.status(400).json({
        message: "Please fill in all required fields (Name, Email, Password)",
      });
    }

    if (finalPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: finalEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered. Please login instead.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(finalPassword, salt);

    // Create user in MongoDB
    const user = await User.create({
      name: finalName,
      email: finalEmail,
      phone: phone || "",
      password: hashedPassword,
      address: address || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      role: "customer",
    });

    // Generate token so the user is immediately logged in upon registration
    const token = generateToken(user);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        token,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      message: error.message || "Server error during registration",
    });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const finalEmail = (email || "").toLowerCase().trim();

    if (!finalEmail || !password) {
      return res.status(400).json({
        message: "Please provide both email and password",
      });
    }

    // Case-insensitive query match
    const user = await User.findOne({ email: finalEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    // Returns token both top-level and nested to support all frontend storage patterns
    return res.json({
      message: "Login successful",
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        token,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: error.message || "Server error during login",
    });
  }
};