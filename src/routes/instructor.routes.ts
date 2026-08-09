import { Router } from "express";
import * as instructorController from "../controllers/instructor.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createInstructorSchema, updateInstructorSchema } from "../validations/instructor.validation";

const router = Router();
router.use(authenticate);

router.get("/", instructorController.listInstructors);
router.get("/:id", instructorController.getInstructor);
router.post("/", authorize("ADMIN"), validate({ body: createInstructorSchema }), instructorController.createInstructor);
router.put("/:id", authorize("ADMIN"), validate({ body: updateInstructorSchema }), instructorController.updateInstructor);
router.delete("/:id", authorize("ADMIN"), instructorController.deleteInstructor);

export default router;
