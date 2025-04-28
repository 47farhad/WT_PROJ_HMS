import express from "express";
import { 
  createAppointment, 
  getAllAppointments, 
  getAppointmentById,
  updateAppointment  
} from "../controllers/appointment.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { validateAppointment } from "../middlewares/appointment.middleware.js";

const router = express.Router();

router.post("/", protectRoute, validateAppointment, createAppointment as express.RequestHandler);
router.get("/", protectRoute, getAllAppointments as express.RequestHandler);
router.get("/:id", protectRoute, getAppointmentById as express.RequestHandler);
router.put("/:id", protectRoute, validateAppointment, updateAppointment as express.RequestHandler);

export default router;