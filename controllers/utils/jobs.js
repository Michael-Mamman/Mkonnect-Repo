import { Agenda } from "@hokify/agenda";
import Job from "../../models/job.js";
import dotenv from 'dotenv';
import logger from "../logs.js";
import { sendBulkMessage, sendMessage } from "./utils.js";
import phoneNumber from "../../models/phoneNumber.js";

dotenv.config();

const MONGODB_URI = process.env.NODE_ENV === 'production' ? process.env.uri : process.env.mongo_local;
const agenda = new Agenda({ db: { address: MONGODB_URI } });

// Define the job handling logic
agenda.define('sendBroadcast', async job => { 
    const jobs = await Job.find({ jobName: 'sendBroadcast', successful: false }).limit(5);

    for (const job of jobs) {
        let id = await phoneNumber.findOne({user: job.filter})
        id = id.WaId
        const send = sendBulkMessage(job.filter, job.message, job.messageType, job.imageUrl, id)
        if (send) {
            job.successful = true;
        } else {
            job.retry -= 1;
        }
        await job.save();
    }
});

// Function to start the agenda and schedule jobs
export async function startAgendaJobs(req, res) {
    try {
        await agenda.start();
        // logger.info("Agenda started");
        await agenda.every('*/1 * * * *', 'sendBroadcast');
        // logger.info("Broadcast job scheduled to run every minute.");
        res.send(true)
    } catch (error) {
        logger.error("Failed to start agenda or schedule jobs:", error.stack);
    }
}
