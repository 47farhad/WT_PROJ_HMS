import express from "express";

import { getPatients } from "../controllers/adminControls.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.get('/getPatients', protectRoute, isAdmin, getPatients);

export default router;