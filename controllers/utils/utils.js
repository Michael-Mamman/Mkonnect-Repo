import dotenv from "dotenv";
import Conversation from "../../models/chatbot.js";
import User from "../../models/users.js";
import transaction from "../../models/transactions.js";
import plan_select from "../../models/plan.js";
import axios from "axios";
import logger from "../logs.js";
import status from "../../models/status.js";
import { loggers } from "winston";
import nodemailer from "nodemailer";
import Job from "../../models/job.js";
import failedTransaction from "../../models/failedDataTransactions.js";
import FlowDataPlan from "../../models/flowDataplans.js";
import FlowDataPlanUsuf from "../../models/flowDataplansUsuf.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import QRCode from "qrcode";
import crypto from "crypto";
import mailchimp from "@mailchimp/mailchimp_marketing";
import BankDetails from "../../models/bankDetails.js";
import fss from "fs/promises"; // Use the promises version of fs
import { parse } from "json2csv"; // Correctly import the parse function from json2csv

dotenv.config();

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const BUY_DATA = process.env.BUY_DATA;
const BUY_AIRTIME = process.env.BUY_AIRTIME;
let token;
const token1 = process.env.WHATSAPP_TOKEN;
const token2 = process.env.WHATSAPP_TOKEN_BACKUP;
const FUN_FACT_KEY = process.env.FUN_FACT_KEY;
const EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const FROM_EMAIL = process.env.FROM_EMAIL;
const KEY = process.env.KEY;
const KARL_DATA_TOKEN = process.env.KARL_DATA_TOKEN;
const USUF_DATA_TOKEN = process.env.USUF_DATA_TOKEN;

async function generateUniqueId(length = 16) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

const generateQRCode = async (url) => {
  try {
    const filePath = "./public/receipt/qrcode/qrcode.png";
    await QRCode.toFile(filePath, url);
    console.log(`QR Code saved at ${filePath}`);
    return filePath;
  } catch (err) {
    console.error("Error generating QR code:", err);
  }
};

export const generateReceipt = async (
  customerName,
  address,
  meterNumber,
  date,
  product,
  provider,
  serviceCharge,
  costOfUtility,
  totalPaid,
  token
) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Pipe its output to a file
  const transactionRef = await generateUniqueId(16);

  const url = `https://mkonnect.com.ng/receipt/Mkonnect_receipt_${transactionRef}.pdf`;
  const filename = `./public/receipt/Mkonnect_receipt_${transactionRef}.pdf`;
  doc.pipe(fs.createWriteStream(filename));
  doc.registerFont("Roboto", "fonts/Roboto-Black.ttf");
  doc.registerFont("Roboto-Italic", "fonts/Roboto-Italic.ttf");

  const pageWidth = doc.page.width;
  const imageWidth = 260; // Set the image width here
  const imageX = (pageWidth - imageWidth) / 2; // Calculate the X position to center the image

  doc.image(
    "./public/assets/logo/Transparent/mkonnect_logo__Trans_Logo_03.png",
    imageX,
    45,
    { width: imageWidth }
  );
  doc.moveDown(4).font("Roboto-Italic");

  // doc.fontSize(12).text('Stay connected with Konnect.', { align: 'center' }).moveDown(2).font('Roboto-Italic');

  doc.moveDown(2);

  // Title and Date
  doc
    .fontSize(16)
    .text("Electricity Purchase Receipt", { align: "center" })
    .moveDown(0.5);
  doc.fontSize(12).text(`Date: 03/04/2025, 10:24:33`, { align: "center" }).font("Roboto");

  // Transaction Details Table
  const tableTop = doc.y + 10;
  // doc.fontSize(12).text('Transaction Details', 50, tableTop - 10);

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  const transactionDetails = [
    { label: "Customer Name", value: customerName },
    { label: "Address", value: address },
    { label: "Meter Number", value: meterNumber },
    { label: "Product", value: product },
    { label: "Provider", value: provider },
    { label: "Transaction Ref", value: transactionRef },
    { label: "Service Charge", value: formatter.format(serviceCharge) },
    { label: "Cost of Utility", value: formatter.format(costOfUtility) },
    { label: "Total Paid", value: formatter.format(totalPaid) },
  ];

  transactionDetails.forEach((item, i) => {
    const y = tableTop + (i + 1) * 40;
    doc
      .text(item.label, 80, y)
      .text(item.value, 320, y, { align: "left" })
      .font("Roboto");
  });

  // Token Section
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(`${token}`, 50, 650, {
      align: "center",
      fillColor: "black",
      underline: true,
    })
    .font("Roboto-Italic");

  let qr_code = await generateQRCode(url);
  console.log(imageX);
  // doc.image(`${qr_code}`, 270, 680, { width: 70 });

  // Footer
  doc
    .fontSize(10)
    .text("Stay connected with Konnect.", 50, 780, {
      align: "center",
      width: 500,
    })
    .font("Roboto-Italic");

  doc.end();

  console.log(`Styled receipt generated and saved as ${filename}`);
  return url;
};

export const test = async (req, res) => {
  const { network, plan } = req.body;
  let id = network;
  id = id.toUpperCase();
  let vendorStatus = await status.find();

  try {
    if (vendorStatus[0].vendor == "karldata") {
      if (id === "9MOBILE") {
        const dataplan = await FlowDataPlan.find({
          Network: "9MOBILE",
          Size: plan,
        });
        return dataplan;
      } else if (id === "MTN") {
        const dataplan = await FlowDataPlan.find({
          Network: "MTN",
          Size: plan,
        });
        return dataplan;
      } else if (id === "AIRTEL") {
        const dataplan = await FlowDataPlan.find({
          Network: "AIRTEL",
          Size: plan,
        });
        return dataplan;
      } else if (id === "GLO") {
        const dataplan = await FlowDataPlan.find({
          Network: "GLO",
          Size: plan,
        });
        return dataplan;
      } else {
        // res.status(404).json({ message: "No data found" });
        return [];
      }
    } else {
      if (id === "9MOBILE") {
        const dataplan = await FlowDataPlanUsuf.find({
          Network: "9MOBILE",
          Size: plan,
        });
        return dataplan;
      } else if (id === "MTN") {
        const dataplan = await FlowDataPlanUsuf.find({
          Network: "MTN",
          Size: plan,
        });
        return dataplan;
      } else if (id === "AIRTEL") {
        const dataplan = await FlowDataPlanUsuf.find({
          Network: "AIRTEL",
          Size: plan,
        });
        return dataplan;
      } else if (id === "GLO") {
        const dataplan = await FlowDataPlanUsuf.find({
          Network: "GLO",
          Size: plan,
        });
        return dataplan;
      } else {
        // res.status(404).json({ message: "No data found" });
        return [];

      }
    }
  } catch (error) {
    logger.error(`error getting data plans: ${error.stack}`);
    return error.message;
  }
};

export const dataPlanRetry = async (network, plan) => {
  let id = network;
  id = id.toUpperCase();
  let vendorStatus = await status.find();

  try {
    if (vendorStatus[0].vendor == "karldata") {
      if (id === "9MOBILE") {
        const dataplan = await FlowDataPlanUsuf.find({
          Network: "9MOBILE",
          Size: plan,
        });
        return dataplan;
      } else if (id === "MTN") {
        const dataplan = await FlowDataPlanUsuf.find({
          Network: "MTN",
          Size: plan,
        });
        return dataplan;
      } else if (id === "AIRTEL") {
        const dataplan = await FlowDataPlanUsuf.find({
          Network: "AIRTEL",
          Size: plan,
        });
        return dataplan;
      } else if (id === "GLO") {
        const dataplan = await FlowDataPlanUsuf.find({
          Network: "GLO",
          Size: plan,
        });
        return dataplan;
      } else {
        // res.status(200).json({ message: "No data found" });
        return [];
      }
    } else {
      if (id === "9MOBILE") {
        const dataplan = await FlowDataPlan.find({
          Network: "9MOBILE",
          Size: plan,
        });
        return dataplan;
      } else if (id === "MTN") {
        const dataplan = await FlowDataPlan.find({
          Network: "MTN",
          Size: plan,
        });
        return dataplan;
      } else if (id === "AIRTEL") {
        const dataplan = await FlowDataPlan.find({
          Network: "AIRTEL",
          Size: plan,
        });
        return dataplan;
      } else if (id === "GLO") {
        const dataplan = await FlowDataPlan.find({
          Network: "GLO",
          Size: plan,
        });
        return dataplan;
      } else {
        // res.status(404).json({ message: "No data found" });
        return [];

      }
    }
  } catch (error) {
    logger.error(`error getting data plans: ${error.stack}`);
    return error.message;
  }
};

const getPhonenumberToken = async (phone_number) => {
  if (phone_number === "273602979164543") {
    token = token1;
  } else if (phone_number === "321718744349890") {
    token = token2;
  }
  return token;
};

export const processMessage = async (
  senderNumber,
  intentName,
  messageBody,
  phone_number_id
) => {
  try {
    let responseMessage = "";

    responseMessage =
      "Please enter the ☎ phone number ☎ that will receive the selected data plan ✅";

    // Send the message
    let msg = await sendMessage(senderNumber, responseMessage, phone_number_id);

    // Save the conversation
    let saveConvo = await saveConversation(
      senderNumber,
      intentName,
      messageBody,
      "phone_number_"
    );

    return { message: responseMessage, status: "success" };
  } catch (error) {
    logger.error(`Error processing message: ${error.stack}`);
    return { message: "Error processing message", status: "error" };
  }
};

export const saveConversation = async (
  senderNumber,
  intent,
  messageBody,
  responseMessage
) => {
  //  Save the conversation to MongoDB
  try {
    const conversation = new Conversation({
      senderNumber,
      intent,
      messageBody,
      responseMessage,
    });

    await conversation.save();
  } catch (error) {
    logger.error(`error saving conversations: ${error.stack}`);
  }
};

export const savetransaction = async (
  senderNumber,
  recipient,
  network,
  plan_name,
  plan_amount,
  profit,
  id,
  vendor
) => {
  //  Save the conversation to MongoDB
  try {
    const Transaction = new transaction({
      senderNumber,
      recipient,
      network,
      plan_name,
      plan_amount,
      profit,
      id,
      vendor
    });

    await Transaction.save();
  } catch (error) {
    logger.error(`error saving transaction: ${error.stack}`);
  }
};

export const saveFailedtransaction = async (
  senderNumber,
  recipient,
  network,
  plan_name,
  plan_amount,
  payload
) => {
  //  Save the conversation to MongoDB
  try {
    const Transaction = new failedTransaction({
      senderNumber,
      recipient,
      network,
      plan_name,
      plan_amount,
      payload,
    });

    await Transaction.save();
  } catch (error) {
    logger.error(`error saving failed transaction: ${error.stack}`);
  }
};

export const savePlan = async (
  receiverNumber,
  senderNumber,
  plan,
  price,
  intent,
  network
) => {
  try {
    // Update the existing document if it exists, or create a new one if not
    const updatedPlan = await plan_select.findOneAndUpdate(
      { senderNumber: senderNumber }, // Condition to find the document
      {
        $set: {
          receiverNumber: receiverNumber,
          plan: plan,
          price: price,
          intent: intent,
          network: network,
        },
      }, // New data to update
      { new: true, upsert: true } // Options: return the updated document and create if not exists
    );
    return updatedPlan; // Return the updated document
  } catch (error) {
    logger.error(`Error saving plan: ${error.stack}`);
  }
};

export const sendMessage = async (
  senderNumber,
  messageBody,
  phone_number_id
) => {
  try {
    token = await getPhonenumberToken(phone_number_id);
    const url = `https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${token}`;

    await axios({
      method: "POST",
      url,
      data: {
        messaging_product: "whatsapp",
        to: senderNumber,
        text: { body: messageBody },
      },
      headers: { "Content-Type": "application/json" },
    });
    // You might want to return something or handle success/failure here
    return true;
  } catch (error) {
    logger.error(`Error sending message:${error.stack}`);
    // Handle error (e.g., log it, throw it, etc.)
  }
};

export const sendTemplateMessage = async (
  senderNumber,
  template,
  phone_number_id
) => {
  try {
    token = await getPhonenumberToken(phone_number_id);
    const url = `https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${token}`;

    // await axios({
    //   method: "POST",
    //   url,
    //   data: {
    //     messaging_product: "whatsapp",
    //     to: senderNumber,
    //     type: "template",
    //     template: {
    //       name: template,
    //       language: {
    //         code: "en",
    //       },
    //     },
    //   },
    //   headers: { "Content-Type": "application/json" },
    // });
    // You might want to return something or handle success/failure here
  } catch (error) {
    logger.error(`Error sending message:${error.stack}`);
  }
};

export const sendTemplateflow = async (
  senderNumber,
  template,
  phone_number_id
) => {
  try {
    token = await getPhonenumberToken(phone_number_id);
    const url = `https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${token}`;

    await axios({
      method: "POST",
      url,
      data: {
        messaging_product: "whatsapp",
        to: senderNumber,
        type: "template",
        template: {
          name: template,
          language: {
            code: "en",
          },
          components: [
            {
              type: "button",
              sub_type: "flow",
              index: "0",
            },
          ],
        },
      },
      headers: { "Content-Type": "application/json" },
    });
    // You might want to return something or handle success/failure here
  } catch (error) {
    logger.error(`Error sending message:${error.stack}`);
  }
};

export const sendFlowMessage = async (
  recipientPhone,
  flowToken,
  flowId,
  phone_number_id,
  body,
  flow_cta,
  screen
) => {
  try {
    const token = await getPhonenumberToken(phone_number_id);
    const url = `https://graph.facebook.com/v18.0/${phone_number_id}/messages`;

    const data = {
      messaging_product: "whatsapp",
      to: recipientPhone,
      recipient_type: "individual",
      type: "interactive",
      interactive: {
        type: "flow",
        header: {
          type: "text",
          text: "Mkonnect",
        },
        body: {
          text: body,
        },
        footer: {
          text: "Stay connected with konnect.",
        },
        action: {
          name: "flow",
          parameters: {
            flow_message_version: "3",
            flow_action: "navigate",
            flow_token: flowToken,
            flow_id: flowId,
            flow_cta: flow_cta,
            flow_action_payload: {
              screen: screen,
              data: {
                "<CUSTOM_KEY>": "<CUSTOM_VALUE>",
              },
            },
          },
        },
      },
    };

    await axios({
      method: "POST",
      url,
      data,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Optionally handle success/failure here
  } catch (error) {
    logger.error(`Failed to send WhatsApp interactive message:${error.stack}`);
  }
};

export const sendFlow = async (
  recipientPhone,
  flowToken,
  flowId,
  phone_number_id,
  body,
  flow_cta,
  screen,
  header,
  footer
) => {
  try {
    const token = await getPhonenumberToken(phone_number_id);
    const url = `https://graph.facebook.com/v18.0/${phone_number_id}/messages`;

    const data = {
      messaging_product: "whatsapp",
      to: recipientPhone,
      recipient_type: "individual",
      type: "interactive",
      interactive: {
        type: "flow",
        header: {
          type: "text",
          text: `${header}\n‎`,
        },
        body: {
          text: body,
        },
        footer: {
          text: footer,
        },
        action: {
          name: "flow",
          parameters: {
            flow_message_version: "3",
            flow_action: "navigate",
            flow_token: flowToken,
            flow_id: flowId,
            flow_cta: flow_cta,
            flow_action_payload: {
              screen: screen,
              data: {
                "<CUSTOM_KEY>": "<CUSTOM_VALUE>",
              },
            },
          },
        },
      },
    };

    await axios({
      method: "POST",
      url,
      data,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Optionally handle success/failure here
  } catch (error) {
    logger.error(`Failed to send WhatsApp interactive message:${error.stack}`);
  }
};

export const sendFlowMessageEndpoint = async (
  recipientPhone,
  flowToken,
  flowId,
  phone_number_id,
  body,
  flow_cta,
  screen
) => {
  try {
    const token = await getPhonenumberToken(phone_number_id);
    const url = `https://graph.facebook.com/v18.0/${phone_number_id}/messages`;

    const data = {
      messaging_product: "whatsapp",
      to: recipientPhone,
      recipient_type: "individual",
      type: "interactive",
      interactive: {
        type: "flow",
        header: {
          type: "text",
          text: "Mkonnect",
        },
        body: {
          text: body,
        },
        footer: {
          text: "Stay connected with konnect.",
        },
        action: {
          name: "flow",
          parameters: {
            flow_message_version: "3",
            flow_action: "data_exchange",
            flow_token: flowToken,
            flow_id: flowId,
            flow_cta: flow_cta,
          },
        },
      },
    };

    await axios({
      method: "POST",
      url,
      data,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Optionally handle success/failure here
  } catch (error) {
    logger.error(`Failed to send WhatsApp interactive message:${error.stack}`);
  }
};

export const sendMediaMessage = async (
  imageUrl,
  message,
  phone_number_id,
  senderNumber,
  type
) => {
  try {
    let data_type;
    if (type === "image") {
      data_type = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: senderNumber,
        type: type,
        image: {
          link: imageUrl,
          caption: message,
        },
      };
    } else if (type === "video") {
      data_type = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: senderNumber,
        type: type,
        video: {
          link: imageUrl,
          caption: message,
        },
      };
    }
    token = await getPhonenumberToken(phone_number_id);
    const url = `https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${token}`;
    await axios({
      method: "POST",
      url,
      data: data_type,
      headers: { "Content-Type": "application/json" },
    });
    // console.log("sdddddddddddddddddddddddddddsd")
    // You might want to return something or handle success/failure here
  } catch (error) {
    logger.error(`Error sending message:${error.stack}`);
    // Handle error (e.g., log it, throw it, etc.)
  }
};

export const sendDocMessage = async (
  docUrl,
  message,
  phone_number_id,
  senderNumber
) => {
  try {
    let data_type = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: senderNumber,
      type: "document",
      document: {
        link: docUrl,
        caption: message,
      },
    };

    let token = await getPhonenumberToken(phone_number_id);
    const url = `https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${token}`;
    await axios({
      method: "POST",
      url,
      data: data_type,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error(`Error sending doc message:${error.stack}`);
  }
};

export const createJob = async (req, res, next) => {
  try {
    let filter = req.body.filter; // Assuming the filter is sent in the request body
    let message = req.body.message; // Assuming the message is sent in the request body
    let messageType = req.body.messageType; // Assuming the message type is sent in the request body
    let imageUrl = req.body.file; // Assuming the image URL is sent in the request body
    let query; // Default empty query object
    if (filter) {
      query = { consent: true, phoneNumber: filter }; // Merge the filter object with the default query object
    } else {
      query = { consent: true };
    }

    let users = await User.find(query);
    if (users.length > 0) {
      await Job.deleteMany();
      users.forEach(async (user) => {
        const createjob = Job.create({
          jobName: "sendBroadcast",
          message: message,
          imageUrl: imageUrl,
          messageType: messageType,
          filter: user.phoneNumber,
          data: { phoneNumber: user.phoneNumber, fullName: user.fullName },
        });
      });
      next();
    } else {
      res.send(false);
    }
  } catch (error) {
    logger.error(`Error creating job: ${error.stack}`);
    res.send(false);
  }
};

export const checkBalance = async (senderNumber) => {
  const contact = senderNumber;
  let responseMessage;
  try {
    const user = await User.findOne({ phoneNumber: contact });
    if (user && user.fullName) {
      responseMessage = `Your balance is ₦${user.balance} \n\n🚨PLEASE USE PAYSTACK TITAN TO MAKE DEPOSITS AS WEMA BANK IS HAVING ISSUES.`;
    } else {
      responseMessage = `Sorry, we don't have a record for ${contact}.`;
    }
  } catch (error) {
    logger.error(`error in checking balance: ${error.stack}`);
    //   throw new Error('Error fetching user balance');
  }

  return responseMessage;
};

export const getDataplan = async (network) => {
  try {
    const response = await axios.get(
      `http://localhost:3000/data/getneworkdataplans/${network}`
    );

    const planList = [];
    let counter = 1;

    response.data.forEach((plan) => {
      const planString = `${counter}. ${plan.Network} ${plan.Size} at ${plan.Amount} (30 days)`;
      planList.push(planString);
      counter++;
    });

    const responseMessage = planList.join("\n");
    logger.info(responseMessage);

    return responseMessage;
  } catch (error) {
    logger.error(`error fetching data plans: ${error.stack}`);
    return "Error fetching data plans";
  }
};

export const getLastThreeConversations = async (phoneNumber) => {
  try {
    const lastThreeConversations = await Conversation.find({
      senderNumber: phoneNumber,
    })
      .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
      .limit(3)
      .exec();

    return lastThreeConversations;
  } catch (error) {
    logger.error(`Error fetching last three conversations:${error.stack}`);
    throw new Error("Error fetching last three conversations");
  }
};

export const getLastConversation = async (phoneNumber) => {
  try {
    const lastConversation = await Conversation.findOne({
      senderNumber: phoneNumber,
    })
      .sort({ createdAt: -1 }) // Sort in descending order based on createdAt
      .limit(1)
      .exec();

    return lastConversation;
  } catch (error) {
    logger.errorr(`Error fetching last conversation:${error.stack}`);
    throw new Error("Error fetching last conversation");
  }
};

export const ProcessData = async (networkName, text, senderNumber, UserNumber) => {
  let network;
  console.log(networkName, text, senderNumber);

  try {
    if (networkName == "MTN") {
      network = 1;
    } else if (networkName == "GLO") {
      network = 2;
    } else if (networkName == "9MOBILE") {
      network = 3;
    } else if (networkName == "AIRTEL") {
      network = 4;
    } else {
      network = 0;
    }

    let rep;

    let data = JSON.stringify({
      network: network,
      mobile_number: senderNumber,
      plan: text,
      Ported_number: true,
      UserNumber: UserNumber
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: BUY_DATA,
      headers: {
        Authorization: KEY,
        "Content-Type": "application/json",
      },
      data: data,
    };

    try {
      const response = await axios.request(config);
      rep = response.data;
      return rep;
    } catch (error) {
      rep = error.response?.data;
    }

    return rep;
  } catch (error) {
    logger.error(`Error ProcessData:${error.stack}`);
  }
};

export const convertToInternationalFormat = async (phoneNumber) => {
  // Remove any non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, "");

  // Check if the cleaned number starts with '0' and replace it with '+234'
  if (cleaned.startsWith("0")) {
    cleaned = "234" + cleaned.substring(1);
  } else if (!cleaned.startsWith("234")) {
    // If it doesn't start with '0' or '+234', prepend '+234'
    cleaned = "234" + cleaned;
  }

  return cleaned;
};

export const ProcessAirtime = async (networkName, amount, mobile_number) => {
  let network;

  try {
    if (networkName == "MTN") {
      network = 1;
    } else if (networkName == "GLO") {
      network = 2;
    } else if (networkName == "9MOBILE") {
      network = 3;
    } else if (networkName == "AIRTEL") {
      network = 4;
    } else {
      network = 0;
    }

    let rep;

    let data = JSON.stringify({
      network: network,
      amount: amount,
      mobile_number: mobile_number,
      Ported_number: true,
      airtime_type: "VTU",
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: BUY_AIRTIME,
      headers: {
        Authorization: KEY,
        "Content-Type": "application/json",
      },
      data: data,
    };

    try {
      const response = await axios.request(config);
      rep = response.data;
      return rep;
    } catch (error) {
      rep = error.response?.data;
    }

    return rep;
  } catch (error) {
    logger.error(`Error ProcessData:${error.stack}`);
  }
};

export const getFacts = async () => {
  try {
    const limit = 1;

    const response = await axios.get(`https://api.api-ninjas.com/v1/facts`, {
      headers: {
        "X-Api-Key": FUN_FACT_KEY,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      logger.error(error.stack);
    } else if (error.request) {
      logger.error(`Request failed in get facts:${error.stack}`);
    } else {
      logger.error(`Error in get facts:${error.stack}`);
    }

    // Return an error object or handle as needed
    return { error: "An error occurred during the request." };
  }
};

export const getIdanFacts = async () => {
  try {
    const limit = 1;

    const response = await axios.get(
      `https://api.api-ninjas.com/v1/chucknorris`,
      {
        headers: {
          "X-Api-Key": FUN_FACT_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      logger.error(error.stack);
    } else if (error.request) {
      logger.error(`Request failed in get idan facts:${error.stack}`);
    } else {
      logger.error(`Error in get idan facts:${error.stack}`);
    }

    // Return an error object or handle as needed
    return { error: "An error occurred during the request." };
  }
};

export const crash = async (req, res) => {
  try {
    const existingStatus = await status.findOne({ status: true });
    if (existingStatus) {
      await status.updateOne(
        { _id: existingStatus._id },
        { $set: { status: false } }
      );
      res.send("GOOD BYE WORLD!");
    } else {
      await status.deleteMany({});
      await status.create({ status: true });
      res.send("HELLO WORLD!");
    }
  } catch (error) {
    loggers.error(`Error updating status:${error.stack}`);
    res.send("Error updating status:", error);
  }
};

export const fetchMeterValidation = async (
  meterNumber,
  discoName,
  meterType
) => {
  let token;
  let vendorStatus = await status.find();
  let url;
  if (vendorStatus[0].vendor == "karldata") {
    url = `https://karldata.com/api/validatemeter`;
    token = KARL_DATA_TOKEN;
  } else {
    url = `https://www.usufdataservice.com/api/validatemeter`;
    token = USUF_DATA_TOKEN;
  }

  const params = {
    meternumber: meterNumber,
    disconame: discoName,
    mtype: meterType,
  };
  const config = {
    method: "get",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    params: params,
  };

  try {
    const response = await axios(url, config);
    // console.log(JSON.stringify(response.data));
    return { status: true, data: response.data };
  } catch (error) {
    logger.error(`Error fetching meter validation:${error.stack}`);
    return { status: false };
  }
};


export const fetchBillPayment = async (transactionId) => {
  let token;
  let url;
  
  try {
    let vendorStatus = await status.find();

    if (vendorStatus[0].vendor === "karldata") {
      url = `https://karldata.com/api/billpayment/${transactionId}`;
      token = KARL_DATA_TOKEN;
    } else {
      url = `https://www.usufdataservice.com/api/billpayment/${transactionId}`;
      token = USUF_DATA_TOKEN;
    }

    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: url,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.request(config);
    // console.log(response.data);

    if (response.data) {
      return { status: true, data: response.data };
    } else {
      return { status: false, data: response.data };
    }
  } catch (error) {
    console.error(`Error fetching bill payment: ${error.stack}`);
    return { status: false };
  }
};



export const makeBillPayment = async (
  discoName,
  amount,
  meterNumber,
  meterType,
  customerPhone,
  customerName,
  customerAddress
) => {
  const data = JSON.stringify({
    disco_name: discoName,
    amount: amount,
    meter_number: meterNumber,
    MeterType: meterType,
    Customer_Phone: customerPhone,
    customer_name: customerName,
    customer_address: customerAddress,
  });
  //
  let token;
  let vendorStatus = await status.find();
  let url;
  if (vendorStatus[0].vendor == "karldata") {
    url = `https://karldata.com/api/billpayment/`;
    token = KARL_DATA_TOKEN;
  } else {
    url = `https://www.usufdataservice.com/api/billpayment/`;
    token = USUF_DATA_TOKEN;
  }
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    console.log(response);
    // console.log(JSON.stringify(response))
    if (response.data.token) {
      return { status: true, data: response.data };
    } else {
      return { status: false, data: response.data };
    }
  } catch (error) {
    logger.error(`Error making bill payment: ${error.stack}`);
    return { status: false };
  }
};

export const sendBulkMessage = async (
  filter,
  message,
  messageType,
  imageUrl,
  id
) => {
  // console.log(req.body)
  try {
    // Iterate through each user and send a message
    const senderNumber = filter;

    try {
      if (messageType == "message") {
        // Send message to the user
        await sendMessage(senderNumber, message, id);
      }
      // else if (messageType == "template") {
      //   await sendTemplateMessage(senderNumber, message, id);
      // }
      else if (messageType == "image") {
        await sendMediaMessage(imageUrl, message, id, senderNumber, "image");
      } else if (messageType == "video") {
        await sendMediaMessage(imageUrl, message, id, senderNumber, "video");
      }
      // Optionally, you can log or handle success/failure of each message sent
      return true;
    } catch (error) {
      logger.error(`Error sending message to ${filter}: ${error.stack}`);
      return false;
    }

    // Process the found users (send messages, etc.)
  } catch (error) {
    // Handle any errors
    logger.error(`Error fetching users:${error.stack}`);

    // throw error; // Rethrow the error to be handled by the caller
  }
};


export const sendVendorBalanceEmail = async (
  recipient,
  subject,
  message
) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: EMAIL_PASSWORD,
    },
  });

  var mailOptions = {
    from: FROM_EMAIL,
    to: recipient,
    subject: subject,
    html: message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      logger.error(`Error sending email:${error.stack}`);
    }
  });
};

export const sendEmail = async (
  recipient,
  subject,
  name,
  email,
  account_number,
  account_name,
  bank,
  Pin
) => {
  // let name = "Michael Mamman"
  // let email = "michaelmamman@gmail.com"
  // let account_number = "0000000000"
  // let account_name = "Michael Mamman"
  // let bank = "Access Bank"
  // let Pin = "1111"
  let message = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<meta charset="UTF-8">
<meta content="width=device-width, initial-scale=1" name="viewport">
<meta name="x-apple-disable-message-reformatting">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta content="telephone=no" name="format-detection">
<title>New email template 2024-03-17</title><!--[if (mso 16)]>
  <style type="text/css">
  a {text-decoration: none;}
  </style>
  <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<xml>
  <o:OfficeDocumentSettings>
  <o:AllowPNG></o:AllowPNG>
  <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
<style type="text/css">
.rollover span {
font-size:0px;
}
u + .body img ~ div div {
display:none;
}
#outlook a {
padding:0;
}
span.MsoHyperlink, span.MsoHyperlinkFollowed {
color:inherit;
mso-style-priority:99;
}
a[x-apple-data-detectors] {
color:inherit!important;
text-decoration:none!important;
font-size:inherit!important;
font-family:inherit!important;
font-weight:inherit!important;
line-height:inherit!important;
}
.es-desk-hidden {
display:none;
float:left;
overflow:hidden;
width:0;
max-height:0;
line-height:0;
mso-hide:all;
}
s {
text-decoration:line-through;
}
ul, ol {
font-family:Spartan, sans-serif;
padding:0px 0px 0px 40px;
margin:15px 0px;
}
ul li {
color:rgb(81, 99, 101);
}
ol li {
color:rgb(81, 99, 101);
}
li {
margin:0px 0px 15px;
font-size:18px;
}
.es-infoblock p {
font-size:12px;
color:rgb(204, 204, 204);
}
h2 {
font-size:28px;
font-style:normal;
font-weight:bold;
line-height:120%;
color:rgb(81, 99, 101);
}
h4 {
font-size:24px;
font-style:normal;
font-weight:normal;
line-height:120%;
color:rgb(51, 51, 51);
}
h5 {
font-size:20px;
font-style:normal;
font-weight:normal;
line-height:120%;
color:rgb(51, 51, 51);
}
h6 {
font-size:16px;
font-style:normal;
font-weight:normal;
line-height:120%;
color:rgb(51, 51, 51);
}
.es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a {
font-size:34px;
}
.es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a {
font-size:28px;
}
.es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a {
font-size:24px;
}
.es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a {
font-size:20px;
}
.es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a {
font-size:16px;
}
.es-button img {
display:inline-block;
vertical-align:middle;
}
.es-fw, .es-fw .es-button {
display:block;
}
.es-il, .es-il .es-button {
display:inline-block;
}
.es-text-rtl h1, .es-text-rtl h2, .es-text-rtl h3, .es-text-rtl h4, .es-text-rtl h5, .es-text-rtl h6, .es-text-rtl input, .es-text-rtl label, .es-text-rtl textarea, .es-text-rtl p, .es-text-rtl ol, .es-text-rtl ul, .es-text-rtl .es-menu a, .es-text-rtl .es-table {
direction:rtl;
}
.es-text-ltr h1, .es-text-ltr h2, .es-text-ltr h3, .es-text-ltr h4, .es-text-ltr h5, .es-text-ltr h6, .es-text-ltr input, .es-text-ltr label, .es-text-ltr textarea, .es-text-ltr p, .es-text-ltr ol, .es-text-ltr ul, .es-text-ltr .es-menu a, .es-text-ltr .es-table {
direction:ltr;
}
.es-text-rtl ol, .es-text-rtl ul {
padding:0px 40px 0px 0px;
}
.es-text-ltr ul, .es-text-ltr ol {
padding:0px 0px 0px 40px;
}
.es-p-default {
padding-top:20px;
padding-right:20px;
padding-bottom:0px;
padding-left:20px;
}
@media only screen and (max-width:600px) {.es-m-p0r { padding-right:0px!important } .es-m-p20b { padding-bottom:20px!important } *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important } h1 { font-size:30px!important; text-align:left } h2 { font-size:24px!important; text-align:left } h3 { font-size:20px!important; text-align:left } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a { font-size:24px!important } .es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a { font-size:20px!important } .es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a { font-size:16px!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock a { font-size:12px!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3, .es-m-txt-c h4, .es-m-txt-c h5, .es-m-txt-c h6 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3, .es-m-txt-r h4, .es-m-txt-r h5, .es-m-txt-r h6 { text-align:right!important } .es-m-txt-j, .es-m-txt-j h1, .es-m-txt-j h2, .es-m-txt-j h3, .es-m-txt-j h4, .es-m-txt-j h5, .es-m-txt-j h6 { text-align:justify!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3, .es-m-txt-l h4, .es-m-txt-l h5, .es-m-txt-l h6 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-m-txt-r .rollover:hover .rollover-second, .es-m-txt-c .rollover:hover .rollover-second, .es-m-txt-l .rollover:hover .rollover-second { display:inline!important } .es-m-txt-r .rollover span, .es-m-txt-c .rollover span, .es-m-txt-l .rollover span { line-height:0!important; font-size:0!important } .es-spacer { display:inline-table } a.es-button, button.es-button { font-size:18px!important; line-height:120%!important } a.es-button, button.es-button, .es-button-border { display:inline-block!important } .es-m-fw, .es-m-fw.es-fw, .es-m-fw .es-button { display:block!important } .es-m-il, .es-m-il .es-button, .es-social, .es-social td, .es-menu { display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } .es-social td { padding-bottom:10px } .h-auto { height:auto!important } .img-2443 { width:198px!important; height:auto!important } }
@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }
</style>
</head>
<body class="body" style="width:100%;height:100%;padding:0;Margin:0">
<div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#BDD7D6"><!--[if gte mso 9]>
    <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
      <v:fill type="tile" color="#BDD7D6"></v:fill>
    </v:background>
  <![endif]-->
 <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#BDD7D6">
   <tr>
    <td valign="top" style="padding:0;Margin:0">
      <br><br>
     <table class="es-content" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
       <tr>
        <td align="center" style="padding:0;Margin:0">
         <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#fff" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#fff;width:600px">
           <tr>
            <td align="left" style="padding:0;Margin:0">
             <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
               <tr>
                <td align="center" valign="top" style="padding:0;Margin:0;width:600px">
                 <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr>
                    <td align="center" style="padding:0;Margin:0;display:none"></td>
                   </tr>
                 </table></td>
               </tr>
             </table></td>
           </tr>
           <tr>
            <td align="left" style="Margin:0;padding-right:20px;padding-left:20px;padding-top:30px;padding-bottom:40px">
             <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
               <tr>
                <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:560px">
                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr>
                    <td align="left" style="padding:0;Margin:0;padding-bottom:20px"><h1 style="Margin:0;font-family:Spartan, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:34px;font-style:normal;font-weight:bold;line-height:41px;color:#516365">Welcome aboard!</h1><h1 style="Margin:0;font-family:Spartan, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:34px;font-style:normal;font-weight:bold;line-height:41px;color:#516365">Let's get you started</h1></td>
                   </tr>
                   <tr>
                    <td align="left" style="padding:0;Margin:0;padding-top:5px;padding-bottom:25px;font-size:0px"></td>
                   </tr>
                   <tr>
                    <td align="left" style="padding:0;Margin:0;padding-bottom:30px"><h3 style="Margin:0;font-family:Spartan, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:20px;font-style:normal;font-weight:bold;line-height:24px;color:#516365">Dear ${name},</h3><p style="Margin:0;mso-line-height-rule:exactly;font-family:Spartan;line-height:27px;letter-spacing:0;color:#516365;font-size:18px"><br></p><p style="Margin:0;mso-line-height-rule:exactly;font-family:Spartan;line-height:27px;letter-spacing:0;color:#516365;font-size:18px">It's fantastic to have you with us! Welcome to the Konnect family. We're thrilled that you've chosen us to be part of your journey.</p><br>
                    <p style="Margin:0;mso-line-height-rule:exactly;font-family:Spartan;line-height:27px;letter-spacing:0;color:#516365;font-size:18px">Here are your account details: <br><br>
                    Name: ${name} <br>
                    Email: ${email} <br>
                    Account Name: ${account_name} <br>
                    Account Number: ${account_number} <br>
                    Bank: ${bank} <br>
                    Pin: ${Pin}
                    </p>
                    </td>
                   </tr>
                   <tr>
                    <td align="left" style="padding:0;Margin:0"><span class="es-button-border msohide" style="border-style:solid;border-color:#113c18;background:#0c3a0a;border-width:0px;display:inline-block;border-radius:12px;width:auto;mso-hide:all"><a href="https://mkonnect.com.ng" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:none !important;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;padding:15px 30px 10px 30px;display:inline-block;background:#155513;border-radius:12px;font-family:Spartan, sans-serif;font-weight:bold;font-style:normal;line-height:22px;width:auto;text-align:center;letter-spacing:0;mso-padding-alt:0;mso-border-alt:10px solid #255224">GET STARTED 🎉</a></span><!--<![endif]--></td>
                   </tr>
                 </table></td>
               </tr>
             </table></td>
           </tr>
         </table></td>
       </tr>
     </table>


     <table cellpadding="0" cellspacing="0" class="es-footer" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
       <tr>
        <td align="center" style="padding:0;Margin:0">
         <table bgcolor="#3c2c4c" class="es-footer-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#fff;width:600px">
           <tr>
            <td align="left" style="Margin:0;padding-right:20px;padding-left:20px;padding-bottom:20px;padding-top:40px">
             <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
               <tr>
                <td align="left" style="padding:0;Margin:0;width:560px">
                 <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">

                   <tr>
                    <td align="center" style="padding:0;Margin:0;padding-bottom:20px;padding-top:20px;font-size:0">
                     <table cellpadding="0" cellspacing="0" class="es-table-not-adapt es-social" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr>
                        <td align="center" valign="top" style="padding:0;Margin:0;padding-right:20px"><a target="_blank" href="https://mkonnect.com.ng" style="mso-line-height-rule:exactly;text-decoration:underline;color:#516365;font-size:14px"><img title="Facebook" src="https://efytuph.stripocdn.email/content/assets/img/social-icons/logo-colored-bordered/facebook-logo-colored-bordered.png" alt="Fb" width="24" height="24" style="display:block;font-size:18px;border:0;outline:none;text-decoration:none"></a></td>
                        <td align="center" valign="top" style="padding:0;Margin:0;padding-right:20px"><a target="_blank" href="https://mkonnect.com.ng" style="mso-line-height-rule:exactly;text-decoration:underline;color:#516365;font-size:14px"><img title="X.com" src="https://efytuph.stripocdn.email/content/assets/img/social-icons/logo-colored-bordered/x-logo-colored-bordered.png" alt="X" width="24" height="24" style="display:block;font-size:18px;border:0;outline:none;text-decoration:none"></a></td>
                        <td align="center" valign="top" style="padding:0;Margin:0;padding-right:20px"><a target="_blank" href="https://mkonnect.com.ng" style="mso-line-height-rule:exactly;text-decoration:underline;color:#516365;font-size:14px"><img title="Instagram" src="https://efytuph.stripocdn.email/content/assets/img/social-icons/logo-colored-bordered/instagram-logo-colored-bordered.png" alt="Inst" width="24" height="24" style="display:block;font-size:18px;border:0;outline:none;text-decoration:none"></a></td>

                       </tr>
                     </table></td>
                   </tr>
                   <tr>
                    <td align="center" style="padding:0;Margin:0;padding-top:10px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:Spartan, sans-serif;line-height:21px;letter-spacing:0;color:#516365;font-size:14px">You are receiving this email because you have successfully registered an account with Mkonnect. Make sure our messages get to your Inbox (and not your bulk or junk folders).<br><strong><a target="_blank" href="https://mkonnect.com.ng" style="mso-line-height-rule:exactly;text-decoration:none;color:#516365;font-size:14px">Privacy police</a> | <a target="_blank" style="mso-line-height-rule:exactly;text-decoration:none;color:#516365;font-size:14px" href="">Unsubscribe</a></strong></p></td>
                   </tr>
                 </table></td>
               </tr>
             </table></td>
           </tr>
         </table>
        </td>
       </tr>
     </table>
</td>
   </tr>
 </table>
</div>
</body>
</html>`;
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: EMAIL_PASSWORD,
    },
  });

  var mailOptions = {
    from: FROM_EMAIL,
    to: recipient,
    subject: subject,
    html: message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      logger.error(`Error sending email:${error.stack}`);
    }
  });
};

export const sendTransactionEmail = async (
  transactionType,
  recipient,
  subject,
  name,
  email,
  senderNumber,
  mobile_number,
  plan_network,
  plan_name,
  plan_amount
) => {
  let message = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
   <head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="telephone=no" name="format-detection">
    <title>New email template 2024-03-17</title><!--[if (mso 16)]>
      <style type="text/css">
      a {text-decoration: none;}
      </style>
      <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
  <xml>
      <o:OfficeDocumentSettings>
      <o:AllowPNG></o:AllowPNG>
      <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
    <style type="text/css">
  .rollover span {
    font-size:0px;
  }
  u + .body img ~ div div {
    display:none;
  }
  #outlook a {
    padding:0;
  }
  span.MsoHyperlink, span.MsoHyperlinkFollowed {
    color:inherit;
    mso-style-priority:99;
  }
  a[x-apple-data-detectors] {
    color:inherit!important;
    text-decoration:none!important;
    font-size:inherit!important;
    font-family:inherit!important;
    font-weight:inherit!important;
    line-height:inherit!important;
  }
  .es-desk-hidden {
    display:none;
    float:left;
    overflow:hidden;
    width:0;
    max-height:0;
    line-height:0;
    mso-hide:all;
  }
  s {
    text-decoration:line-through;
  }
  ul, ol {
    font-family:Spartan, sans-serif;
    padding:0px 0px 0px 40px;
    margin:15px 0px;
  }
  ul li {
    color:rgb(81, 99, 101);
  }
  ol li {
    color:rgb(81, 99, 101);
  }
  li {
    margin:0px 0px 15px;
    font-size:18px;
  }
  .es-infoblock p {
    font-size:12px;
    color:rgb(204, 204, 204);
  }
  h2 {
    font-size:28px;
    font-style:normal;
    font-weight:bold;
    line-height:120%;
    color:rgb(81, 99, 101);
  }
  h4 {
    font-size:24px;
    font-style:normal;
    font-weight:normal;
    line-height:120%;
    color:rgb(51, 51, 51);
  }
  h5 {
    font-size:20px;
    font-style:normal;
    font-weight:normal;
    line-height:120%;
    color:rgb(51, 51, 51);
  }
  h6 {
    font-size:16px;
    font-style:normal;
    font-weight:normal;
    line-height:120%;
    color:rgb(51, 51, 51);
  }
  .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a {
    font-size:34px;
  }
  .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a {
    font-size:28px;
  }
  .es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a {
    font-size:24px;
  }
  .es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a {
    font-size:20px;
  }
  .es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a {
    font-size:16px;
  }
  .es-button img {
    display:inline-block;
    vertical-align:middle;
  }
  .es-fw, .es-fw .es-button {
    display:block;
  }
  .es-il, .es-il .es-button {
    display:inline-block;
  }
  .es-text-rtl h1, .es-text-rtl h2, .es-text-rtl h3, .es-text-rtl h4, .es-text-rtl h5, .es-text-rtl h6, .es-text-rtl input, .es-text-rtl label, .es-text-rtl textarea, .es-text-rtl p, .es-text-rtl ol, .es-text-rtl ul, .es-text-rtl .es-menu a, .es-text-rtl .es-table {
    direction:rtl;
  }
  .es-text-ltr h1, .es-text-ltr h2, .es-text-ltr h3, .es-text-ltr h4, .es-text-ltr h5, .es-text-ltr h6, .es-text-ltr input, .es-text-ltr label, .es-text-ltr textarea, .es-text-ltr p, .es-text-ltr ol, .es-text-ltr ul, .es-text-ltr .es-menu a, .es-text-ltr .es-table {
    direction:ltr;
  }
  .es-text-rtl ol, .es-text-rtl ul {
    padding:0px 40px 0px 0px;
  }
  .es-text-ltr ul, .es-text-ltr ol {
    padding:0px 0px 0px 40px;
  }
  .es-p-default {
    padding-top:20px;
    padding-right:20px;
    padding-bottom:0px;
    padding-left:20px;
  }
  @media only screen and (max-width:600px) {.es-m-p0r { padding-right:0px!important } .es-m-p20b { padding-bottom:20px!important } *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important } h1 { font-size:30px!important; text-align:left } h2 { font-size:24px!important; text-align:left } h3 { font-size:20px!important; text-align:left } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a { font-size:24px!important } .es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a { font-size:20px!important } .es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a { font-size:16px!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock a { font-size:12px!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3, .es-m-txt-c h4, .es-m-txt-c h5, .es-m-txt-c h6 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3, .es-m-txt-r h4, .es-m-txt-r h5, .es-m-txt-r h6 { text-align:right!important } .es-m-txt-j, .es-m-txt-j h1, .es-m-txt-j h2, .es-m-txt-j h3, .es-m-txt-j h4, .es-m-txt-j h5, .es-m-txt-j h6 { text-align:justify!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3, .es-m-txt-l h4, .es-m-txt-l h5, .es-m-txt-l h6 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-m-txt-r .rollover:hover .rollover-second, .es-m-txt-c .rollover:hover .rollover-second, .es-m-txt-l .rollover:hover .rollover-second { display:inline!important } .es-m-txt-r .rollover span, .es-m-txt-c .rollover span, .es-m-txt-l .rollover span { line-height:0!important; font-size:0!important } .es-spacer { display:inline-table } a.es-button, button.es-button { font-size:18px!important; line-height:120%!important } a.es-button, button.es-button, .es-button-border { display:inline-block!important } .es-m-fw, .es-m-fw.es-fw, .es-m-fw .es-button { display:block!important } .es-m-il, .es-m-il .es-button, .es-social, .es-social td, .es-menu { display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } .es-social td { padding-bottom:10px } .h-auto { height:auto!important } .img-2443 { width:198px!important; height:auto!important } }
  @media screen and (max-width:384px) {.mail-message-content { width:414px!important } }
  </style>
   </head>
   <body class="body" style="width:100%;height:100%;padding:0;Margin:0">
    <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#BDD7D6"><!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
          <v:fill type="tile" color="#BDD7D6"></v:fill>
        </v:background>
      <![endif]-->
     <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#BDD7D6">
       <tr>
        <td valign="top" style="padding:0;Margin:0">
          <br><br>
         <table class="es-content" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
           <tr>
            <td align="center" style="padding:0;Margin:0">
             <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#fff" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#fff;width:600px">
               <tr>
                <td align="left" style="padding:0;Margin:0">
                 <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr>
                    <td align="center" valign="top" style="padding:0;Margin:0;width:600px">
                     <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr>
                        <td align="center" style="padding:0;Margin:0;display:none"></td>
                       </tr>
                     </table></td>
                   </tr>
                 </table></td>
               </tr>
               <tr>
                <td align="left" style="Margin:0;padding-right:20px;padding-left:20px;padding-top:30px; ">
                 <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr>
                    <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:560px">
                     <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr>
                        <td align="left" style="padding:0;Margin:0;padding-bottom:20px"><h1 style="Margin:0;font-family:Spartan, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:34px;font-style:normal;font-weight:bold;line-height:41px;color:#516365">Congratulations! 🎉</h1><h4 style="Margin:0;font-family:Spartan, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:23px;font-style:normal;font-weight:bold;line-height:41px;color:#516365">Your ${transactionType} purchase was successful.</h4></td>
                       </tr>
                       <tr>
                        <td align="left" style="padding:0;Margin:0;padding-top:5px;padding-bottom:25px;font-size:0px"></td>
                       </tr>
                       <tr>
                        <td align="left" style="padding:0;Margin:0;"><h3 align="left" style="  Margin:0;font-family:Spartan, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:20px;font-style:normal;font-weight:bold;line-height:24px;color:#516365">Transaction Reciept</h3><p style="Margin:0;mso-line-height-rule:exactly;font-family:Spartan;line-height:27px;letter-spacing:0;color:#516365;font-size:18px"><br></p>
                        <p style="Margin:0;mso-line-height-rule:exactly;font-family:Spartan;line-height:27px;letter-spacing:0;color:#516365;font-size:18px">
                        Name: ${name} <br>
                        Email: ${email}<br>
                        Phone Number: ${senderNumber} <br>
                        Recipient: ${mobile_number}<br>
                        Network: ${plan_network} <br>
                        Plan: ${plan_name} <br>
                        Amount: ₦${plan_amount} <br>
                        </p>
                        </td>
                       </tr>
                     </table></td>
                   </tr>
                 </table></td>
               </tr>
             </table></td>
           </tr>
         </table>
  
  
         <table cellpadding="0" cellspacing="0" class="es-footer" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
           <tr>
            <td align="center" style="padding:0;Margin:0">
             <table bgcolor="#3c2c4c" class="es-footer-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#fff;width:600px">
               <tr>
                <td align="left" style="Margin:0;padding-right:20px;padding-left:20px;padding-bottom:20px;">
                 <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr>
                    <td align="left" style="padding:0;Margin:0;width:560px">
                     <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
  
                       <tr>
                        <td align="center" style="padding:0;Margin:0;padding-bottom:20px;padding-top:20px;font-size:0">
                         <table cellpadding="0" cellspacing="0" class="es-table-not-adapt es-social" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                           <tr>
                            <td align="center" valign="top" style="padding:0;Margin:0;padding-right:20px"><a target="_blank" href="https://mkonnect.com.ng" style="mso-line-height-rule:exactly;text-decoration:underline;color:#516365;font-size:14px"><img title="Facebook" src="https://efytuph.stripocdn.email/content/assets/img/social-icons/logo-colored-bordered/facebook-logo-colored-bordered.png" alt="Fb" width="24" height="24" style="display:block;font-size:18px;border:0;outline:none;text-decoration:none"></a></td>
                            <td align="center" valign="top" style="padding:0;Margin:0;padding-right:20px"><a target="_blank" href="https://mkonnect.com.ng" style="mso-line-height-rule:exactly;text-decoration:underline;color:#516365;font-size:14px"><img title="X.com" src="https://efytuph.stripocdn.email/content/assets/img/social-icons/logo-colored-bordered/x-logo-colored-bordered.png" alt="X" width="24" height="24" style="display:block;font-size:18px;border:0;outline:none;text-decoration:none"></a></td>
                            <td align="center" valign="top" style="padding:0;Margin:0;padding-right:20px"><a target="_blank" href="https://mkonnect.com.ng" style="mso-line-height-rule:exactly;text-decoration:underline;color:#516365;font-size:14px"><img title="Instagram" src="https://efytuph.stripocdn.email/content/assets/img/social-icons/logo-colored-bordered/instagram-logo-colored-bordered.png" alt="Inst" width="24" height="24" style="display:block;font-size:18px;border:0;outline:none;text-decoration:none"></a></td>
  
                           </tr>
                         </table></td>
                       </tr>
                       <tr>
                        <td align="center" style="padding:0;Margin:0;padding-top:10px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:Spartan, sans-serif;line-height:21px;letter-spacing:0;color:#516365;font-size:14px">You are receiving this email because you have successfully purchased a data plan with Mkonnect. Make sure our messages get to your Inbox (and not your bulk or junk folders).<br><strong><a target="_blank" href="https://mkonnect.com.ng" style="mso-line-height-rule:exactly;text-decoration:none;color:#516365;font-size:14px">Privacy police</a> | <a target="_blank" style="mso-line-height-rule:exactly;text-decoration:none;color:#516365;font-size:14px" href="">Unsubscribe</a></strong></p></td>
                       </tr>
                     </table></td>
                   </tr>
                 </table></td>
               </tr>
             </table>
            </td>
           </tr>
         </table>
  </td>
       </tr>
     </table>
    </div>
   </body>
  </html>`;
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: EMAIL_PASSWORD,
    },
  });

  var mailOptions = {
    from: FROM_EMAIL,
    to: recipient,
    subject: subject,
    html: message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      logger.error(`Error sending email:${error.stack}`);
    }
  });
};

export const sendTokenReceipt = async (
  recipient,
  subject,
  name,
  senderNumber,
  electricityToken,
  customerName,
  customerAddress,
  amount
) => {
  let message = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
   <head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="telephone=no" name="format-detection">
    <title>New email template 2024-03-17</title><!--[if (mso 16)]>
      <style type="text/css">
      a {text-decoration: none;}
      </style>
      <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
  <xml>
      <o:OfficeDocumentSettings>
      <o:AllowPNG></o:AllowPNG>
      <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
    <style type="text/css">
  .rollover span {
    font-size:0px;
  }
  u + .body img ~ div div {
    display:none;
  }
  #outlook a {
    padding:0;
  }
  span.MsoHyperlink, span.MsoHyperlinkFollowed {
    color:inherit;
    mso-style-priority:99;
  }
  a[x-apple-data-detectors] {
    color:inherit!important;
    text-decoration:none!important;
    font-size:inherit!important;
    font-family:inherit!important;
    font-weight:inherit!important;
    line-height:inherit!important;
  }
  .es-desk-hidden {
    display:none;
    float:left;
    overflow:hidden;
    width:0;
    max-height:0;
    line-height:0;
    mso-hide:all;
  }
  s {
    text-decoration:line-through;
  }
  ul, ol {
    font-family:Spartan, sans-serif;
    padding:0px 0px 0px 40px;
    margin:15px 0px;
  }
  ul li {
    color:rgb(81, 99, 101);
  }
  ol li {
    color:rgb(81, 99, 101);
  }
  li {
    margin:0px 0px 15px;
    font-size:18px;
  }
  .es-infoblock p {
    font-size:12px;
    color:rgb(204, 204, 204);
  }
  h2 {
    font-size:28px;
    font-style:normal;
    font-weight:bold;
    line-height:120%;
    color:rgb(81, 99, 101);
  }
  h4 {
    font-size:24px;
    font-style:normal;
    font-weight:normal;
    line-height:120%;
    color:rgb(51, 51, 51);
  }
  h5 {
    font-size:20px;
    font-style:normal;
    font-weight:normal;
    line-height:120%;
    color:rgb(51, 51, 51);
  }
  h6 {
    font-size:16px;
    font-style:normal;
    font-weight:normal;
    line-height:120%;
    color:rgb(51, 51, 51);
  }
  .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a {
    font-size:34px;
  }
  .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a {
    font-size:28px;
  }
  .es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a {
    font-size:24px;
  }
  .es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a {
    font-size:20px;
  }
  .es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a {
    font-size:16px;
  }
  .es-button img {
    display:inline-block;
    vertical-align:middle;
  }
  .es-fw, .es-fw .es-button {
    display:block;
  }
  .es-il, .es-il .es-button {
    display:inline-block;
  }
  .es-text-rtl h1, .es-text-rtl h2, .es-text-rtl h3, .es-text-rtl h4, .es-text-rtl h5, .es-text-rtl h6, .es-text-rtl input, .es-text-rtl label, .es-text-rtl textarea, .es-text-rtl p, .es-text-rtl ol, .es-text-rtl ul, .es-text-rtl .es-menu a, .es-text-rtl .es-table {
    direction:rtl;
  }
  .es-text-ltr h1, .es-text-ltr h2, .es-text-ltr h3, .es-text-ltr h4, .es-text-ltr h5, .es-text-ltr h6, .es-text-ltr input, .es-text-ltr label, .es-text-ltr textarea, .es-text-ltr p, .es-text-ltr ol, .es-text-ltr ul, .es-text-ltr .es-menu a, .es-text-ltr .es-table {
    direction:ltr;
  }
  .es-text-rtl ol, .es-text-rtl ul {
    padding:0px 40px 0px 0px;
  }
  .es-text-ltr ul, .es-text-ltr ol {
    padding:0px 0px 0px 40px;
  }
  .es-p-default {
    padding-top:20px;
    padding-right:20px;
    padding-bottom:0px;
    padding-left:20px;
  }
  @media only screen and (max-width:600px) {.es-m-p0r { padding-right:0px!important } .es-m-p20b { padding-bottom:20px!important } *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important } h1 { font-size:30px!important; text-align:left } h2 { font-size:24px!important; text-align:left } h3 { font-size:20px!important; text-align:left } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a { font-size:24px!important } .es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a { font-size:20px!important } .es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a { font-size:16px!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock a { font-size:12px!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3, .es-m-txt-c h4, .es-m-txt-c h5, .es-m-txt-c h6 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3, .es-m-txt-r h4, .es-m-txt-r h5, .es-m-txt-r h6 { text-align:right!important } .es-m-txt-j, .es-m-txt-j h1, .es-m-txt-j h2, .es-m-txt-j h3, .es-m-txt-j h4, .es-m-txt-j h5, .es-m-txt-j h6 { text-align:justify!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3, .es-m-txt-l h4, .es-m-txt-l h5, .es-m-txt-l h6 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-m-txt-r .rollover:hover .rollover-second, .es-m-txt-c .rollover:hover .rollover-second, .es-m-txt-l .rollover:hover .rollover-second { display:inline!important } .es-m-txt-r .rollover span, .es-m-txt-c .rollover span, .es-m-txt-l .rollover span { line-height:0!important; font-size:0!important } .es-spacer { display:inline-table } a.es-button, button.es-button { font-size:18px!important; line-height:120%!important } a.es-button, button.es-button, .es-button-border { display:inline-block!important } .es-m-fw, .es-m-fw.es-fw, .es-m-fw .es-button { display:block!important } .es-m-il, .es-m-il .es-button, .es-social, .es-social td, .es-menu { display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } .es-social td { padding-bottom:10px } .h-auto { height:auto!important } .img-2443 { width:198px!important; height:auto!important } }
  @media screen and (max-width:384px) {.mail-message-content { width:414px!important } }
  </style>
   </head>
   <body class="body" style="width:100%;height:100%;padding:0;Margin:0">
    <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#BDD7D6"><!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
          <v:fill type="tile" color="#BDD7D6"></v:fill>
        </v:background>
      <![endif]-->
     <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#BDD7D6">
       <tr>
        <td valign="top" style="padding:0;Margin:0">
          <br><br>
         <table class="es-content" cellspacing="0" cellpadding="0" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
           <tr>
            <td align="center" style="padding:0;Margin:0">
             <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#fff" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#fff;width:600px">
               <tr>
                <td align="left" style="padding:0;Margin:0">
                 <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr>
                    <td align="center" valign="top" style="padding:0;Margin:0;width:600px">
                     <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr>
                        <td align="center" style="padding:0;Margin:0;display:none"></td>
                       </tr>
                     </table></td>
                   </tr>
                 </table></td>
               </tr>
               <tr>
                <td align="left" style="Margin:0;padding-right:20px;padding-left:20px;padding-top:30px; ">
                 <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr>
                    <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:560px">
                     <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                       <tr>
                        <td align="left" style="padding:0;Margin:0;padding-bottom:20px"><h1 style="Margin:0;font-family:Spartan, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:34px;font-style:normal;font-weight:bold;line-height:41px;color:#516365">Congratulations! 🎉</h1><h4 style="Margin:0;font-family:Spartan, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:23px;font-style:normal;font-weight:bold;line-height:41px;color:#516365">Your electricity purchase was successful.</h4></td>
                       </tr>
                       <tr>
                        <td align="left" style="padding:0;Margin:0;padding-top:5px;padding-bottom:25px;font-size:0px"></td>
                       </tr>
                       <tr>
                        <td align="left" style="padding:0;Margin:0;"><h3 align="left" style="  Margin:0;font-family:Spartan, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:20px;font-style:normal;font-weight:bold;line-height:24px;color:#516365">Transaction Reciept</h3><p style="Margin:0;mso-line-height-rule:exactly;font-family:Spartan;line-height:27px;letter-spacing:0;color:#516365;font-size:18px"><br></p>
                        <p style="Margin:0;mso-line-height-rule:exactly;font-family:Spartan;line-height:27px;letter-spacing:0;color:#516365;font-size:18px">
                        Name: ${name} <br>
                        Email: ${recipient}<br>
                        Phone Number: ${senderNumber} <br>
                        ${electricityToken}<br>
                        Amount: ₦${amount} <br>
                        Customer Name: ${customerName} <br>
                        Customer Address: ${customerAddress} <br>
                        </p>
                        </td>
                       </tr>
                     </table></td>
                   </tr>
                 </table></td>
               </tr>
             </table></td>
           </tr>
         </table>
  
  
         <table cellpadding="0" cellspacing="0" class="es-footer" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
           <tr>
            <td align="center" style="padding:0;Margin:0">
             <table bgcolor="#3c2c4c" class="es-footer-body" align="center" cellpadding="0" cellspacing="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#fff;width:600px">
               <tr>
                <td align="left" style="Margin:0;padding-right:20px;padding-left:20px;padding-bottom:20px;">
                 <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                   <tr>
                    <td align="left" style="padding:0;Margin:0;width:560px">
                     <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
  
                       <tr>
                        <td align="center" style="padding:0;Margin:0;padding-bottom:20px;padding-top:20px;font-size:0">
                         <table cellpadding="0" cellspacing="0" class="es-table-not-adapt es-social" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                           <tr>
                            <td align="center" valign="top" style="padding:0;Margin:0;padding-right:20px"><a target="_blank" href="https://mkonnect.com.ng" style="mso-line-height-rule:exactly;text-decoration:underline;color:#516365;font-size:14px"><img title="Facebook" src="https://efytuph.stripocdn.email/content/assets/img/social-icons/logo-colored-bordered/facebook-logo-colored-bordered.png" alt="Fb" width="24" height="24" style="display:block;font-size:18px;border:0;outline:none;text-decoration:none"></a></td>
                            <td align="center" valign="top" style="padding:0;Margin:0;padding-right:20px"><a target="_blank" href="https://mkonnect.com.ng" style="mso-line-height-rule:exactly;text-decoration:underline;color:#516365;font-size:14px"><img title="X.com" src="https://efytuph.stripocdn.email/content/assets/img/social-icons/logo-colored-bordered/x-logo-colored-bordered.png" alt="X" width="24" height="24" style="display:block;font-size:18px;border:0;outline:none;text-decoration:none"></a></td>
                            <td align="center" valign="top" style="padding:0;Margin:0;padding-right:20px"><a target="_blank" href="https://mkonnect.com.ng" style="mso-line-height-rule:exactly;text-decoration:underline;color:#516365;font-size:14px"><img title="Instagram" src="https://efytuph.stripocdn.email/content/assets/img/social-icons/logo-colored-bordered/instagram-logo-colored-bordered.png" alt="Inst" width="24" height="24" style="display:block;font-size:18px;border:0;outline:none;text-decoration:none"></a></td>
  
                           </tr>
                         </table></td>
                       </tr>
                       <tr>
                        <td align="center" style="padding:0;Margin:0;padding-top:10px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:Spartan, sans-serif;line-height:21px;letter-spacing:0;color:#516365;font-size:14px">You are receiving this email because you have successfully purchased a data plan with Mkonnect. Make sure our messages get to your Inbox (and not your bulk or junk folders).<br><strong><a target="_blank" href="https://mkonnect.com.ng" style="mso-line-height-rule:exactly;text-decoration:none;color:#516365;font-size:14px">Privacy police</a> | <a target="_blank" style="mso-line-height-rule:exactly;text-decoration:none;color:#516365;font-size:14px" href="">Unsubscribe</a></strong></p></td>
                       </tr>
                     </table></td>
                   </tr>
                 </table></td>
               </tr>
             </table>
            </td>
           </tr>
         </table>
  </td>
       </tr>
     </table>
    </div>
   </body>
  </html>`;
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: EMAIL_PASSWORD,
    },
  });

  var mailOptions = {
    from: FROM_EMAIL,
    to: recipient,
    subject: subject,
    html: message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      logger.error(`Error sending email: ${error.stack}`);
    }
  });
};

export const marketingMsg = async (senderNumber, phone_number_id) => {
  let msg;
  const numbers = [1, 2];
  const randomIndex = Math.floor(Math.random() * numbers.length);
  const randomNumber = numbers[randomIndex];
  switch (randomNumber) {
    case 1:
      msg = `Stay connected with us! Follow us on Instagram for the latest updates and exclusive content. 📸✨ @mkonnect_\n\nLink: https://www.instagram.com/mkonnect_`;
      sendMessage(senderNumber, msg, phone_number_id);
      break;
    case 2:
      msg = "You can now buy electricity on Mkonnect ⚡⚡⚡";
      sendMessage(senderNumber, msg, phone_number_id);
      const msg2 = await sendMediaMessage(
        "https://mkonnect.com.ng/tutorial/electricity.mp4",
        "Up NEPA 💡💡💡 \n\nDon't enjoy Mkonnect alone  😎, invite your friends and family to join you on this journey. 💪 \n\nLink: https://wa.me/message/O3GO6ETN3A3CH1",
        phone_number_id,
        senderNumber,
        "video"
      );
      break;
    default:
      break;
  }
};

export const mailchimpContact = async (email, firstName, lastName) => {
  mailchimp.setConfig({
    apiKey: MAILCHIMP_API_KEY,
    server: "us8",
  });

  const subscribingUser = {
    firstName: firstName,
    lastName: lastName,
    email: email,
  };

  async function run() {
    try {
      const listId = "f2fa4a851d";
      const response = await mailchimp.lists.addListMember(listId, {
        email_address: subscribingUser.email,
        status: "subscribed",
        merge_fields: {
          FNAME: subscribingUser.firstName,
          LNAME: subscribingUser.lastName,
        },
      });

      logger.info(
        `Successfully added contact as an audience member. The contact's id is ${response.id}.`
      );
    } catch (error) {
      logger.error(`Error creating mailchimp contact:${error.stack}`);
    }
  }

  run();
};

export const createBankDetails =  async (userDetails) => {
  try {
    // Check if a document with the same email or phoneNumber already exists
    const existingDetails = await BankDetails.findOne({
      $or: [
        { email: userDetails.email }, // Check for matching email
        { phoneNumber: userDetails.phoneNumber }, // Check for matching phone number
      ],
    });

    if (existingDetails) {
      console.log(
        `Document already exists for email: ${userDetails.email} or phone: ${userDetails.phoneNumber}`
      );
      return existingDetails; // Return the existing document
    }

    // Create a new document using the BankDetails model
    const newBankDetails = new BankDetails(userDetails);

    // Save the document to the database
    const savedDetails = await newBankDetails.save();

    console.log('Document created successfully:', savedDetails);
    return savedDetails; // Return the saved document
  } catch (error) {
    // Handle errors
    console.error('Error creating document:', error.message);
    throw error;
  }
}

export const updateBankDetails = async  (userDetails) => {
  try {
    // Find the user by phoneNumber or email and update the Paystack details
    const updatedBankDetails = await BankDetails.findOneAndUpdate(
      { email: userDetails.email }, // Match by email (unique identifier)
      {
        accountNumberWema: userDetails.accountNumberWema,
        accountNameWema: userDetails.accountNameWema,
        bankWema: userDetails.bankWema,
      },
      { new: true, upsert: false } // Return the updated document, do not create a new one
    );

    if (updatedBankDetails) {
      console.log('Document updated successfully:', updatedBankDetails);
      return updatedBankDetails; // Return the updated document
    } else {
      console.log(`No document found for email: ${userDetails.email}`);
      return null;
    }
  } catch (error) {
    // Handle errors
    console.error('Error updating document:', error.message);
    throw error;
  }
}
export const getBankAccountDetails = async (phoneNumber) => {
  try {
    const bankDetails = await BankDetails.findOne({ phoneNumber });

    // Default message for missing bank details
    let responseMessage = '*We could not find your bank account details. Please contact support for assistance.*';

    if (!bankDetails) {
      const user = await User.findOne({ phoneNumber });
      if (user) {
        responseMessage = `*Kindly make a transfer to the account details below to fund your wallet 💸:*\n\n` +
          `*Account-Name*: ${user.accountName}\n` +
          `*Account-Number*: ${user.accountNumber}\n` +
          `*Bank*: ${user.bank}\n\n` +
          `*Note*: Please note that a transaction fee of 1% will be deducted from your deposit ✅`;
      }
      return responseMessage;
    }

    // Construct the message with Paystack and Wema details
    responseMessage = `*Kindly make a transfer to the account details below to fund your wallet.\n\n🚨PLEASE USE PAYSTACK TITAN TO MAKE DEPOSITS AS WEMA BANK IS HAVING ISSUES.  💸:*\n\n` +
      `*Paystack Account:*\n` +
      `*Account-Name*: ${bankDetails.accountNamePaystack}\n` +
      `*Account-Number*: ${bankDetails.accountNumberPaystack}\n` +
      `*Bank*: ${bankDetails.bankPaystack}\n\n` +
      `*Wema Bank Account:*\n` +
      `*Account-Name*: ${bankDetails.accountNameWema}\n` +
      `*Account-Number*: ${bankDetails.accountNumberWema}\n` +
      `*Bank*: Wema Bank\n\n` +
      `*Note*:  Please note that a transaction fee of 1% will be deducted from your deposit ✅`;

    return responseMessage;
  } catch (error) {
    logger.error(`Error in getBankAccountDetails: ${error.message}`);
    return 'An error occurred while fetching bank details. Please try again later.';
  }
};



export const getUsersCSV = async () => {
  try {
    // Fetch users who have an email
    const users = await User.find();
    // const users = await User.find({ email: { $exists: true } });
    // let splitName = fullName.split(" ");
    // let firstName = splitName[0];
    // let surname = splitName.slice(1).join(" ");
    
    // Create an array of objects with full name and email
    const userRecords = users.map(user => ({
      name: user.fullName,
      phoneNumber: `'${user.phoneNumber}`, // Add a leading apostrophe
      email: user.email
    }));

    console.log(userRecords.length);

    // Convert the array of objects to CSV format
    const csvData = parse(userRecords, { fields: ['name', 'phoneNumber', 'email'] });
    // console.log(csvData);

    // Write the CSV data to a file
    await fss.writeFile('Mkonnect.csv', csvData);

    console.log('Emails and names have been saved to Mkonnect.csv');
  } catch (error) {
    console.error('Error fetching user emails:', error);
  }
}



export const sendUsersCSVEmail = async () => {
  const userCount = await User.countDocuments();
    
  // Construct the email message
  const message = `Hello, please find the attached .csv document. Total users are ${userCount}.`;
  const recipients = ["michaelyak66@gmail.com", "smithgodwin678@gmail.com", "dashuwardestiny16@gmail.com", "ochethecreator@gmail.com", "manassehezeocha@gmail.com", "mukiala13@gmail.com"];

  
  // Create the transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: EMAIL_PASSWORD,
    },
  });

  // Mail options with attachment
  const mailOptions = {
    from: FROM_EMAIL,
    to: recipients,
    subject: "MKONNECT USERS CSV",
    html: message,
    attachments: [
      {
        filename: "Mkonnect.csv", // Name of the file as it appears in the email
        path: "Mkonnect.csv",       // Path to the .csv file
        contentType: "text/csv", // MIME type for .csv files
      },
    ],
  };

  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      logger.error(`Error sending email: ${error.stack}`);
    } else {
      console.log(`Email sent: ${info.response}`);
      logger.info(`Email sent successfully to ${recipient}`);
    }
  });
};
