import express from "express";

import { protectRoute } from "../middlewares/auth.middleware.js";
import { createOrder, getOrderDetails, getOrders } from "../controllers/order.controller.js";
import { productionCheck } from "../middlewares/production.middleware.js";


const router = express.Router();

router.get('/getOrders', protectRoute, getOrders);
router.get('/getOrder/:orderId', protectRoute, getOrderDetails);
router.post('/createOrder', protectRoute, productionCheck, createOrder);

export default router;