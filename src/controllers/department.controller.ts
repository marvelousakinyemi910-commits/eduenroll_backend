import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as departmentService from "../services/department.service";

export const listDepartments = asyncHandler(async (_req: Request, res: Response) => {
  const departments = await departmentService.listDepartments();
  res.json({ success: true, data: departments });
});

export const getDepartment = asyncHandler(async (req: Request, res: Response) => {
  const department = await departmentService.getDepartmentById(req.params.id);
  res.json({ success: true, data: department });
});

export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const department = await departmentService.createDepartment(req.body);
  res.status(201).json({ success: true, data: department });
});

export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const department = await departmentService.updateDepartment(req.params.id, req.body);
  res.json({ success: true, data: department });
});

export const deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
  await departmentService.deleteDepartment(req.params.id);
  res.status(204).send();
});
