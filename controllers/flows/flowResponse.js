import axios from "axios";
import FlowDataPlan from "../../models/flowDataplans.js";
import status from "../../models/status.js";
import FlowDataPlanUsuf from "../../models/flowDataplansUsuf.js";
// import { fetchMeterValidation } from "../utils/utils.js";
let data = "";
let newData = [];




const getPlans = async (network, pp) => {
  if (network) {
    try {
      const response = await getneworkdataplans(network);

      // Map response to required format with `Amount` converted to an integer
      let newData = response.map((item) => ({
        id: String(item.id),
        title: `${item.Network} ${item.PlanType} ${item.Size} ₦${item.Amount} - ${item.Validity}`,
        planType: item.PlanType, // Add PlanType for sorting
        amount: parseInt(item.Amount, 10), // Convert Amount to integer for sorting
      }));

      // Sort first by `PlanType` ascd (SME before others) and then by `Amount` in ascending order
      // newData.sort((a, b) => {
      //   if (a.planType < b.planType) return -1;
      //   if (a.planType > b.planType) return 1;
      //   return a.amount - b.amount; // Sort by amount if PlanType is the same
      // });

      // Sort first by `PlanType` desc (SME before others) and then by `Amount` in ascending order

      newData.sort((a, b) => {
        if (a.planType > b.planType) return -1;
        if (a.planType < b.planType) return 1;
        return a.amount - b.amount; // Sort by amount if PlanType is the same
      });
      

      // Check if the provided `pp` exists in the data
      let c = true;
      for (let i of newData) {
        if (i.id === pp) {
          c = false;
          break;
        }
      }

      // Add "Select data plan" if `pp` does not exist
      if (c && pp) {
        newData.push({ id: pp, title: "Select data plan" });
      }

      // Remove temporary sorting fields before returning
      return newData.map(({ planType, amount, ...rest }) => rest);
    } catch (error) {
      logger.error(error.stack);
      throw new Error("Failed to fetch plans");
    }
  }
  return [];
};

// const getPlans = async (network, pp) => {
//   if (network) {
//     try {
//       const p = [];
//       // const response = await axios.request(config);
//       const response = await getneworkdataplans(network);
//       newData = response.map((item) => ({
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
//       logger.error(error.stack)
//       throw new Error("Failed to fetch plans");
//     }
//   }
//   return newData;
// };

// export const fetchMeterValidation = async (meterNumber, discoName) => {
//   const url = "https://www.usufdataservice.com/api/validatemeter";
//   // const url = "https://karldata.com/api/validatemeter"
//   console.log(`Fetching meter validation for: ${ meterNumber} ==== ${discoName.split(" ").join("-") }`);
  
//   let config = {
//   method: 'get',
//   maxBodyLength: Infinity,
//   url: `https://paygold.ng/wp-json/api/v1/verify-customer?username=Mkonnect66&password=yVmP4vX@V:d~Uq2&customer_id=${meterNumber}&service_id=${discoName.split(" ").join("-")}&variation_id=prepaid`,
//   headers: { }
// };

//   try {
//     // const response = await axios(url, config);
//     const response = await axios.request(config)
//     console.log("=====888888888888888888888======",response)

//     return {
//       status: response.status,
//       data: response.data
//     };
    
//   } catch (error) {
//     console.error(`Error fetching meter validation: ${error.message}`);
//     return { status: false, error: error.message };
//   }
// };


export const fetchMeterValidation = async (meterNumber, discoName) => {
  // const url = "https://www.usufdataservice.com/api/validatemeter";
  const url = "https://karldata.com/api/validatemeter";
  console.log("Fetching meter validation for:", { meterNumber, discoName });

  const params = {
    meternumber: meterNumber,
    disconame: discoName,
    mtype: "PREPAID",
  };

  const config = {
    method: "get",
    headers: {
      // Authorization: `Token 4ef79bc0d15c52267c9321863699544283ae99d8`,
      Authorization: `Token f585bb4754091d6585dd3a667d9e5b58c004d037`,
      "Content-Type": "application/json",
    },
    params: params,
  };

  let config1 = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://paygold.ng/wp-json/api/v1/verify-customer?username=Mkonnect66&password=yVmP4vX@V:d~Uq2&customer_id=${meterNumber}&service_id=${discoName
      .split(" ")
      .join("-")}&variation_id=prepaid`,
    headers: {},
  };

  try {
    const response = await axios(url, config);
    // const response = await axios.request(config);

    return {
      status: response.status,
      // headers: response.headers,
      data: response.data,
    };
  } catch (error) {
    console.error(`Error fetching meter validation: ${error.stack}`);
    return { status: false, error: error.message };
  }
};


// this object is generated from Flow Builder under "..." > Endpoint > Snippets > Responses


const SCREEN_RESPONSES = {
  BUY_DATA: {
    version: "3.0",
    screen: "BUY_DATA",
    data: {
      is_plan_enabled: false,
      network: [
        {
          id: "MTN",
          title: "MTN",
        },
        {
          id: "GLO",
          title: "GLO",
        },
        {
          id: "AIRTEL",
          title: "AIRTEL",
        },
        {
          id: "9MOBILE",
          title: "9MOBILE",
        },
      ],
    },
  },
  SCREEN_TWO: {
    version: "3.0",
    screen: "SCREEN_TWO",
    data: {
      title: "Mkonnect",
      name: "Michael Mamman",
      state: "Jos",
      meterNumber: "23232323232323",
      amount: "2000",
      address: "address",
    },
  },
  ERROR: {
    version: "3.0",
    screen: "ERROR",
    data: {
      title: "ERROR",
    },
  },
  SUCCESS: {
    version: "3.0",
    screen: "SUCCESS",
  },
};

export const getNextScreen = async (decryptedBody) => {
  const { screen, data, version, action, flow_token } = decryptedBody;
  // handle health check request
  if (action === "ping") {
    return {
      version,
      data: {
        status: "active",
      },
    };
  }

  // handle error notification
  if (data?.error) {
    console.warn("Received client error:", data);
    return {
      version,
      data: {
        acknowledged: true,
      },
    };
  }

  // handle initial request when opening the flow and display APPOINTMENT screen
  if (action === "INIT") {
    return {
      version: "3.0",
      screen: "MENU",
      data: {},
    };
  }

  if (action === "data_exchange") {
    let pp = null;
    if (data.plan) {
      pp = data.plan;
    }
    // handle the request based on the current screen
    switch (screen) {
      case "MENU":
        switch (data.menu) {
          case "buy_data":
            return {
              ...SCREEN_RESPONSES.BUY_DATA,
            };

          case "buy_airtime":
            return {
              version: "3.0",
              screen: "BUY_AIRTIME",
              data: {},
            };
          case "buy_electricity":
            return {
              version: "3.0",
              screen: "QUESTION_ONE",
              data: {},
            };

          case "fund_wallet":
            return {
              version: "3.0",
              screen: "FUND_WALLET",
              data: {},
            };
          case "check_balance":
            return {
              ...SCREEN_RESPONSES.SUCCESS,
              data: {
                extension_message_response: {
                  params: {
                    flow_token: "check_balance",
                  },
                },
              },
            };
          case "saved_meter_numbers":
            return {
              ...SCREEN_RESPONSES.SUCCESS,
              data: {
                extension_message_response: {
                  params: {
                    flow_token: "saved_meter_numbers",
                  },
                },
              },
            };
          case "tutorials":
            return {
              version: "3.0",
              screen: "TUTORIALS",
              data: {},
            };
        }
      case "FUND_WALLET":
        switch (data.menu) {
          case "ATM_card":
            return {
              version: "3.0",
              screen: "AMOUNT",
              data: {},
            };

          case "bank_transfer":
            return {
              ...SCREEN_RESPONSES.SUCCESS,
              data: {
                extension_message_response: {
                  params: {
                    flow_token: "bank_transfer",
                  },
                },
              },
            };
        }
      case "BUY_DATA":
        return {
          ...SCREEN_RESPONSES.BUY_DATA,
          data: {
            // copy initial screen data then override specific fields
            ...SCREEN_RESPONSES.BUY_DATA.data,
            // each field is enabled only when previous fields are selected
            is_plan_enabled: Boolean(data.network),
            is_phone_enabled: Boolean(data.network) && Boolean(data.plan),
            is_pin_enabled:
              Boolean(data.network) &&
              Boolean(data.plan) &&
              Boolean(data.phone),

            //TODO: filter each field options based on current selection, here we filter randomly instead
            plan: await getPlans(data.network, pp),
          },
        };
      case "QUESTION_ONE":
        let state = `State: ${data.company}`;
        let meterNumber = `Meter Number: ${data.meter_number}`;
        let amount = `Amount: ₦${data.amount}`;
        if (parseInt(data.amount) < 1000) {
          return {
            ...SCREEN_RESPONSES.ERROR,
            data: {
              title:
                "Minimum electricity payment is ₦2000, please increase the amount and try again. 🔄",
            },
          };
        }

        try {
          const result = await fetchMeterValidation(
            data.meter_number,
            data.company
          );

          // if (result && result.status == 200) {
          if (result && result.data.invalid == false) {
            let { name, address } = result.data;
            // let { customer_address, customer_name } = result.data.data;
            console.log(address, name);
            name = `Meter Name: ${name.trim()}`;
            address = `Meter Address: ${address.trim()}`;
            let title =
              "Your meter details have been validated. Please confirm the details and proceed. 🥳 Kindly note that a service fee of ₦150 will be charged for this transaction. 📈";
            return {
              ...SCREEN_RESPONSES.SCREEN_TWO,
              data: {
                title: title,
                name: name,
                address: address,
                meterNumber: meterNumber,
                state: state,
                amount: amount,
              },
            };
          } else {
            console.log(result);
            return {
              ...SCREEN_RESPONSES.ERROR,
              data: {
                title:
                  "An error occurred during meter validation please check your meter details and try again",
                error_message: "error",
              },
            };
          }

          return;
        } catch (error) {
          console.log("Error during meter validation fetch:", error.stack);
          return {
            ...SCREEN_RESPONSES.ERROR,
            data: {
              title:
                "An error occurred during meter validation fetch. _trycatchFailed",
              error_message: error.message,
            },
          };
        }

      default:
        break;
    }
  }

  console.log("Unhandled request body:", decryptedBody);
  console.log(
    "Unhandled endpoint request. Make sure you handle the request action & screen logged above."
  );
};


export const getneworkdataplans = async (network) => {
  let id = network
  id = id.toUpperCase();
  let vendorStatus = await status.find();

  try {
    if (vendorStatus[0].vendor == "karldata") {


      if(id === "9MOBILE"){
        const dataplan = await FlowDataPlan.find({ Network: "9MOBILE"})
        return dataplan;
      }
      else if(id=== "MTN"){
        const dataplan = await FlowDataPlan.find({ Network: "MTN"});
        return dataplan;
      }
      else if(id === "AIRTEL"){
        // const dataplan = await FlowDataPlanUsuf.find({ Network: "AIRTEL"})
        const dataplan = await FlowDataPlan.find({ Network: "AIRTEL"})
        return dataplan;
      }
      else if(id === "GLO"){
        const dataplan = await FlowDataPlan.find({ Network: "GLO"})
        return dataplan;
      }else{
        res.status(404).json({ message: "No data found" });
      }


    } else {

      if(id === "9MOBILE"){
        const dataplan = await FlowDataPlanUsuf.find({ Network: "9MOBILE"})
        return dataplan;
      }
      else if(id=== "MTN"){
        const dataplan = await FlowDataPlanUsuf.find({ Network: "MTN"});
        return dataplan;
      }
      else if(id === "AIRTEL"){
        const dataplan = await FlowDataPlanUsuf.find({ Network: "AIRTEL"})
        return dataplan;
      }
      else if(id === "GLO"){
        const dataplan = await FlowDataPlanUsuf.find({ Network: "GLO"})
        return dataplan;
      }else{
        res.status(404).json({ message: "No data found" });
      }
    }

  } catch (error) {
    logger.error(`error getting data plans: ${error.stack}`);
      return error.message ;   
  }
}