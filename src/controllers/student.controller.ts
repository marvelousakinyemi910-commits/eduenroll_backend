import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as studentService from "../services/student.service";

export const listStudents = asyncHandler(async (req: Request, res: Response) => {
  const { search, departmentId, page, limit } = req.query as Record<string, string>;
  const result = await studentService.listStudents({
    search,
    departmentId,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
  });
  res.json({ success: true, ...result });
});

export const getStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.getStudentById(req.params.id);
  res.json({ success: true, data: student });
});

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.createStudent(req.body);
  res.status(201).json({ success: true, data: student });
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await studentService.updateStudent(req.params.id, req.body);
  res.json({ success: true, data: student });
});

export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  await studentService.deleteStudent(req.params.id);
  res.status(204).send();
});

export const getTranscript = asyncHandler(async (req: Request, res: Response) => {
  const transcript = await studentService.getTranscript(req.params.id);
  res.json({ success: true, data: transcript });
});

export const getMyTranscript = asyncHandler(async (req: Request, res: Response) => {
  const student = await getOwnStudentRecord(req);
  const transcript = await studentService.getTranscript(student.id);
  res.json({ success: true, data: transcript });
});

// Helper: resolve the Student record that belongs to the currently logged-in user.
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
async function getOwnStudentRecord(req: Request) {
  const student = await prisma.student.findUnique({ where: { userId: req.user!.sub } });
  if (!student) throw ApiError.notFound("Student profile not found for this account");
  return student;
}
export { getOwnStudentRecord };
