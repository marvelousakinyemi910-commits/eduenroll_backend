import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as courseService from "../services/course.service";

export const listCourses = asyncHandler(async (req: Request, res: Response) => {
  const { search, departmentId, semesterId, instructorId, page, limit } = req.query as Record<string, string>;
  const result = await courseService.listCourses({
    search,
    departmentId,
    semesterId,
    instructorId,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
  });
  res.json({ success: true, ...result });
});

export const getCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.getCourseById(req.params.id);
  res.json({ success: true, data: course });
});

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.createCourse(req.body);
  res.status(201).json({ success: true, data: course });
});

export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.updateCourse(req.params.id, req.body);
  res.json({ success: true, data: course });
});

export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  await courseService.deleteCourse(req.params.id);
  res.status(204).send();
});
