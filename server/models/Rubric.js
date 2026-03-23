const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      default: "",
    },
    ratings: {
      type: [ratingSchema],
      default: [],
    },
  },
  { _id: false }
);

const criterionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    items: {
      type: [itemSchema],
      default: [],
    },
  },
  { _id: false }
);

const rubricSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    criteria: {
      type: [criterionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rubric", rubricSchema);