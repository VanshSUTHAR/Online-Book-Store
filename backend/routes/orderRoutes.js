const express = require("express");
const auth = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const stripe = require("../config/stripe");
const router = express.Router();

// Order creation handler logic
const handleCreateOrder = async (req, res) => {
  try {
    const { products, books, buyerName, buyerAddress, totalAmount, paymentIntentId, paymentId } = req.body;
    const userId = req.user && req.user._id ? req.user._id : req.user;

    if (!userId || (!products && !books) || !totalAmount) {
      return res.status(400).json({ error: "Missing required fields for order creation." });
    }

    const transactionId = paymentIntentId || paymentId;

    // Verify Stripe payment intent if secret key is present and transaction ID provided
    if (transactionId && process.env.STRIPE_SECRET_KEY) {
      try {
        const intent = await stripe.paymentIntents.retrieve(transactionId);
        if (intent.status !== "succeeded") {
          return res.status(400).json({ error: "Payment failed or incomplete. Order not placed." });
        }
      } catch (stripeErr) {
        console.error("Stripe verification error:", stripeErr);
        return res.status(400).json({ error: "Payment verification failed with Stripe." });
      }
    }

    const rawItems = products || books || [];
    const normalizedProducts = rawItems.map((item) => ({
      productId: item.productId || item.bookId || item._id || item.id,
      title: item.title || "Book",
      image: item.image || "",
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1)
    }));

    const normalizedBooks = rawItems.map((item) => ({
      bookId: item.bookId || item.productId || item._id || item.id,
      title: item.title || "Book",
      image: item.image || "",
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      author: item.author || "",
      category: item.category || ""
    }));

    const order = new Order({
      userId,
      products: normalizedProducts,
      books: normalizedBooks,
      buyerName: buyerName || "Customer",
      buyerAddress: buyerAddress || "Not Provided",
      totalAmount: Number(totalAmount),
      paymentStatus: "Paid",
      paymentIntentId: transactionId || "",
      paymentId: transactionId || "",
      orderStatus: "Pending",
      estimatedDelivery: "1 Day"
    });

    await order.save();
    res.status(201).json({ message: "Payment successful. Your order has been placed.", order });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: "Failed to create order." });
  }
};

// POST /api/orders/create
router.post("/create", auth, handleCreateOrder);

// POST /api/orders/ (alias)
router.post("/", auth, handleCreateOrder);

// GET /api/orders/my-orders (strictly returns logged-in user's orders)
router.get("/my-orders", auth, async (req, res) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : req.user;
    const orders = await Order.find({ userId })
      .populate("products.productId")
      .populate("books.bookId")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/user/:userId (fallback / compat)
router.get("/user/:userId", auth, async (req, res) => {
  try {
    // Ensure requesting user matches requested parameter unless admin
    const requestingUserId = String(req.user && req.user._id ? req.user._id : req.user);
    if (requestingUserId !== req.params.userId) {
      return res.status(403).json({ error: "Unauthorized access to user orders." });
    }
    const orders = await Order.find({ userId: req.params.userId })
      .populate("products.productId")
      .populate("books.bookId")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;