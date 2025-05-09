// routes/adminRoutes.ts
import express from 'express';
import * as adminAppointmentController from '../controllers/adminAppointmentController';
import * as adminPaymentController from '../controllers/adminPaymentController';
import * as doctorController from '../controllers/doctor.controller';
import * as requestController from '../controllers/request.controller';
import { protectRoute, isAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

// Appointment routes
router.get('/appointments', protectRoute, isAdmin, adminAppointmentController.getAllAppointments);
router.get('/doctors/schedules', protectRoute, isAdmin, adminAppointmentController.getDoctorSchedules);
router.put('/appointments/:id', protectRoute, isAdmin, adminAppointmentController.updateAppointment);
router.put('/doctors/:id/schedule', protectRoute, isAdmin, adminAppointmentController.updateDoctorSchedule);

// Payment routes
router.get('/payments', protectRoute, isAdmin, adminPaymentController.getAllPayments);
router.get('/payments/summary', protectRoute, isAdmin, adminPaymentController.getPaymentsSummary);
router.get('/payments/:id', protectRoute, isAdmin, adminPaymentController.getPaymentById);
router.patch('/payments/:id/status', protectRoute, isAdmin, adminPaymentController.updatePaymentStatus);
router.post('/payments', protectRoute, isAdmin, adminPaymentController.createPayment);

// Doctor routes
router.get('/doctors', protectRoute, isAdmin, doctorController.getAllDoctors);
router.get('/doctors/:id', protectRoute, isAdmin, doctorController.getDoctorById);
router.put('/doctors/:id', protectRoute, isAdmin, doctorController.updateDoctor);
router.get('/doctors/:id/schedule', protectRoute, isAdmin, doctorController.getDoctorSchedule);
router.put('/doctors/:id/schedule', protectRoute, isAdmin, doctorController.updateDoctorSchedule);

// Request routes
router.get('/requests', protectRoute, isAdmin, requestController.getAllRequests);
router.get('/requests/doctor/:doctorId', protectRoute, isAdmin, requestController.getDoctorRequests);
router.patch('/requests/:requestId/status', protectRoute, isAdmin, requestController.updateRequestStatus);

export default router;