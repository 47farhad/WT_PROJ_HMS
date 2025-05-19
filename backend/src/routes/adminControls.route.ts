// routes/adminControls.route.js - consolidated admin routes
import express from "express";
import { convertToAdmin, convertToDoctor, getPatientDetails, getPatients } from "../controllers/user.controller.js";
import { isAdmin, protectRoute } from "../middlewares/auth.middleware.js";
import * as adminPaymentController from "../controllers/adminPaymentController.js";
import * as adminAppointmentController from '../controllers/adminAppointmentController.js';
import * as adminDoctorController from '../controllers/adminDoctorController.js';
import * as requestController from '../controllers/request.controller.js';
import * as adminScheduleController from '../controllers/adminScheduleController.js';
import { isAdminOrDoc } from "../middlewares/admin.middleware.js";

const router = express.Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`Admin API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// User management routes
router.get('/getPatients', protectRoute, isAdminOrDoc, getPatients);
router.get('/getPatientDetails/:id', protectRoute, isAdminOrDoc, getPatientDetails);
router.patch('/convertPatientToDoctor/:id', protectRoute, isAdmin, convertToDoctor);
router.patch('/convertPatientToAdmin/:id', protectRoute, isAdmin, convertToAdmin);

// Payment routes
router.get("/payments", protectRoute, isAdmin, adminPaymentController.getAllPayments);
router.get("/payments/summary", protectRoute, isAdmin, adminPaymentController.getPaymentsSummary);
router.get("/payments/:id", protectRoute, isAdmin, adminPaymentController.getPaymentById);
router.patch("/payments/:id/status", protectRoute, isAdmin, adminPaymentController.updatePaymentStatus);

// Appointment routes (previously in adminRoutes.ts)
router.get('/appointments', protectRoute, isAdmin, adminAppointmentController.getAllAppointments);
router.get('/doctors/schedules', protectRoute, isAdmin, adminAppointmentController.getDoctorSchedules);
router.put('/appointments/:id', protectRoute, isAdmin, adminAppointmentController.updateAppointment);
router.put('/doctors/:id/schedule', protectRoute, isAdmin, adminAppointmentController.updateDoctorSchedule);

// Doctor routes (previously in adminRoutes.ts)
router.get('/doctors', protectRoute, isAdmin, adminDoctorController.getAllDoctors);
router.get('/doctors/:id', protectRoute, isAdmin, adminDoctorController.getDoctorById);
router.put('/doctors/:id', protectRoute, isAdmin, adminDoctorController.updateDoctor);
router.get('/doctors/:id/schedule', protectRoute, isAdmin, adminDoctorController.getDoctorSchedule);

// Request routes (previously in adminRoutes.ts)
router.get('/requests', protectRoute, isAdmin, requestController.getAllRequests);
router.get('/requests/doctor/:doctorId', protectRoute, isAdmin, requestController.getDoctorRequests);
router.patch('/requests/:requestId/status', protectRoute, isAdmin, requestController.updateRequestStatus);

// Admin Schedule Routes
router.get('/schedule', protectRoute, isAdmin, adminScheduleController.getScheduleData);
router.get('/schedule/doctors', protectRoute, isAdmin, adminScheduleController.getAllDoctorsWithSchedules);
router.get('/schedule/appointments', protectRoute, isAdmin, adminScheduleController.getAllAppointments);
router.put('/schedule/appointments/:id', protectRoute, isAdmin, adminScheduleController.updateAppointment);
router.put('/schedule/doctors/:id/workschedule', protectRoute, isAdmin, adminScheduleController.updateDoctorWorkSchedule);

export default router;