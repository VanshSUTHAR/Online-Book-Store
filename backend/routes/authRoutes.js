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

// In-memory OTP store for login/forgot-password (for demo; use Redis or DB in production)
const otpStore = {};

// In-memory OTP store for registration — holds pending user data + OTP
const otpRegisterStore = {};

// Nodemailer setup for Gmail SMTP
const getTransporter = () => {
  const user = (process.env.EMAIL_ADMIN || process.env.ADMIN_EMAIL || "").trim();
  let pass = (process.env.EMAIL_ADMIN_PASS || process.env.EMAIL_PASS || process.env.ADMIN_EMAIL_PASS || "").replace(/\s+/g, "");

  if (!user || !pass) {
    throw new Error("Missing email SMTP credentials. Set EMAIL_ADMIN and EMAIL_ADMIN_PASS/EMAIL_PASS/ADMIN_EMAIL_PASS.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

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

    let user = await User.findOne({ email });
    let isAutoCreatedUser = false;

    // Auto-create user if requesting OTP for login and user doesn't exist yet
    if (!user) {
      const defaultName = email.split("@")[0] || "Reader";
      user = new User({
        email,
        name: defaultName,
        password: Math.random().toString(36).slice(-10),
        role: "user",
      });
      await user.save();
      isAutoCreatedUser = true;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP for 10 minutes
    otpStore[email] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
    };

    let emailSent = false;
    let mailErrorMsg = null;

    try {
      const transporter = getTransporter();
      await transporter.verify();
      const adminEmail = (process.env.EMAIL_ADMIN || process.env.ADMIN_EMAIL || "").trim();

      const info = await transporter.sendMail({
        from: `Online Book Store <${adminEmail}>`,
        to: email,
        subject: "🔑 Your Login Verification Code - Online Book Store",
        text: `Hello ${user.name || "Reader"},\n\nYour One-Time Password (OTP) for login to Online Book Store is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, please ignore this email.\n\nHappy Reading!\nOnline Book Store Team`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Code - Online Book Store</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 40px 10px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); padding: 36px 30px; text-align: center;">
                        <div style="font-size: 42px; margin-bottom: 8px;">📚</div>
                        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Online Book Store</h1>
                        <p style="color: #c7d2fe; font-size: 13px; font-weight: 500; margin: 6px 0 0 0; letter-spacing: 0.5px;">Your Portal to Endless Stories</p>
                      </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                      <td style="padding: 40px 36px 30px 36px;">
                        <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
                          Hello ${user.name ? user.name : "Book Lover"}, 👋
                        </h2>
                        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                          We received a request to access your account. Please use the One-Time Password (OTP) below to complete your login:
                        </p>

                        <!-- OTP Box -->
                        <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 28px 20px; text-align: center; margin-bottom: 24px;">
                          <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 10px;">
                            One-Time Verification Code
                          </span>
                          <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #4338ca; text-shadow: 0 1px 2px rgba(0,0,0,0.05); margin: 5px 0;">
                            ${otp}
                          </div>
                          <div style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-top: 12px;">
                            ⏱️ Valid for 10 minutes
                          </div>
                        </div>

                        <!-- Security Notice -->
                        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 12px 12px 0; padding: 14px 18px; margin-bottom: 24px;">
                          <p style="font-size: 12px; line-height: 1.5; color: #1e40af; margin: 0;">
                            <strong>🛡️ Security Tip:</strong> Never share this code with anyone. Our support team will never ask for your verification code.
                          </p>
                        </div>

                        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0;">
                          If you did not initiate this login request, no action is needed. Your account remains safe and secure.
                        </p>
                      </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                      <td style="padding: 0 36px;">
                        <div style="border-top: 1px solid #f1f5f9;"></div>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 36px 36px 36px; text-align: center; background-color: #ffffff;">
                        <p style="font-size: 13px; font-weight: 600; color: #475569; margin: 0 0 6px 0;">
                          Happy Reading! 📖
                        </p>
                        <p style="font-size: 12px; color: #94a3b8; margin: 0 0 12px 0;">
                          Online Book Store Team
                        </p>
                        <p style="font-size: 11px; color: #cbd5e1; margin: 0;">
                          © ${new Date().getFullYear()} Online Book Store. All rights reserved.
                        </p>
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
        console.log(`[OTP] Email sent successfully to ${email}: ${info.response}`);
      }
    } catch (mailErr) {
      console.error("[OTP] Email send failed:", mailErr.message);
      mailErrorMsg = mailErr.message;
    }

    if (!emailSent) {
      delete otpStore[email];
      if (isAutoCreatedUser) {
        await User.deleteOne({ email });
      }
      return res.status(500).json({
        success: false,
        message: `Failed to send OTP email. ${mailErrorMsg || "Check your email configuration."}`,
        mailError: mailErrorMsg,
      });
    }

    return res.json({
      success: true,
      message: `Verification code sent to ${email}`,
      emailSent,
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
});

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

    try {
      const transporter = getTransporter();
      await transporter.verify();
      const adminEmail = (process.env.EMAIL_ADMIN || "").trim();

      const info = await transporter.sendMail({
        from: `Online Book Store <${adminEmail}>`,
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
      }
    } catch (mailErr) {
      console.error("[REG-OTP] Email send failed:", mailErr.message);
      mailErrorMsg = mailErr.message;
    }

    if (!emailSent) {
      delete otpRegisterStore[email];
      return res.status(500).json({
        success: false,
        message: `Failed to send verification email. ${mailErrorMsg || "Check your email configuration."}`,
        mailError: mailErrorMsg,
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

// ================= VERIFY OTP AND LOGIN =================
router.post("/verify-otp", async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const otp = (req.body.otp || "").trim();

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const record = otpStore[email];
    if (!record) {
      return res.status(400).json({ success: false, message: "No OTP request found. Please request a new code." });
    }

    if (Date.now() > record.expires) {
      delete otpStore[email];
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new code." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      delete otpStore[email];
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
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
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error while verifying OTP" });
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
