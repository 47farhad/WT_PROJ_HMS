import express from "express";
import {
  bookLabTest,
  getAllLabTests,
  getLabTestDetails,
  cancelLabTest,
  uploadResult,
  getPatientDetailsLabReports
} from "../controllers/patientLabTest.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post("/bookLabTest", protectRoute, bookLabTest)
router.get("/getAllLabTests", protectRoute, getAllLabTests);
router.get("/getLabTestDetails/:id", protectRoute, getLabTestDetails);
router.put("/cancelLabTest/:id", protectRoute, cancelLabTest);
router.post('/uploadResult/:testId', protectRoute, isAdmin, upload.single('pdf'), uploadResult);
router.get('/patientDetailsReports/:patientId', protectRoute, isAdmin, getPatientDetailsLabReports);

export default router;