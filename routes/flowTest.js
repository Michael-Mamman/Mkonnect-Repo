import express from "express"; 
import { flowSetup } from "../controllers/flows/flowSetupTest.js";


const router = express.Router();

router.post('/', flowSetup);


export default router;
