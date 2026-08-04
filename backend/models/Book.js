const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: Number },
  rating: { type: Number, default: 5 },
  category: { type: String },
  description: { type: String },
  image: { type: String },
  condition: { type: String, default: "Good" },
  originalPartnerPrice: { type: Number },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
});

// Indexes — dramatically speed up filtered queries (category, text search)
bookSchema.index({ category: 1 });
bookSchema.index({ title: 1 });
bookSchema.index({ category: 1, title: 1 }); // Compound for filter + sort combo

module.exports = mongoose.model("Book", bookSchema);
