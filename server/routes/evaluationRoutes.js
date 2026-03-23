const express = require("express");
const Evaluation = require("../models/Evaluation");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const evaluation = await Evaluation.create(req.body);

    res.status(201).json({
      message: "Evaluation хадгалагдлаа",
      evaluation,
    });
  } catch (error) {
    console.log("CREATE EVALUATION ERROR:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const evaluations = await Evaluation.find()
      .populate("courseId", "courseCode courseName")
      .populate("rubricId", "title")
      .populate("evaluatorId", "name email role")
      .populate("teacherId", "name email");

    res.json(evaluations);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;