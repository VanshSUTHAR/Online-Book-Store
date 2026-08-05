const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const LoginLog = require("../models/LoginLog");
const Otp = require("../models/Otp");
const { sendStoreMail } = require("../utils/mailer");

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

// In-memory OTP store for registration — holds pending user data + OTP
const otpRegisterStore = {};

// ================= SEND OTP FOR REGISTRATION (EMAIL VERIFICATION) =================
router.post("/send-register-otp", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const name = (req.body.name || "").trim();
    const mobile = (req.body.mobile || "").trim();
    const password = (req.body.password || "").trim();

    if (!email || !name || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store pending registration data + OTP for 10 minutes
    otpRegisterStore[email] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
      userData: { name, email, mobile, password },
    };

    let emailSent = false;
    let mailErrorMsg = null;
    let mailErrorDetails = null;

    try {
      const info = await sendStoreMail({
        to: email,
        subject: "✅ Verify Your Email - Online Book Store",
        text: `Hello ${name},\n\nYour One-Time Password (OTP) to verify your email and create your account is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not sign up, please ignore this email.\n\nHappy Reading!\nOnline Book Store Team`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - Online Book Store</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 40px 10px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">

                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); padding: 36px 30px; text-align: center;">
                        <div style="font-size: 42px; margin-bottom: 8px;">📚</div>
                        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0;">Online Book Store</h1>
                        <p style="color: #c7d2fe; font-size: 13px; font-weight: 500; margin: 6px 0 0 0;">Verify Your Email Address</p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding: 40px 36px 30px 36px;">
                        <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
                          Welcome, ${name}! 👋
                        </h2>
                        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                          Thanks for signing up! Use the verification code below to confirm your email and activate your account:
                        </p>

                        <!-- OTP Box -->
                        <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 28px 20px; text-align: center; margin-bottom: 24px;">
                          <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 10px;">
                            Email Verification Code
                          </span>
                          <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #4338ca; margin: 5px 0;">
                            ${otp}
                          </div>
                          <div style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-top: 12px;">
                            ⏱️ Valid for 10 minutes
                          </div>
                        </div>

                        <!-- Security Notice -->
                        <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 0 12px 12px 0; padding: 14px 18px; margin-bottom: 24px;">
                          <p style="font-size: 12px; line-height: 1.5; color: #166534; margin: 0;">
                            <strong>🔐 Security Note:</strong> Never share this code with anyone. If you did not create an account, please ignore this email.
                          </p>
                        </div>

                        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0;">
                          Once verified, you'll be logged in automatically and ready to start browsing books!
                        </p>
                      </td>
                    </tr>

                    <!-- Divider -->
                    <tr><td style="padding: 0 36px;"><div style="border-top: 1px solid #f1f5f9;"></div></td></tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 36px 36px 36px; text-align: center;">
                        <p style="font-size: 13px; font-weight: 600; color: #475569; margin: 0 0 6px 0;">Happy Reading! 📖</p>
                        <p style="font-size: 12px; color: #94a3b8; margin: 0 0 12px 0;">Online Book Store Team</p>
                        <p style="font-size: 11px; color: #cbd5e1; margin: 0;">© ${new Date().getFullYear()} Online Book Store. All rights reserved.</p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
          `,
      });
      emailSent = true;
      console.log(`[REG-OTP] Email sent successfully to ${email}: ${info.response}`);
    } catch (mailErr) {
      console.error("[REG-OTP] Email send failed:", mailErr.message);
      if (mailErr.mailerDebugInfo) {
        console.error("[REG-OTP] Mailer debug:", mailErr.mailerDebugInfo);
      }
      mailErrorMsg = mailErr.message;
      mailErrorDetails = mailErr.mailerDebugInfo || null;
    }

    if (!emailSent) {
      delete otpRegisterStore[email];
      return res.status(500).json({
        success: false,
        message: `Failed to send verification email. ${mailErrorMsg || "Check your email configuration."}`,
        mailError: mailErrorMsg,
        mailErrorDetails,
      });
    }

    return res.json({
      success: true,
      message: `Verification code sent to ${email}`,
      emailSent,
    });
  } catch (error) {
    console.error("SEND REGISTER OTP ERROR:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
});

// ================= VERIFY REGISTER OTP AND CREATE ACCOUNT =================
router.post("/verify-register-otp", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const otp = (req.body.otp || "").trim();

    const record = otpRegisterStore[email];

    if (!record) {
      return res.status(400).json({ success: false, message: "No pending registration found. Please start again." });
    }
    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid verification code." });
    }
    if (Date.now() > record.expires) {
      delete otpRegisterStore[email];
      return res.status(400).json({ success: false, message: "Verification code has expired. Please start again." });
    }

    // Double-check the email wasn't registered in the meantime
    const existing = await User.findOne({ email });
    if (existing) {
      delete otpRegisterStore[email];
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    // Create the user
    const { name, mobile, password } = record.userData;
    const user = new User({ email, name, mobile, password, role: "user" });
    await user.save();

    // Clean up store
    delete otpRegisterStore[email];

    // Issue JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });

    return res.json({
      success: true,
      message: "Account created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("VERIFY REGISTER OTP ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
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

    const isBcrypt = user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$");
    const isPasswordValid = isBcrypt
      ? await bcrypt.compare(password, user.password)
      : (user.password === password);

    if (!isPasswordValid) {
      await LoginLog.create({ email, success: false, ip });
      return res.status(400).json({ message: "Invalid password" });
    }

    await LoginLog.create({ email, success: true, ip });

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

// ================= GET ALL ADMINS =================
router.get("/admins", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= DELETE ADMIN =================
router.delete("/admins/:id", async (req, res) => {
  try {
    const adminId = req.params.id;
    const admin = await User.findById(adminId);

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    await User.findByIdAndDelete(adminId);
    return res.json({ message: "Admin removed successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ================= FORGOT PASSWORD (GENERATE & SEND OTP) =================
router.post("/forgot-password", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email address." });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Upsert OTP record
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp, expiresAt, isVerified: false });

    let emailSent = false;
    let mailErrorMsg = null;

    try {
      await sendStoreMail({
        to: email,
        subject: "🔐 Password Reset Code - Online Book Store",
        text: `Hello ${user.name},\n\nYour OTP for resetting your password is: ${otp}\n\nThis code is valid for 5 minutes.\n\nIf you did not request a password reset, please ignore this email.\n\nOnline Book Store Team`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Code - Online Book Store</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 10px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); padding: 32px 24px; text-align: center;">
                        <div style="font-size: 36px; margin-bottom: 8px;">🔑</div>
                        <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0;">Password Reset Request</h1>
                        <p style="color: #c7d2fe; font-size: 13px; font-weight: 500; margin: 6px 0 0 0;">Online Book Store Security</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 32px 28px 24px 28px;">
                        <h2 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
                          Hello, ${user.name}! 👋
                        </h2>
                        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                          We received a request to reset your password. Use the 6-digit One-Time Password (OTP) below to proceed:
                        </p>
                        <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 24px 20px; text-align: center; margin-bottom: 20px;">
                          <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 8px;">
                            Password Reset OTP
                          </span>
                          <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #4338ca; margin: 4px 0;">
                            ${otp}
                          </div>
                          <div style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-top: 10px;">
                            ⏱️ Valid for 5 minutes
                          </div>
                        </div>
                        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 12px 12px 0; padding: 12px 16px; margin-bottom: 20px;">
                          <p style="font-size: 12px; line-height: 1.5; color: #991b1b; margin: 0;">
                            <strong>🔒 Security Warning:</strong> Do not share this code with anyone. If you didn't request a password reset, please ignore this email.
                          </p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 28px; text-align: center; border-top: 1px solid #f1f5f9; background-color: #fafafa;">
                        <p style="font-size: 12px; color: #94a3b8; margin: 0;">© ${new Date().getFullYear()} Online Book Store. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });
      emailSent = true;
    } catch (mailErr) {
      console.error("[FORGOT-PASSWORD-OTP] Mail send failed:", mailErr.message);
      mailErrorMsg = mailErr.message;
    }

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: `Failed to send OTP email. ${mailErrorMsg || "Please check email configuration."}`,
      });
    }

    return res.json({
      success: true,
      message: `OTP sent successfully to ${email}`,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ================= VERIFY OTP =================
router.post("/verify-otp", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const otp = (req.body.otp || "").trim();

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "No OTP request found for this email. Please request a new OTP." });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP code. Please try again." });
    }

    if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
      await Otp.deleteMany({ email });
      return res.status(400).json({ success: false, message: "OTP has expired (valid for 5 minutes). Please request a new OTP." });
    }

    otpRecord.isVerified = true;
    await otpRecord.save();

    return res.json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ================= RESEND OTP =================
router.post("/resend-otp", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email address." });
    }

    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp, expiresAt, isVerified: false });

    let emailSent = false;
    let mailErrorMsg = null;

    try {
      await sendStoreMail({
        to: email,
        subject: "🔐 Resent Password Reset Code - Online Book Store",
        text: `Hello ${user.name},\n\nYour new password reset OTP is: ${otp}\n\nThis code is valid for 5 minutes.\n\nOnline Book Store Team`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Password Reset Code - Online Book Store</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 10px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); padding: 32px 24px; text-align: center;">
                        <div style="font-size: 36px; margin-bottom: 8px;">🔄</div>
                        <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0;">New Password Reset Code</h1>
                        <p style="color: #c7d2fe; font-size: 13px; font-weight: 500; margin: 6px 0 0 0;">Online Book Store Security</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 32px 28px 24px 28px;">
                        <h2 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
                          Hello, ${user.name}!
                        </h2>
                        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                          Here is your new 6-digit One-Time Password (OTP) to reset your account password:
                        </p>
                        <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 24px 20px; text-align: center; margin-bottom: 20px;">
                          <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 8px;">
                            New Password Reset OTP
                          </span>
                          <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #4338ca; margin: 4px 0;">
                            ${otp}
                          </div>
                          <div style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-top: 10px;">
                            ⏱️ Valid for 5 minutes
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 28px; text-align: center; border-top: 1px solid #f1f5f9; background-color: #fafafa;">
                        <p style="font-size: 12px; color: #94a3b8; margin: 0;">© ${new Date().getFullYear()} Online Book Store. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });
      emailSent = true;
    } catch (mailErr) {
      console.error("[RESEND-OTP] Mail send failed:", mailErr.message);
      mailErrorMsg = mailErr.message;
    }

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: `Failed to resend OTP. ${mailErrorMsg || "Please check email configuration."}`,
      });
    }

    return res.json({
      success: true,
      message: `A new OTP has been sent to ${email}`,
    });
  } catch (error) {
    console.error("RESEND OTP ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const otp = (req.body.otp || "").trim();
    const newPassword = (req.body.newPassword || "").trim();
    const confirmPassword = (req.body.confirmPassword || "").trim();

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Email, new password, and confirm password are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "No OTP session found. Please verify your OTP again." });
    }

    if (!otpRecord.isVerified && otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: "OTP is invalid or has not been verified." });
    }

    if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
      await Otp.deleteMany({ email });
      return res.status(400).json({ success: false, message: "OTP session has expired. Please restart the password reset process." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    // Hash the new password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    user.password = hashedPassword;
    await user.save();

    // Invalidate/delete the OTP after successful password reset
    await Otp.deleteMany({ email });

    return res.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
