import express from "express";

import { convertToDoctor, getPatientDetails, getPatients } from "../controllers/adminControls.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.get('/getPatients', protectRoute, isAdmin, getPatients);
router.get('/getPatientDetails/:id', protectRoute, isAdmin, getPatientDetails)
router.patch('/convertPatientToDoctor/:id', protectRoute, isAdmin, convertToDoctor)

export default router;