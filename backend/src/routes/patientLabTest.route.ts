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
import { isAdminOrDoc } from "../middlewares/admin.middleware.js";
import multer from 'multer';
import { productionCheck } from "../middlewares/production.middleware.js";

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post("/bookLabTest", protectRoute, productionCheck, bookLabTest)
router.get("/getAllLabTests", protectRoute, getAllLabTests);
router.get("/getLabTestDetails/:id", protectRoute, getLabTestDetails);
router.put("/cancelLabTest/:id", protectRoute, productionCheck, cancelLabTest);
router.post('/uploadResult/:testId', protectRoute, productionCheck, isAdminOrDoc, upload.single('pdf'), uploadResult);
router.get('/patientDetailsReports/:patientId', protectRoute, isAdminOrDoc, getPatientDetailsLabReports);

export default router;