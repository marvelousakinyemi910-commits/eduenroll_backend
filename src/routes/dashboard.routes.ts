import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();
router.use(authenticate);

router.get("/student", authorize("STUDENT"), dashboardController.studentDashboard);
router.get("/admin", authorize("ADMIN"), dashboardController.adminDashboard);

export default router;
