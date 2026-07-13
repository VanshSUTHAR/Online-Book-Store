const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const bookRoutes = require("./routes/bookRoutes");
const adminRoutes = require("./routes/admin");
const trendingRoutes = require("./routes/trendingRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const contactRoutes = require("./routes/contactRoutes");
const oauthRoutes = require("./routes/oauthRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const cartRoutes = require("./routes/cartRoutes");


const app = express();

const defaultAllowedOrigins = [
  "https://online-book-store-backend-psi.vercel.app",
];

const configuredAllowedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([
  ...configuredAllowedOrigins,
  ...defaultAllowedOrigins,
]));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes("*")) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
}));
app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON request body" });
  }

  next(err);
});


// MongoDB connection
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/onlineBookStore";
const localMongoURI = process.env.MONGO_URI_LOCAL || "mongodb://127.0.0.1:27017/onlineBookStore";

async function connectMongo() {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (err) {
    const isSrvDnsError = err && err.code === "ECONNREFUSED" && String(err.hostname || "").startsWith("_mongodb._tcp.");

    if (isSrvDnsError) {
      console.error("MongoDB SRV DNS lookup failed. Trying local MongoDB fallback...");
      try {
        await mongoose.connect(localMongoURI);
        console.log("MongoDB connected (local fallback)");
        return;
      } catch (fallbackErr) {
        console.error("MongoDB fallback connection error:", fallbackErr.message || fallbackErr);
      }
    } else {
      console.error("MongoDB connection error:", err.message || err);
    }
  }
}

connectMongo();

app.use("/api/books", bookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/trending", trendingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/cart", cartRoutes);

// Debug test POST route (should be after all middleware/routes)
app.post("/api/test", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
