const mongoose = require("mongoose");

const partnerApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  fullName: { type: String, required: true },
  emailAddress: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  dob: { type: String },
  storeName: { type: String },
  storeDescription: { type: String },
  profilePicture: { type: String }, // Base64
  storeBanner: { type: String }, // Base64
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: "India" },
  aadhaarNumber: { type: String, required: true },
  panNumber: { type: String, required: true },
  aadhaarFront: { type: String, required: true }, // Base64
  aadhaarBack: { type: String, required: true }, // Base64
  panCard: { type: String, required: true }, // Base64
  payoutOption: { type: String, default: "bank" },
  accountHolderName: { type: String },
  bankName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  upiId: { type: String },
  sellerType: { type: String, default: "Individual" },
  gstNumber: { type: String },
  experience: { type: String },
  status: { type: String, default: "Pending" }, // Pending, Approved, Rejected
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PartnerApplication", partnerApplicationSchema);
