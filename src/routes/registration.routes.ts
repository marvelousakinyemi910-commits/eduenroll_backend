import { Router } from "express";
import * as registrationController from "../controllers/registration.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createRegistrationSchema, updateRegistrationStatusSchema } from "../validations/registration.validation";

const router = Router();
router.use(authenticate);

router.post("/", authorize("STUDENT"), validate({ body: createRegistrationSchema }), registrationController.register);
router.delete("/:id", authorize("STUDENT"), registrationController.drop);
router.get("/student", authorize("STUDENT"), registrationController.myRegistrations);
router.get("/timetable", authorize("STUDENT"), registrationController.myTimetable);
router.get("/course/:id", authorize("ADMIN", "INSTRUCTOR"), registrationController.courseRegistrations);
router.patch(
  "/:id/status",
  authorize("ADMIN"),
  validate({ body: updateRegistrationStatusSchema }),
  registrationController.updateStatus
);

export default router;
