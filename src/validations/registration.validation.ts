import { z } from "zod";

export const createRegistrationSchema = z.object({
  courseId: z.string().min(1),
});

export const updateRegistrationStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});
