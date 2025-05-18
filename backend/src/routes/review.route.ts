import express from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import { createReview, readReview } from "../controllers/review.controller";

const router = express.Router();

router.post('/createReview/:appointmentId', protectRoute, createReview);
router.get('/getReview/:appointmentId', protectRoute, readReview)

export default router;