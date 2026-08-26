import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";

const app = express();

const frontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === frontendUrl) {
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

app.use("/api/auth", authRoutes);

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
