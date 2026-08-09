import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export const listDepartments = () =>
  prisma.department.findMany({ orderBy: { name: "asc" } });

export async function getDepartmentById(id: string) {
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) throw ApiError.notFound("Department not found");
  return dept;
}

export const createDepartment = (input: any) => prisma.department.create({ data: input });

export async function updateDepartment(id: string, input: any) {
  await getDepartmentById(id);
  return prisma.department.update({ where: { id }, data: input });
}

export async function deleteDepartment(id: string) {
  await getDepartmentById(id);
  await prisma.department.delete({ where: { id } });
}
