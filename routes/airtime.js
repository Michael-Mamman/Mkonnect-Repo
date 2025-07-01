import express from "express"; 
import { airtime } from "../controllers/airtime.js";


const router = express.Router();

router.post('/', airtime);


export default router;
