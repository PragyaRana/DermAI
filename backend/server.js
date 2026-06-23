import "dotenv/config"; // MUST be the very first import — loads .env before anything else
// Server entry point

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";

import "./config/cloudinary.js";

import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

// uploads folder
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/uploads", express.static(uploadsDir));

// mongodb
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err.message));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/reports", reportRoutes);

// test route
app.get("/", (req, res) => {
  res.json({ status: "DermAI API Running" });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});