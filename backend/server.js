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
const partnerRoutes = require("./routes/partnerRoutes");


const app = express();

const defaultAllowedOrigins = [
  "https://online-book-store-three-tan.vercel.app",
].map((origin) => origin.trim().replace(/\/$/, ""));

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
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
}));
// Use a tight global limit; the partner route (Base64 uploads) gets its own 50mb limit below
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

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
  const mongoOptions = {
    maxPoolSize: 10,               // Allow up to 10 concurrent DB connections
    serverSelectionTimeoutMS: 5000, // Fail fast if Atlas is unreachable (default is 30s)
    socketTimeoutMS: 45000,        // Close idle sockets after 45s to prevent resource leaks
    family: 4,                     // Force IPv4 — avoids slow IPv6 DNS on Render/Atlas
  };

  try {
    await mongoose.connect(mongoURI, mongoOptions);
    console.log("MongoDB connected");
  } catch (err) {
    const isSrvDnsError = err && err.code === "ECONNREFUSED" && String(err.hostname || "").startsWith("_mongodb._tcp.");

    if (isSrvDnsError) {
      console.error("MongoDB SRV DNS lookup failed. Trying local MongoDB fallback...");
      try {
        await mongoose.connect(localMongoURI, mongoOptions);
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
app.use(process.env.NODE_ENV === 'test' ? '/api/cart' : '/api/cart', cartRoutes);
// Partner uploads Base64 images (Aadhaar/PAN) — needs a higher body limit than others
app.use("/api/partner", express.json({ limit: "50mb" }), express.urlencoded({ limit: "50mb", extended: true }), partnerRoutes);

// Debug test POST route (should be after all middleware/routes)
app.post("/api/test", (req, res) => {
  res.json({ ok: true });
});

// Serve frontend static build files with optimized Cache-Control headers
const buildPath = path.join(__dirname, "../frontend/build");
if (require("fs").existsSync(buildPath)) {
  app.use(
    express.static(buildPath, {
      maxAge: "1y",
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          // Keep HTML uncached so new deployments reflect immediately
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        } else if (filePath.endsWith("manifest.json")) {
          res.setHeader("Cache-Control", "public, max-age=86400");
        } else {
          // Hashed static assets (JS, CSS, images, media)
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
