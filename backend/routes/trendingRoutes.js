const express = require("express");
const mongoose = require("mongoose");
const TrendingBooks = require("../models/TrendingBooks");
const router = express.Router();

// Get trending books
router.get("/", async (req, res) => {
  try {
    // .lean() skips Mongoose document hydration — faster for read-only list
    const trending = await TrendingBooks.findOne().lean();
    // Trending rarely changes — safe to cache for 2 minutes
    res.set("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
    res.json(trending ? trending.bookIds : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update trending books
router.post("/", async (req, res) => {
  try {
    const { bookIds } = req.body;
    if (!Array.isArray(bookIds)) {
      console.error('bookIds is not an array:', bookIds);
      return res.status(400).json({ message: "bookIds must be an array" });
    }
    let objectIds = [];
    try {
      objectIds = bookIds.map(id => {
        if (!id || typeof id !== 'string') throw new Error('Invalid bookId: ' + id);
        return new mongoose.Types.ObjectId(id);
      });
    } catch (err) {
      console.error('ObjectId conversion error:', err);
      return res.status(400).json({ message: 'Invalid bookId(s) provided.' });
    }
    let trending = await TrendingBooks.findOne();
    if (!trending) {
      trending = new TrendingBooks({ bookIds: objectIds });
    } else {
      trending.bookIds = objectIds;
      trending.updatedAt = Date.now();
    }
    await trending.save();
    res.json({ message: "Trending books updated", bookIds });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
