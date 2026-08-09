import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

// Two courses clash if they share at least one day AND their time ranges overlap.
function schedulesClash(
  a: { scheduleDay: string | null; scheduleStart: string | null; scheduleEnd: string | null },
  b: { scheduleDay: string | null; scheduleStart: string | null; scheduleEnd: string | null }
): boolean {
  if (!a.scheduleDay || !b.scheduleDay || !a.scheduleStart || !a.scheduleEnd || !b.scheduleStart || !b.scheduleEnd) {
    return false; // insufficient schedule info -> cannot determine a clash, don't block
  }
  const daysA = a.scheduleDay.split(",").map((d) => d.trim());
  const daysB = b.scheduleDay.split(",").map((d) => d.trim());
  const sharesDay = daysA.some((d) => daysB.includes(d));
  if (!sharesDay) return false;

  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const startA = toMinutes(a.scheduleStart);
  const endA = toMinutes(a.scheduleEnd);
  const startB = toMinutes(b.scheduleStart);
  const endB = toMinutes(b.scheduleEnd);

  return startA < endB && startB < endA;
}

// Core business-rule gate for course registration (see product spec §Business Rules).
export async function registerForCourse(studentId: string, courseId: string) {
  const [student, course] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId } }),
    prisma.course.findUnique({
      where: { id: courseId },
      include: { semester: true, prerequisites: true },
    }),
  ]);

  if (!student) throw ApiError.notFound("Student not found");
  if (!course) throw ApiError.notFound("Course not found");

  const now = new Date();

  // 1. Registration window must be open for this course's semester.
  if (now < course.semester.registrationStart || now > course.semester.registrationEnd) {
    throw ApiError.badRequest("Registration is closed for this semester");
  }

  // 2. No duplicate registration for the same course.
  const existing = await prisma.registration.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
  if (existing && existing.status !== "DROPPED") {
    throw ApiError.conflict("You are already registered for this course");
  }

  // 3. Course must have available seats.
  if (course.currentEnrollment >= course.maxStudents) {
    throw ApiError.conflict("Course has reached maximum capacity");
  }

  // 4. Prerequisites must be satisfied (a passing grade, i.e. not F, in each).
  if (course.prerequisites.length > 0) {
    const prereqIds = course.prerequisites.map((p) => p.id);
    const passedPrereqs = await prisma.registration.findMany({
      where: {
        studentId,
        courseId: { in: prereqIds },
        status: "APPROVED",
        grade: { letter: { not: "F" } },
      },
    });
    const passedCourseIds = new Set(passedPrereqs.map((r) => r.courseId));
    const missing = course.prerequisites.filter((p) => !passedCourseIds.has(p.id));
    if (missing.length > 0) {
      throw ApiError.badRequest(
        `Missing prerequisite(s): ${missing.map((m) => m.code).join(", ")}`
      );
    }
  }

  // 5. Credit load: existing active registrations this semester + this course <= max.
  const currentRegs = await prisma.registration.findMany({
    where: { studentId, semesterId: course.semesterId, status: { in: ["PENDING", "APPROVED"] } },
    include: { course: true },
  });
  const currentCredits = currentRegs.reduce((sum, r) => sum + r.course.credits, 0);
  if (currentCredits + course.credits > env.MAX_CREDIT_LOAD) {
    throw ApiError.badRequest(
      `Registering for this course would exceed the maximum credit load of ${env.MAX_CREDIT_LOAD}`
    );
  }

  // 6. No timetable clash with existing active registrations.
  const clash = currentRegs.find((r) => schedulesClash(course, r.course));
  if (clash) {
    throw ApiError.conflict(`Time clash with already-registered course ${clash.course.code}`);
  }

  // All checks passed — create (or reinstate a dropped) registration and
  // bump enrollment count atomically.
  return prisma.$transaction(async (tx) => {
    const registration = existing
      ? await tx.registration.update({
          where: { id: existing.id },
          data: { status: "PENDING", registeredAt: new Date(), droppedAt: null },
        })
      : await tx.registration.create({
          data: { studentId, courseId, semesterId: course.semesterId, status: "PENDING" },
        });

    await tx.course.update({ where: { id: courseId }, data: { currentEnrollment: { increment: 1 } } });

    return tx.registration.findUniqueOrThrow({
      where: { id: registration.id },
      include: { course: true, semester: true },
    });
  });
}

export async function dropCourse(studentId: string, registrationId: string) {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { course: true, semester: true },
  });
  if (!registration || registration.studentId !== studentId) {
    throw ApiError.notFound("Registration not found");
  }
  if (registration.status === "DROPPED") {
    throw ApiError.badRequest("Course already dropped");
  }
  if (new Date() > registration.semester.registrationEnd) {
    throw ApiError.badRequest("Cannot drop a course after the registration deadline");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.registration.update({
      where: { id: registrationId },
      data: { status: "DROPPED", droppedAt: new Date() },
    });
    await tx.course.update({
      where: { id: registration.courseId },
      data: { currentEnrollment: { decrement: 1 } },
    });
    return updated;
  });
}

export async function updateRegistrationStatus(registrationId: string, status: "APPROVED" | "REJECTED") {
  const registration = await prisma.registration.findUnique({ where: { id: registrationId } });
  if (!registration) throw ApiError.notFound("Registration not found");

  if (status === "REJECTED" && registration.status !== "REJECTED") {
    // Free up the seat that was held for a pending registration.
    return prisma.$transaction(async (tx) => {
      const updated = await tx.registration.update({ where: { id: registrationId }, data: { status } });
      await tx.course.update({ where: { id: registration.courseId }, data: { currentEnrollment: { decrement: 1 } } });
      return updated;
    });
  }

  return prisma.registration.update({ where: { id: registrationId }, data: { status } });
}

export async function listStudentRegistrations(studentId: string, semesterId?: string) {
  return prisma.registration.findMany({
    where: { studentId, ...(semesterId ? { semesterId } : {}) },
    include: { course: { include: { instructor: true, department: true } }, semester: true, grade: true },
    orderBy: { registeredAt: "desc" },
  });
}

export async function listCourseRegistrations(courseId: string) {
  return prisma.registration.findMany({
    where: { courseId },
    include: { student: true, grade: true },
    orderBy: { registeredAt: "asc" },
  });
}

export async function getTimetable(studentId: string, semesterId: string) {
  const regs = await prisma.registration.findMany({
    where: { studentId, semesterId, status: "APPROVED" },
    include: { course: true },
  });
  return regs.map((r) => ({
    courseCode: r.course.code,
    title: r.course.title,
    day: r.course.scheduleDay,
    start: r.course.scheduleStart,
    end: r.course.scheduleEnd,
    venue: r.course.venue,
  }));
}
