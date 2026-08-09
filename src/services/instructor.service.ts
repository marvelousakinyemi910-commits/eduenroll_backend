import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { hashPassword } from "../utils/password";

export async function listInstructors(params: { search?: string; departmentId?: string; page?: number; limit?: number }) {
  const { search, departmentId, page = 1, limit = 20 } = params;
  const where: any = {
    ...(departmentId ? { departmentId } : {}),
    ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.instructor.findMany({
      where,
      include: { department: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.instructor.count({ where }),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getInstructorById(id: string) {
  const instructor = await prisma.instructor.findUnique({ where: { id }, include: { department: true } });
  if (!instructor) throw ApiError.notFound("Instructor not found");
  return instructor;
}

export async function createInstructor(input: any) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict("Email already in use");

  const hashed = await hashPassword(input.password);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { email: input.email, password: hashed, role: "INSTRUCTOR" } });
    return tx.instructor.create({
      data: {
        userId: user.id,
        instructorNo: input.instructorNo,
        name: input.name,
        email: input.email,
        departmentId: input.departmentId,
        office: input.office,
        phone: input.phone,
      },
    });
  });
}

export async function updateInstructor(id: string, input: any) {
  await getInstructorById(id);
  return prisma.instructor.update({ where: { id }, data: input });
}

export async function deleteInstructor(id: string) {
  const instructor = await getInstructorById(id);
  await prisma.user.delete({ where: { id: instructor.userId } });
}
