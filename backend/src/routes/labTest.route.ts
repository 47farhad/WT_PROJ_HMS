import express from "express";

import { createOfferedTest, getOfferedLabTests, deleteLabTest, updateOfferedTest } from "../controllers/labTest.controller.js";
import { isAdmin, protectRoute } from "../middlewares/auth.middleware.js";
import { productionCheck } from "../middlewares/production.middleware.js";


const router = express.Router();

router.post('/createTest', protectRoute, productionCheck, isAdmin, createOfferedTest);
router.get('/getTests', protectRoute, getOfferedLabTests);
router.delete('/deleteTest/:testId', protectRoute, productionCheck, isAdmin, deleteLabTest);
router.put('/updateTest/:testId', protectRoute, productionCheck, isAdmin, updateOfferedTest);

export default router;