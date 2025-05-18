import express from "express";
import {
  createPrescription,
  getPrescription,
  getPrescriptionDetails,
  getPrescriptions
} from "../controllers/prescription.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { verifyDoctor } from "../middlewares/prescription.middleware.js";
const router = express.Router();

router.post("/createPrescription/:appointmentId", protectRoute, verifyDoctor, createPrescription);
router.get("/getPrescription/:appointmentId", protectRoute, getPrescription);
router.get("/getPrescriptions", protectRoute, getPrescriptions);
router.get("/getPrescriptionDetails/:prescriptionId", protectRoute, getPrescriptionDetails);

export default router;