import express from "express";

import { protectRoute } from "../middlewares/auth.middleware.js";
import { createOrder, getOrderDetails, getOrders } from "../controllers/order.controller.js";


const router = express.Router();

router.get('/getOrders', protectRoute, getOrders);
router.get('/getOrder/:orderId', protectRoute, getOrderDetails);
router.post('/createOrder', protectRoute, createOrder);

export default router;