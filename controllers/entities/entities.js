import plan_select from '../../models/plan.js';
import User from '../../models/users.js';
import { saveConversation, savePlan, sendFlowMessageEndpoint, sendMessage, sendTemplateMessage } from '../utils/utils.js';
import dotenv from 'dotenv';
import axios from 'axios';
import logger from '../logs.js';
import { validatePhoneNumber } from '../numberValidate.js';
dotenv.config();
const url = process.env.url
const FB_PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID
const KEY = process.env.KEY;


export const entity = async (req, res, entities, contactEntities, wit$contact, senderNumber, responseMessage, messageBody, phone_number_id, text) => {

    try {
                if (contactEntities && wit$contact && contactEntities[0].confidence > 0.7 && contactEntities.length > 0){
          const user = await User.findOne({ phoneNumber: senderNumber });
          if (!user.fullName) {
    
    
            let fullName = "";
            if ( entities[wit$contact][0].role == 'contact'){
              for (const contact of contactEntities) {fullName += contact.body + " ";}
    
              fullName = fullName.trim();

              const fullNamePattern = /^[A-Za-z]+(?:\s[A-Za-z]+)+$/;
              console.log(fullNamePattern.test(text)); 
              let nameValidate = fullNamePattern.test(text); 
              
              if (!nameValidate){
                  console.log("name not valid");
                  responseMessage = `Please provide your full name including your first and last name. For example, "Michael Jackson". 🔄`
                  const msg = await sendMessage(senderNumber, responseMessage, phone_number_id);
                  const saveConvo = await saveConversation(senderNumber, contactEntities[0].role, messageBody, responseMessage);
                  res.sendStatus(200);
              }else{

              let data = JSON.stringify({
                "fullName": text,
                "balance": 0,
                "phoneNumber": senderNumber
              });
              
              let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: url,
                headers: { 
                  'Authorization': KEY,
                  'Content-Type': 'application/json'
                },
                data : data
              };
              
              axios.request(config)
              .then(async (response) => {
                let firstname = fullName.split(" ")[0];
                responseMessage = `Almost there ${firstname} 🥳.`
                // const msg = await sendMessage(senderNumber, responseMessage, phone_number_id);
                // const tepmsg = await sendTemplateMessage(senderNumber, "email", phone_number_id);
                const msg = `

                Hey there! 👋 Welcome to MKonnect, your hub for seamless services and convenience! To get started, please register with us. Simply click the button below and follow the instructions. We're here to help you every step of the way. 🌟
        
        We're excited to have you join our community! If you need any assistance, feel free to reach out to our support line on WhatsApp using 07010705401. 🎉 \n‎ `
        
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
                const saveConvo = await saveConversation(senderNumber, contactEntities[0].role, messageBody, responseMessage);
                res.sendStatus(200);
              })
              .catch(async(error) => {  
                logger.error(error.stack);
                res.sendStatus(200);
              })
                }
              }
            }else{
              if(user.fullName && user.email && user.transactionPin){

                await sendFlowMessageEndpoint(
                  user.phoneNumber,
                  `menu_flow_${user.phoneNumber}`,
                  "1051816780241701",
                  id,
                  `‎\nWhat would you like to do today? 🥳 \n‎`,
                  "Menu",
                  "MENU"
                )               
                const saveConvo = await saveConversation(senderNumber, contactEntities[0].role, messageBody, "one_of_us");
              res.sendStatus(200);
              }else{
                const email = user.email ?? null;
                const pin = user.transactionPin ?? null;
                
                const missingFields = [];
                if (!email) missingFields.push("Email");
                if (!pin) missingFields.push("Transaction Pin");
                
                if (missingFields.length > 0) {
                  const responseMessage = `Welcome back ${user.fullName.split(" ")[0]} 🥳, looks like you have not completed the registration process yet. Please provide your ${missingFields.join(' and ')} 🔄.`;
                  const msg = await sendMessage(senderNumber, responseMessage, phone_number_id);
                  console.log(senderNumber, responseMessage, phone_number_id)
                  const saveConvo = await saveConversation(senderNumber, "wit$greetings", messageBody, responseMessage);
                  res.sendStatus(200);
                }                  
    
              }
              
            }
          }
          
          else if (contactEntities && entities['wit$phone_number:phone_number'][0].role ==="phone_number"){
              // Synchronous Usage
              const selected_plan = await plan_select.findOne({ senderNumber: senderNumber }).sort({ createdAt: -1 });
    
              if(selected_plan && selected_plan.network){
    
              let receiverNumber = entities['wit$phone_number:phone_number'][0].value;
              const numberValidate = validatePhoneNumber(receiverNumber);
              // console.log(numberValidate);
              
              // responseMessage = `${numberValidate.isValid} and ${numberValidate.telco}.`
              if (numberValidate.isValid == true){
    
                if (numberValidate.telco === selected_plan.network){
                  responseMessage = `Please enter your pin to complete the transaction 🔐`
                  const select_plan = await savePlan(receiverNumber, senderNumber)
                  const msg = await sendMessage(senderNumber, responseMessage, phone_number_id);
                  const saveConvo = await saveConversation(senderNumber, entities['wit$phone_number:phone_number'][0].role, messageBody, responseMessage);
                  res.sendStatus(200);
                }else{
                  responseMessage = `Looks like the phone number you entered is not a valid ${selected_plan.network} phone number, please check the number and try again 🔄`
                  const msg = await sendMessage(senderNumber, responseMessage, phone_number_id);
                  const saveConvo = await saveConversation(senderNumber, entities['wit$phone_number:phone_number'][0].role, messageBody, responseMessage);
                  res.sendStatus(200);
                }
    
              }else{
                  responseMessage = `Please enter a valid number 📞. Example: 07010705401`
                  const msg = await sendMessage(senderNumber, responseMessage, phone_number_id);
                  const saveConvo = await saveConversation(senderNumber, entities['wit$phone_number:phone_number'][0].role, messageBody, responseMessage);
                  res.sendStatus(200);
    
              }
            }else{
                responseMessage = `Please select a network and data plan first.`
                const msg = await sendMessage(senderNumber, responseMessage, phone_number_id);
                const saveConvo = await saveConversation(senderNumber, entities['wit$phone_number:phone_number'][0].role, messageBody, responseMessage)
                res.sendStatus(200);
    
            }
        } else {
            // No intents, traits, or contact entities found, respond with a default message    
            await sendFlowMessageEndpoint(
              senderNumber,
              `menu_flow_${senderNumber}`,
              "1051816780241701",
              phone_number_id,
              `‎\nSorry, I didn't understand that. Please try again. 😔 \n‎`,
              "Menu",
              "MENU"
            ) 
            const saveConvo = await saveConversation(senderNumber, "unrecognized", messageBody, responseMessage);
            res.sendStatus(200);
          }
    } catch (error) {
        logger.error(`error processing entities: ${error.stack}`);
        res.sendStatus(200);
    }
}