import { z } from "zod";

export const createInstructorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  instructorNo: z.string().min(3),
  name: z.string().min(2),
  departmentId: z.string(),
  office: z.string().optional(),
  phone: z.string().optional(),
});

export const updateInstructorSchema = createInstructorSchema.partial().omit({ password: true });
