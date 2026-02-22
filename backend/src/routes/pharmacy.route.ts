import express from "express";

import { isAdmin, protectRoute } from "../middlewares/auth.middleware.js";
import { createOfferedMedicine, deleteOfferedMedicine, getOfferedMedicine, updateOfferedMedicine } from "../controllers/pharmacy.controller.js";
import { productionCheck } from "../middlewares/production.middleware.js";


const router = express.Router();

router.post('/createMedicine', protectRoute, productionCheck, isAdmin, createOfferedMedicine);
router.get('/getMedicine', protectRoute, getOfferedMedicine);
router.delete('/deleteMedicine/:medicineId', protectRoute, productionCheck, isAdmin, deleteOfferedMedicine);
router.put('/updateMedicine/:medicineId', protectRoute, productionCheck, isAdmin, updateOfferedMedicine);

export default router;