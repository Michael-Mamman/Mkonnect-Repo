import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import DataPlan from '../models/data.js';
import logger from './logs.js';
import status from '../models/status.js';
import FlowDataPlan from '../models/flowDataplans.js';
import FlowDataPlanUsuf from '../models/flowDataplansUsuf.js';
import { savetransaction } from './utils/utils.js';



export const data = async (req, res) => {
  const { network, mobile_number, plan, Ported_number, UserNumber } = req.body;  
  let vendor = await status.find();
  
  // if (network == 4){
    
  //   const plan_details = await FlowDataPlanUsuf.findOne({ id: plan});

  //   if (plan_details && (plan_details.PlanType == "CORPORATE GIFTING" || plan_details.PlanType == "AWOOF DATA")) {

  //     const apiEndpoint = process.env.USUF_DATA_ENDPOINT;
  //     const authToken = process.env.USUF_DATA_TOKEN;
  
  //     try {
  
  //       const response = await axios.post(apiEndpoint, {
  //         network,
  //         mobile_number,
  //         plan,
  //         Ported_number,
  //       }, {
  //         headers: {
  //           'Authorization': `Token ${authToken}`,
  //           'Content-Type': 'application/json',
  //         },
  //       });

  //       const payload = response.data;
        
  //       const profit = parseFloat(plan_details.Amount) - parseFloat(payload.plan_amount);
  //       savetransaction(
  //         UserNumber,
  //         payload.mobile_number,
  //         payload.plan_network,
  //         payload.plan_name,
  //         plan_details.Amount,
  //         profit,
  //         payload.id,
  //         "Usufdata"
  //       );

  //       res.status(response.status).json(response.data);
  //     } catch (error) {
    
  //       logger.error(`usuf error buying data : ${error.stack}`);
  //       res.status(200).json(error.response?.data);
  //     }

  //   }else{

  //     const plan_details = await FlowDataPlan.findOne({ id: plan});

  //     const apiEndpoint = process.env.KARL_DATA_ENDPOINT;
  //     const authToken = process.env.KARL_DATA_TOKEN;
  
  //     try {
  
  //       const response = await axios.post(apiEndpoint, {
  //         network,
  //         mobile_number,
  //         plan,
  //         Ported_number,
  //       }, {
  //         headers: {
  //           'Authorization': `Token ${authToken}`,
  //           'Content-Type': 'application/json',
  //         },
  //       });

  //       const payload = response.data;

  //       const profit = parseFloat(plan_details.Amount) - parseFloat(payload.plan_amount);

  //       savetransaction(
  //         UserNumber,
  //         payload.mobile_number,
  //         payload.plan_network,
  //         payload.plan_name,
  //         plan_details.Amount,
  //         profit,
  //         payload.id,
  //         "Karldata"
  //       );
  //       res.status(response.status).json(response.data);
  //     } catch (error) {
    
  //       logger.error(`karl error buying data: ${error.stack}`);
  //       res.status(200).json(error.response?.data);
  //     }
  //   }

    
  // }else {

  
  if (vendor[0].vendor == "karldata") {
    const plan_details = await FlowDataPlan.findOne({ id: plan});

    const apiEndpoint = process.env.KARL_DATA_ENDPOINT;
    const authToken = process.env.KARL_DATA_TOKEN;

    try {

      const response = await axios.post(apiEndpoint, {
        network,
        mobile_number,
        plan,
        Ported_number,
      }, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const payload = response.data;
        
      const profit = parseFloat(plan_details.Amount) - parseFloat(payload.plan_amount);

      savetransaction(
        UserNumber,
        payload.mobile_number,
        payload.plan_network,
        payload.plan_name,
        plan_details.Amount,
        profit,
        payload.id,
        "karldata"
      );

      res.status(response.status).json(response.data);
    } catch (error) {
  
      logger.error(`karl error buying data: ${error.stack}`);
      res.status(200).json(error.response?.data);
    }

  } else if (vendor[0].vendor == "usufdata") {

    // const plan_details = await FlowDataPlanUsuf.findOne({ id: plan});

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
      let networkName;

        if (network == 1) {
          networkName = "MTN";
        } else if (network == 2) {
          networkName = "GLO";
        } else if (network == 3) {
          networkName = "9MOBILE";
        } else if (network == 4) {
          networkName = "AIRTEL";
        } else {
          network = 0;
        }

      switch (networkName) {
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
      
      
      let plan_details = response.find(response => Number(response.id) == plan);

      console.log("Plan Verify deatails: ", plan_details);
      const sellingAmount = Math.ceil(parseFloat(plan_details.plan_amount) * 1.05); 


    const apiEndpoint = process.env.USUF_DATA_ENDPOINT;
    const authToken = process.env.USUF_DATA_TOKEN;

    try {

      const response = await axios.post(apiEndpoint, {
        network,
        mobile_number,
        plan,
        Ported_number,
      }, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const payload = response.data;
        
      const profit = parseFloat(sellingAmount) - parseFloat(payload.plan_amount);

      savetransaction(
        UserNumber,
        payload.mobile_number,
        payload.plan_network,
        payload.plan_name,
        sellingAmount,
        profit,
        payload.id,
        "Usufdata"
      );

      res.status(response.status).json(response.data);
    } catch (error) {
  
      logger.error(`usuf error buying data : ${error.stack}`);
      res.status(200).json(error.response?.data);
    }
  }

  }


export const dataRetry = async (networkName, mobile_number, plan, senderNumber) => {
  let vendor = await status.find();
  // console.log("hiiiiiiiiiiiiiii")
  // console.log(networkName, mobile_number, plan)
  let network
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
  
  if (vendor[0].vendor == "karldata") {

    const plan_details = await FlowDataPlanUsuf.findOne({ id: plan});

    const apiEndpoint = process.env.USUF_DATA_ENDPOINT;
    const authToken = process.env.USUF_DATA_TOKEN;
    const Ported_number = true

    try {

      const response = await axios.post(apiEndpoint, {
        network,
        mobile_number,
        plan,
        Ported_number
      }, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const payload = response.data;

      const profit = parseFloat(plan_details.Amount) - parseFloat(payload.plan_amount);

      savetransaction(
        senderNumber,
        payload.mobile_number,
        payload.plan_network,
        payload.plan_name,
        plan_details.Amount,
        profit,
        payload.id,
        "Usufdata"
      );

      return response.data;
    } catch (error) {
  
      logger.error(`usufdata bk error buying data: ${error.stack}`);
      return error.response?.data;
    }

  } else if (vendor[0].vendor == "usufdata") {
    const apiEndpoint = process.env.KARL_DATA_ENDPOINT;
    const authToken = process.env.KARL_DATA_TOKEN;
    const plan_details = await FlowDataPlan.findOne({ id: plan});
    const Ported_number = true


    try {

      const response = await axios.post(apiEndpoint, {
        network,
        mobile_number,
        plan,
        Ported_number,
      }, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const payload = response.data;

      const profit = parseFloat(plan_details.Amount) - parseFloat(payload.plan_amount);

      savetransaction(
        senderNumber,
        payload.mobile_number,
        payload.plan_network,
        payload.plan_name,
        plan_details.Amount,
        profit,
        payload.id,
        "karldata"
      );
      return response.data;

      // res.status(response.status).json(response.data);
    } catch (error) {
  
      logger.error(`karl bk error buying data : ${error.stack}`);
      return error.response?.data;

      // res.status(200).json(error.response?.data);
    }
  }




};

const mtnPlanMapall = {
  1: 7,
  2: 8,
  3: 11,
  4: 43,
  5: 44,
  6: 266,
  7: 267,
  8: 268,
  9: 269,
  10: 270,
  11: 271,
  12: 272,
  13: 273,
  14: 274,
  15: 275,
  16: 276,
  17: 277,
  18: 278,
  19: 279,
  20: 212,
  21: 213,
  22: 214,
  23: 215,
  24: 216,
  25: 217,
  26: 218,
  27: 219,
  28: 220,
  29: 221,
  30: 222,
  31: 223,
  32: 224,
};

const mtnPlanMap = {
  1: 7,
  2: 8,
  3: 11,
  4: 43,
  5: 44,
  6: 212,
};

const gloPlanMap = {
  1: 246,
  2: 247,
  3: 248,
  4: 249,
  5: 250,
  6: 251,
  7: 252,
};

const mobile9 = {
    1: 253,
    2: 254,
    3: 255,
    4: 258,
    5: 259,
    6: 260,
    7: 261,
    8: 262,
    9: 263,
    10: 264,
  };

  const airtelPlanMap = {
    1: 225,
    2: 226,
    3: 227,
    4: 228,
    5: 229,
    6: 230,
    7: 231,
    8: 233,
  };

const userFriendlyIdMap = {
  1: 7,
  2: 8,
  3: 11,
  4: 43,
  5: 44,
  6: 212,
  7: 213,
  8: 214,
  9: 215,
  10: 216,
  11: 217,
  12: 218,
  13: 219,
  14: 220,
  15: 221,
  16: 222,
  17: 223,
  18: 224,
  19: 225,
  20: 226,
  21: 227,
  22: 228,
  23: 229,
  24: 230,
  25: 231,
  26: 233,
  27: 240,
  28: 241,
  29: 242,
  30: 243,
  31: 244,
  32: 245,
  33: 246,
  34: 247,
  35: 248,
  36: 249,
  37: 250,
  38: 251,
  39: 252,
  40: 253,
  41: 254,
  42: 255,
  43: 258,
  44: 259,
  45: 260,
  46: 261,
  47: 262,
  48: 263,
  49: 264,
  50: 265,
  51: 266,
  52: 267,
  53: 268,
  54: 269,
  55: 270,
  56: 271,
  57: 272,
  58: 273,
  59: 274,
  60: 275,
  61: 276,
  62: 277,
  63: 278,
  64: 279
};

const findDataPlanByUserFriendlyId = (plan, network) => {
  let actualId;
  if (network == 1){
    actualId = mtnPlanMap[plan];
    return actualId;
  }else if (network == 2){
    const actualId = gloPlanMap[plan];
    return actualId;
  }else if (network == 3){
    const actualId = mobile9[plan];
    return actualId;
  }else if (network == 4){
    const actualId = airtelPlanMap[plan];
    return actualId;
  }else{
    return "Invalid network";
  }
};

export const createdataplans = async (req, res) => {
  const plans = []
  req.body.map((plan) => {
    plans.push({
      "id": plan.id,
      "Network": plan.Network,
      "Validity": plan.Validity,
      "Amount": plan.Amount,
      "Size": plan.Size,
      "PlanType": plan.PlanType,
      "vendor": plan.vendor

    })
  })
  try {
    let vendorStatus = await status.find();
    let vendor;
    if (vendorStatus[0].vendor == "karldata") {
      vendor = FlowDataPlan
    }else{
      vendor = FlowDataPlanUsuf
    }
    
    // const dataplan = await FlowDataPlan.create(plans);
    const dataplan = await vendor.create(plans);

    res.status(201).json(dataplan);
  } catch (error) {
    console.log(error.stack)
    res.status(500).json({message: error.message, status: false});
    
  }
}

export const getdataplans = async (req, res) => {
  try {
    const dataplan = await FlowDataPlan.find({}).sort({ ID: 1 });
    res.status(200).json(dataplan);
  } catch (error) {
    logger.error("error creating data plans: ",error.stack);
      res.status(500).json({message: error.message, status: false});   
  }
}

export const getneworkdataplans = async (req, res) => {
  let {id} = req.params;
  id = id.toUpperCase();
  let vendor

  let vendorStatus = await status.find();
  console.log(vendorStatus[0].vendor)
  if (vendorStatus[0].vendor == "karldata") {
    vendor = FlowDataPlan
  }else{
    vendor = FlowDataPlanUsuf
  }


  try {
    if(id === "9MOBILE"){
      const dataplan = await vendor.find({ Network: "9MOBILE"})
      res.status(200).json(dataplan);
    }
    else if(id=== "MTN"){
      const dataplan = await vendor.find({ Network: "MTN"});
      res.status(200).json(dataplan);
    }
    else if(id === "AIRTEL"){
      const dataplan = await vendor.find({ Network: "AIRTEL"})
      res.status(200).json(dataplan);
    }
    else if(id === "GLO"){
      const dataplan = await vendor.find({ Network: "GLO"})
      res.status(200).json(dataplan);
    }else{
      res.status(404).json({ message: "No data found" });
    }
  } catch (error) {
    logger.error("error getting data plans: ",error.stack);
      res.status(500).json({message: error.message, status: false});   
  }
}

export const updataplan =  async (req, res) => {
  const {id} = req.params;
  try {
      const dataplan = await FlowDataPlan.findByIdAndUpdate(id, req.body);
      const updatedDataPlan = await FlowDataPlan.findById({_id: id});
      if(!updatedDataPlan){
          return res.status(404).json({message: `cannot find Data plan with ID ${id}`, status: false})
      }
      res.status(200).json(updatedDataPlan);

  } catch (error) {
    logger.error("error updating data plans: ",error.stack);
      if (error.name === 'CastError') {
          // Handle CastError (invalid ObjectId)
          res.status(404).json({message:`User with id ${id} not found`, status: false});  
      } else {
        console.error(error);
        res.status(500).json({ message: error.message, status: false });
      }
    }
}

export const deletedataplan = async (req, res) => {
  try {
      const {id} = req.params;
      const dataplan = await FlowDataPlan.findByIdAndDelete(id);
      // const dataplan = await FlowDataPlan.deleteMany({
      //   Network: "MTN",
      //   PlanType: { $ne: "SME" }
      // });
      if(!dataplan){
          return res.status(404).json({message: `cannot find Data plan with ID ${id}`, status: false});
      }
      res.status(200).json({message: `Data plan with ID ${id} has been deleted`, status: true});
      
  } catch (error) {
    logger.error("error deleting data plans: ",error.stack);
      res.status(500).json({message: error.message, status: false});
  }
}


