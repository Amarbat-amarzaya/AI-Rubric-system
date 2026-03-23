const express = require("express");
const Course = require("../models/Course");
const router = express.Router();

/// 🔹 Create course (ADMIN ONLY)
router.post("/", async (req, res) => {
  try {
    const { courseCode, courseName, teacherId } = req.body;

    const course = await Course.create({
      courseCode,
      courseName,
      teacherId,
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/// 🔹 Get all courses (ADMIN)
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().populate("teacherId", "name email");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/// 🔹 Teacher өөрийн course авах
router.get("/my/:teacherId", async (req, res) => {
  try {
    const courses = await Course.find({
      teacherId: req.params.teacherId,
    });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;