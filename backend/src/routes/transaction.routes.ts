import express from "express";
import { 
  getAllTransactions,
  getTransactionDetails,
  updateTransaction
} from "../controllers/transaction.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/getAllTransactions", protectRoute, getAllTransactions);
router.get("/getTransactionDetails/:id", protectRoute, getTransactionDetails);
router.put("/updateTransaction/:id",protectRoute, updateTransaction);

export default router;