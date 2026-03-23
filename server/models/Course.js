const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      courseName: {
        type: String,
        required: true,
      },
      teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    { timestamps: true }
  );
  
module.exports = mongoose.model("Course", courseSchema);
