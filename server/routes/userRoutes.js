const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("_id name email role")
      .sort({ name: 1 });

    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
