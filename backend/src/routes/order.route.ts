import express from "express";

import { protectRoute } from "../middlewares/auth.middleware.js";
import { createOrder } from "../controllers/order.controller.js";


const router = express.Router();

router.post('/createOrder', protectRoute, createOrder);

export default router;