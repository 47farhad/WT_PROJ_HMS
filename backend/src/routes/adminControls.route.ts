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
import { productionCheck } from "../middlewares/production.middleware.js";

const router = express.Router();

// User management routes
router.get('/getPatients', protectRoute, isAdminOrDoc, getPatients);
router.get('/getPatientDetails/:id', protectRoute, isAdminOrDoc, getPatientDetails);
router.patch('/convertPatientToDoctor/:id', protectRoute, productionCheck, isAdmin, convertToDoctor);
router.patch('/convertPatientToAdmin/:id', protectRoute, productionCheck, isAdmin, convertToAdmin);

// Payment routes
router.get("/payments", protectRoute, isAdmin, adminPaymentController.getAllPayments);
router.get("/payments/summary", protectRoute, isAdmin, adminPaymentController.getPaymentsSummary);
router.get("/payments/:id", protectRoute, isAdmin, adminPaymentController.getPaymentById);
router.patch("/payments/:id/status", protectRoute, productionCheck, isAdmin, adminPaymentController.updatePaymentStatus);

// Appointment routes
router.get('/appointments', protectRoute, isAdmin, adminAppointmentController.getAllAppointments);
router.get('/doctors/schedules', protectRoute, isAdmin, adminAppointmentController.getDoctorSchedules);
router.put('/appointments/:id', protectRoute, productionCheck, isAdmin, adminAppointmentController.updateAppointment);
router.put('/doctors/:id/schedule', protectRoute, productionCheck, isAdmin, adminAppointmentController.updateDoctorSchedule);

// Doctor routes
router.get('/doctors', protectRoute, isAdmin, adminDoctorController.getAllDoctors);
router.get('/doctors/:id', protectRoute, isAdmin, adminDoctorController.getDoctorById);
router.put('/doctors/:id', protectRoute, productionCheck, isAdmin, adminDoctorController.updateDoctor);
router.get('/doctors/:id/schedule', protectRoute, isAdmin, adminDoctorController.getDoctorSchedule);

// Request routes
router.get('/requests', protectRoute, isAdmin, requestController.getAllRequests);
router.get('/requests/doctor/:doctorId', protectRoute, isAdmin, requestController.getDoctorRequests);
router.patch('/requests/:requestId/status', protectRoute, productionCheck, isAdmin, requestController.updateRequestStatus);

// Admin Schedule Routes
router.get('/schedule', protectRoute, isAdmin, adminScheduleController.getScheduleData);
router.get('/schedule/doctors', protectRoute, isAdmin, adminScheduleController.getAllDoctorsWithSchedules);
router.get('/schedule/appointments', protectRoute, isAdmin, adminScheduleController.getAllAppointments);
router.put('/schedule/appointments/:id', protectRoute, productionCheck, isAdmin, adminScheduleController.updateAppointment);
router.put('/schedule/doctors/:id/workschedule', protectRoute, productionCheck, isAdmin, adminScheduleController.updateDoctorWorkSchedule);

export default router;