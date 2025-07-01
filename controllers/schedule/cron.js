import { scheduleJob, scheduledJobs } from "node-schedule";
import { fetchData, fetchDataSecondVendor, getTotalDeposits } from "../../admin/options.js";
import { fetchBillPayment, generateReceipt, getUsersCSV, sendDocMessage, sendFlowMessageEndpoint, sendMessage, sendTokenReceipt, sendUsersCSVEmail, sendVendorBalanceEmail } from "../utils/utils.js";
import dotenv from 'dotenv';
import AdminUser from "../../models/admin.js";
import logger from "../logs.js";
import status from "../../models/status.js";
import pendingPowerTransactions from "../../models/pendingPowerTransaction.js";
import powerTransactions from "../../models/powerTransactions.js";
import User from "../../models/users.js";
import { getDailyTransactions } from "../paystack.js";
import Report from "../../models/report.js";
dotenv.config();
const phone_number_id = process.env.PHONE_NUMBER_ID;

// Define a variable to hold the reference to the scheduled job
let cronJobRef;
let cronJobUsersCSV;
let electricityBillQuery;
let cronReport;

export const startCronJob = () => {
    // Schedule the job and store its reference
    cronJobRef = scheduleJob("0 */6 * * *", async () => {
        console.log("Run every 10 minutes");
        const vendorBalance = await fetchData();
        const vendorTwo = await fetchDataSecondVendor();
        const deposite = await getTotalDeposits();
        const adminNumbers = await AdminUser.find({});
        const message = `Vendor Balance One: ₦${vendorBalance} \nVendor Balance Two: ₦${vendorTwo} \nTotal Deposits: ₦${deposite} \n\nYou for like top up boss, before them carry us go cell. 😂😂😂💰`;
        const subject = "Problem dey oh, Check Vendor Balance before them lock us up. 😂😂😂💰";
        if (deposite > vendorBalance) {
          adminNumbers.forEach(async (adminNumber) => {
              await sendVendorBalanceEmail(  adminNumber.email, subject, message)
                // await sendMessage(adminNumber.number, message, phone_number_id);
            });
        }
    });


    cronJobUsersCSV = scheduleJob("0 0 * * *", async () => {
      await getUsersCSV();
      await sendUsersCSVEmail();
  });

  electricityBillQuery = scheduleJob("*/3 * * * *", async () => {
    try {
      let transactions = await pendingPowerTransactions.find({ status: "pending" });
  
      if (transactions.length > 0) {
        for (const transaction of transactions) {
          try {
            const bill = await fetchBillPayment(transaction.id);
  
            if (bill.status == true && bill.data.token) {

              let message = `Your transaction has been processed and your electricity token for meter number ${transaction.meter_number} is ${bill.data.token}.\n\nThank you for using Mkonnect.`;
  
              await sendMessage(transaction.senderNumber, message, phone_number_id);
  
              await pendingPowerTransactions.findOneAndUpdate({id: transaction.id, status: "pending"}, { status: "completed" });

               const url = await generateReceipt(
                  bill.data.customer_name,
                  bill.data.customer_address,
                  bill.data.meter_number, 
                  new Date().toLocaleString(),
                  'ELECTRICITY',
                  bill.data.package,
                  150,
                  bill.data.amount,
                  parseFloat(bill.data.amount) + 150,
                  bill.data.token
                );

                await sendDocMessage(url, "Recipt 📄", phone_number_id, transaction.senderNumber)

                await sendFlowMessageEndpoint(
                  transaction.senderNumber,
                  `menu_flow_${transaction.senderNumber}`,
                  "1051816780241701",
                  phone_number_id,
                  `‎\nTry out our other services 😉 \n‎`,
                  "Menu",
                  "MENU"
                )

                await powerTransactions.create({
                  senderNumber: transaction.senderNumber,
                  package: bill.data.package,
                  meter_number: bill.data.meter_number,
                  token: bill.data.token,
                  amount: bill.data.amount,
                  customer_name: bill.data.customer_name,
                  customer_address: bill.data.customer_address,
                  profit: 150,
                  id: bill.data.id,
                });

                let customerAmount = parseFloat(bill.data.amount) + 150;

                const user = await User.findOne({ phoneNumber: transaction.senderNumber });

                await sendTokenReceipt(
                  user.email,
                  "Up NEPA 🎉",
                  user.fullName,
                  user.phoneNumber,
                  bill.data.token,
                  bill.data.customer_name,
                  bill.data.customer_address,
                  customerAmount
                );

            }
          } catch (err) {
            console.log(err.stack)
            logger.error(`Error processing transaction ${transaction.id}:`, err.message);
          }
        }
      }
    } catch (err) {
      logger.error("Error fetching pending transactions:", err.message);
    }
  });
  


  cronJobRef = scheduleJob("0 0 * * *", async () => {
    // cronReport = scheduleJob("* * * * *", async () => {

      const vendorOne = await fetchData();
      const vendorTwo = await fetchDataSecondVendor();
      const totalDeposits = await  getTotalDeposits();
      const dailyTransactions = await getDailyTransactions();

      // console.log(vendorOne);
      // console.log(vendorTwo);
      // console.log(totalDeposits);
      // console.log(dailyTransactions);

      await Report.create({
        vendorOne: vendorOne,
        vendorTwo: vendorTwo,
        totalDeposits: totalDeposits,
        dailyTransactions: dailyTransactions,
        totalVendorBalance: Number( vendorOne) + Number(vendorTwo),
        bankBalance: 0
      });

  })

  
};

export const stopCronJob = () => {
    // Check if the cron job is currently running
    if (cronJobRef) {
        // Cancel the job if it's running
        cronJobRef.cancel();
    }

    if (cronJobUsersCSV) {
      // Cancel the job if it's running
      cronJobRef.cancel();
  }
};


export const startScheduler = () => {
    // Schedule the job to run every minute
    scheduleJob('*/1 * * * *', async () => {
      let sys_status = await status.find();
  
      if (sys_status.length > 0) {
        sys_status = sys_status[0].status;
      } else {
        sys_status = await status.create({});
        sys_status = sys_status.status;
      }
  
      // Check the system status and start or stop the cron job accordingly
      if (sys_status) {
        startCronJob();
      } else {
        stopCronJob();
      }
    });
  };