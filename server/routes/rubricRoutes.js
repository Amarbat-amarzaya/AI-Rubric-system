const express = require("express");
const Rubric = require("../models/rubric");

const router = express.Router();

// бүх rubric
router.get("/", async (req, res) => {
  try {
    const rubrics = await Rubric.find()
      .populate("courseId", "courseCode courseName")
      .sort({ createdAt: -1 });

    res.json(rubrics);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// course-аар rubric авах
router.get("/course/:courseId", async (req, res) => {
  try {
    const rubric = await Rubric.findOne({
      courseId: req.params.courseId,
    }).populate("courseId", "courseCode courseName");

    if (!rubric) {
      return res.status(404).json({ message: "Rubric олдсонгүй" });
    }

    res.json(rubric);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// id-аар нэг rubric авах
router.get("/:id", async (req, res) => {
  try {
    const rubric = await Rubric.findById(req.params.id).populate(
      "courseId",
      "courseCode courseName"
    );

    if (!rubric) {
      return res.status(404).json({ message: "Rubric not found" });
    }

    res.json(rubric);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// create rubric
router.post("/", async (req, res) => {
  try {
    const { title, courseId, criteria } = req.body;

    if (!title || !courseId) {
      return res.status(400).json({
        message: "title болон courseId шаардлагатай",
      });
    }

    const rubric = await Rubric.create({
      title,
      courseId,
      criteria,
    });

    res.status(201).json({
      message: "Rubric хадгалагдлаа",
      rubric,
    });
  } catch (error) {
    console.log("POST RUBRIC ERROR:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// update rubric
router.put("/:id", async (req, res) => {
  try {
    const { title, courseId, criteria } = req.body;

    const updatedRubric = await Rubric.findByIdAndUpdate(
      req.params.id,
      {
        title,
        courseId,
        criteria,
      },
      { new: true, runValidators: true }
    );

    if (!updatedRubric) {
      return res.status(404).json({ message: "Rubric not found" });
    }

    res.json({
      message: "Rubric амжилттай шинэчлэгдлээ",
      rubric: updatedRubric,
    });
  } catch (error) {
    console.log("PUT RUBRIC ERROR:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// delete rubric
router.delete("/:id", async (req, res) => {
  try {
    const deletedRubric = await Rubric.findByIdAndDelete(req.params.id);

    if (!deletedRubric) {
      return res.status(404).json({ message: "Rubric not found" });
    }

    res.json({ message: "Rubric deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;