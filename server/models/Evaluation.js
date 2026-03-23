const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    rubricId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rubric",
      required: true,
    },
    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    evaluatorRole: {
      type: String,
      enum: ["student", "teacher", "admin"],
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    selectedRatings: {
      type: Object,
      default: {},
    },
    aiFeedback: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evaluation", evaluationSchema);    