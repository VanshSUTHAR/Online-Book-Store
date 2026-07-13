const express = require("express");
const auth = require("../middleware/authMiddleware");
const Cart = require("../models/Cart");

const router = express.Router();

function getUserId(req) {
  return req.user && req.user._id ? req.user._id : req.user;
}

function normalizeItem(item) {
  const bookId = item.bookId || item.productId || item._id || item.id;
  const title = (item.title || "").trim();
  const price = Number(item.price || 0);

  if (!bookId || !title || Number.isNaN(price)) {
    return null;
  }

  return {
    bookId: String(bookId),
    title,
    author: item.author || "",
    price,
    image: item.image || "",
    category: item.category || "",
    quantity: Number(item.quantity || 1),
  };
}

async function findOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
}

router.get("/", auth, async (req, res) => {
  try {
    const cart = await findOrCreateCart(getUserId(req));
    res.json({ items: cart.items });
  } catch (err) {
    console.error("Fetch cart error:", err);
    res.status(500).json({ error: "Failed to fetch cart." });
  }
});

router.post("/items", auth, async (req, res) => {
  try {
    const item = normalizeItem(req.body.item || req.body);
    if (!item) {
      return res.status(400).json({ error: "Invalid cart item." });
    }

    const cart = await findOrCreateCart(getUserId(req));
    cart.items.push(item);
    await cart.save();

    res.status(201).json({ items: cart.items });
  } catch (err) {
    console.error("Add cart item error:", err);
    res.status(500).json({ error: "Failed to add cart item." });
  }
});

router.delete("/items/:index", auth, async (req, res) => {
  try {
    const index = Number(req.params.index);
    const cart = await findOrCreateCart(getUserId(req));

    if (!Number.isInteger(index) || index < 0 || index >= cart.items.length) {
      return res.status(404).json({ error: "Cart item not found." });
    }

    cart.items.splice(index, 1);
    await cart.save();

    res.json({ items: cart.items });
  } catch (err) {
    console.error("Remove cart item error:", err);
    res.status(500).json({ error: "Failed to remove cart item." });
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    const cart = await findOrCreateCart(getUserId(req));
    cart.items = [];
    await cart.save();

    res.json({ items: [] });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ error: "Failed to clear cart." });
  }
});

module.exports = router;
