import express from "express";
import { 
  createAppointment,
  updateAppointment,
  getAppointmentDetails,
  getAllAppointments,
  getDoctors,
  getDoctor
} from "../controllers/appointment.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { verifyPatient } from "../middlewares/appointment.middleware.js";

const router = express.Router();

router.post("/createAppointment", protectRoute, verifyPatient, createAppointment);
router.put("/updateAppointment/:id", protectRoute, updateAppointment);
router.get("/getAppointment/:id", protectRoute, getAppointmentDetails);
router.get("/getAllAppointments", protectRoute, getAllAppointments);
router.get("/getDoctors", getDoctors);
router.get("/getDoctor/:id", getDoctor);

export default router;