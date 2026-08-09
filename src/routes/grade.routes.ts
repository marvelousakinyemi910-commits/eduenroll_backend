import { Router } from "express";
import * as gradeController from "../controllers/grade.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { assignGradeSchema } from "../validations/grade.validation";

const router = Router();
router.use(authenticate);

router.post("/", authorize("ADMIN", "INSTRUCTOR"), validate({ body: assignGradeSchema }), gradeController.assignGrade);
router.get("/me", authorize("STUDENT"), gradeController.myGrades);
router.get("/student/:id", authorize("ADMIN", "INSTRUCTOR"), gradeController.gradesForStudent);

export default router;
