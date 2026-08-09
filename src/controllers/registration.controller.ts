import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as registrationService from "../services/registration.service";
import { getOwnStudentRecord } from "./student.controller";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const student = await getOwnStudentRecord(req);
  const registration = await registrationService.registerForCourse(student.id, req.body.courseId);
  res.status(201).json({ success: true, data: registration });
});

export const drop = asyncHandler(async (req: Request, res: Response) => {
  const student = await getOwnStudentRecord(req);
  const registration = await registrationService.dropCourse(student.id, req.params.id);
  res.json({ success: true, data: registration });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const registration = await registrationService.updateRegistrationStatus(req.params.id, req.body.status);
  res.json({ success: true, data: registration });
});

export const myRegistrations = asyncHandler(async (req: Request, res: Response) => {
  const student = await getOwnStudentRecord(req);
  const semesterId = req.query.semesterId as string | undefined;
  const registrations = await registrationService.listStudentRegistrations(student.id, semesterId);
  res.json({ success: true, data: registrations });
});

export const courseRegistrations = asyncHandler(async (req: Request, res: Response) => {
  const registrations = await registrationService.listCourseRegistrations(req.params.id);
  res.json({ success: true, data: registrations });
});

export const myTimetable = asyncHandler(async (req: Request, res: Response) => {
  const student = await getOwnStudentRecord(req);
  const semesterId = req.query.semesterId as string;
  const timetable = await registrationService.getTimetable(student.id, semesterId);
  res.json({ success: true, data: timetable });
});
