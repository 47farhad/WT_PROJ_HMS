import express from "express";
import { 
  createAppointment,
  deleteAppointment,
  getAppointmentDetails,
  getAllAppointments
} from "../controllers/appointment.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { verifyPatient } from "../middlewares/appointment.middleware.js";

const router = express.Router();

router.post("/createAppointment", protectRoute, verifyPatient, createAppointment);
router.delete("/deleteAppointment/:id", protectRoute, deleteAppointment);
router.get("/getAppointment/:id", protectRoute, getAppointmentDetails);
router.get("/getAllAppointments", protectRoute, getAllAppointments);

export default router;