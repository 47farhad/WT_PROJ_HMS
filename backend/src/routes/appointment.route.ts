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

router.post("/createAppointment", protectRoute, validateAppointment, createAppointment as express.RequestHandler);
router.get("/getAppointments", protectRoute, getAllAppointments as express.RequestHandler);
router.get("/getAppointment/:id", protectRoute, getAppointmentById as express.RequestHandler);
router.put("/:id", protectRoute, validateAppointment, updateAppointment as express.RequestHandler);

export default router;