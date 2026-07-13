const express = require("express");
const router = express.Router();
const PartnerApplication = require("../models/PartnerApplication");
const authMiddleware = require("../middleware/authMiddleware");

// Apply to become a partner
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

    // Validate required fields
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

    const application = new PartnerApplication({
      userId: req.user, // extracted by authMiddleware
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
    });

    await application.save();

    res.status(201).json({ success: true, message: "Application submitted successfully." });
  } catch (err) {
    console.error("Partner application error:", err);
    res.status(500).json({ success: false, message: "Server error during application submission." });
  }
});

module.exports = router;
