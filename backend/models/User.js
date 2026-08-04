const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // unique:true auto-creates an index
  password: { type: String, required: true },
  role: { type: String, default: "user", index: true }, // indexed for admin/partner role lookups
  mobile: { type: String },
});

module.exports = mongoose.model("User", userSchema);
