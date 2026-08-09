import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as gradeService from "../services/grade.service";
import { getOwnStudentRecord } from "./student.controller";

export const assignGrade = asyncHandler(async (req: Request, res: Response) => {
  const grade = await gradeService.assignGrade(req.body.registrationId, req.body.letter);
  res.status(201).json({ success: true, data: grade });
});

export const gradesForStudent = asyncHandler(async (req: Request, res: Response) => {
  const grades = await gradeService.getGradesForStudent(req.params.id);
  res.json({ success: true, data: grades });
});

export const myGrades = asyncHandler(async (req: Request, res: Response) => {
  const student = await getOwnStudentRecord(req);
  const grades = await gradeService.getGradesForStudent(student.id);
  res.json({ success: true, data: grades });
});
