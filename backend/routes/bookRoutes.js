
const express = require("express");
const Book = require("../models/Book");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();



// Get all books
router.get("/", async (req, res) => {
  try {
    let books = await Book.find().lean();

    // Auto-seed sample books if database has no books yet
    if (!books || books.length === 0) {
      const sampleBooks = [
        {
          title: "Bhagavad Gita",
          author: "Maharishi Ved Vyasa",
          price: 1500,
          originalPrice: 3000,
          discount: 50,
          rating: 5,
          category: "religious",
          description: "The Bhagavad Gita is one of the most sacred and influential spiritual texts of Indian philosophy.",
          image: "https://cdn.harekrishnabooks.com/2019/05/Bhagavad-Gita-English_Front.png"
        },
        {
          title: "Atomic Habits",
          author: "James Clear",
          price: 499,
          originalPrice: 799,
          discount: 38,
          rating: 5,
          category: "Self-Help",
          description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones.",
          image: "https://images-na.ssl-images-amazon.com/images/I/81wgcld4wxL.jpg"
        },
        {
          title: "Rich Dad Poor Dad",
          author: "Robert T. Kiyosaki",
          price: 399,
          originalPrice: 599,
          discount: 33,
          rating: 5,
          category: "Business",
          description: "What the Rich Teach Their Kids About Money That the Poor and Middle Class Do Not!",
          image: "https://images-na.ssl-images-amazon.com/images/I/81bsw6fnUiL.jpg"
        },
        {
          title: "The Alchemist",
          author: "Paulo Coelho",
          price: 299,
          originalPrice: 499,
          discount: 40,
          rating: 5,
          category: "Fiction",
          description: "A fable about following your dream.",
          image: "https://images-na.ssl-images-amazon.com/images/I/71aFt4+OTOL.jpg"
        },
        {
          title: "The Psychology of Money",
          author: "Morgan Housel",
          price: 350,
          originalPrice: 550,
          discount: 36,
          rating: 5,
          category: "Finance",
          description: "Timeless lessons on wealth, greed, and happiness.",
          image: "https://images-na.ssl-images-amazon.com/images/I/71g2ednj0JL.jpg"
        }
      ];

      await Book.insertMany(sampleBooks);
      books = await Book.find().lean();
    }

    // Cache books for 60s; stale-while-revalidate lets CDN serve stale while refetching
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get only books listed by the currently authenticated partner
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const books = await Book.find({ addedBy: req.user }).lean();
    res.set("Cache-Control", "no-store");
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Add a new book (auto-calculate discount)
// Uses optional auth — if token is present, records addedBy for partner tracking
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, author, price, originalPrice, rating, category, description, image, condition, originalPartnerPrice } = req.body;
    let discount = req.body.discount;
    if (originalPrice && price) {
      discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    const newBook = new Book({
      title,
      author,
      price,
      originalPrice,
      discount,
      rating: rating || 5,
      category,
      description,
      image,
      condition: condition || "Good",
      originalPartnerPrice,
      addedBy: req.user || null  // Track which partner (or admin) added this book
    });
    await newBook.save();
    res.json({ message: "Book added successfully", book: newBook });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Delete a book by MongoDB _id
router.delete("/:id", async (req, res) => {
  try {
    const result = await Book.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update/edit a book by MongoDB _id
router.put("/:id", async (req, res) => {
  try {
    const { title, author, price, originalPrice, rating, category, description, image, discount, condition, originalPartnerPrice } = req.body;
    let updatedDiscount = discount;
    if (originalPrice && price) {
      updatedDiscount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        price,
        originalPrice,
        discount: updatedDiscount,
        rating,
        category,
        description,
        image,
        condition,
        originalPartnerPrice
      },
      { new: true }
    );
    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json({ message: "Book updated successfully", book: updatedBook });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;