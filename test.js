// import { createJob } from "./controllers/utils/utils.js";
import { connectToDatabase } from "./db.js";
import User from "./models/users.js";
import Deposit from "./models/deposits.js";
import mongoose from "mongoose";
import { writeFile } from "fs/promises";
import axios from "axios";
import PDFDocument from "pdfkit";
// import fs from "fs";

// import { getFacts } from "./controllers/utils/utils.js";

// const db = await connectToDatabase();
import fs from "fs/promises"; // Use the promises version of fs
import { parse } from "json2csv"; // Correctly import the parse function from json2csv


import BankDetails from "./models/bankDetails.js"; // Adjust the path as necessary
import { createDedicatedAccount } from "./controllers/paystack.js";
import { generateReceipt, getUsersCSV } from "./controllers/utils/utils.js";

// await getUsersCSV();

await generateReceipt(
                      "Akinloye Babs Dickson",
                      "B17 Shelter View Estate APO  Lokogoma",
                      "0207227015907",
                      new Date().toLocaleString(),
                      'ELECTRICITY',
                      "PREPAID",
                      150,
                      49850,
                      50000,
                      "Token: 34538673649080120098"
                    );


// db.transactions.aggregate([
//   {
//     $match: {
//       createdAt: {
//         $gte: ISODate("2025-03-12T00:00:00.000Z"),
//         $lte: ISODate("2025-03-12T23:59:59.999Z")
//       }
//     }
//   },
//   {
//     $group: {
//       _id: null,
//       totalProfit: { $sum: "$profit" }
//     }
//   }
// ]);


// async function getTopCustomers(year) {
//   // Set the date range for the whole year
//   const startDate = new Date(year, 0, 1);  // January 1st, 2024
//   const endDate = new Date(year + 1, 0, 1);  // January 1st, 2025

//   // Get the top customers based on the total amount deposited
//   let topCustomers = await Deposit.aggregate([
//     {
//       $match: {
//         createdAt: { $gte: startDate, $lt: endDate },
//         status: "success",
//       },
//     },
//     {
//       $group: {
//         _id: "$phoneNumber",
//         totalAmount: { $sum: { $toDouble: "$amount" } },
//       },
//     },
//     {
//       $sort: { totalAmount: -1 },
//     },
//     {
//       $limit: 30,
//     },
//   ]);

//   // Extract the phone numbers of the top 30 customers
//   const phoneNumbers = topCustomers.map(customer => customer._id);

//   // Fetch customer names using the phone numbers
//   let customersWithNames = await User.find({ phoneNumber: { $in: phoneNumbers } });

//   // Map the top customers to include names
//   topCustomers = topCustomers.map(customer => {
//     const user = customersWithNames.find(u => u.phoneNumber === customer._id);
//     return {
//       phoneNumber: customer._id,
//       totalAmount: customer.totalAmount,
//       fullName: user ? user.fullName : "Unknown",  // Use fullName instead of name
//     };
//   });

//   // Create a new PDF document
//   const doc = new PDFDocument();
//   const filePath = './Top_Customers_Report.pdf';
  
//   // Pipe the document to a file
//   doc.pipe(fs.createWriteStream(filePath));

//   // Add title to the document
//   doc.fontSize(20).text('Top 30 Customers for ' + year, { align: 'center' }).moveDown(2);

//   // Add table headers
//   doc.fontSize(12).text('No. | Phone Number | Total Amount | Full Name');
//   doc.moveDown();

//   // Add each customer's data to the table
//   topCustomers.forEach((customer, index) => {
//     doc.text(
//       `${index + 1} | ${customer.phoneNumber} | ${customer.totalAmount} | ${customer.fullName}`
//     );
//   });

//   // Finalize the document and end the stream
//   doc.end();

//   console.log('PDF Report generated at: ' + filePath);

//   console.log(topCustomers);
//   console.table(topCustomers);


// }


// await getTopCustomers(2024) 



// Connect to your MongoDB database

// const apiKey = ''


// async function getPaystackCustomers() {
//   const config = {
//     method: 'get',
//     maxBodyLength: Infinity,
//     url: `https://api.paystack.co/customer/pmamman@gmail.com?perPage=100&page=4`,
//     headers: { 
//       'Authorization': `Bearer ${apiKey}`,
//     },
//   };

//   try {
//     const response = await axios.request(config);
//     return response.data.data; // Return the customer list
//   } catch (error) {
//     throw new Error(`Error fetching customers: ${error.response?.data?.message || error.message}`);
//   }
// }




// async function createBankDetails(userDetails) {
//   try {
//     // Create a new document using the BankDetails model
//     const newBankDetails = new BankDetails(userDetails);

//     // Save the document to the database
//     const savedDetails = await newBankDetails.save();

//     console.log('Document created successfully:', savedDetails);
//     return savedDetails; // Return the saved document
//   } catch (error) {
//     // Handle errors
//     console.error('Error creating document:', error.message);
//     throw error;
//   }
// }

// async function createBankDetails(userDetails) {
//   try {
//     // Check if a document with the same email or phoneNumber already exists
//     const existingDetails = await BankDetails.findOne({
//       $or: [
//         { email: userDetails.email }, // Check for matching email
//         { phoneNumber: userDetails.phoneNumber }, // Check for matching phone number
//       ],
//     });

//     if (existingDetails) {
//       console.log(
//         `Document already exists for email: ${userDetails.email} or phone: ${userDetails.phoneNumber}`
//       );
//       return existingDetails; // Return the existing document
//     }

//     // Create a new document using the BankDetails model
//     const newBankDetails = new BankDetails(userDetails);

//     // Save the document to the database
//     const savedDetails = await newBankDetails.save();

//     console.log('Document created successfully:', savedDetails);
//     return savedDetails; // Return the saved document
//   } catch (error) {
//     // Handle errors
//     console.error('Error creating document:', error.message);
//     throw error;
//   }
// }



// async function fetchAndSaveCustomerDetails() {
//   const allCustomerDetails = [];

//   try {
//     // Fetch all customers
//     let customers = await getPaystackCustomers();
//     customers = [customers];
//     console.log(customers);
//     console.log(customers.length);

//     for (const customer of customers) {
//       // Fetch details for each customer
//       const details = await createDedicatedAccount(customer.email, "wema-bank");

//       const user = {
//         phoneNumber: details.data.customer.phone,
//         email: details.data.customer.email,
//         accountNumberWema: details.data.account_number,
//         accountNameWema: details.data.account_name,
//         bankWema: 'Wema Bank',
//       };

//       const result = await createBankDetails(user);
//     }

//     console.log(`doneeeeeeeeeeeeeeee`);
//   } catch (error) {
//     console.error(`Error in fetchAndSaveCustomerDetails: ${error.message}`);
//   }
// }


// async function updateBankDetails(userDetails) {
//   try {
//     // Find the user by phoneNumber or email and update the Paystack details
//     const updatedBankDetails = await BankDetails.findOneAndUpdate(
//       { email: userDetails.email }, // Match by email (unique identifier)
//       {
//         accountNumberPaystack: userDetails.accountNumberPaystack,
//         accountNamePaystack: userDetails.accountNamePaystack,
//         bankPaystack: userDetails.bankPaystack,
//       },
//       { new: true, upsert: false } // Return the updated document, do not create a new one
//     );

//     if (updatedBankDetails) {
//       console.log('Document updated successfully:', updatedBankDetails);
//       return updatedBankDetails; // Return the updated document
//     } else {
//       console.log(`No document found for email: ${userDetails.email}`);
//       return null;
//     }
//   } catch (error) {
//     // Handle errors
//     console.error('Error updating document:', error.message);
//     throw error;
//   }
// }

// async function fetchAndUpdateCustomerDetails() {
//   try {
//     // Fetch all customers
//     console.log("hereeeeeeeeeeeeee");

//     const customers = await getPaystackCustomers();
//     console.log(`Total customers fetched: ${customers.length}`);

//     for (const customer of customers) {
//       try {
//         // Fetch details for each customer
//         const details = await createDedicatedAccount(customer.email, "titan-paystack");

//         const userUpdate = {
//           email: details.data.customer.email,
//           accountNumberPaystack: details.data.account_number,
//           accountNamePaystack: details.data.account_name,
//           bankPaystack: 'Paystack-Titan', // Update Paystack bank name
//         };

//         // Update the document
//         const result = await updateBankDetails(userUpdate);
//         if (result) {
//           console.log(`Updated customer details for ${userUpdate.email}`);
//         } else {
//           console.log(`No existing record for ${userUpdate.email}`);
//         }
//       } catch (innerError) {
//         console.error(
//           `Error processing customer ${customer.email}: ${innerError.message}`
//         );
//       }
//     }

//     console.log('All customers processed successfully.');
//   } catch (error) {
//     console.error(`Error in fetchAndUpdateCustomerDetails: ${error.message}`);
//   }
// }


// // Run the function
// await fetchAndSaveCustomerDetails();
// await fetchAndUpdateCustomerDetails();


// Run the migration script
// migrateBankDetails();
// createPaystackAccount();
// getPaystackCustomerall();


// import PDFDocument from 'pdfkit';
// import fs from 'fs';
// import QRCode from 'qrcode';
// import crypto from 'crypto';

// async function generateUniqueId(length = 16) {
//   return crypto.randomBytes(length)
//       .toString('hex')
//       .slice(0, length);
// }

// const generateQRCode = async (url) => {
//   try {
//     const filePath = './public/receipt/qrcode/qrcode.png';
//     await QRCode.toFile(filePath, url);
//     console.log(`QR Code saved at ${filePath}`);
//     return filePath;
//   } catch (err) {
//     console.error('Error generating QR code:', err);
//   }
// };


// async function generateStyledReceipt(customerName, address, meterNumber, date, product, provider, serviceCharge, costOfUtility, totalPaid, token) {
//     const doc = new PDFDocument({ size: 'A4', margin: 50 });

//     // Pipe its output to a file
//     const transactionRef = await generateUniqueId(16);

//     const url = `https://mkonnect.com.ng/receipt/Mkonnect_receipt_${transactionRef}.pdf`
//     const filename = `./public/receipt/Mkonnect_receipt_${transactionRef}.pdf`;
//     doc.pipe(fs.createWriteStream(filename));
//     doc.registerFont('Roboto', 'fonts/Roboto-Black.ttf')
//     doc.registerFont('Roboto-Italic', 'fonts/Roboto-Italic.ttf')

//     const pageWidth = doc.page.width;
//     const imageWidth = 260;  // Set the image width here
//     const imageX = (pageWidth - imageWidth) / 2;  // Calculate the X position to center the image

//     doc.image('./public/assets/logo/Transparent/mkonnect_logo__Trans_Logo_03.png', imageX, 45, { width: imageWidth });
//     doc.moveDown(4).font('Roboto-Italic');


//     // doc.fontSize(12).text('Stay connected with Konnect.', { align: 'center' }).moveDown(2).font('Roboto-Italic');  

//     doc.moveDown(2);

//     // Title and Date
//     doc.fontSize(16).text('Electricity Purchase Receipt', { align: 'center' })
//        .moveDown(0.5);
//     doc.fontSize(12).text(`Date: ${date}`, { align: 'center' }).font('Roboto');

//     // Transaction Details Table
//     const tableTop = doc.y + 10;
//     // doc.fontSize(12).text('Transaction Details', 50, tableTop - 10);
    
//     const formatter = new Intl.NumberFormat('en-NG', {
//       style: 'currency',
//       currency: 'NGN',
//   });
  
//   const transactionDetails = [
//       { label: 'Customer Name', value: customerName },
//       { label: 'Address', value: address },
//       { label: 'Meter Number', value: meterNumber },
//       { label: 'Product', value: product },
//       { label: 'Provider', value: provider },
//       { label: 'Transaction Ref', value: transactionRef },
//       { label: 'Service Charge', value: formatter.format(serviceCharge) },
//       { label: 'Cost of Utility', value: formatter.format(costOfUtility) },
//       { label: 'Total Paid', value: formatter.format(totalPaid) },
//   ];
  

//     transactionDetails.forEach((item, i) => {
//         const y = tableTop + (i + 1) * 40;
//         doc.text(item.label, 80, y)
//            .text(item.value, 320, y, { align: 'left' })
//            .font('Roboto');
        
//     });
    
    
//     // Token Section
//     doc.fontSize(14)
//     .font('Helvetica-Bold')
//     .text(`TOKEN: ${token}`, 50, 650,  { align: 'center', fillColor: 'black', underline: true }).font('Roboto-Italic');
    
//     let qr_code = await generateQRCode(url);
//     console.log(imageX)
//     doc.image(`${qr_code}`, 270, 680, { width: 70 });
    
//     // Footer
//     doc.fontSize(10)
//        .text('Stay connected with Konnect.', 50, 780, { align: 'center', width: 500 }).font('Roboto-Italic');

//     doc.end();

//     console.log(`Styled receipt generated and saved as ${filename}`);
//     return url 
// }

// Example usage
// await generateStyledReceipt(
//     'ENGR IBRAHIMGOJE',
//     'NO 77A AGUIYI IRONSI WAY Und St. Maitama 3',
//     '95300754397',
//     new Date().toLocaleString(),
//     'ELECTRICITY',
//     'Abuja Electric',
//     '20240827195124335472483485c805ed5-102c-4d96-836d-9404bd7827e2',
//     '150',
//     '49850',
//     '50000',
//     '70932501182874875568'
// );




// FIXME:
// Assuming your User schema includes fields for 'email' and 'fullName'

async function getEmails() {
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
    await fs.writeFile('Mkonnect.csv', csvData);

    console.log('Emails and names have been saved to emails.csv');
  } catch (error) {
    console.error('Error fetching user emails:', error);
  }
}
// getEmails();


// async function getEmails() {
//   const userEmail = [];
//   try {
//     const users = await User.find({ email: { $exists: true } });
//     users.forEach((user) => {
//       userEmail.push(user.email);
//     });

//     const emailList = userEmail.join(", ");
//     await writeFile("emails.txt", emailList);
//     console.log("Emails have been saved to emails.txt");
//   } catch (error) {
//     console.error("Error fetching user emails:", error);
//   }
// }

// getEmails();

// async function getTopCustomers(year, month) {
//   // Set the date range for the given month
//   const startDate = new Date(year, month - 1, 1);
//   const endDate = new Date(year, month, 1);

//   let topCustomers = await Deposit.aggregate([
//     {
//       $match: {
//         createdAt: { $gte: startDate, $lt: endDate },
//         status: "success",
//       },
//     },
//     {
//       $group: {
//         _id: "$phoneNumber",
//         totalAmount: { $sum: { $toDouble: "$amount" } },
//       },
//     },
//     {
//       $sort: { totalAmount: -1 },
//     },
//     {
//       $limit: 30,
//     },
//   ]);
//   console.log(topCustomers);
// }

// await getTopCustomers(2024, 5);
// await getEmails();

// Define the data plan mapping
// const data_plan_mapping = {
//   Karldata: {
//     MTN: {
//       "250.0MB": { id: 215, amount: 110, plan_type: "CORPORATE GIFTING" },
//       "500.0MB": [
//         { id: 212, amount: 135, plan_type: "SME" },
//         { id: 313, amount: 135, plan_type: "GIFTING" },
//         { id: 216, amount: 150, plan_type: "CORPORATE GIFTING" },
//       ],
//       "1.0GB": [
//         { id: 310, amount: 250, plan_type: "GIFTING" },
//         { id: 314, amount: 265, plan_type: "GIFTING" },
//         { id: 7, amount: 269, plan_type: "SME" },
//         { id: 217, amount: 290, plan_type: "CORPORATE GIFTING" },
//       ],
//       "2.0GB": [
//         { id: 315, amount: 530, plan_type: "GIFTING" },
//         { id: 8, amount: 538, plan_type: "SME" },
//         { id: 218, amount: 580, plan_type: "CORPORATE GIFTING" },
//       ],
//       "3.0GB": [
//         { id: 316, amount: 795, plan_type: "GIFTING" },
//         { id: 44, amount: 807, plan_type: "SME" },
//         { id: 219, amount: 870, plan_type: "CORPORATE GIFTING" },
//       ],
//       "4.0GB": { id: 320, amount: 1060, plan_type: "GIFTING" },
//       "5.0GB": [
//         { id: 317, amount: 1325, plan_type: "GIFTING" },
//         { id: 11, amount: 1345, plan_type: "SME" },
//         { id: 220, amount: 1450, plan_type: "CORPORATE GIFTING" },
//       ],
//       "6.0GB": { id: 321, amount: 1590, plan_type: "GIFTING" },
//       "7.0GB": { id: 322, amount: 1855, plan_type: "GIFTING" },
//       "10.0GB": [
//         { id: 318, amount: 2650, plan_type: "GIFTING" },
//         { id: 43, amount: 2690, plan_type: "SME" },
//         { id: 221, amount: 2900, plan_type: "CORPORATE GIFTING" },
//       ],
//       "15.0GB": { id: 312, amount: 2100, plan_type: "GIFTING" },
//       "20.0GB": { id: 223, amount: 5800, plan_type: "CORPORATE GIFTING" },
//       "35.0GB": { id: 323, amount: 9275, plan_type: "GIFTING" },
//       "40.0GB": { id: 324, amount: 10600, plan_type: "GIFTING" },
//     },
//   },
//   UsufData: {
//     MTN: {
//       "250.0MB": { id: 279, amount: 95, plan_type: "CORPORATE GIFTING" },
//       "500.0MB": [
//         { id: 304, amount: 139, plan_type: "SME/DATA SHARE" },
//         { id: 297, amount: 140, plan_type: "SME2" },
//         { id: 6, amount: 140, plan_type: "SME" },
//         { id: 207, amount: 148, plan_type: "CORPORATE GIFTING" },
//       ],
//       "1.0GB": [
//         { id: 305, amount: 239, plan_type: "AWOOF DATA" },
//         { id: 289, amount: 260, plan_type: "DATA COUPONS" },
//         { id: 300, amount: 267, plan_type: "SME/DATA SHARE" },
//         { id: 290, amount: 268, plan_type: "SME2" },
//         { id: 7, amount: 269, plan_type: "SME" },
//         { id: 208, amount: 270, plan_type: "CORPORATE GIFTING" },
//       ],
//       "2.0GB": [
//         { id: 301, amount: 534, plan_type: "SME/DATA SHARE" },
//         { id: 293, amount: 536, plan_type: "SME2" },
//         { id: 8, amount: 538, plan_type: "SME" },
//         { id: 209, amount: 540, plan_type: "CORPORATE GIFTING" },
//       ],
//       "3.0GB": [
//         { id: 306, amount: 570, plan_type: "AWOOF DATA" },
//         { id: 291, amount: 780, plan_type: "DATA COUPONS" },
//         { id: 302, amount: 801, plan_type: "SME/DATA SHARE" },
//         { id: 294, amount: 804, plan_type: "SME2" },
//         { id: 44, amount: 807, plan_type: "SME" },
//         { id: 210, amount: 810, plan_type: "CORPORATE GIFTING" },
//       ],
//       "5.0GB": [
//         { id: 303, amount: 1200, plan_type: "SME/DATA SHARE" },
//         { id: 295, amount: 1335, plan_type: "SME2" },
//         { id: 11, amount: 1345, plan_type: "SME" },
//         { id: 211, amount: 1350, plan_type: "CORPORATE GIFTING" },
//       ],
//       "10.0GB": [
//         { id: 307, amount: 2200, plan_type: "AWOOF DATA" },
//         { id: 296, amount: 2680, plan_type: "SME2" },
//         { id: 43, amount: 2690, plan_type: "SME" },
//         { id: 212, amount: 2700, plan_type: "CORPORATE GIFTING" },
//       ],
//       "15.0GB": { id: 308, amount: 2750, plan_type: "AWOOF DATA" },
//       "20.0GB": { id: 309, amount: 5400, plan_type: "CORPORATE GIFTING" },
//       "35.0GB": { id: 310, amount: 8500, plan_type: "CORPORATE GIFTING" },
//       "40.0GB": { id: 311, amount: 9000, plan_type: "CORPORATE GIFTING" },
//     },
//   },
// };

// Define the plan size you're looking for
// const planSize = "2.0GB";

// Get UsufData plans for the specified size
// const usufDataPlans = data_plan_mapping.UsufData.MTN[planSize] || [];
// const KarldataPlans = data_plan_mapping.Karldata.MTN[planSize] || [];
// usufDataPlans.forEach(plan => {
//   console.log(`UsufData plan: ${plan.id}, ${plan.amount}, ${plan.plan_type}`);
// });

// // Print the list of UsufData plans
// console.log(usufDataPlans);
// console.log(KarldataPlans);

// // Function to fetch meter validation
// export const fetchMeterValidation = async (meterNumber, discoName) => {
//   // const url = "https://www.usufdataservice.com/api/validatemeter";
//   const url = "https://karldata.com/api/validatemeter"
//   // console.log("Fetching meter validation for:", { meterNumber, discoName });

//   const params = {
//     meternumber: meterNumber,
//     disconame: discoName,
//     mtype: "PREPAID",
//   };

//   const config = {
//     method: "get",
//     headers: {
//       // Authorization: `Token 4ef79bc0d15c52267c9321863699544283ae99d8`,
//       Authorization: `Token f585bb4754091d6585dd3a667d9e5b58c004d037`,

//       // "Content-Type": "application/json",
//     },
//     params: params,
//   };

//   try {
//     const response = await axios(url, config);
//     // console.log("API Response:", response.data);

//     // Parse the response
//     const { invalid, name, address } = response.data;

//     // Return parsed response
//     return {
//       data: {
//         invalid,
//         name: name.trim(),
//         address: address.trim(),
//       },
//     };
//   } catch (error) {
//     console.error(`Error fetching meter validation: ${error.message}`);
//     return { status: false, error: error.message };
//   }
// };

// import axios from "axios";

// // Function to fetch meter validation
// export const fetchMeterValidation = (meterNumber, discoName) => {
//   // const url = "https://mkonnect.com.ng/test";
//   console.log("Fetching meter validation for:", { meterNumber, discoName });

//   // const params = {
//   //   meternumber: meterNumber,
//   //   disconame: discoName,
//   // };

//   let config = {
//     method: 'get',
//     maxBodyLength: Infinity,
//     url: `https://mkonnect.com.ng/test?meterNumber=${meterNumber}&discoName=${discoName}`,
//     headers: { }
//   };

//   return axios.request(config)
//     .then((response) => {
//       console.log(JSON.stringify(response.data));
//       let data = response.data
//       return data
//     })
//     .catch((error) => {
//       console.log(error);
//     });

// //   return axios(config)
// //     .then(response => {
// //       console.log("API Response:", response.data);

// //       // Parse the response
// //       const { name, address } = response.data;

// //       // Return parsed response
// //      return {data: "hi"}
// //     //   return {
// //     //     data: {
// //     //       invalid: true,
// //     //       name: "name.trim()",
// //     //       address: "address.trim()",
// //     //     },
// //     //   };
// //     }
// //          )
// //     .catch(error => {
// //       console.error(`Error fetching meter validation: ${error.message}`);
// //       return { status: false, error: error.message };
// //     });
// };

// // this object is generated from Flow Builder under "..." > Endpoint > Snippets > Responses
// const SCREEN_RESPONSES = {
//   APPOINTMENT: {
//     version: "3.0",
//     screen: "APPOINTMENT",
//     data: {
//       department: [
//         { id: "shopping", title: "Shopping & Groceries" },
//         { id: "clothing", title: "Clothing & Apparel" },
//         { id: "home", title: "Home Goods & Decor" },
//         { id: "electronics", title: "Electronics & Appliances" },
//         { id: "beauty", title: "Beauty & Personal Care" },
//       ],
//       location: [
//         { id: "1", title: "King\u2019s Cross, London" },
//         { id: "2", title: "Oxford Street, London" },
//         { id: "3", title: "Covent Garden, London" },
//         { id: "4", title: "Piccadilly Circus, London" },
//       ],
//       is_location_enabled: true,
//       date: [
//         { id: "2024-01-01", title: "Mon Jan 01 2024" },
//         { id: "2024-01-02", title: "Tue Jan 02 2024" },
//         { id: "2024-01-03", title: "Wed Jan 03 2024" },
//       ],
//       is_date_enabled: true,
//       time: [
//         { id: "10:30", title: "10:30" },
//         { id: "11:00", title: "11:00", enabled: false },
//         { id: "11:30", title: "11:30" },
//         { id: "12:00", title: "12:00", enabled: false },
//         { id: "12:30", title: "12:30" },
//       ],
//       is_time_enabled: true,
//     },
//   },
//   DETAILS: {
//     version: "3.0",
//     screen: "DETAILS",
//     data: {
//       department: "beauty",
//       location: "1",
//       date: "2024-01-01",
//       time: "11:30",
//     },
//   },
//   SUMMARY: {
//     version: "3.0",
//     screen: "SUMMARY",
//     data: {
//       appointment: "Beauty & Personal Care Department at Kings Cross, London\nMon Jan 01 2024 at 11:30.",
//       details: "Name: John Doe\nEmail: john@example.com\nPhone: 123456789\n\nA free skin care consultation, please",
//       department: "beauty",
//       location: "1",
//       date: "2024-01-01",
//       time: "11:30",
//       name: "John Doe",
//       email: "john@example.com",
//       phone: "123456789",
//       more_details: "A free skin care consultation, please",
//     },
//   },
//   SCREEN_TWO: {
//     version: "3.0",
//     screen: "SCREEN_TWO",
//     data: {
//       title: "Mkonnect",
//       name: "Michael Mamman",
//       state: "Jos",
//       meterNumber: "23232323232323",
//       amount: "2000",
//       address: "address",
//     },
//   },
//   ERROR: {
//     version: "3.0",
//     screen: "ERROR",
//     data: {
//       title: "ERROR",
//     },
//   },
//   TERMS: {
//     version: "3.0",
//     screen: "TERMS",
//     data: {},
//   },
//   SUCCESS: {
//     version: "3.0",
//     screen: "SUCCESS",
//     data: {
//       extension_message_response: {
//         params: {
//           flow_token: "REPLACE_FLOW_TOKEN",
//           some_param_name: "PASS_CUSTOM_VALUE",
//         },
//       },
//     },
//   },
// };

// export const getNextScreen = async (decryptedBody) => {
//   const { screen, data, version, action, flow_token } = decryptedBody;
//   // handle health check request
//   if (action === "ping") {
//     return {
//       version,
//       data: {
//         status: "active",
//       },
//     };
//   }

//   // handle error notification
//   if (data?.error) {
//     console.warn("Received client error:", data);
//     return {
//       version,
//       data: {
//         acknowledged: true,
//       },
//     };
//   }

//   // handle initial request when opening the flow and display APPOINTMENT screen
//   if (action === "INIT") {
//     return {
//       ...SCREEN_RESPONSES.APPOINTMENT,
//       data: {
//         ...SCREEN_RESPONSES.APPOINTMENT.data,
//         // these fields are disabled initially. Each field is enabled when previous fields are selected
//         is_location_enabled: false,
//         is_date_enabled: false,
//         is_time_enabled: false,
//       },
//     };
//   }

//   if (action === "data_exchange") {
//     // handle the request based on the current screen
//     switch (screen) {
//       case "QUESTION_ONE":
//         let state = `State: ${data.company}`;
//         let meterNumber = `Meter Number: ${data.meter_number}`;
//         let amount = `Amount: ₦${data.amount}`;
//            return {
//                   ...SCREEN_RESPONSES.SCREEN_TWO,
//                   version: "3.0",
//                   screen: "ERROR",
//                   data: {
//                     title: "title",
//                     error_message: "SOMETHING WENT WRONG",
//                   },
//                 };
//         // Fetch meter details
//         console.log(data.meter_number, data.company);

//         // Call fetchMeterValidation and handle response
//         return fetchMeterValidation(data.meter_number, data.company)
//           .then(result => {
//             console.log("====++++++++++++++++++++", result, "00000000000000000", )

//             if (result) {
//               console.log("====++++++++++++++++++++", result, "00000000000000000", )
//               const { name, address } = result;
//               let title = "Your meter details have been validated. Please confirm the details and proceed.";

//               if (result == false) {
//                 console.log("======================================================");
//                 title = "An error occurred while validating your meter details. Please check your meter information and try again.";
//                 return {
//                   ...SCREEN_RESPONSES.SCREEN_TWO,
//                   version: "3.0",
//                   screen: "ERROR",
//                   data: {
//                     title: title,
//                     error_message: "SOMETHING WENT WRONG",
//                   },
//                 };
//               } else {
//                 console.log("--------------------------------------------------------------");
//                 return {
//                   ...SCREEN_RESPONSES.SCREEN_TWO,
//                   data: {
//                     title: title,
//                     name: result[0].name,
//                     state: state,
//                     address: result[0].address,
//                     meterNumber: meterNumber,
//                     amount: amount,
//                   },
//                 };
//               }
//             } else {
//               // console.log("Validation Error:", result.error);
//               return {
//                 ...SCREEN_RESPONSES.SCREEN_TWO,
//                 version: "3.0",
//                 screen: "ERROR",
//                 data: {
//                   title: "An error occurred while validating your meter details. Please check your meter information and try again.",
//                   error_message: "error",
//                 },
//               };
//             }
//           })
//           .catch(error => {
//             console.log("Error during meter validation fetch:", error.stack);
//             return {
//               ...SCREEN_RESPONSES.ERROR,
//               data: {
//                 title: "An error occurred during meter validation fetch.",
//                 error_message: error.message,
//               },
//             };
//           });

//       // Add other cases if needed

//       // handles when user interacts with APPOINTMENT screen
//       case "APPOINTMENT":
//         // update the appointment fields based on current user selection
//         return {
//           ...SCREEN_RESPONSES.APPOINTMENT,
//           data: {
//             // copy initial screen data then override specific fields
//             ...SCREEN_RESPONSES.APPOINTMENT.data,
//             // each field is enabled only when previous fields are selected
//             is_location_enabled: Boolean(data.department),
//             is_date_enabled: Boolean(data.department) && Boolean(data.location),
//             is_time_enabled: Boolean(data.department) && Boolean(data.location) && Boolean(data.date),

//             //TODO: filter each field options based on current selection, here we filter randomly instead
//             location: SCREEN_RESPONSES.APPOINTMENT.data.location.slice(0, 3),
//             date: SCREEN_RESPONSES.APPOINTMENT.data.date.slice(0, 3),
//             time: SCREEN_RESPONSES.APPOINTMENT.data.time.slice(0, 3),
//           },
//         };

//       // handles when user completes DETAILS screen
//       case "DETAILS":
//         // the client payload contains selected ids from dropdown lists, we need to map them to names to display to user
//         const departmentName = SCREEN_RESPONSES.APPOINTMENT.data.department.find(dept => dept.id === data.department).title;
//         const locationName = SCREEN_RESPONSES.APPOINTMENT.data.location.find(loc => loc.id === data.location).title;
//         const dateName = SCREEN_RESPONSES.APPOINTMENT.data.date.find(date => date.id === data.date).title;

//         const appointment = `${departmentName} at ${locationName}\n${dateName} at ${data.time}`;

//         const details = `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\n"${data.more_details}"`;

//         return {
//           ...SCREEN_RESPONSES.SUMMARY,
//           data: {
//             appointment,
//             details,
//             // return the same fields sent from client back to submit in the next step
//             ...data,
//           },
//         };

//       // handles when user completes SUMMARY screen
//       case "SUMMARY":
//         // TODO: save appointment to your database
//         // send success response to complete and close the flow
//         return {
//           ...SCREEN_RESPONSES.SUCCESS,
//           data: {
//             extension_message_response: {
//               params: {
//                 flow_token,
//               },
//             },
//           },
//         };

//       default:
//         break;
//     }
//   }

//   console.error("Unhandled request body:", decryptedBody);
//   throw new Error("Unhandled endpoint request. Make sure you handle the request action & screen logged above.");
// };

// // // Function to fetch meter validation using fetch
// // import fetch from 'node-fetch';

// // export const fetchMeterValidation = async (meterNumber, discoName) => {
// //   console.log("Fetching meter validation for:", { meterNumber, discoName });

// //   const url = `https://mkonnect.com.ng/test?meterNumber=${meterNumber}&discoName=${discoName}`;

// //   try {
// //     const response = await fetch(url, {
// //       method: 'GET',
// //       headers: {
// //         'Content-Type': 'application/json',
// //       },
// //     });

// //     if (!response.ok) {
// //       throw new Error(`HTTP error! status: ${JSON.stringify(response)}`);
// //     }

// //     const data = await response.json();
// //     console.log(JSON.stringify(data));
// //     return data;
// //   } catch (error) {
// //     console.error(error);
// //     throw new Error(`Error fetching meter validation: ${JSON.stringify(error.message)}`);
// //   }
// // };
// // Function to fetch meter validation
// import axios from "axios";
// import Qs from 'qs';
// let data = "";
// let newData = [];
// // export const fetchMeterValidation = async (meterNumber, discoName) => {
// //   const url = "https://karldata.com/api/validatemeter";

// //   const params = {
// //     meternumber: meterNumber,
// //     disconame: discoName,
// //     mtype: "PREPAID",
// //   };

// //   const config = {
// //     url: url,
// //     method: "get",
// //     headers: {
// //       Authorization: `Token f585bb4754091d6585dd3a667d9e5b58c004d037`,
// //     },
// //     params: params,
// //     paramsSerializer: function (params) {
// //       return Qs.stringify(params, { arrayFormat: 'brackets' });
// //     },
// //     transformResponse: [function (data) {
// //       // Parse JSON data
// //       const parsedData = JSON.parse(data);

// //       // Check if the meter number is invalid
// //       if (parsedData.invalid) {
// //         return {
// //           invalid: true,
// //           name: 'INVALID METER NUMBER',
// //           address: 'INVALID METER NUMBER'
// //         };
// //       }

// //       // Return transformed data
// //       return {
// //         invalid: parsedData.invalid,
// //         name: parsedData.name.trim(),
// //         address: parsedData.address.trim()
// //       };
// //     }]
// //   };

// //   try {
// //     const response = await axios.request(config);
// //     console.log("API Response:", response.data);

// //     // Return parsed and transformed response
// //     return { data: response.data };
// //   } catch (error) {
// //     console.error(`Error fetching meter validation: ${error.message}`);

// //     return { status: false, error: error.message, data: { invalid: false } };
// //   }
// // };

// const getPlans = async (network, pp) => {
//   if (network) {
//     let config = {
//       method: "get",
//       maxBodyLength: Infinity,
//       url: `https://mkonnect.com.ng/data/getneworkdataplans/${network}`,
//       // url: 'https://karldata.com/api/user',
//       headers: {
//         Authorization: "3d92c17f0026a2b0453c7c6a6143c28b3f3e4ade7823a3f5",
//         // 'Authorization': 'Token f585bb4754091d6585dd3a667d9e5b58c004d037'
//       },
//     };
//         let data = JSON.stringify({
//     "meterNumber": "0101161035361",
//     "discoName": "Jos Electric"
//   });

//   let config2 = {
//     method: 'get',
//     maxBodyLength: Infinity,
//     url: "https://mkonnect.com.ng/test",
//     data: data,
//     headers: {
//       'Content-Type': 'application/json'
//     },
//   };

//     try {
//       const p = [];
//       const response = await axios.request(config);
//       console.log('===========AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH=============');

//       console.log(response.data)

//       // const result = await fetchMeterValidation(
//       //     "0101161035361",
//       //     "Jos Electric"
//       //   );

//       newData = response.data.map((item) => ({
//         id: String(item.id),
//         title: `${item.Network} ${item.PlanType} ${item.Size} ₦${item.Amount} - ${item.Validity}`,
//       }));
//       let c = true;
//       for (let i of newData) {
//         if (i.id == pp) {
//           c = false;
//           break;
//         }
//       }
//       if (c) {
//         if (pp) {
//           newData.push({ id: pp, title: "Select data plan" });
//         }
//       }
//       return newData;
//     } catch (error) {
//       console.log(error);
//       throw new Error("Failed to fetch plans");
//     }
//   }
//   return newData;
// };

// export const fetchmeter = async (meterNumber, discoName) => {
//   try{
//     let config = {
//   method: 'post',
//   maxBodyLength: Infinity,
//   url: `https://sandbox.vtpass.com/api/merchant-verify?serviceID=ikeja-electric&billersCode=1111111111111&type=prepaid `,
//   headers: {
//     'api-key': 'f8e35fe2fcc31ef66f80869afc1c7f0a',
//     'public-key': 'PK_113a0cf9f469f59229b1f2efa8ba9c6f97cc29188f9',
//     'secret-key': 'SK_462e4fa26ae038731c5d1bce35046b623204a119eb0'
//   }}

//     let response = await axios.request(config)
//     console.log(JSON.stringify(response.data));
//     return response.data

// }
//    catch (error){
//           console.log(error);

//   }
// }

// export const fetchMeterValidation = async (meterNumber, discoName) => {
//   // const url = "https://mkonnect.com.ng/test";
//   console.log("Fetching meter validation for:", { meterNumber, discoName });

//   // const params = {
//   //   meternumber: meterNumber,
//   //   disconame: discoName,
//   // };
//     let data = JSON.stringify({
//     "meterNumber": meterNumber,
//     "discoName": discoName
//   });

//   let config = {
//     method: 'get',
//     maxBodyLength: Infinity,
//     url: "https://mkonnect.com.ng/test",
//     data: data,
//     headers: {
//       'Content-Type': 'application/json'
//     },
//   };

//   return axios.request(config)
//     .then((response) => {
//       console.log(JSON.stringify(response.data));
//       let data = response.data
//       return data
//     })
//     .catch((error) => {
//       console.log(error);
//     });

// //   return axios(config)
// //     .then(response => {
// //       console.log("API Response:", response.data);

// //       // Parse the response
// //       const { name, address } = response.data;

// //       // Return parsed response
// //      return {data: "hi"}
// //     //   return {
// //     //     data: {
// //     //       invalid: true,
// //     //       name: "name.trim()",
// //     //       address: "address.trim()",
// //     //     },
// //     //   };
// //     }
// //          )
// //     .catch(error => {
// //       console.error(`Error fetching meter validation: ${error.message}`);
// //       return { status: false, error: error.message };
// //     });
// };

// const SCREEN_RESPONSES = {
//   APPOINTMENT: {
//     version: "3.0",
//     screen: "APPOINTMENT",
//     data: {
//       department: [
//         { id: "shopping", title: "Shopping & Groceries" },
//         { id: "clothing", title: "Clothing & Apparel" },
//         { id: "home", title: "Home Goods & Decor" },
//         { id: "electronics", title: "Electronics & Appliances" },
//         { id: "beauty", title: "Beauty & Personal Care" },
//       ],
//       location: [
//         { id: "1", title: "King\u2019s Cross, London" },
//         { id: "2", title: "Oxford Street, London" },
//         { id: "3", title: "Covent Garden, London" },
//         { id: "4", title: "Piccadilly Circus, London" },
//       ],
//       is_location_enabled: true,
//       date: [
//         { id: "2024-01-01", title: "Mon Jan 01 2024" },
//         { id: "2024-01-02", title: "Tue Jan 02 2024" },
//         { id: "2024-01-03", title: "Wed Jan 03 2024" },
//       ],
//       is_date_enabled: true,
//       time: [
//         { id: "10:30", title: "10:30" },
//         { id: "11:00", title: "11:00", enabled: false },
//         { id: "11:30", title: "11:30" },
//         { id: "12:00", title: "12:00", enabled: false },
//         { id: "12:30", title: "12:30" },
//       ],
//       is_time_enabled: true,
//     },
//   },
//   DETAILS: {
//     version: "3.0",
//     screen: "DETAILS",
//     data: {
//       department: "beauty",
//       location: "1",
//       date: "2024-01-01",
//       time: "11:30",
//     },
//   },
//   SUMMARY: {
//     version: "3.0",
//     screen: "SUMMARY",
//     data: {
//       appointment: "Beauty & Personal Care Department at Kings Cross, London\nMon Jan 01 2024 at 11:30.",
//       details: "Name: John Doe\nEmail: john@example.com\nPhone: 123456789\n\nA free skin care consultation, please",
//       department: "beauty",
//       location: "1",
//       date: "2024-01-01",
//       time: "11:30",
//       name: "John Doe",
//       email: "john@example.com",
//       phone: "123456789",
//       more_details: "A free skin care consultation, please",
//     },
//   },
//   SCREEN_TWO: {
//     version: "3.0",
//     screen: "SCREEN_TWO",
//     data: {
//       title: "Mkonnect",
//       name: "Michael Mamman",
//       state: "Jos",
//       meterNumber: "23232323232323",
//       amount: "2000",
//       address: "address",
//     },
//   },
//   ERROR: {
//     version: "3.0",
//     screen: "ERROR",
//     data: {
//       title: "ERROR",
//     },
//   },
//   TERMS: {
//     version: "3.0",
//     screen: "TERMS",
//     data: {},
//   },
//   SUCCESS: {
//     version: "3.0",
//     screen: "SUCCESS",
//     data: {
//       extension_message_response: {
//         params: {
//           flow_token: "REPLACE_FLOW_TOKEN",
//           some_param_name: "PASS_CUSTOM_VALUE",
//         },
//       },
//     },
//   },
// };

// export const getNextScreen = async (decryptedBody) => {
//   const { screen, data, version, action, flow_token } = decryptedBody;

//   // handle health check request
//   if (action === "ping") {
//     return {
//       version,
//       data: {
//         status: "active",
//       },
//     };
//   }

//   // handle error notification
//   if (data?.error) {
//     console.warn("Received client error:", data);
//     return {
//       version,
//       data: {
//         acknowledged: true,
//       },
//     };
//   }

//   // handle initial request when opening the flow and display APPOINTMENT screen
//   if (action === "INIT") {
//     return {
//       ...SCREEN_RESPONSES.APPOINTMENT,
//       data: {
//         ...SCREEN_RESPONSES.APPOINTMENT.data,
//         // these fields are disabled initially. Each field is enabled when previous fields are selected
//         is_location_enabled: false,
//         is_date_enabled: false,
//         is_time_enabled: false,
//       },
//     };
//   }

// if (action === 'data_exchange') {
//   switch (screen) {
//     case 'QUESTION_ONE':
//       let state = `State: ${data.company}`;
//       let meterNumber = `Meter Number: ${data.meter_number}`;
//       let amount = `Amount: ₦${data.amount}`;

//       try {

//         const result = await fetchMeterValidation(
//           data.meter_number,
//           data.company
//         );

//         await getPlans("MTN", 7)

//         const results = {
//           data: {

//           invalid: false,

//           name: 'INVALID METER NUMBER',

//           address: 'INVALID METER NUMBER'

//         }

//       }
//         console.log('===========ROOT=============');
//         console.log(result);
//         console.log('========================');

//         //   if (!results){
//         //   throw new Error(`HTTP error! status: ${JSON.stringify(results)}`);
//         // }
//         // const result = [{"name":"LONGWA","address":"(STATE LOWCOST)"}]

//         if (!result) {
//           const { name, address } = result;
//           let title =
//             'Your meter details have been validated. Please confirm the details and proceed.';
//         console.log('===========Fail=============');
//         console.log(result);
//         console.log('========================');
//           if (result.status === false) {
//             title =
//               'An error occurred while validating your meter details. Please check your meter information and try again. __FromSever';
//             return {
//               ...SCREEN_RESPONSES.ERROR,
//               version: '3.0',
//               screen: 'ERROR',
//               data: {
//                 title: title,
//                 error_message: 'SOMETHING WENT WRONG'
//               }
//             };
//           } else {
//        console.log('===========Success=============');
//        console.log(result);
//        console.log('========================');
//             return {
//               ...SCREEN_RESPONSES.SCREEN_TWO,
//               data: {
//                 title: title,
//                 name: name,
//                 state: state,
//                 address: address,
//                 meterNumber: meterNumber,
//                 amount: amount
//               }
//             };
//           }
//         } else {
//           return {
//             ...SCREEN_RESPONSES.ERROR,
//             data: {
//               title:
//                 'An error occurred while validating your meter details. Please check your meter information and try again. _No Result',
//               error_message: 'error'
//             }
//           };
//         }
//       } catch (error) {
//         console.log('Error during meter validation fetch:', error.stack);
//         return {
//           ...SCREEN_RESPONSES.ERROR,
//           data: {
//             title: 'An error occurred during meter validation fetch. _trycatchFailed',
//             error_message: error.message
//           }
//         };
//       }

//       case "APPOINTMENT":
//         return {
//           ...SCREEN_RESPONSES.APPOINTMENT,
//           data: {
//             ...SCREEN_RESPONSES.APPOINTMENT.data,
//             is_location_enabled: Boolean(data.department),
//             is_date_enabled: Boolean(data.department) && Boolean(data.location),
//             is_time_enabled: Boolean(data.department) && Boolean(data.location) && Boolean(data.date),
//             location: SCREEN_RESPONSES.APPOINTMENT.data.location.slice(0, 3),
//             date: SCREEN_RESPONSES.APPOINTMENT.data.date.slice(0, 3),
//             time: SCREEN_RESPONSES.APPOINTMENT.data.time.slice(0, 3),
//           },
//         };

//       case "DETAILS":
//         const departmentName = SCREEN_RESPONSES.APPOINTMENT.data.department.find(dept => dept.id === data.department).title;
//         const locationName = SCREEN_RESPONSES.APPOINTMENT.data.location.find(loc => loc.id === data.location).title;
//         const dateName = SCREEN_RESPONSES.APPOINTMENT.data.date.find(date => date.id === data.date).title;

//         const appointment = `${departmentName} at ${locationName}\n${dateName} at ${data.time}`;
//         const details = `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\n"${data.more_details}"`;

//         return {
//           ...SCREEN_RESPONSES.SUMMARY,
//           data: {
//             appointment,
//             details,
//             ...data,
//           },
//         };

//       case "SUMMARY":
//         return {
//           ...SCREEN_RESPONSES.SUCCESS,
//           data: {
//             extension_message_response: {
//               params: {
//                 flow_token,
//               },
//             },
//           },
//         };

//       default:
//         break;
//     }
//   }

//   console.error("Unhandled request body:", decryptedBody);
//   throw new Error("Unhandled endpoint request. Make sure you handle the request action & screen logged above.");
// };

// import axios from "axios";
// export const fetchMeterValidation = async (
//   meterNumber,
//   discoName
// ) => {
//   let url = "https://www.usufdataservice.com/api/validatemeter";
//   console.log("dfffffffffff", meterNumber, discoName)
//   const params = {
//     meternumber: meterNumber,
//     disconame: discoName,
//     mtype: "PREPAID",
//   };
//   let config = {
//     method: 'get',
//     maxBodyLength: Infinity,
//     url: `https://mkonnect.com.ng/test?meterNumber=${meterNumber}&discoName=${discoName}`,
//     headers: { }
//   };

//   try {
//     const response = await axios(config);
//     // console.log(JSON.stringify(response.data));
//     if(response != false){
//       return
//     }

//     return { status: true, data: response.data[0] };

//   } catch (error) {
//    console.log(`Error fetching meter validation:${error.stack}`);
//     return { status: false };
//   }
// };
// // this object is generated from Flow Builder under "..." > Endpoint > Snippets > Responses
// const SCREEN_RESPONSES = {
//   APPOINTMENT: {
//     version: "3.0",
//     screen: "APPOINTMENT",
//     data: {
//       department: [
//         { id: "shopping", title: "Shopping & Groceries" },
//         { id: "clothing", title: "Clothing & Apparel" },
//         { id: "home", title: "Home Goods & Decor" },
//         { id: "electronics", title: "Electronics & Appliances" },
//         { id: "beauty", title: "Beauty & Personal Care" },
//       ],
//       location: [
//         { id: "1", title: "King\u2019s Cross, London" },
//         { id: "2", title: "Oxford Street, London" },
//         { id: "3", title: "Covent Garden, London" },
//         { id: "4", title: "Piccadilly Circus, London" },
//       ],
//       is_location_enabled: true,
//       date: [
//         { id: "2024-01-01", title: "Mon Jan 01 2024" },
//         { id: "2024-01-02", title: "Tue Jan 02 2024" },
//         { id: "2024-01-03", title: "Wed Jan 03 2024" },
//       ],
//       is_date_enabled: true,
//       time: [
//         { id: "10:30", title: "10:30" },
//         { id: "11:00", title: "11:00", enabled: false },
//         { id: "11:30", title: "11:30" },
//         { id: "12:00", title: "12:00", enabled: false },
//         { id: "12:30", title: "12:30" },
//       ],
//       is_time_enabled: true,
//     },
//   },
//   DETAILS: {
//     version: "3.0",
//     screen: "DETAILS",
//     data: {
//       department: "beauty",
//       location: "1",
//       date: "2024-01-01",
//       time: "11:30",
//     },
//   },
//   SUMMARY: {
//     version: "3.0",
//     screen: "SUMMARY",
//     data: {
//       appointment: "Beauty & Personal Care Department at Kings Cross, London\nMon Jan 01 2024 at 11:30.",
//       details: "Name: John Doe\nEmail: john@example.com\nPhone: 123456789\n\nA free skin care consultation, please",
//       department: "beauty",
//       location: "1",
//       date: "2024-01-01",
//       time: "11:30",
//       name: "John Doe",
//       email: "john@example.com",
//       phone: "123456789",
//       more_details: "A free skin care consultation, please",
//     },
//   },
//   SCREEN_TWO: {
//     version: "3.0",
//     screen: "SCREEN_TWO",
//     data: {
//       title: "Mkonnect",
//       name: "Michael Mamman",
//       state: "Jos",
//       meterNumber: "23232323232323",
//       amount: "2000",
//       address: "address",
//     },
//   },
//   ERROR: {
//     version: "3.0",
//     screen: "ERROR",
//     data: {
//       title: "ERROR",
//     },
//   },
//   TERMS: {
//     version: "3.0",
//     screen: "TERMS",
//     data: {},
//   },
//   SUCCESS: {
//     version: "3.0",
//     screen: "SUCCESS",
//     data: {
//       extension_message_response: {
//         params: {
//           flow_token: "REPLACE_FLOW_TOKEN",
//           some_param_name: "PASS_CUSTOM_VALUE",
//         },
//       },
//     },
//   },
// };

// export const getNextScreen = async (decryptedBody) => {
//   const { screen, data, version, action, flow_token } = decryptedBody;
//   // handle health check request
//   if (action === "ping") {
//     return {
//       version,
//       data: {
//         status: "active",
//       },
//     };
//   }

//   // handle error notification
//   if (data?.error) {
//     console.warn("Received client error:", data);
//     return {
//       version,
//       data: {
//         acknowledged: true,
//       },
//     };
//   }

//   // handle initial request when opening the flow and display APPOINTMENT screen
//   if (action === "INIT") {
//     return {
//       ...SCREEN_RESPONSES.APPOINTMENT,
//       data: {
//         ...SCREEN_RESPONSES.APPOINTMENT.data,
//         // these fields are disabled initially. Each field is enabled when previous fields are selected
//         is_location_enabled: false,
//         is_date_enabled: false,
//         is_time_enabled: false,
//       },
//     };
//   }

// if (action === "data_exchange") {
//   // handle the request based on the current screen
//   switch (screen) {
//     case "QUESTION_ONE":
//       let state = `State: ${data.company.split('_').slice(1).join(' ')}`;
//       let meterNumber = `Meter Number: ${data.meter_number}`;
//       let amount = `Amount: ₦${data.amount}`;

//       // Fetch meter details
//       let meterDetails = await fetchMeterValidation(data.meter_number, data.company);

//       console.log(JSON.stringify(meterDetails));
//       // console.log(JSON.stringify(meterDetails?.error));
//       // console.log(`${meterDetails} + ${meterDetails.data.invalid}`);

//       let title;

//       if (meterDetails == null) {

//         title = "An error occurred while validating your meter details. Please check your meter information and try again.";
//         return {
//           ...SCREEN_RESPONSES.SCREEN_TWO,
//           version: "3.0",
//           screen: "ERROR",
//           data: {
//             title: "An error occurred while validating your meter details. Please check your meter information and try again.",
//             error_message: "error",
//           },
//         };

//       } else if(meterDetails.data.invalid === false) {
//         title = "Your meter details have been validated. Please confirm the details and proceed.";
//         let name = `Name: ${meterDetails.data.name}`;
//         let address = `Address: ${meterDetails.data.address.trim()}`;
//         return {
//           ...SCREEN_RESPONSES.SCREEN_TWO,
//           data: {
//             "title": title,
//             "name": name,
//             "state": state,
//             "address": address,
//             "meterNumber": meterNumber,
//             "amount": amount
//           }
//         };
//       }
//     // Add other cases if needed

//       // handles when user interacts with APPOINTMENT screen
//       case "APPOINTMENT":
//         // update the appointment fields based on current user selection
//         return {
//           ...SCREEN_RESPONSES.APPOINTMENT,
//           data: {
//             // copy initial screen data then override specific fields
//             ...SCREEN_RESPONSES.APPOINTMENT.data,
//             // each field is enabled only when previous fields are selected
//             is_location_enabled: Boolean(data.department),
//             is_date_enabled: Boolean(data.department) && Boolean(data.location),
//             is_time_enabled:
//               Boolean(data.department) &&
//               Boolean(data.location) &&
//               Boolean(data.date),

//             //TODO: filter each field options based on current selection, here we filter randomly instead
//             location: SCREEN_RESPONSES.APPOINTMENT.data.location.slice(0, 3),
//             date: SCREEN_RESPONSES.APPOINTMENT.data.date.slice(0, 3),
//             time: SCREEN_RESPONSES.APPOINTMENT.data.time.slice(0, 3),
//           },
//         };

//       // handles when user completes DETAILS screen
//       case "DETAILS":
//         // the client payload contains selected ids from dropdown lists, we need to map them to names to display to user
//         const departmentName =
//           SCREEN_RESPONSES.APPOINTMENT.data.department.find(
//             (dept) => dept.id === data.department
//           ).title;
//         const locationName = SCREEN_RESPONSES.APPOINTMENT.data.location.find(
//           (loc) => loc.id === data.location
//         ).title;
//         const dateName = SCREEN_RESPONSES.APPOINTMENT.data.date.find(
//           (date) => date.id === data.date
//         ).title;

//         const appointment = `${departmentName} at ${locationName}
// ${dateName} at ${data.time}`;

//         const details = `Name: ${data.name}
// Email: ${data.email}
// Phone: ${data.phone}
// "${data.more_details}"`;

//         return {
//           ...SCREEN_RESPONSES.SUMMARY,
//           data: {
//             appointment,
//             details,
//             // return the same fields sent from client back to submit in the next step
//             ...data,
//           },
//         };

//       // handles when user completes SUMMARY screen
//       case "SUMMARY":
//         // TODO: save appointment to your database
//         // send success response to complete and close the flow
//         return {
//           ...SCREEN_RESPONSES.SUCCESS,
//           data: {
//             extension_message_response: {
//               params: {
//                 flow_token,
//               },
//             },
//           },
//         };

//       default:
//         break;
//     }
//   }

//   console.error("Unhandled request body:", decryptedBody);
//   throw new Error(
//     "Unhandled endpoint request. Make sure you handle the request action & screen logged above."
//   );
// };

// // Function to fetch meter validation using fetch
// import fetch from 'node-fetch';

// export const fetchMeterValidation = async (meterNumber, discoName) => {
//   console.log("Fetching meter validation for:", { meterNumber, discoName });

//   const url = `https://mkonnect.com.ng/test?meterNumber=${meterNumber}&discoName=${discoName}`;

//   try {
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${JSON.stringify(response)}`);
//     }

//     const data = await response.json();
//     console.log(JSON.stringify(data));
//     return data;
//   } catch (error) {
//     console.error(error);
//     throw new Error(`Error fetching meter validation: ${JSON.stringify(error.message)}`);
//   }
// };

// const SCREEN_RESPONSES = {
//   APPOINTMENT: {
//     version: "3.0",
//     screen: "APPOINTMENT",
//     data: {
//       department: [
//         { id: "shopping", title: "Shopping & Groceries" },
//         { id: "clothing", title: "Clothing & Apparel" },
//         { id: "home", title: "Home Goods & Decor" },
//         { id: "electronics", title: "Electronics & Appliances" },
//         { id: "beauty", title: "Beauty & Personal Care" },
//       ],
//       location: [
//         { id: "1", title: "King\u2019s Cross, London" },
//         { id: "2", title: "Oxford Street, London" },
//         { id: "3", title: "Covent Garden, London" },
//         { id: "4", title: "Piccadilly Circus, London" },
//       ],
//       is_location_enabled: true,
//       date: [
//         { id: "2024-01-01", title: "Mon Jan 01 2024" },
//         { id: "2024-01-02", title: "Tue Jan 02 2024" },
//         { id: "2024-01-03", title: "Wed Jan 03 2024" },
//       ],
//       is_date_enabled: true,
//       time: [
//         { id: "10:30", title: "10:30" },
//         { id: "11:00", title: "11:00", enabled: false },
//         { id: "11:30", title: "11:30" },
//         { id: "12:00", title: "12:00", enabled: false },
//         { id: "12:30", title: "12:30" },
//       ],
//       is_time_enabled: true,
//     },
//   },
//   DETAILS: {
//     version: "3.0",
//     screen: "DETAILS",
//     data: {
//       department: "beauty",
//       location: "1",
//       date: "2024-01-01",
//       time: "11:30",
//     },
//   },
//   SUMMARY: {
//     version: "3.0",
//     screen: "SUMMARY",
//     data: {
//       appointment: "Beauty & Personal Care Department at Kings Cross, London\nMon Jan 01 2024 at 11:30.",
//       details: "Name: John Doe\nEmail: john@example.com\nPhone: 123456789\n\nA free skin care consultation, please",
//       department: "beauty",
//       location: "1",
//       date: "2024-01-01",
//       time: "11:30",
//       name: "John Doe",
//       email: "john@example.com",
//       phone: "123456789",
//       more_details: "A free skin care consultation, please",
//     },
//   },
//   SCREEN_TWO: {
//     version: "3.0",
//     screen: "SCREEN_TWO",
//     data: {
//       title: "Mkonnect",
//       name: "Michael Mamman",
//       state: "Jos",
//       meterNumber: "23232323232323",
//       amount: "2000",
//       address: "address",
//     },
//   },
//   ERROR: {
//     version: "3.0",
//     screen: "ERROR",
//     data: {
//       title: "ERROR",
//     },
//   },
//   TERMS: {
//     version: "3.0",
//     screen: "TERMS",
//     data: {},
//   },
//   SUCCESS: {
//     version: "3.0",
//     screen: "SUCCESS",
//     data: {
//       extension_message_response: {
//         params: {
//           flow_token: "REPLACE_FLOW_TOKEN",
//           some_param_name: "PASS_CUSTOM_VALUE",
//         },
//       },
//     },
//   },
// };

// export const getNextScreen = async (decryptedBody) => {
//   const { screen, data, version, action, flow_token } = decryptedBody;

//   // handle health check request
//   if (action === "ping") {
//     return {
//       version,
//       data: {
//         status: "active",
//       },
//     };
//   }

//   // handle error notification
//   if (data?.error) {
//     console.warn("Received client error:", data);
//     return {
//       version,
//       data: {
//         acknowledged: true,
//       },
//     };
//   }

//   // handle initial request when opening the flow and display APPOINTMENT screen
//   if (action === "INIT") {
//     return {
//       ...SCREEN_RESPONSES.APPOINTMENT,
//       data: {
//         ...SCREEN_RESPONSES.APPOINTMENT.data,
//         // these fields are disabled initially. Each field is enabled when previous fields are selected
//         is_location_enabled: false,
//         is_date_enabled: false,
//         is_time_enabled: false,
//       },
//     };
//   }

//   if (action === "data_exchange") {
//     switch (screen) {
//       case "QUESTION_ONE":
//         let state = `State: ${data.company}`;
//         let meterNumber = `Meter Number: ${data.meter_number}`;
//         let amount = `Amount: ₦${data.amount}`;

//         try {
//           const results = await fetchMeterValidation(data.meter_number, data.company);
//             //   if (!results){
//             //   throw new Error(`HTTP error! status: ${JSON.stringify(results)}`);
//             // }
//           const result = [{"name":"LONGWA","address":"(STATE LOWCOST)"}]
//           console.log(!result)
//           if (result) {
//             const { name, address } = result;
//             let title = "Your meter details have been validated. Please confirm the details and proceed.";

//             if (result) {
//               title = "An error occurred while validating your meter details. Please check your meter information and try again.";
//               return {
//                 ...SCREEN_RESPONSES.SCREEN_TWO,
//                 version: "3.0",
//                 screen: "ERROR",
//                 data: {
//                   title: title,
//                   error_message: "SOMETHING WENT WRONG",
//                 },
//               };
//             } else {
//               return {
//                 ...SCREEN_RESPONSES.SCREEN_TWO,
//                 data: {
//                   title: title,
//                   name: result[0].name,
//                   state: state,
//                   address: result[0].address,
//                   meterNumber: meterNumber,
//                   amount: amount,
//                 },
//               };
//             }
//           } else {
//             return {
//               ...SCREEN_RESPONSES.ERROR,
//               data: {
//                 title: "An error occurred while validating your meter details. Please check your meter information and try again.",
//                 error_message: "error",
//               },
//             };
//           }
//         } catch (error) {
//           console.log("Error during meter validation fetch:", error.stack);
//           return {
//             ...SCREEN_RESPONSES.ERROR,
//             data: {
//               title: "An error occurred during meter validation fetch.",
//               error_message: error.message,
//             },
//           };
//         }

//       // Add other cases if needed

//       case "APPOINTMENT":
//         return {
//           ...SCREEN_RESPONSES.APPOINTMENT,
//           data: {
//             ...SCREEN_RESPONSES.APPOINTMENT.data,
//             is_location_enabled: Boolean(data.department),
//             is_date_enabled: Boolean(data.department) && Boolean(data.location),
//             is_time_enabled: Boolean(data.department) && Boolean(data.location) && Boolean(data.date),
//             location: SCREEN_RESPONSES.APPOINTMENT.data.location.slice(0, 3),
//             date: SCREEN_RESPONSES.APPOINTMENT.data.date.slice(0, 3),
//             time: SCREEN_RESPONSES.APPOINTMENT.data.time.slice(0, 3),
//           },
//         };

//       case "DETAILS":
//         const departmentName = SCREEN_RESPONSES.APPOINTMENT.data.department.find(dept => dept.id === data.department).title;
//         const locationName = SCREEN_RESPONSES.APPOINTMENT.data.location.find(loc => loc.id === data.location).title;
//         const dateName = SCREEN_RESPONSES.APPOINTMENT.data.date.find(date => date.id === data.date).title;

//         const appointment = `${departmentName} at ${locationName}\n${dateName} at ${data.time}`;
//         const details = `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\n"${data.more_details}"`;

//         return {
//           ...SCREEN_RESPONSES.SUMMARY,
//           data: {
//             appointment,
//             details,
//             ...data,
//           },
//         };

//       case "SUMMARY":
//         return {
//           ...SCREEN_RESPONSES.SUCCESS,
//           data: {
//             extension_message_response: {
//               params: {
//                 flow_token,
//               },
//             },
//           },
//         };

//       default:
//         break;
//     }
//   }

//   console.error("Unhandled request body:", decryptedBody);
//   throw new Error("Unhandled endpoint request. Make sure you handle the request action & screen logged above.");
// };

// {

//     status: 200,

//     headers: Object [AxiosHeaders] {

//       date: 'Fri, 19 Jul 2024 20:48:04 GMT',

//       server: 'Apache',

//       vary: 'Accept,Cookie',

//       'referrer-policy': 'same-origin',

//       'x-frame-options': 'DENY',

//       'x-content-type-options': 'nosniff',

//       allow: 'GET, HEAD, OPTIONS',

//       'x-powered-by': 'Phusion Passenger(R) 6.0.18',

//       'content-length': '100',

//       status: '200 OK',

//       connection: 'close',

//       'content-type': 'application/json'

//     },

//     data: {

//       invalid: false,

//       name: 'ENGR IBRAHIMGOJE  ',

//       address: 'NO 77A AGUIYI IRONSI WAY Und St. Maitama 3'

//     }

//   }

//   {

//     status: 200,

//     headers: Object [AxiosHeaders] {

//       date: 'Fri, 19 Jul 2024 20:46:37 GMT',

//       server: 'Apache',

//       vary: 'Accept,Cookie',

//       'referrer-policy': 'same-origin',

//       'x-frame-options': 'DENY',

//       'x-content-type-options': 'nosniff',

//       allow: 'GET, HEAD, OPTIONS',

//       'x-powered-by': 'Phusion Passenger(R) 6.0.18',

//       'content-length': '79',

//       status: '200 OK',

//       connection: 'close',

//       'content-type': 'application/json'

//     },

//     data: {

//       invalid: true,

//       name: 'INVALID METER NUMBER',

//       address: 'INVALID METER NUMBER'

//     }

//   }

// let facts = await getFacts();
// facts = facts[0].fact.toLowerCase()

// console.log(facts)


// const mailchimp = require("@mailchimp/mailchimp_marketing");

// import mailchimp from "@mailchimp/mailchimp_marketing";
// mailchimp.setConfig({
//   apiKey: "77a98474fdc5ca8aa9e5e88a0b7b6224-us8",
//   server: "us8",
// });

// async function run() {
//   const response = await mailchimp.ping.get();
//   console.log(response);
// }

// run();



// const event = {
//   name: "JS Developers Meetup"
// };

// const footerContactInfo = {
//   company: "Mailchimp",
//   address1: "405 N Angier Ave NE",
//   city: "Atlanta",
//   state: "GA",
//   zip: "30308",
//   country: "US"
// };

// const campaignDefaults = {
//   from_name: "Gettin' Together",
//   from_email: "gettintogether@example.com",
//   subject: "JS Developers Meetup",
//   language: "EN_US"
// };

// async function run() {
//   const response = await mailchimp.lists.createList({
//     name: event.name,
//     contact: footerContactInfo,
//     permission_reminder: "permission_reminder",
//     email_type_option: true,
//     campaign_defaults: campaignDefaults
//   });

//   console.log(
//     `Successfully created an audience. The audience id is ${response.id}.`
//   );
// }

// run();

// const listId = "f2fa4a851d";
// const subscribingUser = {
//   firstName: "Michael",
//   lastName: "Konnect",
//   email: "mkonnectng@gmail.com"
// };

// async function run() {
//   const response = await mailchimp.lists.addListMember(listId, {
//     email_address: subscribingUser.email,
//     status: "subscribed",
//     merge_fields: {
//       FNAME: subscribingUser.firstName,
//       LNAME: subscribingUser.lastName
//     }
//   });

//   console.log(
//     `Successfully added contact as an audience member. The contact's id is ${
//       response.id
//     }.`
//   );
// }

// run();