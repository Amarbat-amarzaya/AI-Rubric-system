const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
        type: Number,
        default: 0
      },
      
      selectedRatings: {
        type: Object
      },
    rubricId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rubric",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "submitted",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);