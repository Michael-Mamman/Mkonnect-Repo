import axios from 'axios';
import dotenv from 'dotenv';
import logger from './logs.js';
dotenv.config();
const PAYSTACK_CREATE_CUSTOMER = process.env.PAYSTACK_CREATE_CUSTOMER;
const PAYSTACK_AUTHORIZATION = process.env.PAYSTACK_AUTHORIZATION;
const PAYSTACK_DEDICATED_ACCOUNT = process.env.PAYSTACK_DEDICATED_ACCOUNT;



export const initializeTransaction = async (email, amount) => {
  const data = JSON.stringify({
    email: email,
    amount: amount,
    callback_url: "https://wa.me/message/WGNI3OIIIQEXO1"
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.paystack.co/transaction/initialize',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': PAYSTACK_AUTHORIZATION
    },  
    data: data
  };

  try {
    const response = await axios.request(config);
    return response.data; // This will return the response data back to the caller
  } catch (error) {
    logger.error(error.stack);
    return false; // Optionally, return null or handle the error based on your requirements
  }
};



export const createCustomer = async (email, firstName, lastName, phone) => {

  try {
    // let data = JSON.stringify({});

    let data = JSON.stringify({
      'email': email,
      'first_name': firstName,
      'last_name': lastName,
      'phone': phone
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: PAYSTACK_CREATE_CUSTOMER,
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': PAYSTACK_AUTHORIZATION
      },
      data : data
    };

    const response = await axios.request(config);

    return response.data;
  } catch (error) {


    logger.error(`error creating paystack customer: ${error.stack}`);
    // throw new Error('Failed to create customer');
  }
}



export const createDedicatedAccount = async (customerId, bank) => {
  // console.log(customerId);

  try {
    let data = JSON.stringify({ 
      'customer': customerId,
      'preferred_bank': bank 
      // 'preferred_bank': 'titan-paystack' 
      // 'preferred_bank': 'wema-bank' 
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: PAYSTACK_DEDICATED_ACCOUNT,
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': PAYSTACK_AUTHORIZATION
      },
      data: data
    };

    const response = await axios.request(config);

    return response.data;
  } catch (error) {
    console.log(customerId);
    logger.error(`error creating paystack dedicated account: ${error.stack}`);
  }
}


export const getSuccessfulTransactions = async () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.paystack.co/transaction/totals?from=${startOfMonth}&status=success&to=${endOfMonth}`,
        headers: { 
            'Authorization': PAYSTACK_AUTHORIZATION, 

        }
    };

    try {
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
}


export const getDailyTransactions = async () => {
  // const now = new Date();

  // Set 'from' to start of the day (00:00:00)
  // const from = new Date(now.setHours(0, 0, 0, 0));

  // Set 'to' to end of the day (23:59:59)
  // const to = new Date(now.setHours(23, 59, 59, 999));

      // Get yesterday's date
      let yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
  
      // Set fromDate to start of yesterday (00:00:00)
      let from = new Date(yesterday.setHours(0, 0, 0, 0));
  
      // Set toDate to end of yesterday (23:59:59)
      let to = new Date(yesterday.setHours(23, 59, 59, 999));



    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.paystack.co/transaction/totals?from=${from}&status=success&to=${to}`,
        headers: { 
            'Authorization': PAYSTACK_AUTHORIZATION, 

        }
    };

    try {
        const response = await axios.request(config);
        let pending_transfers = (response.data.data.total_volume/100) - ((response.data.data.total_volume/100) * 0.01);
        return pending_transfers;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
}

export const getGenratedRevenue = async () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.paystack.co/transaction/totals`,
        headers: { 
            'Authorization': PAYSTACK_AUTHORIZATION, 

        }
    };

    try {
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        logger.error(error.stack);
        return null;
    }
}


