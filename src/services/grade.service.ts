import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { GRADE_POINTS } from "../utils/gpa";
import { GradeLetter } from "@prisma/client";

export async function assignGrade(registrationId: string, letter: GradeLetter) {
  const registration = await prisma.registration.findUnique({ where: { id: registrationId } });
  if (!registration) throw ApiError.notFound("Registration not found");
  if (registration.status !== "APPROVED") {
    throw ApiError.badRequest("Grades can only be assigned to approved registrations");
  }

  const gradePoint = GRADE_POINTS[letter];

  return prisma.grade.upsert({
    where: { registrationId },
    update: { letter, gradePoint },
    create: { registrationId, letter, gradePoint },
  });
}

export async function getGradesForStudent(studentId: string) {
  return prisma.registration.findMany({
    where: { studentId, grade: { isNot: null } },
    include: { course: true, semester: true, grade: true },
    orderBy: { semester: { registrationStart: "desc" } },
  });
}
