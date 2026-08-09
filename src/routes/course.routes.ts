import { Router } from "express";
import * as courseController from "../controllers/course.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { courseSchema, updateCourseSchema } from "../validations/course.validation";

const router = Router();
router.use(authenticate);

router.get("/", courseController.listCourses);
router.get("/:id", courseController.getCourse);
router.post("/", authorize("ADMIN"), validate({ body: courseSchema }), courseController.createCourse);
router.put("/:id", authorize("ADMIN"), validate({ body: updateCourseSchema }), courseController.updateCourse);
router.delete("/:id", authorize("ADMIN"), courseController.deleteCourse);

export default router;
