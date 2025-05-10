import express from "express";
import { 
  bookLabTest,
  getAllLabTests,
  getLabTestDetails,
  cancelLabTest
} from "../controllers/patientLabTest.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/bookLabTest",protectRoute,bookLabTest)
router.get("/getAllLabTests", protectRoute, getAllLabTests);
router.get("/getLabTestDetails/:id", protectRoute, getLabTestDetails);
router.put("/cancelLabTest/:id",protectRoute, cancelLabTest);

export default router;