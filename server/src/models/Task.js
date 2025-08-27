import mongoose from "mongoose";

const PRIORITIES = ["low", "med", "high"];

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    dueAt: { type: Date, default: null, index: true },
    priority: { type: String, enum: PRIORITIES, default: "med", index: true },
    completed: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Helpful compound indexes for queries
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, dueAt: 1 });

export const PRIORITY_VALUES = PRIORITIES;
export default mongoose.model("Task", taskSchema);
