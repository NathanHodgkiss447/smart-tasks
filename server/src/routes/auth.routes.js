import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { signupSchema, loginSchema } from "../validators.js";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = signupSchema.parse(req.body);
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });

    const token = jwt.sign({}, process.env.JWT_SECRET, {
      subject: String(user._id),
      expiresIn: "7d",
    });
    res.status(201).json({ token });
  } catch (err) {
    if (err.name === "ZodError")
      return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({}, process.env.JWT_SECRET, {
      subject: String(user._id),
      expiresIn: "7d",
    });
    res.json({ token });
  } catch (err) {
    if (err.name === "ZodError")
      return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
