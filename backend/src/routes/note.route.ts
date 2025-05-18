import express from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import { verifyDoctor } from "../middlewares/prescription.middleware";
import { createNote, getNoteByAppointmentId, getNotesByPatientId } from "../controllers/notes.controller";

const router = express.Router();

router.post('/createNote/:appointmentId', protectRoute, verifyDoctor, createNote);
router.get('/getNote/:appointmentId', protectRoute, getNoteByAppointmentId);
router.get('/getNotes/:patientId', protectRoute, getNotesByPatientId);

export default router;