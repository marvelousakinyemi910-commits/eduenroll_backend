import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as instructorService from "../services/instructor.service";

export const listInstructors = asyncHandler(async (req: Request, res: Response) => {
  const { search, departmentId, page, limit } = req.query as Record<string, string>;
  const result = await instructorService.listInstructors({
    search,
    departmentId,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
  });
  res.json({ success: true, ...result });
});

export const getInstructor = asyncHandler(async (req: Request, res: Response) => {
  const instructor = await instructorService.getInstructorById(req.params.id);
  res.json({ success: true, data: instructor });
});

export const createInstructor = asyncHandler(async (req: Request, res: Response) => {
  const instructor = await instructorService.createInstructor(req.body);
  res.status(201).json({ success: true, data: instructor });
});

export const updateInstructor = asyncHandler(async (req: Request, res: Response) => {
  const instructor = await instructorService.updateInstructor(req.params.id, req.body);
  res.json({ success: true, data: instructor });
});

export const deleteInstructor = asyncHandler(async (req: Request, res: Response) => {
  await instructorService.deleteInstructor(req.params.id);
  res.status(204).send();
});
