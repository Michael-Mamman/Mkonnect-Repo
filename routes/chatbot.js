import express from "express"; 
import { chatbot } from '../controllers/chatbot.js';
import logger from "../controllers/logs.js";
import { crash } from "../controllers/utils/utils.js";
import { active } from "../controllers/middleware/active.js";
import { optin } from "../controllers/middleware/optIn.js";
const router = express.Router();

router.get('/hakunamatata', crash);

router.post('/', active, optin, chatbot);

router.get("/", (req, res) => {
    /**
     * UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up the webhook
     **/
    const verify_token = process.env.VERIFY_TOKEN;
  
    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];
  
    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === "subscribe" && token === verify_token) {
        // Respond with 200 OK and challenge token from the request
        logger.info("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  });

export default router;
