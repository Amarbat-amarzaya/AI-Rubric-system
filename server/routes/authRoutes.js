const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedRole = role || "student";
    const allowedRoles = ["admin", "teacher", "student"];
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: "Role буруу байна" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email бүртгэлтэй байна" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: normalizedRole,
    });

    res.status(201).json({
      message: "Register амжилттай",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Хэрэглэгч олдсонгүй" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Нууц үг буруу байна" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server тохиргоо дутуу байна (JWT_SECRET)",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login амжилттай",
      token,
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;