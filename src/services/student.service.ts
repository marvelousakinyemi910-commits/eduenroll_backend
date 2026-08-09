import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { hashPassword } from "../utils/password";
import { computeGPA, letterToPoint } from "../utils/gpa";

export async function listStudents(params: { search?: string; departmentId?: string; page?: number; limit?: number }) {
  const { search, departmentId, page = 1, limit = 20 } = params;
  const where: any = {
    ...(departmentId ? { departmentId } : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search } },
            { studentNo: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: { department: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.student.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getStudentById(id: string) {
  const student = await prisma.student.findUnique({ where: { id }, include: { department: true } });
  if (!student) throw ApiError.notFound("Student not found");
  return student;
}

export async function createStudent(input: any) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict("Email already in use");

  const hashed = await hashPassword(input.password);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { email: input.email, password: hashed, role: "STUDENT" } });
    return tx.student.create({
      data: {
        userId: user.id,
        studentNo: input.studentNo,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        departmentId: input.departmentId,
        faculty: input.faculty,
        level: input.level,
        gender: input.gender,
        dob: input.dob ? new Date(input.dob) : undefined,
        address: input.address,
      },
    });
  });
}

export async function updateStudent(id: string, input: any) {
  await getStudentById(id);
  return prisma.student.update({
    where: { id },
    data: { ...input, dob: input.dob ? new Date(input.dob) : undefined },
  });
}

export async function deleteStudent(id: string) {
  const student = await getStudentById(id);
  await prisma.user.delete({ where: { id: student.userId } }); // cascades to Student
}

// Transcript = every APPROVED registration for the student that has a grade,
// grouped by semester, with per-semester and cumulative GPA.
export async function getTranscript(studentId: string) {
  await getStudentById(studentId);

  const registrations = await prisma.registration.findMany({
    where: { studentId, status: "APPROVED", grade: { isNot: null } },
    include: { course: true, semester: true, grade: true },
    orderBy: { semester: { registrationStart: "asc" } },
  });

  const bySemester = new Map<string, typeof registrations>();
  for (const reg of registrations) {
    const key = reg.semester.id;
    if (!bySemester.has(key)) bySemester.set(key, []);
    bySemester.get(key)!.push(reg);
  }

  const semesters = Array.from(bySemester.entries()).map(([, regs]) => {
    const courses = regs.map((r) => ({
      courseCode: r.course.code,
      courseTitle: r.course.title,
      credits: r.course.credits,
      grade: r.grade!.letter,
      gradePoint: r.grade!.gradePoint,
    }));
    return {
      semester: regs[0].semester.name,
      session: regs[0].semester.session,
      courses,
      gpa: computeGPA(courses.map((c) => ({ credits: c.credits, gradePoint: c.gradePoint }))),
    };
  });

  const allCourses = registrations.map((r) => ({ credits: r.course.credits, gradePoint: r.grade!.gradePoint }));
  const cgpa = computeGPA(allCourses);

  return { semesters, cgpa, totalCredits: allCourses.reduce((s, c) => s + c.credits, 0) };
}

export { letterToPoint };
