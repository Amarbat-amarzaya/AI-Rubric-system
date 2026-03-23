const express = require("express");
const multer = require("multer");
const path = require("path");
const Submission = require("../models/Submission");

const router = express.Router();

console.log("✅ submissionRoutes loaded");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

router.get("/", async (req, res) => {
  try {
    console.log("✅ GET /api/submissions hit");

    const submissions = await Submission.find()
      .populate("rubricId", "title")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.log("GET SUBMISSIONS ERROR:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.post("/evaluate/:id", async (req, res) => {
  try {
    console.log("✅ POST /api/submissions/evaluate/:id hit", req.params.id);

    const { totalScore, selectedRatings } = req.body;

    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    submission.score = totalScore;
    submission.selectedRatings = selectedRatings;
    submission.status = "evaluated";

    await submission.save();

    res.json({
      message: "Evaluation saved",
      submission,
    });
  } catch (error) {
    console.log("POST EVALUATION ERROR:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});
router.get("/analytics/summary", async (req, res) => {
  try {
    const submissions = await Submission.find().populate("rubricId", "title");

    const totalSubmissions = submissions.length;

    const evaluatedSubmissions = submissions.filter(
      (item) => item.status === "evaluated"
    );

    const averageScore =
      evaluatedSubmissions.length > 0
        ? (
            evaluatedSubmissions.reduce(
              (sum, item) => sum + (item.score || 0),
              0
            ) / evaluatedSubmissions.length
          ).toFixed(2)
        : 0;

    const rubricMap = {};

    submissions.forEach((submission) => {
      const rubricTitle = submission.rubricId?.title || "Unknown Rubric";

      if (!rubricMap[rubricTitle]) {
        rubricMap[rubricTitle] = {
          rubric: rubricTitle,
          count: 0,
          totalScore: 0,
          evaluatedCount: 0,
        };
      }

      rubricMap[rubricTitle].count += 1;

      if (submission.status === "evaluated") {
        rubricMap[rubricTitle].totalScore += submission.score || 0;
        rubricMap[rubricTitle].evaluatedCount += 1;
      }
    });

    const rubricStats = Object.values(rubricMap).map((item) => ({
      rubric: item.rubric,
      submissions: item.count,
      averageScore:
        item.evaluatedCount > 0
          ? Number((item.totalScore / item.evaluatedCount).toFixed(2))
          : 0,
    }));

    res.json({
      totalSubmissions,
      evaluatedSubmissions: evaluatedSubmissions.length,
      averageScore: Number(averageScore),
      rubricStats,
    });
  } catch (error) {
    console.log("ANALYTICS ERROR:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate(
      "rubricId"
    );

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    console.log("✅ POST /api/submissions hit");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { studentName, rubricId } = req.body;

    if (!studentName || !rubricId) {
      return res.status(400).json({
        message: "studentName болон rubricId шаардлагатай",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Файл оруулаагүй байна",
      });
    }

    const submission = await Submission.create({
      studentName,
      rubricId,
      fileName: req.file.filename,
      filePath: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      status: "submitted",
    });

    res.status(201).json({
      message: "Файл амжилттай хадгалагдлаа",
      submission,
    });
  } catch (error) {
    console.log("POST SUBMISSION ERROR:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});
router.get("/analytics/summary", async (req, res) => {
  try {
    const submissions = await Submission.find().populate("rubricId", "title");

    const totalSubmissions = submissions.length;

    const evaluatedSubmissions = submissions.filter(
      (item) => item.status === "evaluated"
    );

    const averageScore =
      evaluatedSubmissions.length > 0
        ? (
            evaluatedSubmissions.reduce(
              (sum, item) => sum + (item.score || 0),
              0
            ) / evaluatedSubmissions.length
          ).toFixed(2)
        : 0;

    const rubricMap = {};

    submissions.forEach((submission) => {
      const rubricTitle = submission.rubricId?.title || "Unknown Rubric";

      if (!rubricMap[rubricTitle]) {
        rubricMap[rubricTitle] = {
          rubric: rubricTitle,
          count: 0,
          totalScore: 0,
          evaluatedCount: 0,
        };
      }

      rubricMap[rubricTitle].count += 1;

      if (submission.status === "evaluated") {
        rubricMap[rubricTitle].totalScore += submission.score || 0;
        rubricMap[rubricTitle].evaluatedCount += 1;
      }
    });

    const rubricStats = Object.values(rubricMap).map((item) => ({
      rubric: item.rubric,
      submissions: item.count,
      averageScore:
        item.evaluatedCount > 0
          ? Number((item.totalScore / item.evaluatedCount).toFixed(2))
          : 0,
    }));

    res.json({
      totalSubmissions,
      evaluatedSubmissions: evaluatedSubmissions.length,
      averageScore: Number(averageScore),
      rubricStats,
    });
  } catch (error) {
    console.log("ANALYTICS ERROR:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});
module.exports = router;
