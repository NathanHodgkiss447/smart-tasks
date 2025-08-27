import { Router } from "express";
import Task from "../models/Task.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
router.use(requireAuth);

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function nextBusinessDayAt(hour = 9, minute = 0) {
  const d = new Date();
  let day = d.getDay();
  // 0=Sun, 6=Sat
  let add = 1;
  if (day === 5) add = 3; // Fri -> Mon
  if (day === 6) add = 2; // Sat -> Mon
  d.setDate(d.getDate() + add);
  d.setHours(hour, minute, 0, 0);
  return d;
}

router.get("/summary", async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const [overdueCount, dueToday, staleNoDue] = await Promise.all([
    Task.countDocuments({
      userId,
      completed: false,
      dueAt: { $ne: null, $lt: now },
    }),
    Task.find({
      userId,
      completed: false,
      dueAt: { $gte: todayStart, $lte: todayEnd },
    })
      .sort({ dueAt: 1 })
      .lean(),
    Task.find({ userId, completed: false, dueAt: null })
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  // Simple suggestions
  const suggested = [];
  const nowMs = now.getTime();
  for (const t of staleNoDue) {
    const ageDays = (nowMs - new Date(t.createdAt).getTime()) / 86400000;
    if (t.priority === "high" || ageDays > 7) {
      suggested.push({
        taskId: String(t._id),
        suggestedDueAt: nextBusinessDayAt(9, 0),
      });
    }
  }

  res.json({ overdueCount, dueToday, suggested });
});

export default router;
