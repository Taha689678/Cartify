import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes  from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

const configuredFrontendUrl =
  process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";
const allowedFrontendUrls = new Set([
  configuredFrontendUrl,
  "http://localhost:5173",
  "http://localhost:5174",
]);

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
