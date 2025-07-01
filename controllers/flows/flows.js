import AdminUser from "../../models/admin.js";
import airtime from "../../models/airtime.js";
import FlowDataPlan from "../../models/flowDataplans.js";
import FlowDataPlanUsuf from "../../models/flowDataplansUsuf.js";
import opt_status from "../../models/optIn.js";
import pendingPowerTransactions from "../../models/pendingPowerTransaction.js";
import power from "../../models/power.js";
import powerTransactions from "../../models/powerTransactions.js";
import saveMeter from "../../models/saveMeter.js";
import status from "../../models/status.js";
import User from "../../models/users.js";
import { data, dataRetry } from "../data.js";
import logger from "../logs.js";
import { validatePhoneNumber } from "../numberValidate.js";
import axios from "axios";
import {
  createCustomer,
  createDedicatedAccount,
  initializeTransaction,
} from "../paystack.js";
import {
  ProcessAirtime,
  ProcessData,
  checkBalance,
  convertToInternationalFormat,
  createBankDetails,
  dataPlanRetry,
  fetchMeterValidation,
  generateReceipt,
  getBankAccountDetails,
  getFacts,
  mailchimpContact,
  makeBillPayment,
  marketingMsg,
  saveConversation,
  saveFailedtransaction,
  savetransaction,
  sendDocMessage,
  sendEmail,
  sendFlow,
  sendFlowMessage,
  sendFlowMessageEndpoint,
  sendMediaMessage,
  sendMessage,
  sendTemplateMessage,
  sendTokenReceipt,
  sendTransactionEmail,
  sendVendorBalanceEmail,
  updateBankDetails,
} from "../utils/utils.js";
import { getPlanType } from "./flowResponseTest.js";



export const flows = async (
  req,
  res,
  senderNumber,
  phone_number_id,
  responseMessage
) => {
  let user = await User.findOne({ phoneNumber: senderNumber });
  let facts
  let transactionDetails;
  if (user) {
    if (user.consent === true) {
      const responseJsonString =
        req.body.entry[0].changes[0].value.messages[0].interactive.nfm_reply
          .response_json;
      const responseJson = JSON.parse(responseJsonString);
      const flowTokenMain = responseJson.flow_token;
      const flowTokenMainBackup = responseJson.flow_token_new;
      // const fromNumber = req.body.entry[0]?.changes[0]?.value?.messages[0]?.from || "No sender found";
      // console.log("CHECKING ALTERNATIVE SENDER NUMBER: " + fromNumber);

      // TODO: 
      const data_plan_type = responseJson?.data_plan_type ?? null;


      const [flowToken, senderNumberBk] = flowTokenMain.split(/_(?=\d+$)/);
            
      console.log("Phone Number:", senderNumberBk); // "2347030034134"
      console.log("Flow Token:", flowToken);   // `menu_flow_${senderNumber}`
      const input = responseJson.screen_0_RadioButtonsGroup_0;
      // let amount = responseJson.screen_0_TextInput_0;

      console.log(responseJson);
      // logger.info(`id: ${req.body.entry[0].changes[0].value.messages[0].id}`)
      // logger.info(`context_id: ${req.body.entry[0].changes[0].value.messages[0].context.id}`)
      if (flowToken == "menu_flow") {
        const flowId = responseJson.id;
        // airtime flow
        if (flowId == "airtime_flow") {
          const parts = input.split("_");

          let network = parts[1]; // This will give you "MTN"
          let pin = responseJson.screen_2_TextInput_0;
          let amount = parseInt(responseJson.screen_1_TextInput_0);
          let amount_needed = Math.abs(
            parseFloat(user.balance) - parseFloat(amount)
          );
          let recipient = responseJson.screen_1_TextInput_1;

          if (amount > 50 || amount == 50) {
            if (
              parseFloat(user.balance) == parseFloat(amount) ||
              parseFloat(user.balance) > parseFloat(amount)
            ) {
              if (user.transactionPin == pin) {
                let validateNumber = validatePhoneNumber(recipient);

                if (validateNumber.isValid == true) {
                  if (validateNumber.telco === network) {
                    const internationalNumber = await convertToInternationalFormat(recipient);
                    facts = await getFacts();
                    facts = facts[0].fact.toLowerCase()
                    if(senderNumber == internationalNumber){
                       transactionDetails = `We're processing your airtime purchase ${user.fullName.split(" ")[0]}, while you wait, here's a fun fact for you, did you know that ${facts} 💡`

                    } else if (senderNumber != internationalNumber){
                      transactionDetails = `We're sending airtime to ${recipient}, while you wait, here's a fun fact for you, did you know that ${facts} 💡`
                    } else{
                      transactionDetails = `Your airtime is on the way, while you wait, here's a fun fact for you, did you know that ${facts} 💡`
                    }

                    // transactionDetails= 
                    // "📢 *Important Update for Mkonnect Users* 🚨\n\n" +
                    // "Hey " + user.fullName.split(" ")[0] + " 👋\n\n" +
                    // "We want to keep you informed—due to a recent *tariff hike approved by the NCC*, data prices in Nigeria are increasing by *50%*.\n" +
                    // "For example if a *1GB plan that used to cost ₦1,000 could now be around ₦1,500*.\n\n" +
                    // "This change takes effect soon, so now might be a good time to *top up at the current rates* before the increase.\n\n" +
                    // "We appreciate your support and will continue to provide you with the best deals possible! 💙\n\n" +
                    // "For any questions, feel free to DM us. 📩\n\n" +
                    // "*– Mkonnect Team*";
                    
                    
                    const msg = await sendMessage(
                      senderNumber,
                      transactionDetails,
                      phone_number_id
                    );

                    let payload = await ProcessAirtime(
                      network,
                      amount,
                      recipient
                    );
                    // console.log(payload);

                    if (payload.Status == "successful") {
                      // const msg = await sendTemplateMessage(
                      //   senderNumber,
                      //   "airtime_success",
                      //   phone_number_id
                      // );                                            
                      let newBalance = parseFloat(user.balance) - parseFloat(amount);
                      let responsemsg = `🎉 Hooray! Your airtime purchase was a success! 🥳
Your new balance is ₦${newBalance} 💰. Stay connected, make those calls, and enjoy uninterrupted vibes! 📱✨

Need help or got questions? We're just a message away! 😊
Check your airtime balance anytime with *✨ 310# ✨`
                      const msg = await sendMessage(
                        senderNumber,
                        responsemsg,
                        phone_number_id
                      );

                      const userUpdate = await User.findOneAndUpdate(
                        { phoneNumber: senderNumber },
                        { $set: { balance: newBalance.toString() } },
                        { new: true }
                      );
                      let airtime_type = payload.airtime_type;
                      let plan_amount = payload.amount;
                      let id = payload.id;
                      let profit = amount - parseFloat(payload.paid_amount);

                      try {
                        const Transaction = new airtime({
                          senderNumber,
                          recipient,
                          network,
                          airtime_type,
                          profit,
                          plan_amount,
                          id,
                        });

                        await Transaction.save();
                      } catch (error) {
                        logger.error(
                          `error saving transaction: ${error.stack}`
                        );
                      }

                      await sendTransactionEmail(
                        "airtime",
                        userUpdate.email,
                        "Transaction Reciept🚀🚀🚀",
                        userUpdate.fullName,
                        userUpdate.email,
                        senderNumber,
                        recipient,
                        network,
                        airtime_type,
                        amount,
                        payload.id
                      );

                      const saveConvo = await saveConversation(
                        senderNumber,
                        "airtime",
                        "airtime",
                        "airtime_success"
                      );

                      res.sendStatus(200);
                    } else {
                      // const msg = await sendTemplateMessage(
                      //   senderNumber,
                      //   "airtime_fail",
                      //   phone_number_id
                      // );
                  
                    await sendFailedTransactionMessage(user.fullName.split(" ")[0], senderNumber, phone_number_id)

                      const saveConvo = await saveConversation(
                        senderNumber,
                        "buy_airtime",
                        "airtime",
                        "airtime_fail"
                      );
                      res.sendStatus(200);
                    }
                  } else {
                    responseMessage = `Looks like the phone number you entered is not a valid ${network} phone number, please check the number and try again 🔄`;
                    const msg = await sendMessage(
                      senderNumber,
                      responseMessage,
                      phone_number_id
                    );
                    const msgflow = await sendFlowMessage(
                      senderNumber,
                      "airtime_flow",
                      "314556411376637",
                      phone_number_id,
                      `‎ \nKindly click the button below to purchase airtime\n‎`,
                      "Airtime Purchase",
                      "QUESTION_ONE"
                    );
                    const saveConvo = await saveConversation(
                      senderNumber,
                      "airtime",
                      "airtime",
                      responseMessage
                    );
                    res.sendStatus(200);
                  }
                } else {
                  responseMessage = `Please enter a valid number 📞. Example: +2348056115343`;
                  const msg = await sendMessage(
                    senderNumber,
                    responseMessage,
                    phone_number_id
                  );
                  const msgflow = await sendFlowMessage(
                    senderNumber,
                    "airtime_flow",
                    "314556411376637",
                    phone_number_id,
                    `‎ \nKindly click the button below to purchase airtime\n‎`,
                    "Airtime Purchase",
                    "QUESTION_ONE"
                  );
                  const saveConvo = await saveConversation(
                    senderNumber,
                    "airtime",
                    "airtime",
                    responseMessage
                  );
                  res.sendStatus(200);
                }
              } else {
                // const msg = await sendTemplateMessage(
                //   senderNumber,
                //   "wrong__pin",
                //   phone_number_id
                // );

                let responsemsg = `Uh-oh! 😬 It looks like the transaction PIN you entered is incorrect. Please double-check your PIN and try again. If problems persist, contact our support team for assistance.`
                const msg = await sendMessage(
                  senderNumber,
                  responsemsg,
                  phone_number_id
                );
                const msgflow = await sendFlowMessage(
                  senderNumber,
                  "airtime_flow",
                  "314556411376637",
                  phone_number_id,
                  `‎ \nKindly click the button below to purchase airtime\n‎`,
                  "Airtime Purchase",
                  "QUESTION_ONE"
                );
                const saveConvo = await saveConversation(
                  senderNumber,
                  "airtime",
                  "buy_airtime",
                  "wrong__pin"
                );
                res.sendStatus(200);
              }
            } else {
              responseMessage = `You need to add ₦${amount_needed} to you wallet to purchase this plan, please fund your wallet and try again`;
              const msgg = await sendMessage(
                senderNumber,
                responseMessage,
                phone_number_id
              );
              const user = await User.findOne({ phoneNumber: senderNumber });
              // responseMessage = `*Kindly make a tranfer to the account details below to fund your wallet 💸:*\n\n*Account-Name*: ${user.accountName}\n*Account-Number*: ${user.accountNumber} \n*Bank*: ${user.bank}\n\n*Note*: Please include a transaction charge of ₦10 for deposites below ₦1000 and ₦20 for transactions above ₦1000 ✅ `;

              responseMessage = await getBankAccountDetails(user.phoneNumber);

              const msg = await sendMessage(
                senderNumber,
                responseMessage,
                phone_number_id
              );
              // const msgTemp = await sendTemplateMessage(
              //   senderNumber,
              //   "fund_wallet_ ",
              //   phone_number_id
              // );
              const saveConvo = await saveConversation(
                senderNumber,
                "airtime",
                "airtime",
                responseMessage
              );
              res.sendStatus(200);
            }
          } else {
            responseMessage =
              "Minimum airtime topup is amount ₦50, please increase the amount and try again. 🔄";
            const msg = await sendMessage(
              senderNumber,
              responseMessage,
              phone_number_id
            );
            const msgflow = await sendFlowMessage(
              senderNumber,
              "airtime_flow",
              "314556411376637",
              phone_number_id,
              `‎ \nKindly click the button below to purchase airtime\n‎`,
              "Airtime Purchase",
              "QUESTION_ONE"
            );

            const saveConvo = await saveConversation(
              senderNumber,
              "airtime",
              "airtime",
              responseMessage
            );
            res.sendStatus(200);
          }
          return;
        }
        // electricity payment flow
        else if (flowId == "power_flow") {
          try {
            facts = await getFacts();
            facts = facts[0].fact.toLowerCase()
            let responseMessage = `We're processing your electricity purchase, this should only take a couple seconds, while you wait, here's a fun fact for you, did you know that ${facts} 💡 💡`

            // responseMessage= 
            // "📢 *Important Update for Mkonnect Users* 🚨\n\n" +
            // "We want to keep you informed—due to a recent *tariff hike approved by the NCC*, data prices in Nigeria are increasing by *50%*.\n" +
            // "For example if a *1GB plan that used to cost ₦1,000 could now be around ₦1,500*.\n\n" +
            // "This change takes effect soon, so now might be a good time to *top up at the current rates* before the increase.\n\n" +
            // "We appreciate your support and will continue to provide you with the best deals possible! 💙\n\n" +
            // "For any questions, feel free to DM us. 📩\n\n" +
            // "*– Mkonnect Team*";
            const msg = await sendMessage(
              senderNumber,
              responseMessage,
              phone_number_id
            );
            let discoName = responseJson.state.split(":")[1].trim();
            let meterNumber = responseJson.meterNumber.split(":")[1].trim();
            let amount = responseJson.amount.split("₦")[1].trim();
            let pin = responseJson.pin;
            let meterName = responseJson.name.split(":")[1].trim();
            let meterAddress = responseJson.address.split(":")[1].trim();
            // discoName = discoName.split("_").slice(1).join(" "); // Split the string at the underscore and remove the first element
            let powerAmountPurchase = parseFloat(amount) - 150;
            let user = await User.findOne({ phoneNumber: senderNumber });
            let amount_needed = Math.abs(
              parseFloat(user.balance) - parseFloat(amount)
            );
            let meterCheck = await saveMeter.find({
              senderNumber: senderNumber,
              meterNumber: meterNumber,
            });

            if (meterCheck.length <= 0) {
              const saveMeterNumber = new saveMeter({
                senderNumber: senderNumber, // Example sender number
                meterNumber: meterNumber, // Example meter number
                meterName: meterName, // Example meter number
                meterAddress: meterAddress, // Example meter number
              });
              await saveMeterNumber.save();
            }

            if (user && user.fullName && user.email && user.transactionPin) {
              if (parseFloat(user.balance) >= parseFloat(amount)) {
                if (user.transactionPin === pin) {
                  let discoId;
                  switch (discoName) {
                    case "Ikeja Electric":
                      discoId = 1;
                      break;
                    case "Eko Electric":
                      discoId = 2;
                      break;
                    case "Abuja Electric":
                      discoId = 3;
                      break;
                    case "Kano Electric":
                      discoId = 4;
                      break;
                    case "Enugu Electric":
                      discoId = 5;
                      break;
                    case "Port Harcourt Electric":
                      discoId = 6;
                      break;
                    case "Ibadan Electric":
                      discoId = 7;
                      break;
                    case "Kaduna Electric":
                      discoId = 8;
                      break;
                    case "Jos Electric":
                      discoId = 9;
                      break;
                    case "Benin Electric":
                      discoId = 10;
                      break;
                    case "Yola Electric":
                      discoId = 11;
                      break;
                    default:
                      discoId = 0;
                  }

                  let newBalance =
                    parseFloat(user.balance) - parseFloat(amount);
                  const userUpdate = await User.findOneAndUpdate(
                    { phoneNumber: senderNumber },
                    { $set: { balance: newBalance.toString() } },
                    { new: true }
                  );

                  const generateToken = await makeBillPayment(
                    discoId,
                    powerAmountPurchase,
                    meterNumber,
                    "Prepaid",
                    senderNumber,
                    meterName,
                    meterAddress
                  );

                  // const generateToken = {"status":false,"data":{"id":973,"ident":"2024090211422219867841874abc72457-cee7-4224-a6b3-7e5d8a6241ce","package":"Jos Electric","disco_name":9,"amount":"1150","Customer_Phone":"2347030034134","meter_number":"0101170192153","token":"Token : 0966-8609-9751-5645-1963","MeterType":"Prepaid","paid_amount":"1149.9425","balance_before":"18474.11575000002","balance_after":"17324.11575000002","Status":"successful","create_date":"2024-09-02T11:42:36.332915","customer_name":"LONGWA","customer_address":"(STATE LOWCOST)"}}
                  
                  // console.log(generateToken);
                  // console.log(JSON.stringify(generateToken));

                  if (generateToken.status == true) {
                    responseMessage = `Up NEPA! 🎉\n\nGreat news ${
                      user.fullName.split(" ")[0]
                    } your electricity bill payment was successful.\n\n💡 ${
                      generateToken.data.token
                    }\n\nThank you for choosing our service! If you have any questions, feel free to reach out.`;

                    const msg = await sendMessage(
                      senderNumber,
                      responseMessage,
                      phone_number_id
                    );

                    const url = await generateReceipt(
                      generateToken.data.customer_name,
                      generateToken.data.customer_address,
                      generateToken.data.meter_number,
                      new Date().toLocaleString(),
                      'ELECTRICITY',
                      generateToken.data.package,
                      150,
                      generateToken.data.amount,
                      parseFloat(generateToken.data.amount) + 150,
                      generateToken.data.token
                    );

                    await sendDocMessage(url, "Recipt 📄", phone_number_id, senderNumber)

                    await sendFlowMessageEndpoint(
                      senderNumber,
                      `menu_flow_${senderNumber}`,
                      "1051816780241701",
                      phone_number_id,
                      `‎\nTry out our other services and yes ${user.fullName.split(" ")[0]} life can be this easy. 😉 \n‎`,
                      "Menu",
                      "MENU"
                    )

                    let saveTransaction = await powerTransactions.create({
                      senderNumber: senderNumber,
                      package: generateToken.data.package,
                      meter_number: generateToken.data.meter_number,
                      token: generateToken.data.token,
                      amount: generateToken.data.amount,
                      customer_name: generateToken.data.customer_name,
                      customer_address: generateToken.data.customer_address,
                      profit: 150,
                      id: generateToken.data.id,
                    });
                    let customerAmount =
                      parseFloat(generateToken.data.amount) + 150;
                    await sendTokenReceipt(
                      user.email,
                      "Up NEPA 🎉",
                      user.fullName,
                      user.phoneNumber,
                      generateToken.data.token,
                      generateToken.data.customer_name,
                      generateToken.data.customer_address,
                      customerAmount
                    );

                    const saveConvo = await saveConversation(
                      senderNumber,
                      "power_done",
                      "power_done",
                      "power_done"
                    );
                  } else {

                    // await sendFailedTransactionMessage(user.fullName.split(" ")[0], senderNumber, phone_number_id)
                    
                    const message = `\n\nYou're transaction is being processing, just sit back and relax, your token will be ready in a few minutes 🔄\n\n`;
                  
                    await sendFlowMessageEndpoint(
                      senderNumber,
                      `menu_flow_${senderNumber}`,
                      "1051816780241701",
                      phone_number_id,
                      message,                        
                      "Menu",
                      "MENU"
                    )

                    await pendingPowerTransactions.create({
                      senderNumber: senderNumber,
                      package: generateToken.data.package,
                      meter_number: generateToken.data.meter_number,
                      token: generateToken.data.token,
                      amount: generateToken.data.amount,
                      customer_name: generateToken.data.customer_name,
                      customer_address: generateToken.data.customer_address,
                      profit: 150,
                      id: generateToken.data.id,
                      status: "pending"
                    });

                    const msgbk = await sendMessage(
                      "2347030034134",
                      "a pending electricity transaction has been created",
                      phone_number_id
                    );

                    const saveConvo = await saveConversation(
                      senderNumber,
                      "electricity",
                      "electricity",
                      "electricity_fail"
                    );
                  }
                } else {
                      
                      let responseMessage = `"Uh-oh! 😬 It looks like the transaction PIN you entered is incorrect. Please double-check your PIN and try again. If problems persist, contact our support team for assistance.`;
                  await sendFlowMessage(
                    senderNumber,
                    "power_flow",
                    "1704209216986167",
                    phone_number_id,
                    responseMessage,
                    "Buy power",
                    "QUESTION_ONE"
                  );

                  const saveConvo = await saveConversation(
                    senderNumber,
                    "wrong__pin",
                    "wrong__pin",
                    "wrong__pin"
                  );
                }
              } else {
                const user = await User.findOne({ phoneNumber: senderNumber });

                responseMessage = `You need to add ₦${amount_needed} to you wallet to complete this transaction, please fund your wallet and try again`;
                const msgg = await sendMessage(
                  senderNumber,
                  responseMessage,
                  phone_number_id
                );
                // responseMessage = `*Kindly make a tranfer to the account details below to fund your wallet 💸:*\n\n*Account-Name*: ${user.accountName}\n*Account-Number*: ${user.accountNumber} \n*Bank*: ${user.bank}\n\n*Note*: Please include a transaction charge of ₦10 for deposites below ₦1000 and ₦20 for transactions above ₦1000 ✅ `;

                responseMessage = await getBankAccountDetails(user.phoneNumber);

                const msg = await sendMessage(
                  senderNumber,
                  responseMessage,
                  phone_number_id
                );
                const saveConvo = await saveConversation(
                  senderNumber,
                  "electricity",
                  "electricity",
                  responseMessage
                );
              }
            } else {
              const msg = `

        Hey there! 👋 Welcome to MKonnect, your hub for seamless services and convenience! To get started, please register with us. Simply click the button below and follow the instructions. We're here to help you every step of the way. 🌟

We're excited to have you join our community! If you need any assistance, feel free to reach out to our support line on WhatsApp using +2348056115343. 🎉 \n‎ `

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
                "click_register_",
                "click_register_",
                "click_register_"
              );
            }


            res.sendStatus(200);
            return;
          } catch (error) {
            logger.error(`error power: ${error.stack}`);
            return;
          }
        }
        // registration flow
        else if (flowId == "register_flow") {
          const responseJsonString =
            req.body.entry[0].changes[0].value.messages[0].interactive.nfm_reply
              .response_json;
          const responseJson = JSON.parse(responseJsonString);
          let fullName = responseJson.screen_0_TextInput_0;
          let email = responseJson.screen_0_TextInput_1;
          let pin = responseJson.screen_0_TextInput_2;
          let consent = responseJson.screen_0_OptIn_3;

          fullName = fullName.trim();
          const fullNamePattern = /^[A-Za-z]+(?:\s[A-Za-z]+)+$/;
          // console.log(fullNamePattern.test(fullName));
          let nameValidate = fullNamePattern.test(fullName);
          if (!nameValidate) {
            // console.log("name not valid");
            responseMessage = `Please provide your full name including your first and last name. For example, "Michael Mamman". 🔄`;
            const msg = await sendMessage(
              senderNumber,
              responseMessage,
              phone_number_id
            );
            const saveConvo = await saveConversation(
              senderNumber,
              "registration",
              "registeration",
              responseMessage
            );
            res.sendStatus(200);
          } else {
            let user = await User.findOneAndUpdate(
              { phoneNumber: senderNumber },
              {
                $set: {
                  fullName: fullName,
                  email: email,
                  transactionPin: pin,
                  consent: consent,
                },
              },
              { new: true }
            );

            if (user && user.fullName && user.email && user.transactionPin) {
              try {
                let fullName = user.fullName;
                let splitName = fullName.split(" ");
                let firstName = splitName[0];
                let surname = splitName.slice(1).join(" ");

                // create customer
                // console.log(fullName, firstName, surname, user.phoneNumber);
                const create_customer = await createCustomer(
                  user.email,
                  firstName,
                  surname,
                  user.phoneNumber
                );

                // create dedicated account
                let dedicated_account;
                if (create_customer.status == true) {
                  dedicated_account = await createDedicatedAccount(
                    create_customer.data.id, "titan-paystack"
                  );
                }

                // update user
                if (dedicated_account.status == true) {
                  const userUpdate = await User.findOneAndUpdate(
                    { phoneNumber: senderNumber },
                    {
                      $set: {
                        paystackId: create_customer.data.id,
                        accountNumber: dedicated_account.data.account_number,
                        accountName: dedicated_account.data.account_name,
                        bank: dedicated_account.data.bank.name,
                      },
                    },
                    { new: true }
                  );

                  // send email
                  await sendEmail(
                    userUpdate.email,
                    "Welcome to the Konnect family🎉🎉🎉",
                    userUpdate.fullName,
                    userUpdate.email,
                    userUpdate.accountNumber,
                    userUpdate.accountName,
                    userUpdate.bank,
                    userUpdate.transactionPin
                  );

                  // send messages
                  responseMessage = `Welcome to the Konnect family, ${
                    user.fullName.split(" ")[0]
                  } 🥳! 
                  
                  🎁 As a special welcome gift, we've credited your wallet with ₦150, which you can use to purchase 500MB of data. This bonus becomes available as soon as you make your first deposit of any amount (E fit be ₦10 😂). Start exploring the possibilities!
                  
                  What would you like to do today? 🚀`;
                  
              
                  await sendFlowMessageEndpoint(
                    senderNumber,
                    `menu_flow_${senderNumber}`,
                    "1051816780241701",
                    phone_number_id,
                    `‎\n${responseMessage}\n‎`,
                    "Get started",
                    "MENU"
                  )
                  
                  const saveConvo = await saveConversation(
                    senderNumber,
                    "registration",
                    "registration",
                    responseMessage
                  );

                  // await mailchimpContact(user.email, firstName, surname);
                  const user = {
                    phoneNumber: senderNumber,
                    email: userUpdate.email,
                    accountNumberPaystack: dedicated_account.data.account_number,
                    accountNamePaystack: dedicated_account.data.account_name,
                    bankPaystack: 'Paystack-Titan', 

                  };
            
                  await createBankDetails(user);



                  // create bank account for wema bank
                  if (create_customer.status == true) {
                    dedicated_account = await createDedicatedAccount(
                      create_customer.data.id, "wema-bank"
                    );
                  }

                if (dedicated_account.status == true) {


                  const updateUser = {
                    email: userUpdate.email,
                    accountNumberWema: dedicated_account.data.account_number,
                    accountNameWema: dedicated_account.data.account_name,
                    bankWema: "wema-bank",
                  };
          
                  // Update the document
                  await updateBankDetails(updateUser);

                }

                responseMessage = await getBankAccountDetails(user.phoneNumber);
                msg = await sendMessage(
                  senderNumber,
                  responseMessage,
                  phone_number_id
                );

                  res.sendStatus(200);
                }
              } catch (error) {
                logger.error(error.stack);
                res.sendStatus(200);
              }
            }
          }
          return;
        }
        // generate payment link flow
        else if (flowId == "amount_flow") {
          try {
            const user = await User.findOne({ phoneNumber: senderNumber });
            if (user) {
              let amount = responseJson.amount;
              amount = amount * 100;
              let generatePaymentLink = await initializeTransaction(
                user.email,
                amount
              );
              if (generatePaymentLink && generatePaymentLink.status == true) {
                let paymentLink = generatePaymentLink.data.authorization_url;
                let name = user.fullName;
                name = name.split(" ")[0];
                responseMessage = `To complete your deposit, please use this secure payment link: \n\nLink: ${paymentLink}. \n\nThank you for choosing us *${name}* 🚀🚀🚀`;
                const msg = await sendMessage(
                  senderNumber,
                  responseMessage,
                  phone_number_id
                );
                const saveConvo = await saveConversation(
                  senderNumber,
                  "paymentLink",
                  "paymentLink",
                  "paymentLink"
                );
                res.sendStatus(200);
                return;
              } else if (generatePaymentLink == false) {
                responseMessage = `We encountered an issue generating your payment link. 😞 Please try again later or contact our support team for assistance +2348056115343`
                const msg = await sendMessage(
                  senderNumber,
                  responseMessage,
                  phone_number_id
                );

                // const msg = await sendTemplateMessage(
                //   senderNumber,
                //   "payment_link_fail ",
                //   phone_number_id
                // );
                const saveConvo = await saveConversation(
                  senderNumber,
                  "payment_link_fail ",
                  "payment_link_fail ",
                  "payment_link_fail "
                );
                res.sendStatus(200);
                return;
              }
            } else {
              const msg = `

              Hey there! 👋 Welcome to MKonnect, your hub for seamless services and convenience! To get started, please register with us. Simply click the button below and follow the instructions. We're here to help you every step of the way. 🌟
      
We're excited to have you join our community! If you need any assistance, feel free to reach out to our support line on WhatsApp using +2348056115343. 🎉 \n‎ `
      
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
              // const msg = await sendTemplateMessage(
              //   senderNumber,
              //   "click_register_",
              //   phone_number_id
              // );
              const saveConvo = await saveConversation(
                senderNumber,
                "click_register_ ",
                "paymentLink",
                "click_register_ "
              );
              res.sendStatus(200);
              return;
            }
          } catch (error) {
            logger.error(`error processing paymentLink : ${error.stack}`);
            res.sendStatus(200);
            return;
          }
        }
        // data purchase flow
        else if (flowId == "data_flow") {
          const network = responseJson.network;
          const number = responseJson.number;
          const plan = responseJson.plan;
          const pin = responseJson.pin;

          let vendorStatus = await status.find();
          let vendor = vendorStatus[0].vendor ;
          console.log("hardcoding usuf for airtel transactions 1111111111111111")
          
        //   if (network.toLowerCase() === "airtel") {
        //     // vendor = "usufdata";
        //     console.log("hardcoding usuf for airtel transactions");
        // }
        
       if (vendor == "karldata") {
              vendor = FlowDataPlan;
            } else {
              vendor = FlowDataPlanUsuf;
            }

          // if (network.toLowerCase() === "airtel") {
        
          //     vendor = FlowDataPlanUsuf ;
    
          // }else{
        
          //   if (vendor == "karldata") {
          //     vendor = FlowDataPlan;
          //   } else {
          //     vendor = FlowDataPlanUsuf;
          //   }
        
          // }




   
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
                  
          //   let planVerify = await vendor.findOne({
          //   id: plan,
          // });

          let planVerify = response.find(response => Number(response.id) == plan);


          console.log(planVerify);
          // return;
          const numberValidate = validatePhoneNumber(number);
          if (numberValidate.isValid == true) {
            if (numberValidate.telco === network) {
              if (planVerify != null) {
                const sellingAmount = Math.ceil(parseFloat(planVerify.plan_amount) * 1.05); // Add 3% profit and round up

                let balance =
                  parseFloat(user.balance) - parseFloat(sellingAmount);

                const amountNeeded = Math.abs(
                  parseFloat(user.balance) - parseFloat(sellingAmount)
                );

                if (balance != 0 && balance < 0) {
                  responseMessage = `You need to add ₦${amountNeeded} to your wallet to purchase this plan. Please fund your wallet and try again.`;
                  const msgg = await sendMessage(
                    senderNumber,
                    responseMessage,
                    phone_number_id
                  );

                  const user = await User.findOne({ phoneNumber: senderNumber });
                  // responseMessage = `*Kindly make a tranfer to the account details below to fund your wallet 💸:*\n\n*Account-Name*: ${user.accountName}\n*Account-Number*: ${user.accountNumber} \n*Bank*: ${user.bank}\n\n*Note*: Please include a transaction charge of ₦10 for deposites below ₦1000 and ₦20 for transactions above ₦1000 ✅ `;

                  responseMessage = await getBankAccountDetails(user.phoneNumber);

                  const msg = await sendMessage(
                    senderNumber,
                    responseMessage,
                    phone_number_id
                  );
                  // const msgTemp = await sendTemplateMessage(
                  //   senderNumber,
                  //   "fund_wallet_ ",
                  //   phone_number_id
                  // );

                  const saveConvo = await saveConversation(
                    senderNumber,
                    "buy data flow",
                    toString(responseJson),
                    responseMessage
                  );
                } else if (user.transactionPin == pin) {
                  try {
                    const userUpdate = await User.findOneAndUpdate(
                      { phoneNumber: senderNumber },
                      { $set: { balance: balance.toString() } },
                      { new: true }
                    );

                    let transactionDetails
                    const internationalNumber = await convertToInternationalFormat(number);
                    facts = await getFacts();
                    facts = facts[0].fact.toLowerCase()
                    if(senderNumber == internationalNumber){
                      transactionDetails = `We're processing your data purchase ${user.fullName.split(" ")[0]}, while you wait, here's a fun fact for you, did you know that ${facts} 💡`

                    } else if (senderNumber != internationalNumber){
                      transactionDetails = `We're sending the data plan to ${number}, while you wait, here's a fun fact for you, did you know that ${facts} 💡`
                    } else{
                      transactionDetails = `Your data plan is on the way, while you wait, here's a fun fact for you, did you know that ${facts} 💡`
                    }

                    // transactionDetails= 
                    // "📢 *Important Update for Mkonnect Users* 🚨\n\n" +
                    // "Hey " + user.fullName.split(" ")[0] + " 👋\n\n" +
                    // "We want to keep you informed—due to a recent *tariff hike approved by the NCC*, data prices in Nigeria are increasing by *50%*.\n" +
                    // "For example if a *1GB plan that used to cost ₦1,000 could now be around ₦1,500*.\n\n" +
                    // "This change takes effect soon, so now might be a good time to *top up at the current rates* before the increase.\n\n" +
                    // "We appreciate your support and will continue to provide you with the best deals possible! 💙\n\n" +
                    // "For any questions, feel free to DM us. 📩\n\n" +
                    // "*– Mkonnect Team*";

                    const msg = await sendMessage(
                      senderNumber,
                      transactionDetails,
                      phone_number_id
                    );
                    let payload = await ProcessData(network, plan, number, senderNumber);
                    // console.log(payload);
                    // Example usage

                    if (payload.Status == "successful") {
                      // const msg = await sendTemplateMessage(
                      //   senderNumber,
                      //   "data__success",
                      //   phone_number_id
                      // );
                      let responsemsg = await getDataSuccessMessage(balance)

                      await sendFlowMessageEndpoint(
                        senderNumber,
                        `menu_flow_${senderNumber}`,
                        "1051816780241701",
                        phone_number_id,
                        responsemsg,                        
                        "Menu",
                        "MENU"
                      )
                      

                      let profit = parseFloat(sellingAmount) - parseFloat(payload.plan_amount);

       


                      await sendTransactionEmail(
                        "data",
                        userUpdate.email,
                        "Transaction Reciept🚀🚀🚀",
                        userUpdate.fullName,
                        userUpdate.email,
                        senderNumber,
                        payload.mobile_number,
                        payload.plan_network,
                        payload.plan_name,
                        sellingAmount,
                        payload.id
                      );

                      const saveConvo = await saveConversation(
                        senderNumber,
                        "data__success",
                        transactionDetails,
                        responsemsg
                      );

                      if (profit < 0) {
                        const adminNumbers = await AdminUser.find({});

                        const message = `Dear Admin,\n\nA transaction has been processed that resulted in a loss. Please find the transaction details below:\n\n📌 Sender Number: ${senderNumber}  \n📌 Recipient Number: ${payload.mobile_number}  \n📌 Network: ${payload.plan_network}  \n📌 Plan Name: ${payload.plan_name}  \n📌 Plan Amount: ₦${sellingAmount}  \n📌 Loss Incurred: -₦${Math.abs(profit)}  \n📌 Transaction ID: ${payload.id}  \n\n⚠️ Action Required: Kindly review this transaction and take necessary measures.\n\nBest regards,  \nYour Automated Transaction Monitoring System`;
                        const subject = `MKONNECT LOSS OF -₦${Math.abs(profit)}🚨🚨🚨🚨`;

                        adminNumbers.forEach(async (adminNumber) => {
                        await sendVendorBalanceEmail(  adminNumber.email, subject, message)
                        });                     
                      }

                      // await marketingMsg(senderNumber, phone_number_id);
                    } else {

                      try {
                        // console.log(network, number);
                        // Attempt to retry the data plan
                        // const backup = await dataPlanRetry(network, planVerify.plan);
                        // console.log(backup);
                        let count = 0;
                        
                        
                        let transactionSuccessful = false; // Flag to track transaction success
                        
                      //   if (network != "AIRTEL"){

                      //     let dataplan;

                      //     // Update user balance
                      //     const userUpdate = await User.findOneAndUpdate(
                      //       { phoneNumber: senderNumber },
                      //       { $set: { balance: balance.toString() } },
                      //       { new: true }
                      //     );
    
                      //     let vendor = await status.find();
    
                      //     if (vendor[0].vendor == "karldata") {
    
                      //      dataplan = await FlowDataPlan.findOne({id: plan});
                      //     } else {
    
                      //       dataplan = await FlowDataPlanUsuf.findOne({id: plan});
    
                      //     }

                        
                      //     if (dataplan != null){
               
                      //   // Loop through the backup data
                      //   for (const id of backup) {

                      //   if (id.Amount <= dataplan.Amount){

                      //     count += 1;
  
                      //     console.log(network, number, id.id);
                      //     const payload = await dataRetry(network, number, id.id, senderNumber);
                    
                      //     // Check if the payload was successful
                      //     if (payload.Status === "successful") {
                      //       await handleSuccessfulTransaction(
                      //         payload,
                      //         planVerify,
                      //         balance,
                      //         userUpdate,
                      //         senderNumber,
                      //         phone_number_id,
                      //         count,
                      //         vendor[0].vendor
                      //       );
                      //       transactionSuccessful = true; // Set flag to true on success
                      //       break; // Stop further processing if successful
                      //     }
                      //   }
                      // }

                      // }

                      // }
                    
                        // Only handle failed transactions if no successful transaction occurred
                        if (!transactionSuccessful) {
                          await handleFailedTransaction(
                            senderNumber,
                            planVerify,
                            number,
                            network,
                            balance,
                            phone_number_id
                          );
                        }
                    
                      } catch (error) {
                        console.log(error.stack);
                        logger.error(`An error occurred in data plan retry: ${error}`);
                      }
                    }
                  // Function to handle successful transactions
                  async function handleSuccessfulTransaction(
                    payload,
                    planVerify,
                    balance,
                    userUpdate,
                    senderNumber,
                    phone_number_id,
                    count,
                    vendor
                  ) {
                    let responseMsg = await getDataSuccessMessage(balance)

                    await sendFlowMessageEndpoint(
                      senderNumber,
                      `menu_flow_${senderNumber}`,
                      "1051816780241701",
                      phone_number_id,
                      responseMsg,                        
                      "Menu",
                      "MENU"
                    )
                  
                  
                    let profit = parseFloat(planVerify.plan_amount) - parseFloat(payload.plan_amount);
                  
                  
                    await sendTransactionEmail(
                      "data",
                      userUpdate.email,
                      "Transaction Reciept🚀🚀🚀",
                      userUpdate.fullName,
                      userUpdate.email,
                      senderNumber,
                      payload.mobile_number,
                      payload.plan_network,
                      payload.plan_name,
                      planVerify.plan_amount,
                      payload.id
                    );
                  
                    await saveConversation(senderNumber, "data__success", "data__success", "data__success");
                    // await marketingMsg(senderNumber, phone_number_id);
                    if (profit < 0) {
                      const adminNumbers = await AdminUser.find({});
                      const message = `Dear Admin,\n\nA transaction has been processed that resulted in a loss. Please find the transaction details below:\n\n📌 Sender Number: ${senderNumber}  \n📌 Recipient Number: ${payload.mobile_number}  \n📌 Network: ${payload.plan_network}  \n📌 Plan Name: ${payload.plan_name}  \n📌 Plan Amount: ₦${planVerify.plan_amount}  \n📌 Loss Incurred: -₦${Math.abs(profit)}  \n📌 Transaction ID: ${payload.id}  \n\n⚠️ Action Required: Kindly review this transaction and take necessary measures.\n\nBest regards,  \nYour Automated Transaction Monitoring System`;
                      const subject = `MKONNECT LOSS OF -₦${Math.abs(profit)}🚨🚨🚨🚨`;
                      adminNumbers.forEach(async (adminNumber) => {
                      await sendVendorBalanceEmail(  adminNumber.email, subject, message)
                      });                     
                    }

                    
                  }
                  
                  // Function to handle failed transactions
                  async function handleFailedTransaction(
                    senderNumber,
                    planVerify,
                    number,
                    network,
                    balance,
                    phone_number_id
                  ) {
                    let user = await User.findOne({ phoneNumber: senderNumber });
                    let newBalance = parseFloat(user.balance) + parseFloat(planVerify.plan_amount);
                  
                    const userUpdate = await User.findOneAndUpdate(
                      { phoneNumber: senderNumber },
                      { $set: { balance: newBalance.toString() } },
                      { new: true }
                    );
                  

                    await sendDataFailedTransactionMessage(user.fullName.split(" ")[0], senderNumber, phone_number_id, network, data_plan_type)

                                    
                    await saveFailedtransaction(
                      senderNumber,
                      number,
                      network,
                      planVerify.plan,
                      planVerify.plan_amount,
                      payload.toString()
                    );

                    // TODO: UPDATE CONVERSION SAVING TO INCLUDE MORE DETAILS

                  
                    await saveConversation(senderNumber, "data_fail_", "data_fail_", "data_fail_");
                  }
                    
                  } catch (error) {
                    logger.error(error.stack);
                  }
                } else {
                  // const msg = await sendTemplateMessage(
                  //   senderNumber,
                  //   "wrong__pin",
                  //   phone_number_id
                  // );
                  let responseMessage = `"Uh-oh! 😬 It looks like the transaction PIN you entered is incorrect. Please double-check your PIN and try again. If problems persist, contact our support team for assistance.`;
                  await sendFlowMessageEndpoint(
                    senderNumber,
                    `menu_flow_${senderNumber}`,
                    "1051816780241701",
                    phone_number_id,
                    `‎\n${responseMessage}\n‎`,
                    "Buy Data",
                    "MENU"
                  )
                  const saveConvo = await saveConversation(
                    senderNumber,
                    "wrong__pin",
                    toString(responseJson),
                    "wrong__pin"
                  );
                }
              }
            } else {
              responseMessage = `Looks like the phone number you entered is not a valid ${network} phone number, please check the number and try again 🔄`;
              const msg = await sendMessage(
                senderNumber,
                responseMessage,
                phone_number_id
              );
              const saveConvo = await saveConversation(
                senderNumber,
                "phone",
                "phone",
                responseMessage
              );
            }
          } else {
            responseMessage = `Please enter a valid number 📞. Example: +2348056115343`;
            const msg = await sendMessage(
              senderNumber,
              responseMessage,
              phone_number_id
            );
            const saveConvo = await saveConversation(
              senderNumber,
              "phone",
              "phone",
              responseMessage
            );
          }

          res.sendStatus(200);
        }
        // tutorials flow
        else if (flowId == "tutorials_flow") {
          try {
            let text = responseJson.tutorials
            if (text.includes("register")) {
              const msg2 = await sendMediaMessage(
                "https://mkonnect.com.ng/tutorial/BOBO.mp4",
                "Get Registered in a few simple steps. 🚀 \n\nDon't enjoy Mkonnect alone  😎, invite your friends and family to join you on this journey. 💪 \n\nLink: https://wa.me/message/O3GO6ETN3A3CH1",
                phone_number_id,
                senderNumber,
                "video"
              );
            } else if (text.includes("data")) {
              const msg2 = await sendMediaMessage(
                "https://mkonnect.com.ng/tutorial/OCHE.mp4",
                "Buying Data has never been easier, just follow the steps in the video and you'll be good to go. 🛜 \n\nDon't enjoy Mkonnect alone  😎, invite your friends and family to join you on this journey. 💪 \n\nLink: https://wa.me/message/O3GO6ETN3A3CH1",
                phone_number_id,
                senderNumber,
                "video"
              );
            } else if (text.includes("airtime")) {
              const msg2 = await sendMediaMessage(
                "https://mkonnect.com.ng/tutorial/SMITH.mp4",
                "Buying Airtime has never been easier, just follow the steps in the video and you'll be good to go. 🥳 \n\nDon't enjoy Mkonnect alone  😎, invite your friends and family to join you on this journey. 💪 \n\nLink: https://wa.me/message/O3GO6ETN3A3CH1",
                phone_number_id,
                senderNumber,
                "video"
              );
            } else if (text.includes("atm")) {
              const msg2 = await sendMediaMessage(
                "https://mkonnect.com.ng/tutorial/ABUJA.mp4",
                "You can easily fund your wallet with your ATM card. 💳 \n\nDon't enjoy Mkonnect alone  😎, invite your friends and family to join you on this journey. 💪 \n\nLink: https://wa.me/message/O3GO6ETN3A3CH1",
                phone_number_id,
                senderNumber,
                "video"
              );
            } else if (text.includes("bank")) {
              const msg2 = await sendMediaMessage(
                "https://mkonnect.com.ng/tutorial/MICHAEL.mp4",
                "Fund your wallet with a quick bank tranfer. 🏦 \n\nDon't enjoy Mkonnect alone  😎, invite your friends and family to join you on this journey. 💪 \n\nLink: https://wa.me/message/O3GO6ETN3A3CH1",
                phone_number_id,
                senderNumber,
                "video"
              );
            } else if (text.includes("electricity")) {
              const msg2 = await sendMediaMessage(
                "https://mkonnect.com.ng/tutorial/electricity.mp4",
                "Up NEPA 💡💡💡 \n\nDon't enjoy Mkonnect alone  😎, invite your friends and family to join you on this journey. 💪 \n\nLink: https://wa.me/message/O3GO6ETN3A3CH1",
                phone_number_id,
                senderNumber,
                "video"
              );
            } else if (text.includes("tutorial")) {
              // const msg1 = await sendTemplateMessage(
              //   senderNumber,
              //   "tutorial",
              //   phone_number_id
              // );
              let responseMessage = `We have a step by step tutorial on how to do everything on Mkonnect.`
              await sendFlowMessageEndpoint(
                senderNumber,
                `menu_flow_${senderNumber}`,
                "1051816780241701",
                phone_number_id,
                `‎\n${responseMessage}\n‎`,
                "Tutorials",
                "MENU"
              )
            }
          } catch (error) {
            logger.error(`error processing tutorial intent:  ${error.stack}`);
          }
          res.sendStatus(200);
        }
      }

      if (flowToken == "check_balance") {
        try {
          responseMessage = await checkBalance(senderNumber);
          const msg = await sendMessage(
            senderNumber,
            responseMessage,
            phone_number_id
          );
          const saveConvo = await saveConversation(
            senderNumber,
            "check_balance",
            "check_balance",
            responseMessage
          );
          res.sendStatus(200);
        } catch (error) {
          console.error(error);
          responseMessage = `Something went wrong, don't worry it's from our end and our engineers are working on it.`;
          const msg = await sendMessage(
            senderNumber,
            responseMessage,
            phone_number_id
          );
          const saveConvo = await saveConversation(
            senderNumber,
            "check_balance",
            "check_balance",
            responseMessage
          );
          res.sendStatus(200);
        }
      } else if (flowToken == "saved_meter_numbers") {
        const savedMeters = await saveMeter.find({
          senderNumber: senderNumber,
        });
        if (savedMeters.length > 0) {
          let message = "📋 Your Saved Meters 📋\n\n";

          savedMeters.forEach((meter, index) => {
            message += `${index + 1}. Meter Number: ${meter.meterNumber}\n`;
            message += `   Meter Name: ${meter.meterName}\n`;
            message += `   Meter Address: ${meter.meterAddress}\n\n`;
          });

          message += "If you need any further assistance, feel free to ask!";
          const msg = await sendMessage(senderNumber, message, phone_number_id);

          await sendFlowMessage(
            senderNumber,
            "power_flow",
            "1704209216986167",
            phone_number_id,
            `You can copy your meter number and buy electricity, it's easy as ABC. 🥳\n‎`,
            "Buy power",
            "QUESTION_ONE"
          );
        } else {
          responseMessage = `You have not saved any meters yet.`;
          const msg = await sendMessage(
            senderNumber,
            responseMessage,
            phone_number_id
          );

          await sendFlowMessage(
            senderNumber,
            "power_flow",
            "1704209216986167",
            phone_number_id,
            `Your Meter details get automatically saved when your purchase electricity. 💡\n‎`,
            "Buy power",
            "QUESTION_ONE"
          );
        }
        res.sendStatus(200);
      } else if (flowToken == "bank_transfer") {
        try {
          const user = await User.findOne({ phoneNumber: senderNumber });
          if (user && user.fullName) {
            if (user.email && user.transactionPin) {

              // responseMessage = `*Kindly make a tranfer to the account details below to fund your wallet 💸:*\n\n*Account-Name*: ${user.accountName}\n*Account-Number*: ${user.accountNumber} \n*Bank*: ${user.bank}\n\n*Note*: Please include a transaction charge of ₦10 for deposites below ₦1000 and ₦20 for transactions above ₦1000 ✅ `;

              responseMessage = await getBankAccountDetails(user.phoneNumber);
              const msg = await sendMessage(
                senderNumber,
                responseMessage,
                phone_number_id
              );
              const saveConvo = await saveConversation(
                senderNumber,
                "bank_transfer",
                "bank_transfer",
                responseMessage
              );
              res.sendStatus(200);
            } else {
              const email = user.email ?? null;
              const pin = user.transactionPin ?? null;

              const missingFields = [];
              if (!email) missingFields.push("Email");
              if (!pin) missingFields.push("Transaction Pin");

              if (missingFields.length > 0) {
                const responseMessage = `Welcome back ${
                  user.fullName.split(" ")[0]
                } 🥳, looks like you have not completed the registration process yet. Please provide your ${missingFields.join(
                  " and "
                )} 🔄.`;
                const msg = await sendMessage(
                  senderNumber,
                  responseMessage,
                  phone_number_id
                );
                const saveConvo = await saveConversation(
                  senderNumber,
                  "bank_transfer",
                  "bank_transfer",
                  responseMessage
                );
                res.sendStatus(200);
              }
            }
          } else {
            // const msg = await sendTemplateMessage(
            //   senderNumber,
            //   "click_register_",
            //   phone_number_id
            // );
            const msg = `

            Hey there! 👋 Welcome to MKonnect, your hub for seamless services and convenience! To get started, please register with us. Simply click the button below and follow the instructions. We're here to help you every step of the way. 🌟
    
We're excited to have you join our community! If you need any assistance, feel free to reach out to our support line on WhatsApp using +2348056115343. 🎉 \n‎ `

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
              "bank_transfer",
              "bank_transfer",
              "click_register_"
            );
            res.sendStatus(200);
          }
        } catch (error) {
          console.error(error);
          responseMessage = `Something went wrong, don't worry it's from our end and our engineers are working on it.`;
          const msg = await sendMessage(
            senderNumber,
            responseMessage,
            phone_number_id
          );
          const saveConvo = await saveConversation(
            senderNumber,
            "bank_transfer",
            "bank_transfer",
            responseMessage
          );
          res.sendStatus(200);
        }
      } else if (flowToken == "airtime_flow") {
        const parts = input.split("_");

        let network = parts[1]; // This will give you "MTN"
        let pin = responseJson.screen_2_TextInput_0;
        let amount = parseInt(responseJson.screen_1_TextInput_0);
        let amount_needed = Math.abs(
          parseFloat(user.balance) - parseFloat(amount)
        );
        let recipient = responseJson.screen_1_TextInput_1;

        if (amount > 50 || amount == 50) {
          if (
            parseFloat(user.balance) == parseFloat(amount) ||
            parseFloat(user.balance) > parseFloat(amount)
          ) {
            if (user.transactionPin == pin) {
              let validateNumber = validatePhoneNumber(recipient);

              if (validateNumber.isValid == true) {
                if (validateNumber.telco === network) {

                  const internationalNumber = await convertToInternationalFormat(recipient);
                  facts = await getFacts();
                  facts = facts[0].fact.toLowerCase()
                  if(senderNumber == internationalNumber){
                     transactionDetails = `We're processing your airtime purchase ${user.fullName.split(" ")[0]}, while you wait, here's a fun fact for you, did you know that ${facts} 💡`

                  } else if (senderNumber != internationalNumber){
                    transactionDetails = `We're sending airtime to ${recipient}, while you wait, here's a fun fact for you, did you know that ${facts} 💡`
                  } else{
                    transactionDetails = `Your airtime is on the way, while you wait, here's a fun fact for you, did you know that ${facts} 💡`
                  }

                  transactionDetails= 
                  "📢 *Important Update for Mkonnect Users* 🚨\n\n" +
                  "Hey " + user.fullName.split(" ")[0] + " 👋\n\n" +
                  "We want to keep you informed—due to a recent *tariff hike approved by the NCC*, data prices in Nigeria are increasing by *50%*.\n" +
                  "For example if a *1GB plan that used to cost ₦1,000 could now be around ₦1,500*.\n\n" +
                  "This change takes effect soon, so now might be a good time to *top up at the current rates* before the increase.\n\n" +
                  "We appreciate your support and will continue to provide you with the best deals possible! 💙\n\n" +
                  "For any questions, feel free to DM us. 📩\n\n" +
                  "*– Mkonnect Team*";


                  const msg = await sendMessage(
                    senderNumber,
                    transactionDetails,
                    phone_number_id
                  );

                  let payload = await ProcessAirtime(
                    network,
                    amount,
                    recipient
                  );
                  // console.log(payload);

                  if (payload.Status == "successful") {
                    // const msg = await sendTemplateMessage(
                    //   senderNumber,
                    //   "airtime_success",
                    //   phone_number_id
                    // );                                            
                    let newBalance = parseFloat(user.balance) - parseFloat(amount);
                    let responsemsg = `🎉 Hooray! Your airtime purchase was a success! 🥳
Your new balance is ₦${newBalance} 💰. Stay connected, make those calls, and enjoy uninterrupted vibes! 📱✨

Need help or got questions? We're just a message away! 😊
Check your airtime balance anytime with *✨ 310# ✨`
                    const msg = await sendMessage(
                      senderNumber,
                      responsemsg,
                      phone_number_id
                    );
                    const userUpdate = await User.findOneAndUpdate(
                      { phoneNumber: senderNumber },
                      { $set: { balance: newBalance.toString() } },
                      { new: true }
                    );
                    let airtime_type = payload.airtime_type;
                    let plan_amount = payload.amount;
                    let id = payload.id;
                    let profit = amount - parseFloat(payload.paid_amount);

                    try {
                      const Transaction = new airtime({
                        senderNumber,
                        recipient,
                        network,
                        airtime_type,
                        profit,
                        plan_amount,
                        id,
                      });

                      await Transaction.save();
                    } catch (error) {
                      logger.error(`error saving transaction: ${error.stack}`);
                    }

                    await sendTransactionEmail(
                      "airtime",
                      userUpdate.email,
                      "Transaction Reciept🚀🚀🚀",
                      userUpdate.fullName,
                      userUpdate.email,
                      senderNumber,
                      recipient,
                      network,
                      airtime_type,
                      amount,
                      payload.id
                    );

                    const saveConvo = await saveConversation(
                      senderNumber,
                      "airtime",
                      "airtime",
                      "airtime_success"
                    );

                    res.sendStatus(200);
                  } else {

                    await sendFailedTransactionMessage(user.fullName.split(" ")[0], senderNumber, phone_number_id)

                    const saveConvo = await saveConversation(
                      senderNumber,
                      "buy_airtime",
                      "airtime",
                      "airtime_fail"
                    );
                    res.sendStatus(200);
                  }
                } else {
                  responseMessage = `Looks like the phone number you entered is not a valid ${network} phone number, please check the number and try again 🔄`;
                  const msg = await sendMessage(
                    senderNumber,
                    responseMessage,
                    phone_number_id
                  );
                  const msgflow = await sendFlowMessage(
                    senderNumber,
                    "airtime_flow",
                    "314556411376637",
                    phone_number_id,
                    `‎ \nKindly click the button below to purchase airtime\n‎`,
                    "Airtime Purchase",
                    "QUESTION_ONE"
                  );
                  const saveConvo = await saveConversation(
                    senderNumber,
                    "airtime",
                    "airtime",
                    responseMessage
                  );
                  res.sendStatus(200);
                }
              } else {
                responseMessage = `Please enter a valid number 📞. Example: +2348056115343`;
                const msg = await sendMessage(
                  senderNumber,
                  responseMessage,
                  phone_number_id
                );
                const msgflow = await sendFlowMessage(
                  senderNumber,
                  "airtime_flow",
                  "314556411376637",
                  phone_number_id,
                  `‎ \nKindly click the button below to purchase airtime\n‎`,
                  "Airtime Purchase",
                  "QUESTION_ONE"
                );
                const saveConvo = await saveConversation(
                  senderNumber,
                  "airtime",
                  "airtime",
                  responseMessage
                );
                res.sendStatus(200);
              }
            } else {
              // const msg = await sendTemplateMessage(
              //   senderNumber,
              //   "wrong__pin",
              //   phone_number_id
              // );
              let responseMessage = `"Uh-oh! 😬 It looks like the transaction PIN you entered is incorrect. Please double-check your PIN and try again. If problems persist, contact our support team for assistance.`;
              await sendFlowMessage(
                senderNumber,
                "airtime_flow",
                "314556411376637",
                phone_number_id,
                `‎ \n${responseMessage}\n‎`,
                "Airtime Purchase",
                "QUESTION_ONE"
              );
              const saveConvo = await saveConversation(
                senderNumber,
                "airtime",
                "buy_airtime",
                "wrong__pin"
              );
              res.sendStatus(200);
            }
          } else {
            responseMessage = `You need to add ₦${amount_needed} to you wallet to purchase this plan, please fund your wallet and try again`;
            const msgg = await sendMessage(
              senderNumber,
              responseMessage,
              phone_number_id
            );
            const user = await User.findOne({ phoneNumber: senderNumber });
            // responseMessage = `*Kindly make a tranfer to the account details below to fund your wallet 💸:*\n\n*Account-Name*: ${user.accountName}\n*Account-Number*: ${user.accountNumber} \n*Bank*: ${user.bank}\n\n*Note*: Please include a transaction charge of ₦10 for deposites below ₦1000 and ₦20 for transactions above ₦1000 ✅ `;

            responseMessage = await getBankAccountDetails(user.phoneNumber);

            const msg = await sendMessage(
              senderNumber,
              responseMessage,
              phone_number_id
            );

            const saveConvo = await saveConversation(
              senderNumber,
              "airtime",
              "airtime",
              responseMessage
            );
            res.sendStatus(200);
          }
        } else {
          responseMessage =
            "Minimum airtime topup is amount ₦50, please increase the amount and try again. 🔄";
          const msg = await sendMessage(
            senderNumber,
            responseMessage,
            phone_number_id
          );
          const msgflow = await sendFlowMessage(
            senderNumber,
            "airtime_flow",
            "314556411376637",
            phone_number_id,
            `‎ \nKindly click the button below to purchase airtime\n‎`,
            "Airtime Purchase",
            "QUESTION_ONE"
          );

          const saveConvo = await saveConversation(
            senderNumber,
            "airtime",
            "airtime",
            responseMessage
          );
          res.sendStatus(200);
        }
        return;
      }
      // electricity payment flow
      else if (flowToken == "power_flow") {
        try {
          let responseMessage = `We're processing your electricity purchase, this should only take a couple seconds 💡`
          const msg = await sendMessage(
            senderNumber,
            responseMessage,
            phone_number_id
          );
          let discoName = responseJson.state.split(":")[1].trim();
          let meterNumber = responseJson.meterNumber.split(":")[1].trim();
          let amount = responseJson.amount.split("₦")[1].trim();
          let pin = responseJson.pin;
          let meterName = responseJson.name.split(":")[1].trim();
          let meterAddress = responseJson.address.split(":")[1].trim();
          // discoName = discoName.split("_").slice(1).join(" "); // Split the string at the underscore and remove the first element
          let powerAmountPurchase = parseFloat(amount) - 150;
          let user = await User.findOne({ phoneNumber: senderNumber });
          let amount_needed = Math.abs(
            parseFloat(user.balance) - parseFloat(amount)
          );
          let meterCheck = await saveMeter.find({
            senderNumber: senderNumber,
            meterNumber: meterNumber,
          });

          if (meterCheck.length <= 0) {
            const saveMeterNumber = new saveMeter({
              senderNumber: senderNumber, // Example sender number
              meterNumber: meterNumber, // Example meter number
              meterName: meterName, // Example meter number
              meterAddress: meterAddress, // Example meter number
            });
            await saveMeterNumber.save();
          }

          if (user && user.fullName && user.email && user.transactionPin) {
            if (parseFloat(user.balance) >= parseFloat(amount)) {
              if (user.transactionPin === pin) {
                let discoId;
                switch (discoName) {
                  case "Ikeja Electric":
                    discoId = 1;
                    break;
                  case "Eko Electric":
                    discoId = 2;
                    break;
                  case "Abuja Electric":
                    discoId = 3;
                    break;
                  case "Kano Electric":
                    discoId = 4;
                    break;
                  case "Enugu Electric":
                    discoId = 5;
                    break;
                  case "Port Harcourt Electric":
                    discoId = 6;
                    break;
                  case "Ibadan Electric":
                    discoId = 7;
                    break;
                  case "Kaduna Electric":
                    discoId = 8;
                    break;
                  case "Jos Electric":
                    discoId = 9;
                    break;
                  case "Benin Electric":
                    discoId = 10;
                    break;
                  case "Yola Electric":
                    discoId = 11;
                    break;
                  default:
                    discoId = 0;
                }

                let newBalance = parseFloat(user.balance) - parseFloat(amount);
                const userUpdate = await User.findOneAndUpdate(
                  { phoneNumber: senderNumber },
                  { $set: { balance: newBalance.toString() } },
                  { new: true }
                );

                const generateToken = await makeBillPayment(
                  discoId,
                  powerAmountPurchase,
                  meterNumber,
                  "Prepaid",
                  senderNumber,
                  meterName,
                  meterAddress
                );

                if (generateToken.status == true) {
                  responseMessage = `Up NEPA! 🎉\n\nGreat news ${
                    user.fullName.split(" ")[0]
                  } your electricity bill payment was successful.\n\n💡 ${
                    generateToken.data.token
                  }\n\nThank you for choosing our service! If you have any questions, feel free to reach out.`;

                  const msg = await sendMessage(
                    senderNumber,
                    responseMessage,
                    phone_number_id
                  );

                  const url = await generateReceipt(
                    generateToken.data.customer_name,
                    generateToken.data.customer_address,
                    generateToken.data.meter_number,
                    new Date().toLocaleString(),
                    'ELECTRICITY',
                    generateToken.data.package,
                    150,
                    generateToken.data.amount,
                    parseFloat(generateToken.data.amount) + 150,
                    generateToken.data.token
                  );

                  await sendDocMessage(url, "Recipt 📄", phone_number_id, senderNumber)

                  await sendFlowMessageEndpoint(
                    senderNumber,
                    `menu_flow_${senderNumber}`,
                    "1051816780241701",
                    phone_number_id,
                    `‎\nTry out our other services and yes ${user.fullName.split(" ")[0]} life can be this easy. 😉 \n‎`,
                    "Menu",
                    "MENU"
                  )

                  let saveTransaction = await powerTransactions.create({
                    senderNumber: senderNumber,
                    package: generateToken.data.package,
                    meter_number: generateToken.data.meter_number,
                    token: generateToken.data.token,
                    amount: generateToken.data.amount,
                    customer_name: generateToken.data.customer_name,
                    customer_address: generateToken.data.customer_address,
                    profit: 150,
                    id: generateToken.data.id,
                  });
                  let customerAmount =
                    parseFloat(generateToken.data.amount) + 150;
                  await sendTokenReceipt(
                    user.email,
                    "Up NEPA 🎉",
                    user.fullName,
                    user.phoneNumber,
                    generateToken.data.token,
                    generateToken.data.customer_name,
                    generateToken.data.customer_address,
                    customerAmount
                  );

                  const saveConvo = await saveConversation(
                    senderNumber,
                    "power_done",
                    "power_done",
                    "power_done"
                  );
                } else {

                  // await sendFailedTransactionMessage(user.fullName.split(" ")[0], senderNumber, phone_number_id)
                  
                  const message = `\n\nYou're transaction is being processing, just sit back and relax, your token will be ready in a few minutes 🔄\n\n`;
                
                  await sendFlowMessageEndpoint(
                    senderNumber,
                    `menu_flow_${senderNumber}`,
                    "1051816780241701",
                    phone_number_id,
                    message,                        
                    "Menu",
                    "MENU"
                  )

                  await pendingPowerTransactions.create({
                    senderNumber: senderNumber,
                    package: generateToken.data.package,
                    meter_number: generateToken.data.meter_number,
                    token: generateToken.data.token,
                    amount: generateToken.data.amount,
                    customer_name: generateToken.data.customer_name,
                    customer_address: generateToken.data.customer_address,
                    profit: 150,
                    id: generateToken.data.id,
                    status: "pending"
                  });

                  const msgbk = await sendMessage(
                    "2347030034134",
                    "a pending electricity transaction has been created",
                    phone_number_id
                  );

                  const saveConvo = await saveConversation(
                    senderNumber,
                    "electricity",
                    "electricity",
                    "electricity_fail"
                  );
                }
              } else {
                responseMessage = `"Uh-oh! 😬 It looks like the transaction PIN you entered is incorrect. Please double-check your PIN and try again. If problems persist, contact our support team for assistance.`;
                // const msg = await sendTemplateMessage(
                //   senderNumber,
                //   "wrong__pin",
                //   phone_number_id
                // );
                await sendFlowMessage(
                  senderNumber,
                  "power_flow",
                  "1704209216986167",
                  phone_number_id,
                  `‎ \n${responseMessage}\n‎`,
                  "Buy power",
                  "QUESTION_ONE"
                )
                // const msgg = await sendTemplateflow(
                //   senderNumber,
                //   "meter_validation",
                //   phone_number_id
                // );

                const saveConvo = await saveConversation(
                  senderNumber,
                  "wrong__pin",
                  "wrong__pin",
                  "wrong__pin"
                );
              }
            } else {
              responseMessage = `You need to add ₦${amount_needed} to you wallet to complete this transaction, please fund your wallet and try again`;
              const msgg = await sendMessage(
                senderNumber,
                responseMessage,
                phone_number_id
              );
              const user = await User.findOne({ phoneNumber: senderNumber });
              // responseMessage = `*Kindly make a tranfer to the account details below to fund your wallet 💸:*\n\n*Account-Name*: ${user.accountName}\n*Account-Number*: ${user.accountNumber} \n*Bank*: ${user.bank}\n\n*Note*: Please include a transaction charge of ₦10 for deposites below ₦1000 and ₦20 for transactions above ₦1000 ✅ `;

              responseMessage = await getBankAccountDetails(user.phoneNumber);

              const msg = await sendMessage(
                senderNumber,
                responseMessage,
                phone_number_id
              );
              const saveConvo = await saveConversation(
                senderNumber,
                "electricity",
                "electricity",
                responseMessage
              );
            }
          } else {
            // const msg = await sendTemplateMessage(
            //   senderNumber,
            //   "click_register_",
            //   phone_number_id
            // );
            const msg = `

            Hey there! 👋 Welcome to MKonnect, your hub for seamless services and convenience! To get started, please register with us. Simply click the button below and follow the instructions. We're here to help you every step of the way. 🌟
    
    We're excited to have you join our community! If you need any assistance, feel free to reach out to our support line on WhatsApp using +2348056115343. 🎉 \n‎ `
    
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
              "click_register_",
              "click_register_",
              "click_register_"
            );
          }

          // const validatemeter = await fetchMeterValidation(
          //   meternumber,
          //   discoName,
          //   "prepaid"
          // );

          // if (powerAmount >= 2000) {
          //   if (validatemeter && validatemeter.data.invalid == false) {

          //     let meterCheck = await saveMeter.find({
          //       senderNumber: senderNumber,
          //       meterNumber: meternumber,
          //     });

          //     if (meterCheck.length <= 0) {
          //       const saveMeterNumber = new saveMeter({
          //         senderNumber: senderNumber, // Example sender number
          //         meterNumber: meternumber, // Example meter number
          //         meterName: validatemeter.data.name, // Example meter number
          //         meterAddress: validatemeter.data.address.trim(), // Example meter number
          //       });
          //       await saveMeterNumber.save();
          //     }
          //     await power.deleteMany({ senderNumber: senderNumber });
          //     const Power = new power({
          //       senderNumber: senderNumber, // Example sender number
          //       meterNumber: meternumber, // Example meter number
          //       amount: powerAmountPurchase, // Example amount
          //       discoName: discoName, // Example disco name
          //       pin: powerPin, // Example PIN
          //       meterName: validatemeter.data.name.trim(), // Example meter number
          //       meterAddress: validatemeter.data.address.trim(), // Example meter number
          //       profit: parseFloat(powerAmount) - powerAmountPurchase,
          //     });
          //     await Power.save();

          //     responseMessage = `
          //     Your Meter details have been successfully validated.🥳\n\n Name: ${
          //       validatemeter.data.name
          //     }\n Address: ${validatemeter.data.address.trim()}\n\nIf this matches your meter, kindly click on Complete Transaction. ⬇
          //     `;
          //     const msg = await sendMessage(
          //       senderNumber,
          //       responseMessage,
          //       phone_number_id
          //     );
          //     const msgg = await sendTemplateMessage(
          //       senderNumber,
          //       "complete_transaction ",
          //       phone_number_id
          //     );
          //     const saveConvo = await saveConversation(
          //       senderNumber,
          //       "complete_transaction",
          //       "complete_transaction",
          //       responseMessage
          //     );
          //   } else if (validatemeter && validatemeter.data.invalid == true) {
          //     const msg = await sendTemplateMessage(
          //       senderNumber,
          //       "invalid_meter",
          //       phone_number_id
          //     );
          //     const saveConvo = await saveConversation(
          //       senderNumber,
          //       "invalid_meter",
          //       "invalid_meter",
          //       "invalid_meter"
          //     );
          //   }
          // } else {
          //   responseMessage =
          //     "Minimum electricity payment is ₦2000, please increase the amount and try again.";
          //   const msg = await sendMessage(
          //     senderNumber,
          //     responseMessage,
          //     phone_number_id
          //   );
          //   const msgflow = await sendFlowMessage(
          //     senderNumber,
          //     "power_flow",
          //     "1704209216986167",
          //     phone_number_id,
          //     `‎ \nKindly click the button below to pay for your electricity. 💡\n‎`,
          //     "Buy power",
          //     "QUESTION_ONE"
          //   );
          //   const saveConvo = await saveConversation(
          //     senderNumber,
          //     "minimum amount",
          //     "minimum amount",
          //     responseMessage
          //   );
          // }

          res.sendStatus(200);
          return;
        } catch (error) {
          logger.error(`error power: ${error.stack}`);
          return;
        }
      }
      // registration flow
      else if (flowToken == "register_flow") {
        const responseJsonString =
          req.body.entry[0].changes[0].value.messages[0].interactive.nfm_reply
            .response_json;
        const responseJson = JSON.parse(responseJsonString);
        let fullName = responseJson.screen_0_TextInput_0;
        let email = responseJson.screen_0_TextInput_1;
        let pin = responseJson.screen_0_TextInput_2;
        let consent = responseJson.screen_0_OptIn_3;

        fullName = fullName.trim();
        const fullNamePattern = /^[A-Za-z]+(?:\s[A-Za-z]+)+$/;
        // console.log(fullNamePattern.test(fullName));
        let nameValidate = fullNamePattern.test(fullName);
        if (!nameValidate) {
          // console.log("name not valid");
          responseMessage = `Please provide your full name including your first and last name. For example, "Michael Mamman". 🔄`;
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
            "registration",
            "registeration",
            responseMessage
          );
          res.sendStatus(200);
        } else {
          let user = await User.findOneAndUpdate(
            { phoneNumber: senderNumber },
            {
              $set: {
                fullName: fullName,
                email: email,
                transactionPin: pin,
                consent: consent,
              },
            },
            { new: true }
          );

          if (user && user.fullName && user.email && user.transactionPin) {
            try {
              let fullName = user.fullName;
              let splitName = fullName.split(" ");
              let firstName = splitName[0];
              let surname = splitName.slice(1).join(" ");

              // create customer
              // console.log(fullName, firstName, surname, user.phoneNumber);
              const create_customer = await createCustomer(
                user.email,
                firstName,
                surname,
                user.phoneNumber
              );

              // create dedicated account
              let dedicated_account;
              if (create_customer.status == true) {
                dedicated_account = await createDedicatedAccount(
                  create_customer.data.id, "titan-paystack"
                );
              }

              // update user
              if (dedicated_account.status == true) {
                const userUpdate = await User.findOneAndUpdate(
                  { phoneNumber: senderNumber },
                  {
                    $set: {
                      paystackId: create_customer.data.id,
                      accountNumber: dedicated_account.data.account_number,
                      accountName: dedicated_account.data.account_name,
                      bank: dedicated_account.data.bank.name,
                    },
                  },
                  { new: true }
                );

                // send email
                await sendEmail(
                  userUpdate.email,
                  "Welcome to the Konnect family🎉🎉🎉",
                  userUpdate.fullName,
                  userUpdate.email,
                  userUpdate.accountNumber,
                  userUpdate.accountName,
                  userUpdate.bank,
                  userUpdate.transactionPin
                );

                // send messages
                responseMessage = `Welcome to the Konnect family, ${
                  user.fullName.split(" ")[0]
                } 🥳! 
                
                🎁 As a special welcome gift, we've credited your wallet with ₦150, which you can use to purchase 500MB of data. This bonus becomes available as soon as you make your first deposit of any amount (E fit be ₦10 😂). Start exploring the possibilities!
                
                What would you like to do today? 🚀`;
                
            
                await sendFlowMessageEndpoint(
                  senderNumber,
                  `menu_flow_${senderNumber}`,
                  "1051816780241701",
                  phone_number_id,
                  `‎\n${responseMessage}\n‎`,
                  "Get started",
                  "MENU"
                )

                const saveConvo = await saveConversation(
                  senderNumber,
                  "registration",
                  "registration",
                  responseMessage
                );

                // await mailchimpContact(user.email, firstName, surname);

                const user = {
                  phoneNumber: senderNumber,
                  email: userUpdate.email,
                  accountNumberPaystack: dedicated_account.data.account_number,
                  accountNamePaystack: dedicated_account.data.account_name,
                  bankPaystack: 'Paystack-Titan', 

                };
          
                await createBankDetails(user);



                // create bank account for wema bank
                if (create_customer.status == true) {
                  dedicated_account = await createDedicatedAccount(
                    create_customer.data.id, "wema-bank"
                  );
                }

              if (dedicated_account.status == true) {


                const updateUser = {
                  email: userUpdate.email,
                  accountNumberWema: dedicated_account.data.account_number,
                  accountNameWema: dedicated_account.data.account_name,
                  bankWema: "wema-bank",
                };
        
                // Update the document
                await updateBankDetails(updateUser);

              }

              responseMessage = await getBankAccountDetails(user.phoneNumber);
              msg = await sendMessage(
                senderNumber,
                responseMessage,
                phone_number_id
              );

                res.sendStatus(200);
              }
            } catch (error) {
              logger.error(error.stack);
              res.sendStatus(200);
            }
          }
        }
        return;
      }
      // generate payment link flow
      else if (flowToken == "amount_flow") {
        try {
          const user = await User.findOne({ phoneNumber: senderNumber });
          if (user) {
            amount = amount * 100;
            let generatePaymentLink = await initializeTransaction(
              user.email,
              amount
            );
            if (generatePaymentLink && generatePaymentLink.status == true) {
              let paymentLink = generatePaymentLink.data.authorization_url;
              let name = user.fullName;
              name = name.split(" ")[0];
              responseMessage = `To complete your deposit, please use this secure payment link: \n\nLink: ${paymentLink}. \n\nThank you for choosing us *${name}* 🚀🚀🚀`;
              const msg = await sendMessage(
                senderNumber,
                responseMessage,
                phone_number_id
              );
              const saveConvo = await saveConversation(
                senderNumber,
                "paymentLink",
                "paymentLink",
                "paymentLink"
              );
              res.sendStatus(200);
              return;
            } else if (generatePaymentLink == false) {
              // const msg = await sendTemplateMessage(
              //   senderNumber,
              //   "payment_link_fail ",
              //   phone_number_id
              // );
              let responseMessage = `We encountered an issue generating your payment link. 😞 Please try again later or contact our support team for assistance +2348056115343`
              const msg = await sendMessage(
                senderNumber,
                responseMessage,
                phone_number_id
              );
              const saveConvo = await saveConversation(
                senderNumber,
                "payment_link_fail ",
                "payment_link_fail ",
                "payment_link_fail "
              );
              res.sendStatus(200);
              return;
            }
          } else {
            // const msg = await sendTemplateMessage(
            //   senderNumber,
            //   "click_register_",
            //   phone_number_id
            // );
            const msg = `

            Hey there! 👋 Welcome to MKonnect, your hub for seamless services and convenience! To get started, please register with us. Simply click the button below and follow the instructions. We're here to help you every step of the way. 🌟
    
    We're excited to have you join our community! If you need any assistance, feel free to reach out to our support line on WhatsApp using +2348056115343. 🎉 \n‎ `
    
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
              "click_register_ ",
              "paymentLink",
              "click_register_ "
            );
            res.sendStatus(200);
            return;
          }
        } catch (error) {
          logger.error(`error processing paymentLink : ${error.stack}`);
          res.sendStatus(200);
          return;
        }
      }
      // data purchase flow
      else if (flowToken == "data_flow") {
        const network = responseJson.network;
        const number = responseJson.number;
        const plan = responseJson.plan;
        const pin = responseJson.pin;

        let vendorStatus = await status.find();
        let vendor;
        if (vendorStatus[0].vendor == "karldata") {
          vendor = FlowDataPlan;
        } else {
          vendor = FlowDataPlanUsuf;
        }

        // let planVerify = await vendor.findOne({
        //   id: plan,
        // });


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
        // console.log(planVerify);
        const numberValidate = validatePhoneNumber(number);
        if (numberValidate.isValid == true) {
          if (numberValidate.telco === network) {
            if (planVerify != null) {
              const sellingAmount = Math.ceil(parseFloat(planVerify.plan_amount) * 1.05);

              let balance = parseFloat(user.balance) - sellingAmount;

              const amountNeeded = Math.abs(parseFloat(user.balance) - sellingAmount);

              if (balance != 0 && balance < 0) {
                responseMessage = `You need to add ₦${amountNeeded} to your wallet to purchase this plan. Please fund your wallet and try again.`;
                // const msg = await sendMessage(
                //   senderNumber,
                //   responseMessage,
                //   phone_number_id
                // );
                // const msgTemp = await sendTemplateMessage(
                //   senderNumber,
                //   "fund_wallet_ ",
                //   phone_number_id
                // );
                const msgg = await sendMessage(
                  senderNumber,
                  responseMessage,
                  phone_number_id
                );
                const user = await User.findOne({ phoneNumber: senderNumber });
                // responseMessage = `*Kindly make a tranfer to the account details below to fund your wallet 💸:*\n\n*Account-Name*: ${user.accountName}\n*Account-Number*: ${user.accountNumber} \n*Bank*: ${user.bank}\n\n*Note*: Please include a transaction charge of ₦10 for deposites below ₦1000 and ₦20 for transactions above ₦1000 ✅ `;

                responseMessage = await getBankAccountDetails(user.phoneNumber);

                const msg = await sendMessage(
                  senderNumber,
                  responseMessage,
                  phone_number_id
                );
                const saveConvo = await saveConversation(
                  senderNumber,
                  "buy data flow",
                  toString(responseJson),
                  responseMessage
                );
              } else if (user.transactionPin == pin) {
                try {
                  const userUpdate = await User.findOneAndUpdate(
                    { phoneNumber: senderNumber },
                    { $set: { balance: balance.toString() } },
                    { new: true }
                  );
                  const internationalNumber = await convertToInternationalFormat(number);
                  facts = await getFacts();
                  facts = facts[0].fact.toLowerCase()
                  if(senderNumber == internationalNumber){

                     transactionDetails = `We're processing your data purchase ${user.fullName.split(" ")[0]}, while you wait, here's a fun fact for you, did you know that ${facts} 💡`

                  } else if (senderNumber != internationalNumber){
                    transactionDetails = `We're sending the data plan to ${number}, while you wait, here's a fun fact for you, did you know that ${facts} 💡`
                  } else{
                    transactionDetails = `Your data plan is on the way, while you wait, here's a fun fact for you, did you know that ${facts} 💡`
                  }

                  transactionDetails= 
                  "📢 *Important Update for Mkonnect Users* 🚨\n\n" +
                  "Hey " + user.fullName.split(" ")[0] + " 👋\n\n" +
                  "We want to keep you informed—due to a recent *tariff hike approved by the NCC*, data prices in Nigeria are increasing by *50%*.\n" +
                  "For example if a *1GB plan that used to cost ₦1,000 could now be around ₦1,500*.\n\n" +
                  "This change takes effect soon, so now might be a good time to *top up at the current rates* before the increase.\n\n" +
                  "We appreciate your support and will continue to provide you with the best deals possible! 💙\n\n" +
                  "For any questions, feel free to DM us. 📩\n\n" +
                  "*– Mkonnect Team*";


                  const msg = await sendMessage(
                    senderNumber,
                    transactionDetails,
                    phone_number_id
                  );
                  const payload = await ProcessData(network, plan, number, senderNumber);
                  // const payload = "failed"
                  // console.log(payload);

                  if (payload.Status == "successful") {
                    // const msg = await sendTemplateMessage(
                    //   senderNumber,
                    //   "data__success",
                    //   phone_number_id
                    // );
                      let responsemsg = await getDataSuccessMessage(balance)

                      await sendFlowMessageEndpoint(
                        senderNumber,
                        `menu_flow_${senderNumber}`,
                        "1051816780241701",
                        phone_number_id,
                        responsemsg,                        
                        "Menu",
                        "MENU"
                      )
                    const msg = await sendMessage(
                      senderNumber,
                      responsemsg,
                      phone_number_id
                    );

                    // let profit =
                    //   parseFloat(planVerify.plan_amount) -
                    //   parseFloat(payload.plan_amount);

                    // const saveTransaction = await savetransaction(
                    //   senderNumber,
                    //   payload.mobile_number,
                    //   `${payload.plan_network}-M`,
                    //   payload.plan_name,
                    //   planVerify.plan_amount,
                    //   profit,
                    //   payload.id,
                    //   vendorStatus[0].vendor
                    // );
                    await sendTransactionEmail(
                      "data",
                      userUpdate.email,
                      "Transaction Reciept🚀🚀🚀",
                      userUpdate.fullName,
                      userUpdate.email,
                      senderNumber,
                      payload.mobile_number,
                      payload.plan_network,
                      payload.plan_name,
                      sellingAmount,
                      payload.id
                    );

                    const saveConvo = await saveConversation(
                      senderNumber,
                      "data__success",
                      "data__success",
                      "data__success"
                    );

                    // await marketingMsg(senderNumber, phone_number_id);

                    if (profit < 0) {
                      const adminNumbers = await AdminUser.find({});
                      const message = `Dear Admin,\n\nA transaction has been processed that resulted in a loss. Please find the transaction details below:\n\n📌 Sender Number: ${senderNumber}  \n📌 Recipient Number: ${payload.mobile_number}  \n📌 Network: ${payload.plan_network}  \n📌 Plan Name: ${payload.plan_name}  \n📌 Plan Amount: ₦${planVerify.plan_amount}  \n📌 Loss Incurred: -₦${Math.abs(profit)}  \n📌 Transaction ID: ${payload.id}  \n\n⚠️ Action Required: Kindly review this transaction and take necessary measures.\n\nBest regards,  \nYour Automated Transaction Monitoring System`;
                      const subject = `MKONNECT LOSS OF -₦${Math.abs(profit)}🚨🚨🚨🚨`;
                      adminNumbers.forEach(async (adminNumber) => {
                      await sendVendorBalanceEmail(  adminNumber.email, subject, message)
                      });                     
                    }
                  }
                  else {



                    try {
                      // console.log(network, number);
                      // Attempt to retry the data plan
                      // const backup = await dataPlanRetry(network, planVerify.plan);
                      // console.log(backup);
                      let count = 0;

                  
                      let transactionSuccessful = false; // Flag to track transaction success
                  
                //       if (network != "AIRTEL"){
                //         let dataplan;

                //       // Update user balance
                //       const userUpdate = await User.findOneAndUpdate(
                //         { phoneNumber: senderNumber },
                //         { $set: { balance: balance.toString() } },
                //         { new: true }
                //       );

                //       let vendor = await status.find();

                //       if (vendor[0].vendor == "karldata") {

                //        dataplan = await FlowDataPlan.findOne({id: plan});
                //       } else {

                //         dataplan = await FlowDataPlanUsuf.findOne({id: plan});

                //       }

                //       if (dataplan != null){
                //       // Loop through the backup data
                //       for (const id of backup) {

                //         if (id.Amount <= dataplan.Amount){

                        
                //         count += 1;

                //         console.log(network, number, id.id);
                //         const payload = await dataRetry(network, number, id.id, senderNumber);
                //         // const payload = {
                //         //   Status: "successfu",
                //         //   id: 5656565,
                //         //   plan_name: "500.0MB",
                //         //   plan_amount: "148",
                //         //   mobile_number: "07030034134",
                //         //   plan_network: "MTN"
                //         // };
                  
                //         // Check if the payload was successful
                //         if (payload.Status === "successful") {
                //           await handleSuccessfulTransaction(
                //             payload,
                //             planVerify,
                //             balance,
                //             userUpdate,
                //             senderNumber,
                //             phone_number_id,
                //             count,
                //             vendor[0].vendor
                //           );
                //           transactionSuccessful = true; // Set flag to true on success
                //           break; // Stop further processing if successful
                //         }

                //       }
                //     }
                //   }
                // }
                      
                    
                  

                    
                  
                      // Only handle failed transactions if no successful transaction occurred
                      if (!transactionSuccessful) {
                        await handleFailedTransaction(
                          senderNumber,
                          planVerify,
                          number,
                          network,
                          balance,
                          phone_number_id
                        );
                      }
                  
                    } catch (error) {
                      console.log(error.stack);
                      logger.error(`An error occurred in data plan retry: ${error}`);
                    }



                  }
                  
                  // Function to handle successful transactions
                  async function handleSuccessfulTransaction(
                    payload,
                    planVerify,
                    balance,
                    userUpdate,
                    senderNumber,
                    phone_number_id,
                    count,
                    vendor
                  ) {
                    let responseMsg = await getDataSuccessMessage(balance)

                    await sendFlowMessageEndpoint(
                      senderNumber,
                      `menu_flow_${senderNumber}`,
                      "1051816780241701",
                      phone_number_id,
                      responseMsg,                        
                      "Menu",
                      "MENU"
                    )
                  
                    // await sendMessage(senderNumber, responseMsg, phone_number_id);

                    let profit = parseFloat(sellingAmount) - parseFloat(payload.plan_amount);

                    // await savetransaction(
                    //   senderNumber,
                    //   payload.mobile_number,
                    //   `${payload.plan_network}-M`,
                    //   `${payload.plan_name}-${count}`,
                    //   planVerify.plan_amount,
                    //   profit,
                    //   payload.id,
                    //   vendor
                    // );
                  
                    await sendTransactionEmail(
                      "data",
                      userUpdate.email,
                      "Transaction Reciept🚀🚀🚀",
                      userUpdate.fullName,
                      userUpdate.email,
                      senderNumber,
                      payload.mobile_number,
                      payload.plan_network,
                      payload.plan_name,
                      sellingAmount,
                      payload.id
                    );
                  
                    await saveConversation(senderNumber, "data__success", "data__success", "data__success");
                    // await marketingMsg(senderNumber, phone_number_id);

                    if (profit < 0) {
                      const adminNumbers = await AdminUser.find({});
                      const message = `Dear Admin,\n\nA transaction has been processed that resulted in a loss. Please find the transaction details below:\n\n📌 Sender Number: ${senderNumber}  \n📌 Recipient Number: ${payload.mobile_number}  \n📌 Network: ${payload.plan_network}  \n📌 Plan Name: ${payload.plan_name}  \n📌 Plan Amount: ₦${sellingAmount}  \n📌 Loss Incurred: -₦${Math.abs(profit)}  \n📌 Transaction ID: ${payload.id}  \n\n⚠️ Action Required: Kindly review this transaction and take necessary measures.\n\nBest regards,  \nYour Automated Transaction Monitoring System`;
                      const subject = `MKONNECT LOSS OF -₦${Math.abs(profit)}🚨🚨🚨🚨`;
                      adminNumbers.forEach(async (adminNumber) => {
                      await sendVendorBalanceEmail(  adminNumber.email, subject, message)
                      });                     
                    }
                  }
                  
                  // Function to handle failed transactions
                  async function handleFailedTransaction(
                    senderNumber,
                    planVerify,
                    number,
                    network,
                    balance,
                    phone_number_id
                  ) {
                    let user = await User.findOne({ phoneNumber: senderNumber });
                    let newBalance = parseFloat(user.balance) + parseFloat(planVerify.plan_amount);
                  
                    const userUpdate = await User.findOneAndUpdate(
                      { phoneNumber: senderNumber },
                      { $set: { balance: newBalance.toString() } },
                      { new: true }
                    );

                    await sendFailedTransactionMessage(user.fullName.split(" ")[0], senderNumber, phone_number_id)
                                    
                    await saveFailedtransaction(
                      senderNumber,
                      number,
                      network,
                      planVerify.plan,
                      sellingAmount,
                      payload.toString()
                    );

                    // TODO: UPDATE CONVERSION SAVING TO INCLUDE MORE DETAILS
                  
                    await saveConversation(senderNumber, "data_fail_", "data_fail_", "data_fail_");
                  }
                  
                  
                } catch (error) {
                  logger.error(error.stack);
                }
              } else {
                // const msg = await sendTemplateMessage(
                //   senderNumber,
                //   "wrong__pin",
                //   phone_number_id
                // );
                let responseMessage = `"Uh-oh! 😬 It looks like the transaction PIN you entered is incorrect. Please double-check your PIN and try again. If problems persist, contact our support team for assistance.`;
                await sendFlowMessageEndpoint(
                  senderNumber,
                  `menu_flow_${senderNumber}`,
                  "1051816780241701",
                  phone_number_id,
                  `‎\n${responseMessage}\n‎`,
                  "Buy Data",
                  "MENU"
                )

                const saveConvo = await saveConversation(
                  senderNumber,
                  "wrong__pin",
                  toString(responseJson),
                  "wrong__pin"
                );
              }
            }
          } else {
            responseMessage = `Looks like the phone number you entered is not a valid ${network} phone number, please check the number and try again 🔄`;
            const msg = await sendMessage(
              senderNumber,
              responseMessage,
              phone_number_id
            );
            const saveConvo = await saveConversation(
              senderNumber,
              "phone",
              "phone",
              responseMessage
            );
          }
        } else {
          responseMessage = `Please enter a valid number 📞. Example: +2348056115343`;
          const msg = await sendMessage(
            senderNumber,
            responseMessage,
            phone_number_id
          );
          const saveConvo = await saveConversation(
            senderNumber,
            "phone",
            "phone",
            responseMessage
          );
        }

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
      return;
    }
  } else {
    const responseJsonString =
      req.body.entry[0].changes[0].value.messages[0].interactive.nfm_reply
        .response_json;
    const responseJson = JSON.parse(responseJsonString);
    console.log(responseJson);
    let fullName = responseJson.screen_0_TextInput_0;
    let email = responseJson.screen_0_TextInput_1;
    let pin = responseJson.screen_0_TextInput_2;
    let consent = responseJson.screen_0_OptIn_3;

    fullName = fullName.trim();
    const fullNamePattern = /^[A-Za-z]+(?:\s[A-Za-z]+)+$/;
    // console.log(fullNamePattern.test(fullName));
    let nameValidate = fullNamePattern.test(fullName);
    if (!nameValidate) {
      // console.log("name not valid");
      responseMessage = `Please provide your full name including your first and last name. For example, "Michael Jackson". 🔄`;
      const msg = await sendMessage(
        senderNumber,
        responseMessage,
        phone_number_id
      );
      const saveConvo = await saveConversation(
        senderNumber,
        "registration",
        "registeration",
        responseMessage
      );
      res.sendStatus(200);
    } else {

      if (pin.toString().length === 4) {
      let user = await User.create({
        phoneNumber: senderNumber,
        fullName: fullName,
        email: email,
        transactionPin: pin,
        consent: consent,
      });

      if (user && user.fullName && user.email && user.transactionPin) {
        try {
          let fullName = user.fullName;
          let splitName = fullName.split(" ");
          let firstName = splitName[0];
          let surname = splitName.slice(1).join(" ");

          // create customer
          // console.log(fullName, firstName, surname, user.phoneNumber);
          const create_customer = await createCustomer(
            user.email,
            firstName,
            surname,
            user.phoneNumber
          );

          // create dedicated account
          let dedicated_account;
          if (create_customer.status == true) {
            dedicated_account = await createDedicatedAccount(
              create_customer.data.id, "titan-paystack"
            );
          }

          // update user
          if (dedicated_account.status == true) {
            const userUpdate = await User.findOneAndUpdate(
              { phoneNumber: senderNumber },
              {
                $set: {
                  paystackId: create_customer.data.id,
                  accountNumber: dedicated_account.data.account_number,
                  accountName: dedicated_account.data.account_name,
                  bank: dedicated_account.data.bank.name,
                },
              },
              { new: true }
            );

            // send email
            await sendEmail(
              userUpdate.email,
              "Welcome to the Konnect family🎉🎉🎉",
              userUpdate.fullName,
              userUpdate.email,
              userUpdate.accountNumber,
              userUpdate.accountName,
              userUpdate.bank,
              userUpdate.transactionPin
            );


              let sys_status = await status.find()
              sys_status = sys_status[0].WelcomeBonus
              // send messages
              let responseMessage = `Welcome to the Konnect family, ${user.fullName.split(" ")[0]}! 🥳`;

              if (sys_status) {
                responseMessage +=
                  `\n\n🎁 As a special welcome gift, we've credited your wallet with ₦150, which you can use to purchase 500MB of data. This bonus becomes available as soon as you make your first deposit of any amount (E fit be ₦50 or ₦500k 😂). Start exploring the possibilities!\n\nWhat would you like to do today? 🚀 \n\n🚨PLEASE USE PAYSTACK TITAN TO MAKE DEPOSITS AS WEMA BANK IS HAVING ISSUES.`;
              }
                            
            
                await sendFlowMessageEndpoint(
                  senderNumber,
                  `menu_flow_${senderNumber}`,
                  "1051816780241701",
                  phone_number_id,
                  `‎\n${responseMessage}\n‎`,
                  "Get started",
                  "MENU"
                )
            const saveConvo = await saveConversation(
              senderNumber,
              "registration",
              "registration",
              responseMessage
            );

            const newuser = {
              phoneNumber: userUpdate.phoneNumber,
              email: userUpdate.email,
              accountNumberPaystack: dedicated_account.data.account_number,
              accountNamePaystack: dedicated_account.data.account_name,
              bankPaystack: 'Paystack-Titan', 

            };
      
            await createBankDetails(newuser);



            // create bank account for wema bank
            if (create_customer.status == true) {
              dedicated_account = await createDedicatedAccount(
                create_customer.data.id, "wema-bank"
              );
            }

          if (dedicated_account.status == true) {


            const updateUser = {
              email: userUpdate.email,
              accountNumberWema: dedicated_account.data.account_number,
              accountNameWema: dedicated_account.data.account_name,
              bankWema: "wema-bank",
            };
    
            // Update the document
            await updateBankDetails(updateUser);

          }

          responseMessage = await getBankAccountDetails(user.phoneNumber);
          let msg = await sendMessage(
            senderNumber,
            responseMessage,
            phone_number_id
          );
            
            res.sendStatus(200);
          }
        } catch (error) {
          logger.error(error.stack);
          res.sendStatus(200);
        }
      }
    } else{

      const errorMessage = `⚠️ Your transaction PIN should be exactly 4 digits. Please try again with a valid PIN.\n`;

      // Send a message to the user
      await sendFlow(
        senderNumber,
        "register_flow",
        "470601328867010",
        phone_number_id,
        errorMessage,
        "Start Registeration",
        "QUESTION_ONE",
        "Welcome to MKonnect",
        "Thank you for choosing MKonnect."
      )
      // Log the validation error
      logger.info(`User with phone number ${phoneNumber} supplied a PIN longer than 4 digits.`);

      res.sendStatus(200);
    }
  }
    return;
  }
};



async function getDataSuccessMessage(balance) {
  // Construct the base message
  let message = `🎉 Your data purchase was successful!`;

  // Add balance info only if it's provided
  if (balance !== null && balance !== undefined) {
    message += `  
Balance: ₦${balance}. Time to surf the web, stream your favorites, and stay connected like never before! 🌟`;
  }

  // Add the rest of the message
  message += `

💡 Stay productive, entertained, and connected every day of the year! We've got you covered. 

Questions? We're here for you! Check your balance anytime with *323#. 📲\n \n 🚨PLEASE USE PAYSTACK TITAN TO MAKE DEPOSITS AS WEMA BANK IS HAVING ISSUES.`;

  return message;
}


async function sendFailedTransactionMessage(name, senderNumber, phone_number_id) {
  // Construct the base message

  const message = `It seems there was an issue processing your transaction ${name} 😓. Please try again, in 5-10 minutes 🔄. If the problem persists, reach out to our support team on WhatsApp using +2348056115343 for assistance. We apologize for any inconvenience and appreciate your understanding.
  
  `;

  
  await sendFlowMessageEndpoint(
    senderNumber,
    `menu_flow_${senderNumber}`,
    "1051816780241701",
    phone_number_id,
    message,                        
    "Menu",
    "MENU"
  )

  return
}



async function sendDataFailedTransactionMessage(name, senderNumber, phone_number_id, network, data_plan_type) {
  // Construct the base message

  
  let network_plan_types = await getPlanType(network);
  let alternative = network_plan_types.find(plan => plan.title !== data_plan_type);
  
  
  const message = `⚠️ Oops! The ${data_plan_type} data plan you selected isn't available right now. No worries! 😊 You can try again with the ${alternative.title} data plan or wait 5–10 minutes ⏳ and try again.\n\nIf the issue persists, reach out to our support team on WhatsApp at +2348056115343. We apologize for the inconvenience and appreciate your patience. 👍`;

   
  await sendFlowMessageEndpoint(
     senderNumber,
     `menu_flow_${senderNumber}`,
     "1051816780241701",
     phone_number_id,
     message,                        
     "Menu",
     "MENU"
   )

  console.log(network_plan_types, alternative);

  return
}