import { z } from "zod";

export const courseSchema = z.object({
  code: z.string().min(3),
  title: z.string().min(3),
  description: z.string().optional(),
  credits: z.number().int().min(1).max(12),
  instructorId: z.string().optional(),
  semesterId: z.string(),
  departmentId: z.string(),
  scheduleDay: z.string().optional(), // e.g. "MON,WED"
  scheduleStart: z.string().optional(), // "09:00"
  scheduleEnd: z.string().optional(), // "10:30"
  venue: z.string().optional(),
  maxStudents: z.number().int().min(1),
  prerequisiteCodes: z.array(z.string()).optional(),
});

export const updateCourseSchema = courseSchema.partial();

export const courseQuerySchema = z.object({
  search: z.string().optional(),
  departmentId: z.string().optional(),
  semesterId: z.string().optional(),
  instructorId: z.string().optional(),
  level: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
