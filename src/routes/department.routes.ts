import { Router } from "express";
import * as departmentController from "../controllers/department.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { departmentSchema, updateDepartmentSchema } from "../validations/department.validation";

const router = Router();

router.get("/", departmentController.listDepartments);
router.get("/:id", departmentController.getDepartment);
router.post("/", authenticate, authorize("ADMIN"), validate({ body: departmentSchema }), departmentController.createDepartment);
router.put("/:id", authenticate, authorize("ADMIN"), validate({ body: updateDepartmentSchema }), departmentController.updateDepartment);
router.delete("/:id", authenticate, authorize("ADMIN"), departmentController.deleteDepartment);

export default router;
