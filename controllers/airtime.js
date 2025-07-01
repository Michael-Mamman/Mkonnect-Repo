import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import DataPlan from '../models/data.js';
import logger from './logs.js';
import status from '../models/status.js';


export const airtime = async (req, res) => {
  let { network, amount, mobile_number, Ported_number, airtime_type } = req.body;
//   let Ported_number = true
//   let airtime_type = "VTU"
 
  
  let vendor = await status.find();
  console.log(vendor);
  if (vendor[0].vendor == "karldata") {
    const apiEndpoint = process.env.KARL_AIRTIME_ENDPOINT;
    const authToken = process.env.KARL_DATA_TOKEN;

    try {

      const response = await axios.post(apiEndpoint, {
        network,
        amount,
        mobile_number,
        Ported_number,
        airtime_type
      }, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      res.status(response.status).json(response.data);
    } catch (error) {
  
      logger.error(`karl error buying data: ${error.stack}`);
      res.status(error.response?.status || 500).json(error.response?.data);
    }

  } else if (vendor[0].vendor == "usufdata") {

    const apiEndpoint = process.env.USUF_AIRTIME_ENDPOINT;
    const authToken = process.env.USUF_DATA_TOKEN;

    try {

      const response = await axios.post(apiEndpoint, {
        network,
        amount,
        mobile_number,
        Ported_number,
        airtime_type
      }, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      res.status(response.status).json(response.data);
    } catch (error) {
      logger.error(`usuf error buying data: ${error.stack}`);
      console.log(error.response?.data);
      res.status(error.response?.status || 500).json(error.response?.data);
    }
  }

};