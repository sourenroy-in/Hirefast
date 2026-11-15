import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Fill in every box" });
    const safeRole =
      email.toLowerCase() === "admin@hirefast.com"
        ? "admin"
        : role === "recruiter"
          ? "recruiter"
          : "seeker";
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role: safeRole,
    });
    res.status(201).json({ message: "Account made. Please log in." });
  } catch (error) {
    res.status(400).json({
      message:
        error.code === 11000
          ? "That email is already used"
          : "Could not make the account",
    });
  }
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() });
  if (
    !user ||
    !(await bcrypt.compare(req.body.password || "", user.password))
  ) {
    return res
      .status(401)
      .json({ message: "Email or password is not correct" });
  }
  const token = jwt.sign(
    { id: user._id, name: user.name, role: user.role },
    process.env.TOKEN_KEY,
    { expiresIn: "1d" },
  );
  res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
});

export default router;
