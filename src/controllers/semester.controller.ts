import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as semesterService from "../services/semester.service";

export const listSemesters = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await semesterService.listSemesters() });
});

export const getSemester = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: await semesterService.getSemesterById(req.params.id) });
});

export const getActiveSemester = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await semesterService.getActiveSemester() });
});

export const createSemester = asyncHandler(async (req: Request, res: Response) => {
  const semester = await semesterService.createSemester(req.body);
  res.status(201).json({ success: true, data: semester });
});

export const updateSemester = asyncHandler(async (req: Request, res: Response) => {
  const semester = await semesterService.updateSemester(req.params.id, req.body);
  res.json({ success: true, data: semester });
});

export const closeRegistration = asyncHandler(async (req: Request, res: Response) => {
  const semester = await semesterService.closeSemesterRegistration(req.params.id);
  res.json({ success: true, data: semester });
});

export const deleteSemester = asyncHandler(async (req: Request, res: Response) => {
  await semesterService.deleteSemester(req.params.id);
  res.status(204).send();
});
