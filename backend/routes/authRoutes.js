const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const LoginLog = require("../models/LoginLog");

function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is not connected. Check the deployed MONGO_URI environment variable.",
    });
  }

  next();
}

router.use(requireDatabase);

// ================= CHANGE PASSWORD =================
router.post("/change-password", async (req, res) => {
  const { email, currentPassword, newPassword, confirmPassword } = req.body;
  if (!email || !currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: "New passwords do not match" });
  }
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (user.password !== currentPassword) {
    return res.status(400).json({ success: false, message: "Current password is incorrect" });
  }
  user.password = newPassword;
  await user.save();
  return res.json({ success: true, message: "Password changed successfully" });
});

// In-memory OTP store (for demo; use Redis or DB in production)
const otpStore = {};

// Nodemailer setup (configure with your SMTP)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASS,
  },
});
// ================= SEND OTP FOR PASSWORD RESET =================
router.post("/send-otp", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP for 10 minutes
    otpStore[email] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
    };

    // SMTP credentials check
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_EMAIL_PASS) {
      console.log(`OTP for ${email}: ${otp}`);

      return res.json({
        success: true,
        message: "SMTP not configured. OTP generated for testing.",
        otp, // Remove this in production
      });
    }

    await transporter.sendMail({
      from: `"Online Book Store" <${process.env.ADMIN_EMAIL}>`,
      to: email,
      subject: "Verify Your Login - Online Book Store",
      html: `
      <div style="font-family:Arial,sans-serif;padding:20px;background:#f5f5f5;">
        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px;">

          <h2 style="color:#2563eb;">📚 Online Book Store</h2>

          <p>Hello <strong>${user.name || "Reader"}</strong>,</p>

          <p>Your One-Time Password (OTP) for login is:</p>

          <div style="text-align:center;margin:30px 0;">
            <span style="
              font-size:32px;
              font-weight:bold;
              letter-spacing:8px;
              color:#2563eb;
            ">
              ${otp}
            </span>
          </div>

          <p>This OTP will expire in <strong>10 minutes</strong>.</p>

          <p>If you didn't request this login, you can safely ignore this email.</p>

          <hr>

          <p style="font-size:13px;color:#777;">
            Regards,<br>
            Online Book Store Team
          </p>

        </div>
      </div>
      `,
    });

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    });
  }
});

// ================= VERIFY OTP AND LOGIN =================
router.post("/verify-otp", async (req, res) => {
  const email = (req.body.email || "").toLowerCase().trim();
  const otp = (req.body.otp || "").trim();
  const record = otpStore[email];
  if (!record || record.otp !== otp || Date.now() > record.expires) {
    return res.json({ success: false, message: "Invalid or expired OTP" });
  }
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, message: "User not found" });
  // Generate JWT token (same as login)
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  delete otpStore[email];
  return res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role
    },
    token
  });
});

// ================= GET ALL ADMINS =================
router.get("/admins", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const password = (req.body.password || "").trim();
    const name = (req.body.name || "").trim();
    const mobile = (req.body.mobile || "").trim();

    if (!email || !password || !name) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      email,
      password,
      name,
      mobile,
      role: "user"
    });

    await user.save();

    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: "7d" });

    return res.json({
      message: "Registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      },
      token
    });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const password = (req.body.password || "").trim();
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      await LoginLog.create({ email, success: false, ip });
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      await LoginLog.create({ email, success: false, ip });
      return res.status(400).json({ message: "Invalid password" });
    }

    await LoginLog.create({ email, success: true, ip });

    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: "7d" });

    return res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      },
      token
    });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});


// ================= FETCH USER (SESSION RESTORE) =================
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});


// ================= ADD ADMIN =================
router.post("/add-admin", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const password = (req.body.password || "").trim();
    const name = (req.body.name || "").trim();
    const mobile = (req.body.mobile || "").trim();

    if (!email || !password || !name) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const admin = new User({
      email,
      password,
      name,
      mobile,
      role: "admin"
    });

    await admin.save();
    return res.json({ message: "Admin added successfully" });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
