import axios from 'axios';
import { componentLoader, Components } from './component-loader.js';
import User from '../models/users.js';
import Conversation from '../models/chatbot.js';
import transaction from '../models/transactions.js';
import DataPlan from '../models/data.js';
import deposite from '../models/deposits.js';
import plan_select from '../models/plan.js';
import { dark, light, noSidebar } from '@adminjs/themes';
import logger from '../controllers/logs.js';
import error_logs from '../models/errorLogs.js';
import info_logs from '../models/infoLogs.js';
import dotenv from 'dotenv';
import status from '../models/status.js';
import media from '../models/media.js';
import uploadFeature from './build/index.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import opt_status from '../models/optIn.js';
import airtime from '../models/airtime.js';
import Job from '../models/job.js';
import powerTransactions from '../models/powerTransactions.js';
import { getGenratedRevenue, getSuccessfulTransactions } from '../controllers/paystack.js';
import FlowDataPlan from '../models/flowDataplans.js';
import FlowDataPlanUsuf from '../models/flowDataplansUsuf.js';
import failedTransaction from '../models/failedDataTransactions.js';
import WelcomeBonus from '../models/welcomeBonus.js';
import pendingPowerTransactions from '../models/pendingPowerTransaction.js';
import Report from '../models/report.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

let token;
let endpoint;
const KARL_DATA_TOKEN = process.env.KARL_DATA_TOKEN;
const USUF_DATA_TOKEN = process.env.USUF_DATA_TOKEN;
const KARLDATA_ENDPOINT = 'https://karldata.com/api/user/'
const USUFDATA_ENDPOINT = "https://www.usufdataservice.com/api/user/"
const VENDORS = {
    KARL_DATA: "karldata",
    USUF_DATA: "usufdata",
  };

export async function getCredentials(vendorStatus) {

const vendorName = vendorStatus[0]?.vendor;

if (vendorName === VENDORS.KARL_DATA) {
    token = KARL_DATA_TOKEN;
    endpoint = KARLDATA_ENDPOINT;

} else if (vendorName === VENDORS.USUF_DATA) {
    token = USUF_DATA_TOKEN;
    endpoint = USUFDATA_ENDPOINT;
} else {
    logger.error(`Vendor error ${error.stack}`);
    throw new Error("Unknown vendor");
  }

  return { token, endpoint };
}

export async function getCredentialsSecondVendor(vendorStatus) {

    const vendorName = vendorStatus[0]?.vendor;
    
    if (vendorName === VENDORS.KARL_DATA) {
        token = USUF_DATA_TOKEN;
        endpoint = USUFDATA_ENDPOINT;
        
    } else if (vendorName === VENDORS.USUF_DATA) {
        token = KARL_DATA_TOKEN;
        endpoint = KARLDATA_ENDPOINT;
    } else {
        logger.error(`Vendor error ${error.stack}`);
        throw new Error("Unknown vendor");
      }
    
      return { token, endpoint };
    }

const UserResource = {
    resource: User,
    options: {
        listProperties: ['phoneNumber', 'message', 'fullName', 'email', 'accountNumber', 'accountName', 'bank', 'consent', 'createdAt', 'updatedAt'],
        filterProperties: ['fullName', 'phoneNumber','consent', 'createdAt'],
        editProperties: ['fullName', 'message', 'email', 'balance', 'transactionPin'],
        showProperties: ['phoneNumber', 'message', 'fullName', 'consent', 'email', 'accountNumber', 'accountName', 'bank', 'balance', 'balanceHistory', 'transactionPin', 'createdAt', 'updatedAt'],
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
    },
};
const TransactionResource = {
    resource: transaction,
    options: {
        listProperties: ['senderNumber', 'recipient', 'network', 'plan_name', 'plan_amount', 'profit', 'id','vendor', 'createdAt',],
        filterProperties: ['senderNumber', 'vendor', 'recipient', 'network', 'plan_name', 'createdAt'],
        showProperties: ['senderNumber', 'recipient', 'vendor', 'network', 'plan_name', 'plan_amount', 'profit', 'id', 'createdAt', 'updatedAt'],
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
    },
};

const FailedTransactionResource = {
    resource: failedTransaction,
    options: {
        listProperties: ['senderNumber', 'recipient', 'network', 'plan_name', 'plan_amount', 'createdAt', 'updatedAt'],
        filterProperties: ['senderNumber', 'recipient', 'network', 'plan_name', 'createdAt'],
        showProperties: ['senderNumber', 'recipient', 'network', 'plan_name', 'plan_amount', 'payload', 'createdAt', 'updatedAt'],
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
    },
};

const ElectricityResource = {
    resource: powerTransactions,
    options: {
        listProperties: ['senderNumber', 'package', 'meter_number', 'token', 'amount', 'profit', 'customer_name', 'customer_address', 'createdAt'],
        filterProperties: ['senderNumber', 'meter_number', 'amount', 'createdAt'],
        showProperties: ['senderNumber', 'package', 'meter_number', 'token', 'amount', 'profit', 'customer_name', 'customer_address', 'createdAt', 'updatedAt'],
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
    },
};

const PendingElectricityResource = {
    resource: pendingPowerTransactions,
    options: {
        listProperties: ['status', 'senderNumber', 'package', 'meter_number', 'token', 'amount', 'profit', 'customer_name', 'customer_address', 'createdAt'],
        filterProperties: ['status', 'senderNumber', 'meter_number', 'amount', 'createdAt'],
        showProperties: ['status', 'senderNumber', 'package', 'meter_number', 'token', 'amount', 'profit', 'customer_name', 'customer_address', 'createdAt', 'updatedAt'],
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
    },
};

const AirtimeResource = {
    resource: airtime,
    options: {
        listProperties: ['senderNumber', 'recipient', 'network', 'profit', 'plan_amount', 'id', 'createdAt', 'updatedAt'],
        filterProperties: ['senderNumber', 'recipient', 'network', 'profit', 'plan_amount', 'createdAt'],
        showProperties: ['senderNumber', 'recipient', 'network', 'profit', 'airtime_type', 'plan_amount', 'id', 'createdAt', 'updatedAt'],
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
    },
};

const karldata = {
    resource: FlowDataPlan,
    options: {
        listProperties: ['id', 'Network', 'PlanType', 'Amount', 'Size', 'Validity', 'enabled'],
        filterProperties: ['id', 'Network', 'PlanType', 'Amount', 'Size', 'enabled'],
        editProperties: ['Network', 'PlanType', 'Amount', 'Size', 'enabled'],
        showProperties: ['id', 'Network', 'PlanType', 'Amount', 'Size', 'Validity', 'enabled'],
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
    },
};
const usufdata = {
    resource: FlowDataPlanUsuf,
    options: {
        listProperties: ['id', 'Network', 'PlanType', 'Amount', 'Size', 'Validity', 'enabled'],
        filterProperties: ['id', 'Network', 'PlanType', 'Amount', 'Size', 'enabled'],
        editProperties: ['Network', 'PlanType', 'Amount', 'Size', 'enabled'],
        showProperties: ['id', 'Network', 'PlanType', 'Amount', 'Size', 'Validity', 'enabled'],
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
    },
};

const chatbotResource = {
    resource: Conversation,
    options: {
        listProperties: ['senderNumber', 'messageBody', 'responseMessage', 'createdAt'],
        filterProperties: ['senderNumber', 'messageBody', 'responseMessage', 'createdAt'],
        showProperties: ['senderNumber', 'messageBody', 'responseMessage', 'createdAt'],
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
    },
};
const DepositeResource = {
    resource: deposite,
    options: {
        listProperties: ['phoneNumber', 'email', 'amount', 'status', 'createdAt'],
        filterProperties: ['phoneNumber', 'email', 'amount', 'status', 'createdAt'],
        editProperties: ['phoneNumber', 'email', 'amount', 'status', 'createdAt'],
        showProperties: ['phoneNumber', 'email', 'amount', 'status', 'createdAt'],
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
    },
};
const PlanResource = {
    resource: plan_select,
    options: {
        listProperties: ['senderNumber', 'intent', 'network', 'plan', 'price', 'receiverNumber'],
        filterProperties: ['senderNumber', 'intent', 'network', 'plan', 'price', 'receiverNumber'],
        editProperties: ['senderNumber', 'intent', 'network', 'plan', 'price', 'receiverNumber'],
        showProperties: ['senderNumber', 'intent', 'network', 'plan', 'price', 'receiverNumber'],
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
    },
};

const ErrorResource = {
    resource: error_logs,
    options: {
        listProperties: ['timestamp', 'message'],
        filterProperties: ['timestamp', 'message', 'meta'],
        showProperties: ['timestamp', 'level', 'message', 'meta'],
        sort: {
            sortBy: 'timestamp',
            direction: 'desc',
        },
    },
};

const Status = {
    resource: status,
    options: {
        listProperties: ['status', 'WelcomeBonus', 'vendor'],
        filterProperties: ['status', 'WelcomeBonus', 'vendor'],
        editProperties: ['status', 'WelcomeBonus', 'vendor'],
        showProperties: ['status', 'WelcomeBonus', 'vendor'],
    },
};

const job = {
    resource: Job,
    options: {
        listProperties: ['jobName', 'successful', 'message', 'filter', 'messageType', 'imageUrl'],
        filterProperties: ['jobName', 'successful', 'message', 'filter', 'messageType', 'imageUrl'],
        editProperties: ['jobName', 'successful', 'message', 'filter', 'messageType', 'imageUrl'],
        showProperties: ['jobName', 'successful', 'message', 'filter', 'messageType', 'imageUrl'],
    },
};

const InfoResource = {
    resource: info_logs,
    options: {
        listProperties: ['timestamp', 'message'],
        filterProperties: ['timestamp', 'message', 'meta'],
        showProperties: ['timestamp', 'level', 'message', 'meta'],
        sort: {
            sortBy: 'timestamp',
            direction: 'desc',
        },
    },
};

const OptResource = {
    resource: opt_status,
    options: {
        listProperties: ['optin', 'senderNumber'],
        filterProperties: ['optin', 'senderNumber'],
        editProperties: ['optin', 'senderNumber'],
        showProperties: ['optin', 'senderNumber'],
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
    },
};

const ReportResource = {
    resource: Report,
    options: {
        listProperties: ['createdAt', 'vendorOne', 'vendorTwo', 'totalDeposits', 'dailyTransactions', 'totalVendorBalance', 'bankBalance', 'profits'],
        filterProperties: ['createdAt', 'vendorOne', 'vendorTwo', 'totalDeposits', 'dailyTransactions', 'totalVendorBalance', 'bankBalance', 'profits'],
        editProperties: ['createdAt', 'vendorOne', 'vendorTwo', 'totalDeposits', 'dailyTransactions', 'totalVendorBalance', 'bankBalance', 'profits'],
        showProperties: ['createdAt', 'vendorOne', 'vendorTwo', 'totalDeposits', 'dailyTransactions', 'totalVendorBalance', 'bankBalance', 'profits'],
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
    },
};

const mediaResource = {
    resource: media,
    options: {
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
    },
    features: [uploadFeature({
    componentLoader,
    provider: { local: { bucket: 'uploads', opts:"http://localhost:3000"} },
    properties: {
    key: 'fileUrl', // to this db field feature will safe S3 key
    mimeType: 'icon',// this property is important because allows to have previews
    },
    })
    ]

}

const WelcomeBonusResource = {
    resource: WelcomeBonus,
    options: {
        listProperties: ['phoneNumber', 'amount', 'receivedAt'],
        filterProperties: ['phoneNumber', 'amount', 'receivedAt'],
        editProperties: ['phoneNumber', 'amount', 'receivedAt'],
        showProperties: ['phoneNumber', 'amount', 'receivedAt'],
        sort: {
            sortBy: 'createdAt',
            direction: 'desc',
        },
    },
};

const dashboardHandler = async () => {
    try {
        const userCount = await User.countDocuments();
        const conversationCount = await Conversation.countDocuments();
        const TransactionCount = await transaction.countDocuments();
        const DataPlanCount = await DataPlan.countDocuments();
        const depositecount = await deposite.countDocuments();
        const planSelectcount = await plan_select.countDocuments();
        let vendorBalance = await fetchData();
        let vendorBalanceSecondVendor = await fetchDataSecondVendor();
        let totalData = await getTotalData();
        let totalAirtime = await getTotalAirtime();
        let totalDeposits = await getTotalDeposits();
        let dailyUsers = await getDailyUserCount();
        let WeeklyUserCount = await getWeeklyUserCount();
        let monthlyrevenu = await getMonthlyRevenu()
        let paystackRevenue = await getPaystackRevenue()
        let getMonthlyDataProfits = await getMonthlyDataProfit()
        let getMonthlyAirtimeProfits = await getMonthlyAirtimeProfit()
        let getMonthlyPowerProfits = await getMonthlyPowerProfit()
        const kpi = {
            "userCount": userCount,
            "conversationCount": conversationCount,
            "TransactionCount": TransactionCount,
            "DataPlanCount": DataPlanCount,
            "depositecount": depositecount,
            "planSelectcount": planSelectcount,
            "deposits": totalDeposits,
            "totalData": totalData,
            "totalAirtime": totalAirtime,
            "wallet_balance": vendorBalance,
            "wallet_balance_second_vendor": vendorBalanceSecondVendor,
            "dailyUsers": dailyUsers,
            "WeeklyUserCount": WeeklyUserCount,
            "revenue": paystackRevenue.revenu,
            "dataProfit": getMonthlyDataProfits,
            "airtimeProfit": getMonthlyAirtimeProfits,
            "powerProfit": getMonthlyPowerProfits,
            "getMonthlytransactionFee": paystackRevenue.tranactionFee,
            "pending_transfer": paystackRevenue.pending_transfer,
            "totalRevenue": paystackRevenue.totalRevenue
        };
        // logger.info(kpi);
        return kpi;
    }
    catch (error) {
        logger.error(`Error fetching data:${error.stack}`);
        return { message: 'Failed to fetch data', error: error.message };
    }
};

export const getTotalDeposits = async () => {
    try {
        const users = await User.find();
        let totalDeposits = 0;
        users.forEach((user) => {
            totalDeposits += Number(user.balance) || 0;
        });
        return totalDeposits;
    }
    catch (error) {
        logger.error(`Error fetching users:${error.stack}`);
        throw error;
    }
};
const getTotalData = async () => {
    try {
        const transactions = await transaction.find();
        let totalData = 0;
        transactions.forEach((tran) => {
            const sizeString = tran.plan_name;
            if (sizeString.includes('MB')) {
                const numericPart = parseFloat(sizeString.substring(0, sizeString.indexOf('MB')));
                totalData += (numericPart / 1024);
            }
            else if (sizeString.includes('GB')) {
                const numericPart = parseFloat(sizeString.substring(0, sizeString.indexOf('GB')));
                totalData += numericPart;
            }
            else {
                logger.info('Invalid size string from getTotatData');
            }
        });
        return totalData/1024;
    }
    catch (error) {
        logger.error(`Error fetching users:${error.stack}`);
        throw error;
    }
};

const getTotalAirtime = async () => {
    try {
        const transactions = await airtime.find();
        let totalAirtime = 0;
        transactions.forEach((tran) => {
            let amount = parseFloat(tran.plan_amount);
            // amount = amount.split('N')
            // amount = parseFloat(amount[1]);
            totalAirtime += amount;

        });
        return totalAirtime;
    }
    catch (error) {
        logger.error(`Error fetching users: ${error.stack}`);
        throw error;
    }
};

export async function fetchData() {
    let vendorStatus = await status.find();
    let credentials = await getCredentials(vendorStatus);

    let data = '';
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: credentials.endpoint,
        headers: {
            'Authorization': `Token ${credentials.token}`,
            'Content-Type': 'application/json'
        },
        data: data
    };
    try {
        const response = await axios.request(config);
        return response.data.user.wallet_balance;
    }
    catch (error) {
        logger.info(error);
    }
}

export async function fetchDataSecondVendor() {
    let vendorStatus = await status.find();

    let credentials = await getCredentialsSecondVendor(vendorStatus);

    let data = '';
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: credentials.endpoint,
        headers: {
            'Authorization': `Token ${credentials.token}`,
            'Content-Type': 'application/json'
        },
        data: data
    };
    try {
        const response = await axios.request(config);
        return response.data.user.wallet_balance;
    }
    catch (error) {
        logger.info(error);
    }
}

async function getDailyUserCount() {
    try {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        const userCount = await User.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
        return userCount;
    }
    catch (error) {
        logger.error(`Error fetching daily user count:${error.stack}`);
        throw error;
    }
}

async function getWeeklyUserCount() {
    try {
        const today = new Date();

        // Calculate the start of the week (assuming week starts on Sunday)
        const startOfWeek = new Date(today);
        const dayOfWeek = startOfWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.
        startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek); // Go back to Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        // Calculate the end of the week (Saturday 23:59:59.999)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Move to Saturday
        endOfWeek.setHours(23, 59, 59, 999);

        // Query the user count within the week
        const userCount = await User.countDocuments({
            createdAt: { $gte: startOfWeek, $lte: endOfWeek }
        });

        return userCount;
    } catch (error) {
        logger.error(`Error fetching weekly user count: ${error.stack}`);
        throw error;
    }
}


async function getMonthlyRevenu() {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        const TotalDeposite = await deposite.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });
        let totalDeposits = 0;
        TotalDeposite.forEach((dep) => {
            totalDeposits += Number(dep.amount) || 0;
        });
        
        return totalDeposits;
    }
    catch (error) {
        logger.error(`Error fetching monthly revenu:${error.stack}`);
        throw error;
    }
}

async function getMonthlyDataProfit() {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        const dataProfit = await transaction.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });
        let totalProfit = 0;
        dataProfit.forEach((profit) => {
            totalProfit += Number(profit.profit) || 0;
        });
        return totalProfit;
    }
    catch (error) {
        logger.error(`Error fetching monthly revenu in data:${error.stack}`);
        throw error;
    }
}

async function getMonthlyAirtimeProfit() {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        const airtimeProfit = await airtime.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });
        let totalProfit = 0;
        airtimeProfit.forEach((profit) => {
            totalProfit += Number(profit.profit) || 0;
        });
        return totalProfit;
    }
    catch (error) {
        logger.error(`Error fetching monthly revenu in airtime:${error.stack}`);
        throw error;
    }
}

async function getMonthlyPowerProfit() {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        const powerProfits = await powerTransactions.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });
        let totalProfit = 0;
        powerProfits.forEach((profit) => {
            totalProfit += Number(profit.profit) || 0;
        });
        return totalProfit;
    }
    catch (error) {
        logger.error(`Error fetching monthly revenu in power:${error.stack}`);
        throw error;
    }
}

async function getPaystackRevenue() {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        const transactionFee = await deposite.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });
        let totalProfit = 0;
        let count20 = 0
        let count10 = 0

        transactionFee.forEach((profit) => {
            if(profit.amount > 1000){
                count20 += 1
            }else{
                count10 += 1
            } 
        });
        

        const transactions = await getSuccessfulTransactions();
        const allTimeRevenue = await getGenratedRevenue();
        let tt = transactions.data.total_volume
        count20 = count20 * 20
        count10 = count10 * 10
        totalProfit = count20 + count10
        totalProfit = totalProfit - ((tt / 100) * 0.01)

        return { 
            "tranactionFee": parseInt(totalProfit),
            "revenu": tt/100,
            "pending_transfer": transactions.data.pending_transfers/100,
            "totalRevenue": allTimeRevenue.data.total_volume/100,
        }
    }
    catch (error) {
        logger.error(`Error fetching monthly revenue in paysatack:${error.stack}`);
        throw error;
    }
}


const options = {
    rootPath: '/admin',
    resources: [UserResource, TransactionResource, FailedTransactionResource, AirtimeResource, usufdata, karldata, chatbotResource, DepositeResource, PlanResource, ErrorResource, Status, InfoResource, mediaResource, OptResource, job, ElectricityResource, WelcomeBonusResource, PendingElectricityResource, ReportResource],
    defaultTheme: dark.id,
    availableThemes: [dark, light, noSidebar],
    dashboard: {
        component: Components.Dashboard,
        handler: dashboardHandler,
    },
    branding: {
        logo: false,
        companyName: "M-Konnect",
        withMadeWithLove: false,
        favicon: "https://drive.google.com/file/d/1vgaE-0SKTFvKzz2GxTeWPHqdDiEx9vZt/view?usp=sharing"
    },
    databases: [],
    componentLoader,
    pages: {
        customPage: {
          label: "Custom page",
          handler: async (request, response, context) => {
            return {
              text: 'I am fetched from the backend',
            }
          },
          component: 'Msg',
        },
        anotherPage: {
          label: "TypeScript page",
          component: 'msg',
        },
      },
};
export default options;
