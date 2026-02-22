import express from "express";

import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { productionCheck } from "../middlewares/production.middleware.js";

const router = express.Router();

router.post("/signup", productionCheck, signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/check", protectRoute, checkAuth);
router.put("/update-profile", protectRoute, productionCheck, updateProfile);

export default router;