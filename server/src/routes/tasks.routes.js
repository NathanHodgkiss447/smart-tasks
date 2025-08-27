import { Router } from "express";
import Task from "../models/Task.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { createTaskSchema, updateTaskSchema } from "../validators.js";

const router = Router();
router.use(requireAuth);

// Helpers
function parseDueAt(input) {
  if (!input) return null;
  try {
    return new Date(input);
  } catch {
    return null;
  }
}

// Create
router.post("/", async (req, res) => {
  try {
    const parsed = createTaskSchema.parse(req.body);
    const task = await Task.create({
      userId: req.user.id,
      title: parsed.title,
      description: parsed.description ?? "",
      dueAt: parsed.dueAt ? new Date(parsed.dueAt) : null,
      priority: parsed.priority ?? "med",
      completed: parsed.completed ?? false,
    });
    res.status(201).json(task);
  } catch (err) {
    if (err.name === "ZodError")
      return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: "Failed to create task" });
  }
});

// List with filters: ?status=overdue|today|upcoming|completed
router.get("/", async (req, res) => {
  const { status } = req.query;
  const userId = req.user.id;

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let query = { userId };
  if (status === "completed") query.completed = true;
  if (status === "overdue")
    query = { userId, completed: false, dueAt: { $ne: null, $lt: now } };
  if (status === "today")
    query = { userId, completed: false, dueAt: { $gte: start, $lte: end } };
  if (status === "upcoming")
    query = { userId, completed: false, dueAt: { $ne: null, $gt: end } };

  const tasks = await Task.find(query).sort({ dueAt: 1, createdAt: -1 }).lean();
  res.json(tasks);
});

// Read one
router.get("/:id", async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json(task);
});

// Update (partial)
router.patch("/:id", async (req, res) => {
  try {
    const parsed = updateTaskSchema.parse(req.body);
    const patch = { ...parsed };
    if ("dueAt" in parsed)
      patch.dueAt = parsed.dueAt ? new Date(parsed.dueAt) : null;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: patch },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Not found" });
    res.json(task);
  } catch (err) {
    if (err.name === "ZodError")
      return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });
  if (!task) return res.status(404).json({ error: "Not found" });
  res.json({ success: true });
});

export default router;
