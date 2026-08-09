import { prisma } from "../config/prisma";
import { computeGPA } from "../utils/gpa";

export async function studentDashboard(studentId: string) {
  const activeSemester = await prisma.semester.findFirst({ where: { isActive: true } });

  const [registeredCourses, gradedRegs] = await Promise.all([
    prisma.registration.count({
      where: { studentId, status: { in: ["PENDING", "APPROVED"] }, ...(activeSemester ? { semesterId: activeSemester.id } : {}) },
    }),
    prisma.registration.findMany({
      where: { studentId, status: "APPROVED", grade: { isNot: null } },
      include: { course: true, grade: true, semester: true },
    }),
  ]);

  const currentCredits = await prisma.registration
    .findMany({
      where: { studentId, status: { in: ["PENDING", "APPROVED"] }, ...(activeSemester ? { semesterId: activeSemester.id } : {}) },
      include: { course: true },
    })
    .then((regs) => regs.reduce((sum, r) => sum + r.course.credits, 0));

  const cgpa = computeGPA(gradedRegs.map((r) => ({ credits: r.course.credits, gradePoint: r.grade!.gradePoint })));

  // GPA trend, grouped by semester
  const bySemester = new Map<string, typeof gradedRegs>();
  for (const r of gradedRegs) {
    const key = r.semester.id;
    if (!bySemester.has(key)) bySemester.set(key, []);
    bySemester.get(key)!.push(r);
  }
  const gpaTrend = Array.from(bySemester.values()).map((regs) => ({
    semester: regs[0].semester.name,
    gpa: computeGPA(regs.map((r) => ({ credits: r.course.credits, gradePoint: r.grade!.gradePoint }))),
    credits: regs.reduce((s, r) => s + r.course.credits, 0),
  }));

  return {
    registeredCourses,
    currentCredits,
    cgpa,
    gpaTrend,
    activeSemester,
  };
}

export async function adminDashboard() {
  const [students, courses, instructors, activeSemester, registrations] = await Promise.all([
    prisma.student.count(),
    prisma.course.count(),
    prisma.instructor.count(),
    prisma.semester.findFirst({ where: { isActive: true } }),
    prisma.registration.count({ where: { status: { in: ["PENDING", "APPROVED"] } } }),
  ]);

  const enrollmentByDepartment = await prisma.department.findMany({
    select: {
      name: true,
      courses: { select: { currentEnrollment: true } },
    },
  });

  const departmentEnrollment = enrollmentByDepartment.map((d) => ({
    department: d.name,
    enrollment: d.courses.reduce((s, c) => s + c.currentEnrollment, 0),
  }));

  const popularCourses = await prisma.course.findMany({
    orderBy: { currentEnrollment: "desc" },
    take: 5,
    select: { code: true, title: true, currentEnrollment: true, maxStudents: true },
  });

  return {
    students,
    courses,
    instructors,
    activeSemester,
    registrations,
    departmentEnrollment,
    popularCourses,
  };
}
