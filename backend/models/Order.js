const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        title: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 }
      }
    ],
    // Backwards compatibility getter/setter or fallback
    books: [
      {
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        title: String,
        image: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        author: String,
        category: String
      }
    ],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, default: "Paid" },
    paymentIntentId: { type: String },
    paymentId: { type: String },
    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending"
    },
    estimatedDelivery: { type: String, default: "1 Day" },
    buyerName: { type: String, default: "Customer" },
    buyerAddress: { type: String, default: "Not Provided" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
