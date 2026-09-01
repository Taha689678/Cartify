import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";


import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes  from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sellerApplicationRoutes from "./routes/sellerApplicationRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();

const configuredFrontendUrl =
  process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";

const allowedFrontendUrls = new Set([configuredFrontendUrl]);

if (process.env.NODE_ENV !== "production") {
  allowedFrontendUrls.add("http://localhost:5173");
  allowedFrontendUrls.add("http://localhost:5174");
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedFrontendUrls.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Express 5+ compatibility for express-mongo-sanitize
// req.body, req.query, req.params are getters in Express 5 and cannot be reassigned.
// We call sanitize to mutate the objects in-place instead of reassigning them.
app.use((req, res, next) => {
  ["body", "params", "headers", "query"].forEach((key) => {
    if (req[key]) {
      mongoSanitize.sanitize(req[key]);
    }
  });
  next();
});

import rateLimit from "express-rate-limit";
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Limit each IP to 500 requests per 15 mins globally
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});
app.use("/api/", apiLimiter);

app.use(cookieParser());

const healthResponse = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Cartify server is healthy",
    timestamp: new Date().toISOString(),
  });
};

app.get("/health", healthResponse);
app.get("/api/health", healthResponse);

app.use("/api/auth",       authRoutes);
app.use("/api/users",      userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products",   productRoutes);
app.use("/api/cart",       cartRoutes);
app.use("/api/wishlist",   wishlistRoutes);
app.use("/api/addresses",  addressRoutes);
app.use("/api/orders",     orderRoutes);
app.use("/api/payments",   paymentRoutes);
app.use("/api/reviews",    reviewRoutes);
app.use("/api/seller",     sellerRoutes);
app.use("/api/upload",     uploadRoutes);
app.use("/api/admin",      adminRoutes);
app.use("/api/seller-applications", sellerApplicationRoutes);
app.use("/api/newsletter",  newsletterRoutes);
app.use("/api/contact",     contactRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  const response = {
    success: false,
    message,
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(response);
});

export default app;


