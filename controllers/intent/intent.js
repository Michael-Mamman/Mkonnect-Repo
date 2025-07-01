import DataPlan from "../../models/data.js";
import plan_select from "../../models/plan.js";
import power from "../../models/power.js";
import powerTransactions from "../../models/powerTransactions.js";
import saveMeter from "../../models/saveMeter.js";
import User from "../../models/users.js";
import { entity } from "../entities/entities.js";
import logger from "../logs.js";
import {
  createCustomer,
  createDedicatedAccount,
  initializeTransaction,
} from "../paystack.js";
import {
  processMessage,
  saveConversation,
  savetransaction,
  savePlan,
  sendMessage,
  sendTemplateMessage,
  checkBalance,
  ProcessData,
  sendEmail,
  sendTransactionEmail,
  sendTemplateflow,
  makeBillPayment,
  sendTokenReceipt,
  sendMediaMessage,
  marketingMsg,
  sendFlowMessage,
  sendFlowMessageEndpoint,
  sendFlow,
  getBankAccountDetails,
} from "../utils/utils.js";
import { vendor } from "../utils/vendor.js";

export const intent = async (
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
) => {

  try {
    intents.forEach(async (intent) => {

      if (intent.name === "check_balance") {
        try {
          responseMessage = await checkBalance(senderNumber);
          const msg = await sendMessage(
            senderNumber,
            responseMessage,
            phone_number_id
          );
          const saveConvo = await saveConversation(
            senderNumber,
            intent.name,
            messageBody,
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
            intent.name,
            messageBody,
            responseMessage
          );
          res.sendStatus(200);
        }
      } else if (intent.name === "buy_data") {
        try {
          await sendFlowMessageEndpoint(
            senderNumber,
            `menu_flow_${senderNumber}`,
            "1051816780241701",
            phone_number_id,
            "What would you like to do today? ✅",
            "Menu",
            "MENU"
          )
          const saveConvo = await saveConversation(
            senderNumber,
            intent.name,
            messageBody,
            "dataplans"
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
            intent.name,
            messageBody,
            responseMessage
          );
          res.sendStatus(200);
        }
      } else if (
        intent.name === "mtn_dataplans" ||
        intent.name === "airtel_dataplans" ||
        intent.name === "glo_dataplans" ||
        intent.name === "mobile9_dataplans"
      ) {
        const intentToTemplateMap = {
          mtn_dataplans: "mtn_plans",
          airtel_dataplans: "airtel_plans",
          glo_dataplans: "glo_plans",
          mobile9_dataplans: "9mobile_plans ",
        };

        const intentName = intent.name;

        if (intentToTemplateMap.hasOwnProperty(intentName)) {
          const templateName = intentToTemplateMap[intentName];
          const user = await User.findOne({ phoneNumber: senderNumber });
          // if (user) {
          //   responseMessage =  `Hi ${user.fullName.split(" ")[0]}, to serve you better, we've slightly increased our data prices. Thank you for your understanding. ❤`
          //   const msgg = await sendMessage(
          //     senderNumber,
          //     responseMessage,
          //     phone_number_id
          //   );
          // }
          // const msg = await sendTemplateMessage(
          //   senderNumber,
          //   templateName,
          //   phone_number_id
          // );
          const saveConvo = await saveConversation(
            senderNumber,
            intentName,
            messageBody,
            templateName
          );
          res.sendStatus(200);
        }
      } else if (intent.name === "register") {
        const user = await User.findOne({ phoneNumber: senderNumber });
        if (!user.fullName) {
          // const msg = await sendTemplateflow(
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
            intent.name,
            messageBody,
            "register"
          );
          res.sendStatus(200);
        } else {
          if (user && user.fullName && user.email && user.transactionPin) {
            await sendFlowMessageEndpoint(
              findUser.phoneNumber,
              `menu_flow_${senderNumber}`,
              "1051816780241701",
              id,
              `‎\nWhat would you like to do today? 🥳 \n‎`,
              "Menu",
              "MENU"
            )    
            const saveConvo = await saveConversation(
              senderNumber,
              intent.name,
              messageBody,
              "one_of_us"
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
                "wit$greetings",
                messageBody,
                responseMessage
              );
              res.sendStatus(200);
            }
          }
        }
      } else if (intent.name === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (emailRegex.test(text)) {
          console.log("Valid email address");
          const user = await User.findOne({ phoneNumber: senderNumber });

          if (user && user.fullName) {
            const checkEmail = await User.findOne({ email: text });
            if (checkEmail) {
              const responseMessage = `This email is already registered with us. Please use a different email. 🔄`;
              const msg = await sendMessage(
                senderNumber,
                responseMessage,
                phone_number_id
              );
              const saveConvo = await saveConversation(
                senderNumber,
                "wit$email",
                messageBody,
                responseMessage
              );
              res.sendStatus(200);
            } else {
              const user = await User.findOneAndUpdate(
                { phoneNumber: senderNumber },
                { email: text },
                { new: true }
              );
              // const msg = await sendTemplateMessage(
              //   senderNumber,
              //   "transaction_pin ",
              //   phone_number_id
              // );

              await sendFlowMessageEndpoint(
                senderNumber,
                `menu_flow_${senderNumber}`,
                "1051816780241701",
                phone_number_id,
                "What would you like to do today? ✅",
                "Menu",
                "MENU"
              )
              const saveConvo = await saveConversation(
                senderNumber,
                intent.name,
                messageBody,
                "transaction_pin "
              );
              res.sendStatus(200);
            }
          } else {
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
              intent.name,
              messageBody,
              "click_register_"
            );
            res.sendStatus(200);
          }
        } else {
          console.log("Invalid email address");
        }
      } else if (intent.name === "pin" && text.length === 4) {
        const user = await User.findOne({ phoneNumber: senderNumber });
        if (user && user.fullName) {
          const selected_plan = await plan_select
            .findOne({ senderNumber: senderNumber })
            .sort({ createdAt: -1 });

          const pinRegex = /^\d{4}$/;

          if (
            selected_plan &&
            selected_plan.intent &&
            selected_plan.intent === "select_plan"
          ) {
            let amount_needed = Math.abs(
              parseFloat(user.balance) - parseFloat(selected_plan.price)
            );

            if (user.fullName && user.email && user.transactionPin) {
              if (pinRegex.test(text)) {
                if (user.transactionPin === text) {
                  let userBalance =
                    parseFloat(user.balance) - parseFloat(selected_plan.price);

                  if (userBalance == 0 || userBalance > 0) {
                    try {
                      let newBalance =
                        parseFloat(user.balance) -
                        parseFloat(selected_plan.price);
                      const userUpdate = await User.findOneAndUpdate(
                        { phoneNumber: senderNumber },
                        { $set: { balance: newBalance.toString() } },
                        { new: true }
                      );

                      let networkId = await vendor(selected_plan.plan);

                      if (
                        selected_plan.network &&
                        selected_plan.receiverNumber &&
                        selected_plan.price
                      ) {
                        let payload = await ProcessData(
                          selected_plan.network,
                          networkId,
                          selected_plan.receiverNumber
                        );

                        if (payload.Status == "successful") {
                          let responsemsg = `Congratulations! 🎉 Your data purchase was successful. Enjoy seamless browsing and stay connected. If you have any questions or need assistance, feel free to ask. You can check your data balance using *323#`
                          // const msg = await sendTemplateMessage(
                          //   senderNumber,
                          //   "data__success_",
                          //   phone_number_id
                          // );
                          const msg = await sendMessage(
                            senderNumber,
                            responsemsg,
                            phone_number_id
                          );

                          
                          let profit =
                            parseFloat(selected_plan.price) -
                            parseFloat(payload.plan_amount);

                          const saveTransaction = await savetransaction(
                            senderNumber,
                            payload.mobile_number,
                            `${payload.plan_network}-C`,
                            payload.plan_name,
                            selected_plan.price,
                            profit,
                            payload.id
                          );
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
                            selected_plan.price,
                            payload.id
                          );
                          
                          const saveConvo = await saveConversation(
                            senderNumber,
                            intent.name,
                            messageBody,
                            "data__success_"
                          );
                          
                          await marketingMsg(senderNumber, phone_number_id)
                          res.sendStatus(200);
                        } else {
                          let user = await User.findOne({
                            phoneNumber: senderNumber,
                          });
                          let newBalance =
                            parseFloat(user.balance) +
                            parseFloat(selected_plan.price);
                          const userUpdate = await User.findOneAndUpdate(
                            { phoneNumber: senderNumber },
                            { $set: { balance: newBalance.toString() } },
                            { new: true }
                          );
                          responseMessage = `It seems there was an issue processing your data purchase ${user.fullName.split(" ")[0]} 😓. Please try again, in 15-20 minutes 🔄. If the problem persists, reach out to our support team on whatsApp using +2348056115343 for assistance. We apologize for any inconvenience and appreciate your understanding.`;
                          // const msg = await sendTemplateMessage(
                          //   senderNumber,
                          //   "data_fail_",
                          //   phone_number_id
                          // );
                          const msgg = await sendMessage(
                            senderNumber,
                            responseMessage,
                            phone_number_id
                          );
                          const saveConvo = await saveConversation(
                            senderNumber,
                            intent.name,
                            messageBody,
                            "data_fail_"
                          );
                          res.sendStatus(200);
                        }
                      } else {
                        responseMessage =
                          " Please select a data plan and receiver phone number first 🔄.";
                        const msg = await sendMessage(
                          senderNumber,
                          responseMessage,
                          phone_number_id
                        );

                        const saveConvo = await saveConversation(
                          senderNumber,
                          intent.name,
                          messageBody,
                          responseMessage
                        );
                        res.sendStatus(200);
                      }
                    } catch (error) {
                      res.sendStatus(200);
                      logger.error(error.stack);
                    }
                  } else {
                    responseMessage = `You need to add ₦${amount_needed} to you wallet to purchase this plan, please fund your wallet and try again`;
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
                      intent.name,
                      messageBody,
                      responseMessage
                    );
                    res.sendStatus(200);
                  }
                } else {
                  responseMessage = `"Uh-oh! 😬 It looks like the transaction PIN you entered is incorrect. Please double-check your PIN and try again. If problems persist, contact our support team for assistance.`;
                  // const msg = await sendTemplateMessage(
                  //   senderNumber,
                  //   "wrong__pin",
                  //   phone_number_id
                  // );

                  await sendFlowMessageEndpoint(
                    senderNumber,
                    `menu_flow_${senderNumber}`,
                    "1051816780241701",
                    phone_number_id,
                    "What would you like to do today? ✅",
                    "Menu",
                    "MENU"
                  )               
                  const saveConvo = await saveConversation(
                    senderNumber,
                    intent.name,
                    messageBody,
                    responseMessage
                  );
                  res.sendStatus(200);
                }
              } else {
                responseMessage = `Sorry but that's an invalid pin, try again!.`;
                const msg = await sendMessage(
                  senderNumber,
                  responseMessage,
                  phone_number_id
                );

                const saveConvo = await saveConversation(
                  senderNumber,
                  intent.name,
                  messageBody,
                  responseMessage
                );
                res.sendStatus(200);
              }
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
                  "wit$greetings",
                  messageBody,
                  responseMessage
                );
                res.sendStatus(200);
              }
            }
          } else {
            if (user && user.fullName) {
              if (pinRegex.test(text)) {
                if (user.email && user.transactionPin) {
                  responseMessage = `Welcome to the Konnect family ${
                    user.fullName.split(" ")[0]
                  } 🥳. What would you like to do today?`;
              
                  await sendFlowMessageEndpoint(
                    senderNumber,
                    `menu_flow_${senderNumber}`,
                    "1051816780241701",
                    phone_number_id,
                    `‎\n${responseMessage}\n‎`,
                    "Get started",
                    "MENU"
                  )
                  // const msg = await sendMessage(
                  //   senderNumber,
                  //   responseMessage,
                  //   phone_number_id
                  // );
                  // const tepmsg = await sendTemplateMessage(
                  //   senderNumber,
                  //   "cheap_data_plan",
                  //   phone_number_id
                  // );
                  const saveConvo = await saveConversation(
                    senderNumber,
                    intent.name,
                    messageBody,
                    responseMessage
                  );
                  res.sendStatus(200);
                } else if (!user.email) {
                  responseMessage = `Looks like we don't have your email yet, please provide your email before you setup your pin.`;
                  const msg = await sendMessage(
                    senderNumber,
                    responseMessage,
                    phone_number_id
                  );
                  const saveConvo = await saveConversation(
                    senderNumber,
                    intent.name,
                    messageBody,
                    responseMessage
                  );
                  res.sendStatus(200);
                } else if (!user.transactionPin) {
                  const user = await User.findOne({
                    phoneNumber: senderNumber,
                  });
                  let fullName = user.fullName;
                  let splitName = fullName.split(" ");
                  let firstName = splitName[0];
                  let surname = splitName.slice(1).join(" ");
                  try {
                    const create_customer = await createCustomer(
                      user.email,
                      firstName,
                      surname,
                      user.phoneNumber
                    );
                    if (create_customer.status == true) {
                      const dedicated_account = await createDedicatedAccount(
                        create_customer.data.id
                      );
                      if (dedicated_account.status == true) {
                        // const user = await User.findOneAndUpdate({ phoneNumber: senderNumber }, {"transactionPin": text}, { new: true });

                        const userUpdate = await User.findOneAndUpdate(
                          { phoneNumber: senderNumber },
                          {
                            $set: {
                              paystackId: create_customer.data.id,
                              accountNumber:
                                dedicated_account.data.account_number,
                              accountName: dedicated_account.data.account_name,
                              bank: dedicated_account.data.bank.name,
                              transactionPin: text,
                            },
                          },
                          { new: true }
                        );

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
                      }
                    }
                  } catch (error) {
                    logger.error(error.stack);
                  }

                  responseMessage = `Welcome to the Konnect family ${
                    user.fullName.split(" ")[0]
                  } 🥳. What would you like to do today?`;
              
                  await sendFlowMessageEndpoint(
                    senderNumber,
                    `menu_flow_${senderNumber}`,
                    "1051816780241701",
                    phone_number_id,
                    `‎\n${responseMessage}\n‎`,
                    "Get started",
                    "MENU"
                  )

                  // const msg = await sendMessage(
                  //   senderNumber,
                  //   responseMessage,
                  //   phone_number_id
                  // );
                  // const tepmsg = await sendTemplateMessage(
                  //   senderNumber,
                  //   "cheap_data_plan",
                  //   phone_number_id
                  // );
                  const saveConvo = await saveConversation(
                    senderNumber,
                    intent.name,
                    messageBody,
                    responseMessage
                  );
                  res.sendStatus(200);
                }
              } else {
                responseMessage = `Sorry but that's an invalid pin, try again!.`;
                const msg = await sendMessage(
                  senderNumber,
                  responseMessage,
                  phone_number_id
                );
                const saveConvo = await saveConversation(
                  senderNumber,
                  intent.name,
                  messageBody,
                  responseMessage
                );
                res.sendStatus(200);
              }
            } else {
              responseMessage = `Sorry but it seems like you've not started the registration process yet, please send your full name to get started.`;
              const msg = await sendMessage(
                senderNumber,
                responseMessage,
                phone_number_id
              );
              const saveConvo = await saveConversation(
                senderNumber,
                intent.name,
                messageBody,
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
            intent.name,
            messageBody,
            "click_register_"
          );
          res.sendStatus(200);
        }
      } else if (intent.name === "pin" && text.length > 4) {
        const processTrait = await entity(
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
      } else if (intent.name === "select_plan") {
        try {
          const user = await User.findOne({ phoneNumber: senderNumber });
          if (user && user.fullName) {
            if (user.email && user.transactionPin) {
              const text = messageBody;
              const dataPlanRegex =
                /^(MTN|GLO|AIRTEL|9MOBILE)\s+(\d+(\.\d+)?)\s*(GB|MB)/i;
              const match = text.match(dataPlanRegex);

              if (match) {
                const dataPlantype = match[2] + " " + match[4];
                // Split the string by " - " to separate the product name and the amount
                let splitString = text.split(" - ");
                let c = splitString[0].split("-")[0].split(" ");
                let planSize = c[1] + " " + c[2];
                // Extract the product name (MTN)
                let productName = splitString[0];
                // Extract the amount without the currency symbol (₦580)
                let amountWithCurrency = splitString[1];
                let amountWithoutCurrency = parseFloat(
                  amountWithCurrency.split("₦")[1]
                );
                // Extract only the first word of the product name (MTN)
                let onlyProvider = productName.split(" ")[0];
                // Extract the product name and data amount (MTN 2.0 GB)
                let productNameWithDataAmount = splitString[0];
                // Split the productNameWithDataAmount by space and take the first two elements
                let productNameWithoutGB = productNameWithDataAmount
                  .split(" ")
                  .slice(0, 2)
                  .join(" ");

                let planVerify = await DataPlan.findOne({
                  Network: onlyProvider,
                  Size: planSize,
                });
                if (planVerify) {
                  let planAmount = parseFloat(planVerify.Amount);
                  const select_plan = await savePlan(
                    "",
                    senderNumber,
                    productNameWithoutGB,
                    planAmount,
                    intent.name,
                    onlyProvider
                  );

                  let balance = parseFloat(user.balance) - planAmount;

                  const amountNeeded = Math.abs(
                    parseFloat(user.balance) - planAmount
                  );

                  if (balance != 0 && balance < 0) {
                    responseMessage = `You need to add ₦${amountNeeded} to you wallet to purchase this plan, please fund your wallet and try again`;
                    await sendFlowMessageEndpoint(
                      senderNumber,
                      `menu_flow_${senderNumber}`,
                      "1051816780241701",
                      phone_number_id,
                      responseMessage,
                      "Menu",
                      "MENU"
                    )                       
                    // responseMessage = `You need to add ₦${amountNeeded} to your wallet to purchase this plan. Please fund your wallet and try again.`;
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

                    const saveConvo = await saveConversation(
                      senderNumber,
                      intent.name,
                      messageBody,
                      responseMessage
                    );
                  } else {
                    switch (dataPlantype) {
                      case "25.0 MB":
                      case "100.0 MB":
                      case "200.0 MB":
                      case "300.0 MB":
                      case "500.0 MB":
                      case "1.0 GB":
                      case "2.0 GB":
                      case "3.0 GB":
                      case "4.0 GB":
                      case "5.0 GB":
                      case "10.0 GB":
                      case "11.0 GB":
                      case "20.0 GB":
                      case "40.0 GB":
                        await processMessage(
                          senderNumber,
                          intent.name,
                          messageBody,
                          phone_number_id
                        );
                        break;

                      default:
                        responseMessage = "Please select a valid data plan";
                        const msg = await sendMessage(
                          senderNumber,
                          responseMessage,
                          phone_number_id
                        );

                        const saveConvo = await saveConversation(
                          senderNumber,
                          intent.name,
                          messageBody,
                          responseMessage
                        );
                    }
                  }
                } else {
                  responseMessage = "Please select a valid data plan 🔄";
                  await sendFlowMessageEndpoint(
                    senderNumber,
                    `menu_flow_${senderNumber}`,
                    "1051816780241701",
                    phone_number_id,
                    responseMessage,
                    "Menu",
                    "MENU"
                  )                    
                  // const msg = await sendMessage(
                  //   senderNumber,
                  //   responseMessage,
                  //   phone_number_id
                  // );
                  // const msgg = await sendTemplateMessage(
                  //   senderNumber,
                  //   "dataplans_",
                  //   phone_number_id
                  // );
                  const saveConvo = await saveConversation(
                    senderNumber,
                    intent.name,
                    messageBody,
                    "dataplans"
                  );
                }
              } else {
                responseMessage = `Please try again.`;
                const msg = await sendMessage(
                  senderNumber,
                  responseMessage,
                  phone_number_id
                );

                const saveConvo = await saveConversation(
                  senderNumber,
                  intent.name,
                  messageBody,
                  responseMessage
                );
              }

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
                  "wit$greetings",
                  messageBody,
                  responseMessage
                );
                res.sendStatus(200);
              }
            }
          } else {
            let msgg = `

            Hey there! 👋 Welcome to MKonnect, your hub for seamless services and convenience! To get started, please register with us. Simply click the button below and follow the instructions. We're here to help you every step of the way. 🌟
    
    We're excited to have you join our community! If you need any assistance, feel free to reach out to our support line on WhatsApp using +2348056115343. 🎉 \n‎ `
    
            await sendFlow(
              senderNumber,
              "register_flow",
              "470601328867010",
              phone_number_id,
              msgg,
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
              intent.name,
              messageBody,
              "click_register_"
            );
            res.sendStatus(200);
          }
        } catch (error) {
          logger.error(`error processing select plan: ${error.stack}`);
        }
      } else if (intent.name === "bank_transfer") {
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
                intent.name,
                messageBody,
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
                  "wit$greetings",
                  messageBody,
                  responseMessage
                );
                res.sendStatus(200);
              }
            }
          } else {
            const msggg = `

            Hey there! 👋 Welcome to MKonnect, your hub for seamless services and convenience! To get started, please register with us. Simply click the button below and follow the instructions. We're here to help you every step of the way. 🌟
    
    We're excited to have you join our community! If you need any assistance, feel free to reach out to our support line on WhatsApp using +2348056115343. 🎉 \n‎ `
    
            await sendFlow(
              senderNumber,
              "register_flow",
              "470601328867010",
              phone_number_id,
              msggg,
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
              intent.name,
              messageBody,
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
            intent.name,
            messageBody,
            responseMessage
          );
          res.sendStatus(200);
        }
      } else if (intent.name === "atm_card") {
        try {
          let user = await User.findOne({ phoneNumber: senderNumber });
          if (user) {
            // const msg = await sendTemplateflow(
            //   senderNumber,
            //   "amount_",
            //   phone_number_id
            // );

            await sendFlowMessage  (
              senderNumber,
              "amount_flow",
              "2837459326405957",
              phone_number_id,
              `‎ \nHow much will you like to deposit💸\n‎`,
              "Amount",
              "QUESTION_ONE"
  
            )
            const saveConvo = await saveConversation(
              senderNumber,
              "amount_",
              messageBody,
              "amount_"
            );
            res.sendStatus(200);
          } else {
            let msgfggg = `

            Hey there! 👋 Welcome to MKonnect, your hub for seamless services and convenience! To get started, please register with us. Simply click the button below and follow the instructions. We're here to help you every step of the way. 🌟
    
    We're excited to have you join our community! If you need any assistance, feel free to reach out to our support line on WhatsApp using +2348056115343. 🎉 \n‎ `
    
            await sendFlow(
              senderNumber,
              "register_flow",
              "470601328867010",
              phone_number_id,
              msgfggg,
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
              messageBody,
              "click_register_ "
            );
            res.sendStatus(200);
          }
        } catch (error) {
          logger.error(`error processing fund intent: ${error.stack}`);
          res.sendStatus(200);
        }
      } else if (intent.name === "opt_in") {
        await User.findOneAndUpdate(
          { phoneNumber: senderNumber },
          { consent: true }
        );
        // const msg = await sendTemplateMessage(
        //   senderNumber,
        //   "opt_in_ok",
        //   phone_number_id
        // );
        const saveConvo = await saveConversation(
          senderNumber,
          intent.name,
          messageBody,
          "opt_in_ok"
        );
        res.sendStatus(200);
      } else if (intent.name === "opt_out") {
        let textLower = text.toLowerCase();
        if (
          textLower == "opt out" ||
          textLower == "stop promotions" ||
          textLower == "unsubscribe" ||
          textLower == "stop promotion"
        ) {
          await User.findOneAndUpdate(
            { phoneNumber: senderNumber },
            { consent: false }
          );
          // const msg = await sendTemplateMessage(
          //   senderNumber,
          //   "opt_out_ok",
          //   phone_number_id
          // );
          const saveConvo = await saveConversation(
            senderNumber,
            intent.name,
            messageBody,
            "opt_out_ok"
          );
          res.sendStatus(200);
        } else {
          // const msg = await sendTemplateMessage(
          //   senderNumber,
          //   "opt_out",
          //   phone_number_id
          // );
          const saveConvo = await saveConversation(
            senderNumber,
            intent.name,
            messageBody,
            "opt_out"
          );
          res.sendStatus(200);
        }
      } else if (intent.name === "menu") {
        await sendFlowMessageEndpoint(
          senderNumber,
          `menu_flow_${senderNumber}`,
          "1051816780241701",
          phone_number_id,
          `‎\nWhat would you like to do today? 🎉\n‎`,
          "Menu",
          "MENU"
        )
        const saveConvo = await saveConversation(
          senderNumber,
          intent.name,
          messageBody,
          `menu_flow_${senderNumber}`
        );
        res.sendStatus(200);
      } else if (intent.name === "buy_airtime") {
        try {
          // const msg = await sendTemplateflow(
          //   senderNumber,
          //   "buy_airtime",
          //   phone_number_id,
          //   "airtime_flow"
          // );

          await sendFlowMessage  (
            senderNumber,
            "airtime_flow",
            "314556411376637",
            phone_number_id,
            `‎ \nKindly click the button below to purchase airtime\n‎`,
            "Airtime Purchase",
            "QUESTION_ONE"

          )
          const saveConvo = await saveConversation(
            senderNumber,
            intent.name,
            messageBody,
            "buy_airtime"
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
            intent.name,
            messageBody,
            responseMessage
          );
          res.sendStatus(200);
        }
      } else if (intent.name === "buluku") {
        // const msg = await sendTemplateMessage(
        //   senderNumber,
        //   "buluku",
        //   phone_number_id
        // );
        // const saveConvo = await saveConversation(
        //   senderNumber,
        //   "buluku",
        //   messageBody,
        //   "buluku"
        // );
        res.sendStatus(200);
      } else if (intent.name === "test") {
        // const msg = await sendTemplateMessage(
        //   senderNumber,
        //   "data_method_",
        //   phone_number_id
        // );
        await sendFlowMessageEndpoint(
          senderNumber,
          `menu_flow_${senderNumber}`,
          "1051816780241701",
          phone_number_id,
          `‎\nMkonnect just got even easier, you can now do everthing you love in one place. 🥳 Click the button below to experience Mkonnect 2.0 🚀🚀🚀 \n‎`,
          "Menu",
          "MENU"
        )

        // const saveConvo = await saveConversation(
        //   senderNumber,
        //   "meter_validation ",
        //   messageBody,
        //   "meter_validation "
        // );
        res.sendStatus(200);
      } else if (intent.name === "fund") {
        try {
          let user = await User.findOne({ phoneNumber: senderNumber });
          if (user.email && user.transactionPin) {
            // responseMessage = `*Kindly make a tranfer to the account details below to fund your wallet 💸:*\n\n*Account-Name*: ${user.accountName}\n*Account-Number*: ${user.accountNumber} \n*Bank*: ${user.bank}\n\n*Note*: Please include a transaction charge of ₦10 for deposites below ₦1000 and ₦20 for transactions above ₦1000 ✅ `;

            responseMessage = await getBankAccountDetails(user.phoneNumber);

            let msg = await sendMessage(
              senderNumber,
              responseMessage,
              phone_number_id
            );
            const saveConvo = await saveConversation(
              senderNumber,
              intent.name,
              messageBody,
              responseMessage
            );
            res.sendStatus(200);
          } else {
            let responsee = `

            Hey there! 👋 Welcome to MKonnect, your hub for seamless services and convenience! To get started, please register with us. Simply click the button below and follow the instructions. We're here to help you every step of the way. 🌟
    
    We're excited to have you join our community! If you need any assistance, feel free to reach out to our support line on WhatsApp using +2348056115343. 🎉 \n‎ `
    
            await sendFlow(
              senderNumber,
              "register_flow",
              "470601328867010",
              phone_number_id,
              responsee,
              "Start Registeration",
              "QUESTION_ONE",
              "Welcome to MKonnect",
              "Thank you for choosing MKonnect."
            )
            const saveConvo = await saveConversation(
              senderNumber,
              "click_register_ ",
              messageBody,
              "click_register_ "
            );
            // const msg = await sendTemplateMessage(
            //   senderNumber,
            //   "click_register_",
            //   phone_number_id
            // );
            res.sendStatus(200);
          }
        } catch (error) {
          logger.error(`error processing fund intent: ${error.stack}`);
          res.sendStatus(200);
        }
      } else if (intent.name === "power") {
        try {
          // const msg = await sendTemplateflow(
          //   senderNumber,
          //   "meter_validation ",
          //   phone_number_id
          // );

          await sendFlowMessage(
            senderNumber,
            "power_flow",
            "1704209216986167",
            phone_number_id,
            `‎ \nKindly click the button below to pay for your electricity. 💡\n‎`,
            "Buy power",
            "QUESTION_ONE"
          )

          const saveConvo = await saveConversation(
            senderNumber,
            "meter_validation ",
            messageBody,
            "meter_validation "
          );
          res.sendStatus(200);
        } catch (error) {
          logger.error(`error processing power intent: ${error.stack}`);
          res.sendStatus(200);
        }
      } else if (intent.name === "power_done") {
        await sendFlowMessage(
          senderNumber,
          "power_flow",
          "1704209216986167",
          phone_number_id,
          `‎ \nKindly click the button below to pay for your electricity. 💡\n‎`,
          "Buy power",
          "QUESTION_ONE"
        )
        res.sendStatus(200);


        // try {
        //   let user = await User.findOne({ phoneNumber: senderNumber });
        //   let powerTracking = await power.findOne({
        //     senderNumber: senderNumber,
        //   });
        //   let amount_needed = Math.abs(
        //     parseFloat(user.balance) - parseFloat(powerTracking.amount)
        //   );

        //   if (user && user.fullName && user.email && user.transactionPin) {
        //     if (parseFloat(user.balance) >= parseFloat(powerTracking.amount)) {
        //       if (user.transactionPin === powerTracking.pin) {
        //         let discoId;
        //         switch (powerTracking.discoName) {
        //           case "Ikeja Electric":
        //             discoId = 1;
        //             break;
        //           case "Eko Electric":
        //             discoId = 2;
        //             break;
        //           case "Abuja Electric":
        //             discoId = 3;
        //             break;
        //           case "Kano Electric":
        //             discoId = 4;
        //             break;
        //           case "Enugu Electric":
        //             discoId = 5;
        //             break;
        //           case "Port Harcourt Electric":
        //             discoId = 6;
        //             break;
        //           case "Ibadan Electric":
        //             discoId = 7;
        //             break;
        //           case "Kaduna Electric":
        //             discoId = 8;
        //             break;
        //           case "Jos Electric":
        //             discoId = 9;
        //             break;
        //           case "Benin Electric":
        //             discoId = 10;
        //             break;
        //           case "Yola Electric":
        //             discoId = 11;
        //             break;
        //           default:
        //             discoId = 0;
        //         }

        //         let newBalance =
        //           parseFloat(user.balance) - parseFloat(powerTracking.amount);
        //         const userUpdate = await User.findOneAndUpdate(
        //           { phoneNumber: senderNumber },
        //           { $set: { balance: newBalance.toString() } },
        //           { new: true }
        //         );

        //         const generateToken = await makeBillPayment(
        //           discoId,
        //           powerTracking.amount,
        //           powerTracking.meterNumber,
        //           "Prepaid",
        //           senderNumber,
        //           powerTracking.meterName,
        //           powerTracking.meterAddress
        //         );

        //         if (generateToken.status == true) {
        //           responseMessage = `Up NEPA! 🎉\n\nGreat news ${
        //             user.fullName.split(" ")[0]
        //           } your electricity bill payment was successful.\n\n💡 ${
        //             generateToken.data.token
        //           }\n\nThank you for choosing our service! If you have any questions, feel free to reach out.`;

        //           const msg = await sendMessage(
        //             senderNumber,
        //             responseMessage,
        //             phone_number_id
        //           );
        //           await sendFlowMessageEndpoint(
        //             senderNumber,
        //             `menu_flow_${senderNumber}`,
        //             "1051816780241701",
        //             phone_number_id,
        //             `‎\nTry out our other services and yes ${user.fullName.split(" ")[0]} life can be this easy.🚀🚀🚀 \n‎`,
        //             "Menu",
        //             "MENU"
        //           )

        //           let saveTransaction = await powerTransactions.create({
        //             senderNumber: senderNumber,
        //             package: generateToken.data.package,
        //             meter_number: generateToken.data.meter_number,
        //             token: generateToken.data.token,
        //             amount: generateToken.data.amount,
        //             customer_name: generateToken.data.customer_name,
        //             customer_address: generateToken.data.customer_address,
        //             profit: powerTracking.profit,
        //             id: generateToken.data.id,
        //           });
        //           let customerAmount =
        //             parseFloat(generateToken.data.amount) +
        //             parseFloat(powerTracking.profit);
        //           await sendTokenReceipt(
        //             user.email,
        //             "Up NEPA 🎉",
        //             user.fullName,
        //             user.phoneNumber,
        //             generateToken.data.token,
        //             generateToken.data.customer_name,
        //             generateToken.data.customer_address,
        //             customerAmount
        //           );

        //           const saveConvo = await saveConversation(
        //             senderNumber,
        //             "power_done",
        //             messageBody,
        //             "power_done"
        //           );
        //         }else{
        //           const msgTemp = await sendTemplateMessage(
        //             senderNumber,
        //             "electricity_fail",
        //             phone_number_id
        //           );
        //           const msgTempp = await sendTemplateMessage(
        //             "2347030034134",
        //             "electricity_fail",
        //             phone_number_id
        //           );
        //           const saveConvo = await saveConversation(
        //             senderNumber,
        //             intent.name,
        //             messageBody,
        //             "electricity_fail"
        //           );
        //         }
        //       } else {

        //         responseMessage = `"Uh-oh! 😬 It looks like the transaction PIN you entered is incorrect. Please double-check your PIN and try again. If problems persist, contact our support team for assistance.`;
        //         const msg = await sendTemplateMessage(
        //           senderNumber,
        //           "wrong__pin",
        //           phone_number_id
        //         );
        //         // const msgg = await sendTemplateflow(
        //         //   senderNumber,
        //         //   "meter_validation",
        //         //   phone_number_id
        //         // );

        //         await sendFlowMessage(
        //           senderNumber,
        //           "power_flow",
        //           "1704209216986167",
        //           phone_number_id,
        //           `‎ \nKindly click the button below to pay for your electricity. 💡\n‎`,
        //           "Buy power",
        //           "QUESTION_ONE"
        //         )

        //         const saveConvo = await saveConversation(
        //           senderNumber,
        //           "wrong__pin",
        //           messageBody,
        //           "wrong__pin"
        //         );
        //       }
        //     } else {
        //       responseMessage = `You need to add ₦${amount_needed} to you wallet to purchase this plan, please fund your wallet and try again`;
        //       await sendFlowMessageEndpoint(
        //         senderNumber,
        //         `menu_flow_${senderNumber}`,
        //         "1051816780241701",
        //         phone_number_id,
        //         responseMessage,
        //         "Menu",
        //         "MENU"
        //       )   

        //       // responseMessage = `You need to add ₦${amount_needed} to you wallet to complete this transaction, please fund your wallet and try again`;
        //       // const msg = await sendMessage(
        //       //   senderNumber,
        //       //   responseMessage,
        //       //   phone_number_id
        //       // );
        //       // const msgTemp = await sendTemplateMessage(
        //       //   senderNumber,
        //       //   "fund_wallet_ ",
        //       //   phone_number_id
        //       // );
        //       const saveConvo = await saveConversation(
        //         senderNumber,
        //         intent.name,
        //         messageBody,
        //         responseMessage
        //       );
        //     }
        //   } else {
        //     const msg = await sendTemplateMessage(
        //       senderNumber,
        //       "click_register_",
        //       phone_number_id
        //     );
        //     const saveConvo = await saveConversation(
        //       senderNumber,
        //       "click_register_",
        //       messageBody,
        //       "click_register_"
        //     );
        //   }
        //   res.sendStatus(200);
        // } catch (error) {
        //   logger.error(`error processing power intent: ${error.stack}`);
        //   res.sendStatus(200);
        // }

      } else if (intent.name === "saved_meter") {
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

          // Now you can send this message to the user via WhatsApp
        } else {
          responseMessage = `You have not saved any meters yet.`;
          const msg = await sendMessage(
            senderNumber,
            responseMessage,
            phone_number_id
          );
          // const msgg = await sendTemplateflow(
          //   senderNumber,
          //   "meter_validation ",
          //   phone_number_id
          // );

          await sendFlowMessage(
            senderNumber,
            "power_flow",
            "1704209216986167",
            phone_number_id,
            `‎ \nKindly click the button below to pay for your electricity. 💡\n‎`,
            "Buy power",
            "QUESTION_ONE"
          )
        }
        res.sendStatus(200);
      } else if (intent.name === "tutorial") {
        try {
          text = text.toLowerCase();
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
            await sendFlowMessageEndpoint(
              senderNumber,
              `menu_flow_${senderNumber}`,
              "1051816780241701",
              phone_number_id,
              "Check out our tutorial videos to learn how to use Mkonnect. 📚 \n\nDon't enjoy Mkonnect alone  😎, invite your friends and family to join you on this journey. 💪 \n\nLink: https://wa.me/message/O3GO6ETN3A3CH1",
              "Menu",
              "MENU"
            )
            // const msg1 = await sendTemplateMessage(
            //   senderNumber,
            //   "tutorial",
            //   phone_number_id
            // );
          }
        } catch (error) {
          logger.error(`error processing tutorial intent:  ${error.stack}`);
        }
        res.sendStatus(200);
      } else if (intent.name === "data_method"){
        text = text.toLowerCase();
        if (text.includes("classic")){
          await sendFlowMessageEndpoint(
            senderNumber,
            `menu_flow_${senderNumber}`,
            "1051816780241701",
            phone_number_id,
            "What would you like to do today? ✅",
            "Menu",
            "MENU"
          )
          const saveConvo = await saveConversation(
            senderNumber,
            intent.name,
            messageBody,
            "dataplans"
          );
          res.sendStatus(200);
        }else if(text.includes("modern")){
          await sendFlowMessageEndpoint(
            senderNumber,
            `menu_flow_${senderNumber}`,
            "1051816780241701",
            phone_number_id,
            "What would you like to do today? ✅",
            "Menu",
            "MENU"
          )
          const saveConvo = await saveConversation(
            senderNumber,
            intent.name,
            messageBody,
            "dataplans flow"
          );
          res.sendStatus(200);

        }
      }
    });
  } catch (error) {
    logger.error(`error processing intent: ${error.stack}`);
    res.sendStatus(200);
  }
};
