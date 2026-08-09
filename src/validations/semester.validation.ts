import { z } from "zod";

export const semesterSchema = z.object({
  name: z.string().min(2),
  session: z.string().min(4),
  registrationStart: z.string().datetime(),
  registrationEnd: z.string().datetime(),
  isActive: z.boolean().optional(),
});

export const updateSemesterSchema = semesterSchema.partial();
