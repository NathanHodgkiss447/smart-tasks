import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import tasksRouter from "./routes/tasks.routes.js";
import remindersRouter from "./routes/reminders.routes.js";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/tasks", tasksRouter);
app.use("/reminders", remindersRouter);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo connected - hello v3");
    app.listen(PORT, () => console.log(`API listening on :${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}
start();
