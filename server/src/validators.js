import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  dueAt: z.string().datetime().or(z.null()).optional(),
  priority: z.enum(["low", "med", "high"]).optional().default("med"),
  completed: z.boolean().optional().default(false),
});

export const updateTaskSchema = createTaskSchema.partial();
