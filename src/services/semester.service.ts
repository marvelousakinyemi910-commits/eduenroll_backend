import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export const listSemesters = () => prisma.semester.findMany({ orderBy: { registrationStart: "desc" } });

export async function getSemesterById(id: string) {
  const semester = await prisma.semester.findUnique({ where: { id } });
  if (!semester) throw ApiError.notFound("Semester not found");
  return semester;
}

export const getActiveSemester = () => prisma.semester.findFirst({ where: { isActive: true } });

// Only one semester may be active at a time (business rule from the spec).
export async function createSemester(input: any) {
  return prisma.$transaction(async (tx) => {
    if (input.isActive) {
      await tx.semester.updateMany({ where: { isActive: true }, data: { isActive: false } });
    }
    return tx.semester.create({
      data: {
        ...input,
        registrationStart: new Date(input.registrationStart),
        registrationEnd: new Date(input.registrationEnd),
      },
    });
  });
}

export async function updateSemester(id: string, input: any) {
  await getSemesterById(id);
  return prisma.$transaction(async (tx) => {
    if (input.isActive) {
      await tx.semester.updateMany({ where: { isActive: true, NOT: { id } }, data: { isActive: false } });
    }
    return tx.semester.update({
      where: { id },
      data: {
        ...input,
        registrationStart: input.registrationStart ? new Date(input.registrationStart) : undefined,
        registrationEnd: input.registrationEnd ? new Date(input.registrationEnd) : undefined,
      },
    });
  });
}

export async function closeSemesterRegistration(id: string) {
  await getSemesterById(id);
  return prisma.semester.update({ where: { id }, data: { registrationEnd: new Date() } });
}

export async function deleteSemester(id: string) {
  await getSemesterById(id);
  await prisma.semester.delete({ where: { id } });
}
