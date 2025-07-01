import express from "express";  
import { wallet } from '../controllers/wallet.js';

const router = express.Router();

// create user route
router.post("/", wallet);



export default router;
