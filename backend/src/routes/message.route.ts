import express from "express";

import { protectRoute } from "../middlewares/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";
import { productionCheck } from "../middlewares/production.middleware.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, productionCheck, sendMessage);

export default router;