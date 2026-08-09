import { Router } from "express";
import authRoutes from "./auth.routes";
import studentRoutes from "./student.routes";
import instructorRoutes from "./instructor.routes";
import departmentRoutes from "./department.routes";
import semesterRoutes from "./semester.routes";
import courseRoutes from "./course.routes";
import registrationRoutes from "./registration.routes";
import gradeRoutes from "./grade.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ success: true, message: "EduEnroll API is healthy" }));

router.use("/auth", authRoutes);
router.use("/students", studentRoutes);
router.use("/instructors", instructorRoutes);
router.use("/departments", departmentRoutes);
router.use("/semesters", semesterRoutes);
router.use("/courses", courseRoutes);
router.use("/registrations", registrationRoutes);
router.use("/grades", gradeRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
