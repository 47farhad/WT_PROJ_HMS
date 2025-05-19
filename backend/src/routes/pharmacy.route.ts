import express from "express";

import { isAdmin, protectRoute } from "../middlewares/auth.middleware.js";
import { createOfferedMedicine, deleteOfferedMedicine, getOfferedMedicine, updateOfferedMedicine } from "../controllers/pharmacy.controller.js";


const router = express.Router();

router.post('/createMedicine', protectRoute, isAdmin, createOfferedMedicine);
router.get('/getMedicine', protectRoute, getOfferedMedicine);
router.delete('/deleteMedicine/:medicineId', protectRoute, isAdmin, deleteOfferedMedicine);
router.put('/updateMedicine/:medicineId', protectRoute, isAdmin, updateOfferedMedicine);

export default router;