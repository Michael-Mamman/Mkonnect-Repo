import express from "express";  
import { createJob, sendBulkMessage } from "../controllers/utils/utils.js";
import { startAgendaJobs } from "../controllers/utils/jobs.js";

const router = express.Router();

// create user route
router.post("/", createJob, startAgendaJobs);



export default router;
