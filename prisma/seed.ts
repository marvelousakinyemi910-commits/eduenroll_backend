import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding EduEnroll database...");

  const hash = (pwd: string) => bcrypt.hash(pwd, 12);

  // --- Departments ---
  const cs = await prisma.department.upsert({
    where: { code: "CSC" },
    update: {},
    create: { name: "Computer Science", code: "CSC", faculty: "Faculty of Science" },
  });
  const math = await prisma.department.upsert({
    where: { code: "MTH" },
    update: {},
    create: { name: "Mathematics", code: "MTH", faculty: "Faculty of Science" },
  });

  // --- Semester ---
  const semester = await prisma.semester.upsert({
    where: { name_session: { name: "First Semester", session: "2025/2026" } },
    update: {},
    create: {
      name: "First Semester",
      session: "2025/2026",
      registrationStart: new Date(Date.now() - 1000 * 60 * 60 * 24), // started yesterday
      registrationEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
      isActive: true,
    },
  });

  // --- Admin ---
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@eduenroll.edu" },
    update: {},
    create: {
      email: "admin@eduenroll.edu",
      password: await hash("Admin@12345"),
      role: "ADMIN",
      admin: { create: { fullName: "System Administrator" } },
    },
  });

  // --- Instructor ---
  const instructorUser = await prisma.user.upsert({
    where: { email: "jsmith@eduenroll.edu" },
    update: {},
    create: {
      email: "jsmith@eduenroll.edu",
      password: await hash("Instructor@123"),
      role: "INSTRUCTOR",
      instructor: {
        create: {
          instructorNo: "INS-0001",
          name: "Dr. John Smith",
          email: "jsmith@eduenroll.edu",
          departmentId: cs.id,
          office: "Block A, Room 12",
          phone: "+2348000000001",
        },
      },
    },
    include: { instructor: true },
  });
  const instructor = await prisma.instructor.findUniqueOrThrow({ where: { userId: instructorUser.id } });

  // --- Students ---
  const student1User = await prisma.user.upsert({
    where: { email: "jane.doe@eduenroll.edu" },
    update: {},
    create: {
      email: "jane.doe@eduenroll.edu",
      password: await hash("Student@123"),
      role: "STUDENT",
      student: {
        create: {
          studentNo: "STU-0001",
          fullName: "Jane Doe",
          email: "jane.doe@eduenroll.edu",
          phone: "+2348000000002",
          departmentId: cs.id,
          faculty: "Faculty of Science",
          level: 200,
        },
      },
    },
  });

  // --- Courses ---
  const csc101 = await prisma.course.upsert({
    where: { code_semesterId: { code: "CSC101", semesterId: semester.id } },
    update: {},
    create: {
      code: "CSC101",
      title: "Introduction to Computer Science",
      description: "Foundations of computing, algorithms, and problem solving.",
      credits: 3,
      instructorId: instructor.id,
      semesterId: semester.id,
      departmentId: cs.id,
      scheduleDay: "MON,WED",
      scheduleStart: "09:00",
      scheduleEnd: "10:30",
      venue: "LT 1",
      maxStudents: 60,
    },
  });

  await prisma.course.upsert({
    where: { code_semesterId: { code: "CSC201", semesterId: semester.id } },
    update: {},
    create: {
      code: "CSC201",
      title: "Data Structures & Algorithms",
      description: "Core data structures, complexity analysis, and algorithm design.",
      credits: 4,
      instructorId: instructor.id,
      semesterId: semester.id,
      departmentId: cs.id,
      scheduleDay: "TUE,THU",
      scheduleStart: "11:00",
      scheduleEnd: "12:30",
      venue: "LT 2",
      maxStudents: 50,
      prerequisites: { connect: [{ id: csc101.id }] },
    },
  });

  await prisma.course.upsert({
    where: { code_semesterId: { code: "MTH101", semesterId: semester.id } },
    update: {},
    create: {
      code: "MTH101",
      title: "Calculus I",
      description: "Limits, derivatives, and integrals.",
      credits: 3,
      semesterId: semester.id,
      departmentId: math.id,
      scheduleDay: "MON,WED",
      scheduleStart: "13:00",
      scheduleEnd: "14:30",
      venue: "LT 3",
      maxStudents: 80,
    },
  });

  console.log("Seed complete.");
  console.log("Admin login:      admin@eduenroll.edu / Admin@12345");
  console.log("Instructor login: jsmith@eduenroll.edu / Instructor@123");
  console.log("Student login:    jane.doe@eduenroll.edu / Student@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
