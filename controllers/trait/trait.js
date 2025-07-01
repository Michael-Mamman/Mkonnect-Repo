import User from '../../models/users.js';
import logger from '../logs.js';
import { saveConversation, sendMessage, sendTemplateMessage, getIdanFacts, getFacts, sendFlowMessageEndpoint, sendFlow } from '../utils/utils.js';


export const trait = async (req, res, traits, senderNumber, responseMessage, messageBody, phone_number_id, text) => {
    try {

        if (traits['wit$greetings'] && traits['wit$greetings'][0].confidence > 0.9) {
    
          const user = await User.findOne({ phoneNumber: senderNumber });
          if (user && user.fullName){
    
          if (user.fullName && user.email && user.transactionPin){
            let fullname = user.fullName.split(" ")[0]
            let facts 
            try {
              
              //  facts = await getFacts();
              //  facts = facts[0].fact.toLowerCase()
               facts = "it is possible to feed 5000 people with just 5 loaves of bread and 2 fish"
            } catch (error) {
              logger.error(error.stack)
              facts = "it is possible to feed 5000 people with just 5 loaves of bread and 2 fish"
            }
            // let idan = await getIdanFacts();
            // idan = idan.joke
            // const idanJoke = idan.replace(/Chuck Norris/g, 'IDAN');
            responseMessage = `Welcome back ${fullname}, here's a fun fact for you. Did you know that ${facts}`;

            // responseMessage = 
            // "📢 *Important Update for Mkonnect Users* 🚨\n\n" +
            // "Hey " + user.fullName.split(" ")[0] + " 👋\n\n" +
            // "We want to keep you informed—due to a recent *tariff hike approved by the NCC*, data prices in Nigeria are increasing by *50%*.\n" +
            // "For example if a *1GB plan that used to cost ₦1,000 could now be around ₦1,500*.\n\n" +
            // "This change takes effect soon, so now might be a good time to *top up at the current rates* before the increase.\n\n" +
            // "We appreciate your support and will continue to provide you with the best deals possible! 💙\n\n" +
            // "For any questions, feel free to DM us. 📩\n\n" +
            // "*– Mkonnect Team*";
            


            const msg = await sendMessage(senderNumber, responseMessage, phone_number_id);
            await sendFlowMessageEndpoint(
              senderNumber,
              `menu_flow_${senderNumber}`,
              "1051816780241701",
              phone_number_id,
              `‎\nWhat would you like to do today? 🥳 \n‎`,
              "Menu",
              "MENU"
            )            
            const saveConvo = await saveConversation(senderNumber, "wit$greetings", messageBody, "responseMessage");
            res.sendStatus(200);
          }
          else{
            const email = user.email ?? null;
            const pin = user.transactionPin ?? null;
            
            const missingFields = [];
            if (!email) missingFields.push("Email");
            if (!pin) missingFields.push("Transaction Pin");
            
            if (missingFields.length > 0) {
              let fullname = user.fullName.split(" ")[0]
              const responseMessage = `Welcome back ${fullname} 🥳, looks like you have not completed the registration process yet. Please provide your ${missingFields.join(' and ')} 🔄.`;
              const msg = await sendMessage(senderNumber, responseMessage, phone_number_id);
              const saveConvo = await saveConversation(senderNumber, "wit$greetings", messageBody, responseMessage);
              res.sendStatus(200);
            }    
          }
        }else{
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
          const saveConvo = await saveConversation(senderNumber, "wit$greetings", messageBody, "unregistered_message");
          res.sendStatus(200);
        }
    
        } else if (traits['wit$bye'] && traits['wit$bye'][0].confidence > 0.9) {
          // Handle logic for bye
          let responseMessage = 'Goodbye!👋🏼 Have a great day!';
          const msg = await sendMessage(senderNumber, responseMessage, phone_number_id);
          const saveConvo = await saveConversation(senderNumber, "wit$bye", messageBody, responseMessage);
          res.sendStatus(200);
        }else{
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
        logger.error(`error processing traits: ${error.stack}`);
    }
}