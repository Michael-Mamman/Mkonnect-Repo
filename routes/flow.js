import express from "express"; 
import { flowSetup } from "../controllers/flows/flowSetup.js";


const router = express.Router();

router.post('/', flowSetup);


export default router;
