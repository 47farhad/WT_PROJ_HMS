import express from "express";

import { getPatientDetails, getPatients } from "../controllers/adminControls.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.get('/getPatients', protectRoute, isAdmin, getPatients);
router.get('/getPatientDetails/:id', protectRoute, isAdmin, getPatientDetails)

export default router;