import express from 'express';
import { 
  createTransaction, 
  getAllTransactions, 
  getTransactionById 
} from '../controllers/transaction.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { validateTransaction } from '../middlewares/transaction.middleware.js';

const router = express.Router();

router.post('/', protectRoute, validateTransaction, createTransaction as express.RequestHandler);
router.get('/', protectRoute, getAllTransactions );
router.get('/:id', protectRoute, getTransactionById as express.RequestHandler);

export default router;