import { Router } from "express";
import * as semesterController from "../controllers/semester.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { semesterSchema, updateSemesterSchema } from "../validations/semester.validation";

const router = Router();
router.use(authenticate);

router.get("/", semesterController.listSemesters);
router.get("/active", semesterController.getActiveSemester);
router.get("/:id", semesterController.getSemester);
router.post("/", authorize("ADMIN"), validate({ body: semesterSchema }), semesterController.createSemester);
router.put("/:id", authorize("ADMIN"), validate({ body: updateSemesterSchema }), semesterController.updateSemester);
router.post("/:id/close-registration", authorize("ADMIN"), semesterController.closeRegistration);
router.delete("/:id", authorize("ADMIN"), semesterController.deleteSemester);

export default router;
