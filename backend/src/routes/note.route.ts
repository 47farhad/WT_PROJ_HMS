import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { verifyDoctor } from "../middlewares/prescription.middleware.js";
import { createNote, getNoteByAppointmentId, getNotesByPatientId } from "../controllers/notes.controller.js";

const router = express.Router();

router.post('/createNote/:appointmentId', protectRoute, verifyDoctor, createNote);
router.get('/getNote/:appointmentId', protectRoute, getNoteByAppointmentId);
router.get('/getNotes/:patientId', protectRoute, getNotesByPatientId);

export default router;