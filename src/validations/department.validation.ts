import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(10),
  faculty: z.string().min(2),
});

export const updateDepartmentSchema = departmentSchema.partial();
