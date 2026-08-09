import { z } from "zod";

export const assignGradeSchema = z.object({
  registrationId: z.string().min(1),
  letter: z.enum(["A", "B", "C", "D", "E", "F"]),
});
