import { Router } from "express";
import * as studentController from "../controllers/student.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createStudentSchema, updateStudentSchema } from "../validations/student.validation";

const router = Router();
router.use(authenticate);

// Self-service (student) routes — must be declared before the /:id routes.
router.get("/me/transcript", authorize("STUDENT"), studentController.getMyTranscript);

router.get("/", authorize("ADMIN", "INSTRUCTOR"), studentController.listStudents);
router.get("/:id", authorize("ADMIN", "INSTRUCTOR"), studentController.getStudent);
router.get("/:id/transcript", authorize("ADMIN", "INSTRUCTOR"), studentController.getTranscript);
router.post("/", authorize("ADMIN"), validate({ body: createStudentSchema }), studentController.createStudent);
router.put("/:id", authorize("ADMIN"), validate({ body: updateStudentSchema }), studentController.updateStudent);
router.delete("/:id", authorize("ADMIN"), studentController.deleteStudent);

export default router;
