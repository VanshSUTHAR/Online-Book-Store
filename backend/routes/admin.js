const express = require("express");
const Contact = require("../models/Contact");
const { sendStoreMail } = require("../utils/mailer");

const router = express.Router();

const SUPER_ADMIN_EMAIL = "rudra2004@gmail.com";

let admins = [
  { email: SUPER_ADMIN_EMAIL, name: "Super Admin" }
];

// ================= ADMIN MANAGEMENT =================

// Add new admin
router.post("/add-admin", (req, res) => {
  const { email, name, addedBy } = req.body;

  if (!email || !name || !addedBy) {
    return res.status(400).json({ message: "All fields required" });
  }

  if (addedBy !== SUPER_ADMIN_EMAIL) {
    return res.status(401).json({ message: "Only super admin allowed" });
  }

  const exists = admins.find(a => a.email === email);
  if (exists) {
    return res.status(409).json({ message: "Admin already exists" });
  }

  admins.push({ email, name });
  res.status(201).json({ message: "Admin added successfully" });
});

// Check admin
router.post("/check", (req, res) => {
  const { email } = req.body;
  const isAdmin = admins.some(a => a.email === email);

  if (!isAdmin) {
    return res.status(401).json({ message: "Not an admin" });
  }

  res.json({ message: "Admin verified" });
});

// ================= CONTACT MESSAGE SYSTEM =================

// GET all customer messages
router.get("/messages", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Reply to customer
router.post("/reply", async (req, res) => {
  const contactId = (req.body.contactId || "").trim();
  const replyMessage = (req.body.replyMessage || "").trim();

  if (!contactId || !replyMessage) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({ message: "Message not found" });
    }

    contact.replies = contact.replies || [];
    contact.replies.push({ message: replyMessage, fromAdmin: true });
    await contact.save();

    try {
      await sendStoreMail({
        to: contact.email,
        subject: "Reply from Online Book Store Support",
        html: `
          <div style="font-family: Arial; padding: 20px;">
            <p>Hello ${contact.name || "Reader"},</p>
            <p>${replyMessage}</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>Online Book Store Team</strong></p>
          </div>
        `,
      });

      return res.json({ message: "Reply sent successfully!", emailSent: true });
    } catch (emailError) {
      console.error("Admin reply email error:", emailError.message || emailError);
      return res.json({
        message: "Reply saved, but email delivery failed. Check ADMIN_EMAIL and ADMIN_EMAIL_PASS on Render.",
        emailSent: false,
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save reply" });
  }
});

// ================= ADMIN ORDER MANAGEMENT =================
const Order = require("../models/Order");
const User = require("../models/User");

// GET /api/admin/orders - Fetch all orders with user details
router.get("/orders", async (req, res) => {
  try {
    // Removed .populate('products.productId') and .populate('books.bookId') — both are redundant
    // because title, image, price, quantity are already stored on the order document itself.
    // .populate('userId') is kept because admin genuinely needs user name/email from User collection.
    // .lean() returns plain JS objects (~3x faster than full Mongoose document hydration).
    const orders = await Order.find()
      .populate("userId", "name email mobile")
      .lean()
      .sort({ createdAt: -1 });
    res.set("Cache-Control", "no-store"); // Never cache admin data
    res.json(orders);
  } catch (err) {
    console.error("Admin fetch orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PUT /api/admin/orders/:orderId - Update orderStatus and estimatedDelivery
router.put("/orders/:orderId", async (req, res) => {
  try {
    const { orderStatus, estimatedDelivery, paymentStatus } = req.body;
    const updateData = {};
    if (orderStatus !== undefined) updateData.orderStatus = orderStatus;
    if (estimatedDelivery !== undefined) updateData.estimatedDelivery = estimatedDelivery;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

    // Removed populate for products/books — embedded data is already on the order.
    // Kept populate for userId so admin sees name/email after updating.
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { $set: updateData },
      { new: true }
    ).populate("userId", "name email mobile").lean();

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.set("Cache-Control", "no-store");
    res.json({ message: "Order updated successfully", order: updatedOrder });
  } catch (err) {
    console.error("Admin update order error:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

module.exports = router;
