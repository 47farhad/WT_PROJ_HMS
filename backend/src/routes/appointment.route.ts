import express from "express";
import { 
  createAppointment,
  updateAppointment,
  getAppointmentDetails,
  getAllAppointments,
  getDoctors,
  getDoctor,
  getPatientDetailsAppointments,
  getDoctorAppointmentStats
} from "../controllers/appointment.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { verifyPatient } from "../middlewares/appointment.middleware.js";
import { isAdminOrDoc } from "../middlewares/admin.middleware.js";

const router = express.Router();

// Create a new appointment
router.post("/createAppointment", protectRoute, verifyPatient, createAppointment);

// Update an existing appointment
router.put("/updateAppointment/:id", protectRoute, updateAppointment);

// Get details of a specific appointment
router.get("/getAppointment/:id", protectRoute, getAppointmentDetails);

// Get all appointments for the logged-in user
router.get("/getAllAppointments", protectRoute, getAllAppointments);
router.get("/getPatientDetailsAppointment/:patientId", protectRoute, isAdminOrDoc, getPatientDetailsAppointments);
router.get("/getDoctors", getDoctors);

// Get a specific doctor's details
router.get("/getDoctor/:id", getDoctor);
router.get('/getDoctorStats/:doctorId', getDoctorAppointmentStats);


export default router;