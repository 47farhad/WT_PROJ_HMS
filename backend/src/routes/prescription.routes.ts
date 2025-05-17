import express from "express";
import { 
  createPrescription,
  getPrescription
} from "../controllers/prescription.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { verifyDoctor } from "../middlewares/prescription.middleware.js";
const router = express.Router();

router.post("/createPrescription/:id", protectRoute ,verifyDoctor, createPrescription);
router.get("/getPrescription/:appointmentId", protectRoute, getPrescription);

export default router;