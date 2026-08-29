import "dotenv/config";
import mongoose from "mongoose";
import request from "supertest";
import app from "./app.js";

async function runRegression() {
  await mongoose.connect(process.env.MONGODB_URI);
  let res;
  
  res = await request(app).get("/api/products");
  if (res.status !== 200) throw new Error("Products GET failed");
  
  res = await request(app).get("/api/categories");
  if (res.status !== 200) throw new Error("Categories GET failed");

  res = await request(app).get("/health");
  if (res.status !== 200) throw new Error("Health check failed");

  console.log("Regression checks passed");
  await mongoose.disconnect();
}

runRegression().catch(err => console.error(err));
