require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const rubricRoutes = require("./routes/rubricRoutes");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const courseRoutes = require("./routes/courseRoutes");
const userRoutes = require("./routes/userRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const app = express();

// Ensure uploads directory exists for multer
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai-rubric")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

app.get("/", (req, res) => res.send("Server ok 🚀"));

app.use("/api/auth", authRoutes);
app.use("/api/rubrics", rubricRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/uploads", express.static(uploadsDir));
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/reports", reportRoutes);
app.use((req, res) => res.status(404).json({ message: "🚫 Not found" }));


app.use((err, req, res, next) => {
  console.error("🔴 UNHANDLED ERROR:", err);
  res.status(err.status || 500).json({
    message: err.message || "Server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`)
);
