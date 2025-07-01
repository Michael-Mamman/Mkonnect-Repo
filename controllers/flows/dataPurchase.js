import status from "../../models/status.js";
import User from "../../models/users.js";
import { dataRetry } from "../data.js";
import { validatePhoneNumber } from "../numberValidate.js";
import FlowDataPlan from "../../models/flowDataplans.js";
import FlowDataPlanUsuf from "../../models/flowDataplansUsuf.js";
import logger from "../logs.js";
import axios from "axios";
import {
  convertToInternationalFormat,
  dataPlanRetry,
  getBankAccountDetails,
  getFacts,
  saveFailedtransaction,
  ProcessData,
  saveConversation,
  savetransaction,
  sendFlowMessageEndpoint,
  sendMessage,
  sendTransactionEmail,
} from "../utils/utils.js";
import dotenv from "dotenv";
dotenv.config();
const phone_number_id = process.env.PHONE_NUMBER_ID;

export const dataPurchaseFlow = async (network, number, plan, pin, senderNumber, alternative, plan_type) => {
  try {
    // (1, "07030034134", 212, data.pin, senderNumber)
    // (network, mobileNumber, plan, pin, senderNumber)
  let responseMessage;
  let finalResponse;
  let vendorStatus = await status.find();
  let user = await User.findOne({ phoneNumber: senderNumber });

  let vendor = vendorStatus[0].vendor;  

  // if (network.toLowerCase() === "airtel") {
    
  //   console.log("hardcoding usuf for airtel transactions");
  //   vendor = FlowDataPlan;

  //   // vendor = "usufdata";
  //   // if (vendor == "karldata") {
  //   //   vendor = FlowDataPlanUsuf ;
  //   // } else {
  //   //   vendor = FlowDataPlan;
  //   // }


  // }else{

    if (vendor == "karldata") {
      vendor = FlowDataPlan;
    } else {
      vendor = FlowDataPlanUsuf;
    }

  // }


  // let planVerify = await vendor.findOne({ id: plan});

  
     
            let config = {
                      method: "get",
                      maxBodyLength: Infinity,
                      url: "https://usufdataservice.com/api/user",
                      headers: {
                        Authorization: `Token 4ef79bc0d15c52267c9321863699544283ae99d8`,
                      },
                    };
            
                    const p = [];
                    let response = await axios.request(config);
            
                    console.log(" Network issssssssssssssssssss ", network);
                    let newtworkDataPlan;
            
                    switch (network) {
                      case "9MOBILE":
                        newtworkDataPlan = "9MOBILE_PLAN";
                        break;
                      case "MTN":
                        newtworkDataPlan = "MTN_PLAN";
                        break;
                      case "AIRTEL":
                        newtworkDataPlan = "AIRTEL_PLAN";
                        break;
                      case "GLO":
                        newtworkDataPlan = "GLO_PLAN";
                        break;
                      default:
                        newtworkDataPlan = "AIRTEL_PLAN"; // Optional default
                        break;
                    }
            
                    response = response.data.Dataplans[newtworkDataPlan].ALL;
                    
                    
                    let planVerify = response.find(response => Number(response.id) == plan);
                    
                    console.log("Plan Verify deatails: ", planVerify);
                    
                    //   let planVerify = await vendor.findOne({
                    //   id: plan,
                    // });


  const numberValidate = validatePhoneNumber(number);
  if (numberValidate.isValid == true) {
    if (numberValidate.telco === network) {
      if (planVerify != null) {
        const sellingAmount = Math.ceil(parseFloat(planVerify.plan_amount) * 1.05); // Add 3% profit and round up

        let balance = parseFloat(user.balance) - parseFloat(sellingAmount);

        const amountNeeded = Math.abs(
          parseFloat(user.balance) - parseFloat(sellingAmount)
        );

        if (balance != 0 && balance < 0) {
          responseMessage = `You need to add ₦${amountNeeded} to your wallet to purchase this plan. Please fund your wallet and try again.`;

          const user = await User.findOne({ phoneNumber: senderNumber });

          let bankAccountDetails = await getBankAccountDetails(user.phoneNumber);
          bankAccountDetails = bankAccountDetails.replace(/\*/g, '');

          const saveConvo = await saveConversation(
            senderNumber,
            "buy data flow",
            `${network} ${number} ${plan} ${pin} ${senderNumber}`, 
            responseMessage
          );
          
          finalResponse = `${responseMessage}\n\n${bankAccountDetails}`;

          return {
            "status": false,
            "message": finalResponse
          }

        } 
        
        else if (user.transactionPin == pin) {
            try {

              return {
                "status": true,
                "message": "validated"
              }
            } catch (error) {
              logger.error(error.stack);
            }
          }
        
        else {

          let responseMessage = `Uh-oh! 😬 It looks like the transaction PIN you entered is incorrect. Please double-check your PIN and try again. If problems persist, contact our support team for assistance.`;

          const saveConvo = await saveConversation(
            senderNumber,
            "wrong__pin",
            `${network} ${number} ${plan} ${pin} ${senderNumber}`, 
            "wrong__pin"
          );

          return {
            "status": false,
            "message": responseMessage
          }
        }
      }
    } else {
      responseMessage = `Looks like the phone number you entered is not a valid ${network} phone number, please check the number and try again 🔄`;

      const saveConvo = await saveConversation(
        senderNumber,
        "phone",
        "phone",
        responseMessage
      );

      return {
        "status": false,
        "message": responseMessage
      }

    }
  } else {
    responseMessage = `Please enter a valid number 📞. Example: 08056115343`;

    const saveConvo = await saveConversation(
      senderNumber,
      "phone",
      "phone",
      responseMessage
    );

    return {
        "status": false,
        "message": responseMessage
      }
  }

} catch (error) {
  console.log(error.stack);
  logger.error(error.stack);
}

};



// Background retry function (does not block the request)
async function processRetryInBackground(network, planVerify, senderNumber, number, balance, alternative, plan_type) {
    try {
      const backup = await dataPlanRetry(network, planVerify.Size);
      let count = 0;
  
      if (network != "AIRTEL") {
        const userUpdate = await User.findOneAndUpdate(
          { phoneNumber: senderNumber },
          { $set: { balance: balance.toString() } },
          { new: true }
        );
  
        for (const id of backup) {
          count += 1;
          console.log(`Retrying with backup ID: ${id.id}`);
  
          const payload = await dataRetry(network, number, id.id);
          console.log("Retry Response:", payload);
  
          if (payload.Status == "successful") {
            let responsemsg = await getDataSuccessMessage(balance);
            let profit = parseFloat(planVerify.plan_amount) - parseFloat(payload.plan_amount);
  
            await savetransaction(
              senderNumber,
              payload.mobile_number,
              payload.plan_network,
              `${payload.plan_name}-${count}`,
              planVerify.plan_amount,
              profit,
              payload.id
            );
            
            await sendFlowMessageEndpoint(
                senderNumber,
                `menu_flow_${senderNumber}`,
                "1051816780241701",
                phone_number_id,
                responsemsg,                        
                "Menu",
                "MENU"
            )
            await sendTransactionEmail(
              "data",
              userUpdate.email,
              "Transaction Receipt🚀🚀🚀",
              userUpdate.fullName,
              userUpdate.email,
              senderNumber,
              payload.mobile_number,
              payload.plan_network,
              payload.plan_name,
              planVerify.plan_amount,
              payload.id
            );
  
            await saveConversation(senderNumber, "data__success", "data__success", responsemsg);
            
            console.log("Transaction retry was successful.");
            return;
          }
        }
      }
  
      console.log("All retries failed. Handling failed transaction...");
      await handleFailedTransaction(senderNumber, planVerify, number, network, alternative, plan_type);
    } catch (error) {
      console.error("Error in retry process:", error);
      logger.error(`Retry process error: ${error}`);
    }
  }
  
  // Function to handle failed transactions
  async function handleFailedTransaction(senderNumber, planVerify, number, network, alternative, plan_type) {
    let user = await User.findOne({ phoneNumber: senderNumber });
    let newBalance = parseFloat(user.balance) + parseFloat(planVerify.plan_amount);
  
    await User.findOneAndUpdate(
      { phoneNumber: senderNumber },
      { $set: { balance: newBalance.toString() } },
      { new: true }
    );
  
    let responseMessage = await sendFailedTransactionMessage(user.fullName.split(" ")[0], alternative, plan_type);

    await sendFlowMessageEndpoint(
        senderNumber,
        `menu_flow_${senderNumber}`,
        "1051816780241701",
        phone_number_id,
        responseMessage,                        
        "Menu",
        "MENU"
    )
  
    await saveFailedtransaction(
      senderNumber,
      number,
      network,
      planVerify.Size,
      planVerify.plan_amount,
      "Failed after multiple retries"
    );
  
    await saveConversation(senderNumber, "data_fail_", "data_fail_", "data_fail_");
  
    console.log("Final transaction failed. User has been refunded.");
  }


async function getDataSuccessMessage(balance) {
  // Construct the base message
  let message = `🎉 Your data purchase was successful!`;

  // Add balance info only if it's provided
  if (balance !== null && balance !== undefined) {
    message += `Balance: ₦${balance}. Time to surf the web, stream your favorites, and stay connected like never before! 🌟`;
  }

  // Add the rest of the message
  message += `💡 Stay productive, entertained, and connected every day of the year! We've got you covered. 
  Questions? We're here for you! Check your balance anytime with *323#. 📲\n \n 🚨PLEASE USE PAYSTACK TITAN TO MAKE DEPOSITS AS WEMA BANK IS HAVING ISSUES.`;

  return message;
}



async function sendFailedTransactionMessage(name, alternative, plan_type) {

    let message =  `⚠️ Sorry! the ${plan_type} data plan you selected isn't available right now. No worries! 😊 You can try again with ${alternative.title} data plans instead or try again, in 5-10 minutes 🔄 and if the problem persists, reach out to our support team on WhatsApp using +2348056115343 for assistance. We apologize for any inconvenience and appreciate your understanding.`;
  
    return message;
  }



                // const userUpdate = await User.findOneAndUpdate(
              //   { phoneNumber: senderNumber },
              //   { $set: { balance: balance.toString() } },
              //   { new: true }
              // );
          
              // let transactionDetails;
              // const internationalNumber = await convertToInternationalFormat(number);
        
          
              // transactionDetails =
              //   "📢 *Important Update for Mkonnect Users* 🚨\n\n" +
              //   "Hey " +
              //   user.fullName.split(" ")[0] +
              //   " 👋\n\n" +
              //   "We want to keep you informed—due to a recent *tariff hike approved by the NCC*, data prices in Nigeria are increasing by *50%*.\n" +
              //   "For example if a *1GB plan that used to cost ₦1,000 could now be around ₦1,500*.\n\n" +
              //   "This change takes effect soon, so now might be a good time to *top up at the current rates* before the increase.\n\n" +
              //   "We appreciate your support and will continue to provide you with the best deals possible! 💙\n\n" +
              //   "For any questions, feel free to DM us. 📩\n\n" +
              //   "*– Mkonnect Team*";
          
              // let payload = await ProcessData(network, plan, number);
          
              // if (payload.Status == "successful") {
              //   let responsemsg = await getDataSuccessMessage(balance);
              //   let profit = parseFloat(planVerify.plan_amount) - parseFloat(payload.plan_amount);
          
              //   await savetransaction(
              //     senderNumber,
              //     payload.mobile_number,
              //     payload.plan_network,
              //     payload.plan_name,
              //     planVerify.plan_amount,
              //     profit,
              //     payload.id
              //   );
          
              //   await sendTransactionEmail(
              //     "data",
              //     userUpdate.email,
              //     "Transaction Receipt🚀🚀🚀",
              //     userUpdate.fullName,
              //     userUpdate.email,
              //     senderNumber,
              //     payload.mobile_number,
              //     payload.plan_network,
              //     payload.plan_name,
              //     planVerify.plan_amount,
              //     payload.id
              //   );
          
              //   await saveConversation(senderNumber, "data__success", transactionDetails, responsemsg);
          
              //   return { "status": true, "message": responsemsg };
              // } else {
              //   console.log("Initial purchase failed, initiating retry in background...");
          
              //   // Run the retry process in the background
              //   processRetryInBackground(network, planVerify, senderNumber, number, balance, alternative, plan_type);
                
              //   let facts = await getFacts();
              //   facts = facts[0].fact.toLowerCase();

              //   return {
              //     "status": true,
              //     "message": `Your transaction is being proccesed, while you wait, here's a fun fact for you. Did you know that ${facts}.`,
              //   };
              // }