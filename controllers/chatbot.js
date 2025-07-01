import dotenv from "dotenv";
import pkg from "node-wit";
import {
  saveConversation,
  sendFlowMessageEndpoint,
  sendMessage,
  sendTemplateMessage,
} from "./utils/utils.js";
import { intent } from "./intent/intent.js";
import { trait } from "./trait/trait.js";
import { entity } from "./entities/entities.js";
import logger from "./logs.js";
import { flows } from "./flows/flows.js";

const { Wit, log } = pkg;
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const url = process.env.url;
const phone_number_id = process.env.PHONE_NUMBER_ID;
const witClient = new Wit({ accessToken: process.env.WIT_AI_ACCESS_TOKEN });
let messageBody;

export const chatbot = async (req, res) => {
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      // console.log(req.body.entry[0].changes[0].value.messages[0].type);

      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let senderNumber = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let responseMessage;
      if (
        req.body.entry[0].changes[0].value.messages[0].type == "interactive"
      ) {
        await flows(req, res, senderNumber, phone_number_id, responseMessage);
      }
    
    else if (req.body.entry[0].changes[0].value.messages[0].type == "text") {
      messageBody = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
      await processMsg(
        messageBody,
        req,
        res,
        senderNumber,
        phone_number_id,
        responseMessage
      );
    } else {
      messageBody = req.body.entry[0].changes[0].value.messages[0].button.text; // extract the message text from the webhook payload
      await processMsg(
        messageBody,
        req,
        res,
        senderNumber,
        phone_number_id,
        responseMessage
      );
    }
  }
  } else {
    res.sendStatus(404);
  }
};

const processMsg = async (
  messageBody,
  req,
  res,
  senderNumber,
  phone_number_id,
  responseMessage
) => {
  try {
    // Use Wit.ai to analyze the user's message
    const witResponse = await witClient.message(messageBody);
    // Extract intent and entities from Wit.ai response
    const { intents, traits, entities, text } = witResponse;
    let contactEntities;
    const wit$contact = Object.keys(entities).find((key) =>
      key.includes("wit$contact")
    );
    const pin = Object.keys(entities).find((key) => key.includes("pin"));
    const phone_number = Object.keys(entities).find((key) =>
      key.includes("wit$phone_number")
    );

    if (wit$contact) {
      contactEntities = entities["wit$contact:contact"];
    } else if (pin) {
      contactEntities = entities["pin:pin"];
    } else if (phone_number) {
      contactEntities = entities["wit$phone_number:phone_number"];
    }

    if (intents && intents.length > 0 && intents[0].confidence > 0.88) {
      const processIntent = await intent(
        req,
        res,
        intents,
        senderNumber,
        responseMessage,
        messageBody,
        phone_number_id,
        text,
        entities,
        contactEntities,
        wit$contact
      );
    } else if (
      traits &&
      Object.keys(traits).length > 0 &&
      traits["wit$greetings"][0].confidence > 0.7
    ) {
      // console.log(traits);
      const processTrait = await trait(
        req,
        res,
        traits,
        senderNumber,
        responseMessage,
        messageBody,
        phone_number_id,
        text
      );
    } else if (entities && Object.keys(entities).length > 0) {
      const processEntities = await entity(
        req,
        res,
        entities,
        contactEntities,
        wit$contact,
        senderNumber,
        responseMessage,
        messageBody,
        phone_number_id,
        text
      );
    } else {
      await sendFlowMessageEndpoint(
        senderNumber,
        `menu_flow_${senderNumber}`,
        "1051816780241701",
        phone_number_id,
        `‎\nSorry, I didn't understand that. Please try again. 😔 \n‎`,
        "Menu",
        "MENU"
      ) 
      const saveConvo = await saveConversation(
        senderNumber,
        "unrecognized",
        messageBody,
        responseMessage
      );
      res.sendStatus(200);
    }
  } catch (error) {
    await sendFlowMessageEndpoint(
      senderNumber,
      `menu_flow_${senderNumber}`,
      "1051816780241701",
      phone_number_id,
      `‎\nWhat would you like to do today? 🎉\n‎`,
      "Menu",
      "MENU"
    )
    logger.error(`Error processing chatbot response: ${error.stack}`);
    res.sendStatus(200);
  }
};
