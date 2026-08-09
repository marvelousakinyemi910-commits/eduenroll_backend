import { z } from "zod";

export const createStudentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  studentNo: z.string().min(3),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  departmentId: z.string(),
  faculty: z.string(),
  level: z.number().int().min(100).max(700),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dob: z.string().datetime().optional(),
  address: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial().omit({ password: true });

export const idParamSchema = z.object({ id: z.string().min(1) });
