const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const PartnerApplication = require("../models/PartnerApplication");
const User = require("../models/User");
const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");
const authMiddleware = require("../middleware/authMiddleware");

// Admin check middleware
async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden. Admin access required." });
    }
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error checking admin privileges." });
  }
}

// Mailer Helper
async function sendMailHelper(to, subject, html) {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_EMAIL_PASS) {
    console.log(`[Email MOCK] to: ${to} | Subject: ${subject}`);
    return false;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `Online Book Store <${process.env.ADMIN_EMAIL}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("Email send failure:", err.message);
    return false;
  }
}

// 1. Submit Application
router.post("/apply", authMiddleware, async (req, res) => {
  try {
    const {
      fullName,
      emailAddress,
      mobileNumber,
      dob,
      storeName,
      storeDescription,
      profilePicture,
      storeBanner,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      aadhaarNumber,
      panNumber,
      aadhaarFront,
      aadhaarBack,
      panCard,
      payoutOption,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      upiId,
      sellerType,
      gstNumber,
      experience
    } = req.body;

    if (
      !fullName ||
      !emailAddress ||
      !mobileNumber ||
      !addressLine1 ||
      !city ||
      !state ||
      !pincode ||
      !aadhaarNumber ||
      !panNumber ||
      !aadhaarFront ||
      !aadhaarBack ||
      !panCard
    ) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    // Check if there is already a Pending application
    const existing = await PartnerApplication.findOne({ emailAddress, status: "Pending" });
    if (existing) {
      return res.status(400).json({ success: false, message: "You already have a pending application." });
    }

    const application = new PartnerApplication({
      userId: req.user,
      fullName,
      emailAddress,
      mobileNumber,
      dob,
      storeName,
      storeDescription,
      profilePicture,
      storeBanner,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      aadhaarNumber,
      panNumber,
      aadhaarFront,
      aadhaarBack,
      panCard,
      payoutOption,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      upiId,
      sellerType,
      gstNumber,
      experience,
      status: "Pending"
    });

    await application.save();

    // Log Activity
    await ActivityLog.create({
      userId: req.user,
      action: "PARTNER_APPLY",
      details: `User ${fullName} (${emailAddress}) submitted partner application.`,
      ipAddress: req.ip
    });

    // Create Admin Notification
    await Notification.create({
      userId: null, // Admin alert
      title: "New Partner Application",
      message: `A new partner application has been submitted by ${fullName} (${storeName || "No Store Name"}).`,
      type: "apply"
    });

    // Send Confirmation Email to Applicant
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-2xl;">
        <h2 style="color: #2563eb;">Application Received!</h2>
        <p>Dear ${fullName},</p>
        <p>Thank you for your interest in the Book Partner Program. We have successfully received your registration details.</p>
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>Our operations team will review your identity proof and banking options.</li>
          <li>You will receive an email notification once your application is reviewed (usually within 24-48 hours).</li>
        </ul>
        <p>If you have any questions, feel free to reply to this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 0.8em; color: #64748b;">Online Book Store Team</p>
      </div>
    `;
    await sendMailHelper(emailAddress, "Partner Application Received – Online Book Store", userEmailHtml);

    // Send Notification Email to Admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b;">New Partner Registration Request</h2>
        <p>A new seller application is pending review in the Admin Console:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 150px;">Applicant Name:</td>
            <td style="padding: 6px 0;">${fullName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Email Address:</td>
            <td style="padding: 6px 0;">${emailAddress}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Store Name:</td>
            <td style="padding: 6px 0;">${storeName || "N/A"}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">Please log in to the admin panel to review files and approve/reject.</p>
      </div>
    `;
    const adminEmail = process.env.ADMIN_EMAIL || "rudra2004@gmail.com";
    await sendMailHelper(adminEmail, "New Partner Registration Alert", adminEmailHtml);

    res.status(201).json({ success: true, message: "Application submitted successfully." });
  } catch (err) {
    console.error("Partner application error:", err);
    res.status(500).json({ success: false, message: "Server error during application submission." });
  }
});

// 2. Fetch All Applications (Admin Only)
router.get("/applications", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const apps = await PartnerApplication.find().sort({ createdAt: -1 });
    res.json({ success: true, applications: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch applications." });
  }
});

// 3. Review Application (Admin Only)
router.post("/review/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    if (!action || !["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid review action." });
    }

    const app = await PartnerApplication.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    if (app.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Application has already been reviewed." });
    }

    if (action === "approve") {
      app.status = "Approved";
      await app.save();

      // Update User Role to partner
      if (app.userId) {
        await User.findByIdAndUpdate(app.userId, { role: "partner" });
      } else {
        // Fallback: match by email if userId wasn't present
        await User.findOneAndUpdate({ email: app.emailAddress }, { role: "partner" });
      }

      // Log Activity
      await ActivityLog.create({
        userId: req.user,
        action: "PARTNER_APPROVE",
        details: `Approved partner application for ${app.fullName} (${app.emailAddress})`,
        ipAddress: req.ip
      });

      // User Notification
      if (app.userId) {
        await Notification.create({
          userId: app.userId,
          title: "Application Approved! 🎉",
          message: "Congratulations! Your partner seller account is approved. You can now access your Seller Dashboard.",
          type: "approve"
        });
      }

      // Send Email to User
      const approveHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
          <h2 style="color: #10b981;">Partnership Approved! 🎉</h2>
          <p>Dear ${app.fullName},</p>
          <p>We are excited to inform you that your registration for the Book Partner Program has been <strong>Approved</strong>!</p>
          <p>Your seller dashboard is now fully unlocked. You can access it by logging in and navigating to the seller options.</p>
          <p>Thank you for partnering with us!</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 0.8em; color: #64748b;">Online Book Store Team</p>
        </div>
      `;
      await sendMailHelper(app.emailAddress, "Welcome as a Book Partner! (Approved)", approveHtml);

    } else {
      app.status = "Rejected";
      app.rejectionReason = rejectionReason || "Provided details were incomplete or invalid.";
      await app.save();

      // Log Activity
      await ActivityLog.create({
        userId: req.user,
        action: "PARTNER_REJECT",
        details: `Rejected partner application for ${app.fullName} (${app.emailAddress}). Reason: ${app.rejectionReason}`,
        ipAddress: req.ip
      });

      // User Notification
      if (app.userId) {
        await Notification.create({
          userId: app.userId,
          title: "Application Status Update",
          message: `Unfortunately, your partner application was not accepted. Reason: ${app.rejectionReason}`,
          type: "reject"
        });
      }

      // Send Email to User
      const rejectHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
          <h2 style="color: #ef4444;">Partnership Update</h2>
          <p>Dear ${app.fullName},</p>
          <p>Thank you for applying to the Book Partner Program. After careful review of your registration and documents, we are unable to accept your application at this time.</p>
          <p><strong>Reason for rejection:</strong></p>
          <blockquote style="background: #f8fafc; border-left: 4px solid #ef4444; padding: 10px; margin: 15px 0;">
            ${app.rejectionReason}
          </blockquote>
          <p>If you believe this was an error or wish to re-apply with corrected information, please reach out to our support team.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 0.8em; color: #64748b;">Online Book Store Team</p>
        </div>
      `;
      await sendMailHelper(app.emailAddress, "Update on your Partner Application Status", rejectHtml);
    }

    res.json({ success: true, message: `Application ${action === "approve" ? "approved" : "rejected"} successfully.` });
  } catch (err) {
    console.error("Review application error:", err);
    res.status(500).json({ success: false, message: "Server error during application review." });
  }
});

// 4. Get Current User's Partnership Status
router.get("/my-status", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const application = await PartnerApplication.findOne({
      $or: [
        { userId: req.user },
        { emailAddress: user.email }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      role: user.role,
      application: application
        ? {
            status: application.status,
            storeName: application.storeName,
            rejectionReason: application.rejectionReason,
            createdAt: application.createdAt
          }
        : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch status." });
  }
});

module.exports = router;
