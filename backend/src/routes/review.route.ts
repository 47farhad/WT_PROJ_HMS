import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { createReview, readReview } from "../controllers/review.controller.js";
import { productionCheck } from "../middlewares/production.middleware.js";

const router = express.Router();

router.post('/createReview/:appointmentId', protectRoute, productionCheck, createReview);
router.get('/getReview/:appointmentId', protectRoute, readReview);

export default router;