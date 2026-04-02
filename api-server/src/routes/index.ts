import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import staffRouter from "./staff.js";
import patientsRouter from "./patients.js";
import appointmentsRouter from "./appointments.js";
import treatmentsRouter from "./treatments.js";
import inventoryRouter from "./inventory.js";
import billingRouter from "./billing.js";
import tasksRouter from "./tasks.js";
import sterilizationRouter from "./sterilization.js";
import chatRouter from "./chat.js";
import analyticsRouter from "./analytics.js";
import promotionsRouter from "./promotions.js";
import bookingsRouter from "./bookings.js";
import sopsRouter from "./sops.js";

const router = Router();

router.use("/", healthRouter);
router.use("/auth", authRouter);
router.use("/staff", staffRouter);
router.use("/patients", patientsRouter);
router.use("/appointments", appointmentsRouter);
router.use("/treatments", treatmentsRouter);
router.use("/inventory", inventoryRouter);
router.use("/billing", billingRouter);
router.use("/tasks", tasksRouter);
router.use("/sterilization", sterilizationRouter);
router.use("/chat", chatRouter);
router.use("/analytics", analyticsRouter);
router.use("/promotions", promotionsRouter);
router.use("/bookings", bookingsRouter);
router.use("/sops", sopsRouter);

export default router;
