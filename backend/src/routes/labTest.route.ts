import express from "express";

import { createOfferedTest, getOfferedLabTests, deleteLabTest, updateOfferedTest } from "../controllers/labTest.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post('/createTest', protectRoute, isAdmin, createOfferedTest);
router.get('/getTests', protectRoute, getOfferedLabTests);
router.delete('/deleteTest/:testId', protectRoute, isAdmin, deleteLabTest);
router.put('/updateTest/:testId', protectRoute, isAdmin, updateOfferedTest);

export default router;