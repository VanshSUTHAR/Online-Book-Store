const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  action: { type: String, required: true }, // e.g. PARTNER_APPLY, PARTNER_APPROVE, PARTNER_REJECT
  details: { type: String },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
