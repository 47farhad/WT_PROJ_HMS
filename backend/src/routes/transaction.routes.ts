import express from "express";
import { 
  getTransactionDetails,
  getAllTransactions,
  updateTransaction
} from "../controllers/transaction.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.get("/getTransaction/:id", protectRoute, getTransactionDetails);
router.get("/getAllTransactions", protectRoute, getAllTransactions);
router.put("/updatetransactions/:id",protectRoute, updateTransaction);

export default router;