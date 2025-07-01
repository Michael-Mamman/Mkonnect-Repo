import opt_status from "../../models/optIn.js";
import User from "../../models/users.js";
import logger from "../logs.js";
import dotenv from "dotenv";
import pkg from "node-wit";
import axios from "axios";
dotenv.config();

import {
  saveConversation,
  sendFlow,
  sendFlowMessage,
  sendTemplateMessage,
} from "../utils/utils.js";
import { flows } from "../flows/flows.js";
const { Wit, log } = pkg;
const witClient = new Wit({ accessToken: process.env.WIT_AI_ACCESS_TOKEN });


export const optin = async (req, res, next) => {
  try {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let senderNumber = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook
      let messageBody;
      let responseMessage;

      if (req.body.entry[0].changes[0].value.messages[0].type == "text") {
        messageBody = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
      } 
      else if (req.body.entry[0].changes[0].value.messages[0].type == "interactive") {

        await flows(req, res, senderNumber, phone_number_id, responseMessage);
        return

      } else {
        messageBody = req.body.entry[0].changes[0].value.messages[0].button.text;
      }
      let user = await User.findOne({ phoneNumber: senderNumber });
      let opt = await opt_status.findOne({ senderNumber: senderNumber });

      if (user) {
        if (user.consent === true) {
          next();
        } 
        
        else {
          const witResponse = await witClient.message(messageBody);
          const { intents, traits, entities, text } = witResponse;
          if (intents && intents.length > 0 && intents[0].confidence > 0.8) {
            if (intents[0].name == "opt_in") {
              await User.findOneAndUpdate(
                { phoneNumber: senderNumber },
                { consent: true }
              );
              // const msg = sendTemplateMessage(
              //   senderNumber,
              //   "opt_in_ok",
              //   phone_number_id
              // );
              const saveConvo = await saveConversation(
                senderNumber,
                "opt_in",
                messageBody,
                "opt_in_ok"
              );
              res.sendStatus(200);
            } else {
              // const msgg = await sendTemplateMessage(
              //   senderNumber,
              //   "opt_in_",
              //   phone_number_id
              // );
              const saveConvo = await saveConversation(
                senderNumber,
                "opt_in_",
                "opt_in_",
                "opt_in_"
              );
              res.sendStatus(200);
            }
          } else {
            // const msgg = await sendTemplateMessage(
            //   senderNumber,
            //   "opt_in_",
            //   phone_number_id
            // );
            const saveConvo = await saveConversation(
              senderNumber,
              "opt_in_",
              "opt_in_",
              "opt_in_"
            );
            res.sendStatus(200);
          }
        }
      } else {
        const witResponse = await witClient.message(messageBody);
        const { intents, traits, entities, text } = witResponse;
        if (intents && intents.length > 0 && intents[0].confidence > 0.8) {
          if (intents[0].name == "register") {
            await User.findOneAndUpdate(
              { phoneNumber: senderNumber },
              { consent: true }
            );
            // const msg = sendTemplateflow(
            //   senderNumber,
            //   "registration_flow",
            //   phone_number_id
            // );
            
            await sendFlowMessage(
              senderNumber,
              "register_flow",
              "470601328867010",
              phone_number_id,
              `‎ \nLet's get you registered 🚀\n‎`,
              "Start Registeration",
              "QUESTION_ONE"
            )
            const saveConvo = await saveConversation(
              senderNumber,
              "register",
              messageBody,
              "register"
            );
            res.sendStatus(200);
            return;
          }
        }
        console.log("opt in 3")
        const msg = `

        Hey there! 👋 Welcome to MKonnect, your hub for seamless services and convenience! To get started, please register with us. Simply click the button below and follow the instructions. We're here to help you every step of the way. 🌟

We're excited to have you join our community! If you need any assistance, feel free to reach out to our support line on WhatsApp using 08056115343. 🎉 \n‎ `

        await sendFlow(
          senderNumber,
          "register_flow",
          "470601328867010",
          phone_number_id,
          msg,
          "Start Registeration",
          "QUESTION_ONE",
          "Welcome to MKonnect",
          "Thank you for choosing MKonnect."
        )
        const saveConvo = await saveConversation(
          senderNumber,
          "new_user",
          "new_user",
          "new_user"
        );
        res.sendStatus(200);
      }
    }
  } catch (error) {
    console.log(JSON.stringify(req.body.entry[0].changes[0]))
    logger.error(error.stack);
  }
};
