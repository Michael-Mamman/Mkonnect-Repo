import phoneNumber from "../../models/phoneNumber.js";
import status from "../../models/status.js"
import logger from "../logs.js"
import { saveConversation, sendMessage, sendTemplateMessage } from "../utils/utils.js"

export const active = async (req, res, next) => {
  // console.log("===================================================================================")
  // console.log(JSON.stringify(req.body, null, 2)); // Stringify the object with indentation for better readability.
  // console.log("===================================================================================")

  try {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
      ) {
        
      let phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let senderNumber = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook 
      let phoneNumberIdCheck = await phoneNumber.find({ user: senderNumber})
      if (phoneNumberIdCheck.length > 0) {
        await phoneNumber.findOneAndUpdate({ user: senderNumber}, { WaId: phone_number_id})
      }else{
        await phoneNumber.create({ user: senderNumber, WaId: phone_number_id })
      }

      let sys_status = await status.find()
      if(sys_status.length > 0){
        // console.log("status found: ", sys_status[0].status)
        sys_status = sys_status[0].status
  
      }else{
        sys_status = await status.create({})
        // console.log(`status created:  ${sys_status.status}`)
        sys_status = sys_status.status
  
       }
  
      if (sys_status){
          next();
      }else{
        let responsemsg = `🔧 *Maintenance Notice* 🔧

Hey there! Just a quick heads up - We're currently undergoing maintenance to enhance our services and ensure better performance 🚀. As a result, all services are temporarily unavailable.

We apologize for any inconvenience caused and appreciate your patience. Our team is working diligently to complete the maintenance as quickly as possible.

Hang tight! We'll be back up and running smoother than ever in no time. Thanks you for your patience and understanding! 🙏`

const transactionDetails= 
"📢 *Important Update for Mkonnect Users* 🚨\n\n" +
"We want to keep you informed—due to a recent *tariff hike approved by the NCC*, data prices in Nigeria are increasing by *50%*.\n" +
"For example if a *1GB plan that used to cost ₦1,000 could now be around ₦1,500*.\n\n" +
"This change takes effect soon, so now might be a good time to *top up at the current rates* before the increase.\n\n" +
"We appreciate your support and will continue to provide you with the best deals possible! 💙\n\n" +
"For any questions, feel free to DM us. 📩\n\n" +
"*– Mkonnect Team*";

          const msg = sendMessage(senderNumber, responsemsg, phone_number_id)
          const msg2 = sendMessage(senderNumber, transactionDetails, phone_number_id)
          const saveConvo = await saveConversation(senderNumber, "maintainance", "maintainace", "maintainance");
          res.sendStatus(200);
        }
      }else {
        res.sendStatus(404);
      } 
  } catch (error) {
    logger.error(error.stack);

  }

}