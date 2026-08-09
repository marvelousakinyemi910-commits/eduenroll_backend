import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as dashboardService from "../services/dashboard.service";
import { getOwnStudentRecord } from "./student.controller";

export const studentDashboard = asyncHandler(async (req: Request, res: Response) => {
  const student = await getOwnStudentRecord(req);
  const data = await dashboardService.studentDashboard(student.id);
  res.json({ success: true, data });
});

export const adminDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const data = await dashboardService.adminDashboard();
  res.json({ success: true, data });
});
