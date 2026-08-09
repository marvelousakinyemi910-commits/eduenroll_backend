import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

interface CourseQuery {
  search?: string;
  departmentId?: string;
  semesterId?: string;
  instructorId?: string;
  page?: number;
  limit?: number;
}

export async function listCourses(params: CourseQuery) {
  const { search, departmentId, semesterId, instructorId, page = 1, limit = 20 } = params;
  const where: any = {
    ...(departmentId ? { departmentId } : {}),
    ...(semesterId ? { semesterId } : {}),
    ...(instructorId ? { instructorId } : {}),
    ...(search
      ? { OR: [{ code: { contains: search } }, { title: { contains: search } }] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: { department: true, semester: true, instructor: true, prerequisites: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { code: "asc" },
    }),
    prisma.course.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getCourseById(id: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: { department: true, semester: true, instructor: true, prerequisites: true },
  });
  if (!course) throw ApiError.notFound("Course not found");
  return course;
}

export async function createCourse(input: any) {
  const { prerequisiteCodes, semesterId, code, ...rest } = input;

  const duplicate = await prisma.course.findUnique({ where: { code_semesterId: { code, semesterId } } });
  if (duplicate) throw ApiError.conflict("Course code already exists for this semester");

  if (rest.credits <= 0) throw ApiError.badRequest("Credits must be greater than 0");
  if (rest.maxStudents <= 0) throw ApiError.badRequest("Maximum students must be greater than 0");

  let prereqConnect: { id: string }[] = [];
  if (prerequisiteCodes?.length) {
    const prereqs = await prisma.course.findMany({ where: { code: { in: prerequisiteCodes } } });
    prereqConnect = prereqs.map((p) => ({ id: p.id }));
  }

  return prisma.course.create({
    data: {
      code,
      semesterId,
      ...rest,
      prerequisites: prereqConnect.length ? { connect: prereqConnect } : undefined,
    },
    include: { department: true, semester: true, instructor: true, prerequisites: true },
  });
}

export async function updateCourse(id: string, input: any) {
  await getCourseById(id);
  const { prerequisiteCodes, ...rest } = input;

  let prereqSet: { set: { id: string }[] } | undefined;
  if (prerequisiteCodes) {
    const prereqs = await prisma.course.findMany({ where: { code: { in: prerequisiteCodes } } });
    prereqSet = { set: prereqs.map((p) => ({ id: p.id })) };
  }

  return prisma.course.update({
    where: { id },
    data: { ...rest, ...(prereqSet ? { prerequisites: prereqSet } : {}) },
    include: { department: true, semester: true, instructor: true, prerequisites: true },
  });
}

export async function deleteCourse(id: string) {
  await getCourseById(id);
  const activeRegs = await prisma.registration.count({
    where: { courseId: id, status: { in: ["PENDING", "APPROVED"] } },
  });
  if (activeRegs > 0) {
    throw ApiError.conflict("Cannot delete a course with active student registrations");
  }
  await prisma.course.delete({ where: { id } });
}
