import axios from "axios";
import FlowDataPlan from "../../models/flowDataplans.js";
import status from "../../models/status.js";
import FlowDataPlanUsuf from "../../models/flowDataplansUsuf.js";
import { dataPurchaseFlow } from "./dataPurchase.js";
// import { fetchMeterValidation } from "../utils/utils.js";

let data = "";
let newData = [];

export const getPlanType = async (network) => {
  let plan_type = [];

  if (network.toLowerCase() === "airtel") {
    plan_type = [
      {
        id: "3",
        title: "GIFTING",
      },
      {
        id: "2",
        title: "CORPORATE GIFTING",
      },
      {
        id: "5",
        title: "DATA COUPONS",
      },
      {
        id: "4",
        title: "AWOOF DATA",
      },
    ];
  } else if (network.toLowerCase() === "mtn") {
    plan_type = [
      {
        id: "1",
        title: "SME",
      },
      {
        id: "3",
        title: "GIFTING",
      },
      {
        id: "2",
        title: "CORPORATE GIFTING",
      },
    ];
  } else if (network.toLowerCase() === "glo") {
    plan_type = [
      {
        id: "2",
        title: "CORPORATE GIFTING",
      },
      {
        id: "3",
        title: "GIFTING",
      },
      {
        id: "4",
        title: "AWOOF DATA",
      },
    ];
  } else if (network.toLowerCase() === "9mobile") {
    plan_type = [
      {
        id: "2",
        title: "CORPORATE GIFTING",
      },
    ];
  }

  return plan_type;
};

const getPlans = async (network, pp, plan_type) => {
  if (network) {
    try {
      if (plan_type == "1") {
        plan_type = "SME";
      } else if (plan_type == "2") {
        plan_type = "CORPORATE GIFTING";
      } else if (plan_type == "3") {
        plan_type = "GIFTING";
      } else if (plan_type == "4") {
        plan_type = "AWOOF DATA";
      } else if (plan_type == "5") {
        plan_type = "DATA COUPONS";
      }

      // const response = await getneworkdataplans(network);
      if (network) {
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

        let newData = response
          .filter((item) => item.plan_type === plan_type) // Filter for specific plan_type
          .map((item) => {
            const baseAmount = Number(item.plan_amount);
            const sellingAmount = Math.ceil(baseAmount * 1.05); // Add 3% profit and round up

            return {
              id: String(item.id),
              title: `${item.plan_network} ${item.plan_type} ${item.plan} ₦${sellingAmount} - ${item.month_validate}`,
            };
          });

        // Map response to required format with `Amount` converted to an integer
        // let newData = response
        //   .filter(item => item.PlanType === plan_type) // Filter for SME plans
        //   .map((item) => ({
        //       id: String(item.id),
        //       title: `${item.Network} ${item.PlanType} ${item.Size} ₦${item.Amount} - ${item.Validity}`,
        //       planType: item.PlanType, // Add PlanType for sorting
        //       amount: parseInt(item.Amount, 10), // Convert Amount to integer for sorting
        //   }));

        // Assign a default value if newData is empty
        newData =
          newData.length > 0
            ? newData
            : [
                {
                  id: "1",
                  title: "No data plan available",
                },
              ];

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

        if (plan_type == "SME" && network.toLowerCase() == "airtel") {
          newData.unshift({
            id: "0",
            title: "Please don't buy if you're owing",
          });
        }

        if (plan_type == "AWOOF DATA" && network.toLowerCase() == "airtel") {
          newData.unshift({
            id: "0",
            title: "Please don't buy if you're owing",
          });
        }

        // Remove temporary sorting fields before returning
        return newData.map(({ planType, amount, ...rest }) => rest);
      }
    } catch (error) {
      logger.error(error.stack);
      throw new Error("Failed to fetch plans");
    }
  }
  return [];
};

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
    version: "6.3",
    screen: "BUY_DATA",
    data: {
      is_plan_enabled: false,
      is_plan_type_enabled: false,
      network: [
        {
          id: "MTN",
          title: "MTN",
        },
        {
          id: "AIRTEL",
          title: "AIRTEL",
        },
        {
          id: "GLO",
          title: "GLO",
        },
        {
          id: "9MOBILE",
          title: "9MOBILE",
        },
      ],
      plan_type: [
        {
          id: "1",
          title: "SME",
        },
        {
          id: "2",
          title: "Corporate Gifting",
        },
      ],
      plan: [
        {
          id: "1",
          title: "No data plan available",
        },
      ],
    },
  },
  SCREEN_TWO: {
    version: "6.3",
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
    version: "6.3",
    screen: "ERROR",
    data: {
      title: "ERROR",
    },
  },
  SUCCESS: {
    version: "6.3",
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
      version: "6.3",
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
              version: "6.3",
              screen: "BUY_AIRTIME",
              data: {},
            };
          case "buy_electricity":
            return {
              version: "6.3",
              screen: "QUESTION_ONE",
              data: {},
            };

          case "fund_wallet":
            return {
              version: "6.3",
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
                    flow_token_new: "check_balance",
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
                    flow_token_new: "saved_meter_numbers",
                  },
                },
              },
            };
          case "tutorials":
            return {
              version: "6.3",
              screen: "TUTORIALS",
              data: {},
            };
        }
      case "FUND_WALLET":
        switch (data.menu) {
          case "ATM_card":
            return {
              version: "6.3",
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
                    flow_token_new: "bank_transfer",
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
            is_plan_type_enabled: Boolean(data.network),
            is_plan_enabled: Boolean(data.plan_type),

            is_phone_enabled: Boolean(data.network) && Boolean(data.plan),
            is_pin_enabled:
              Boolean(data.network) &&
              Boolean(data.plan) &&
              Boolean(data.phone),

            //TODO: filter each field options based on current selection, here we filter randomly instead
            plan_type: await getPlanType(data.network),
            plan: await getPlans(data.network, pp, data.plan_type),
          },
        };

      case "data_complete":
        let plan_type = data.plan_type;
        let network_plan_types = await getPlanType(data.network);

        if (plan_type == "1") {
          plan_type = "SME";
        } else if (plan_type == "2") {
          plan_type = "CORPORATE GIFTING";
        } else if (plan_type == "3") {
          plan_type = "GIFTING";
        } else if (plan_type == "4") {
          plan_type = "AWOOF DATA";
        } else if (plan_type == "5") {
          plan_type = "DATA COUPONS";
        }

        const [flowToken, senderNumber] = flow_token.split(/_(?=\d+$)/);

        console.log("Phone Number:", senderNumber); // "2347030034134"
        console.log("Flow Token:", flowToken); // "menu_flow"
        if (!senderNumber) {
          return {
            version: "6.3",
            screen: "DATA_ERROR",
            data: {
              msg: "We've made a few updates and this form is no longer supported. Please use our new form to purchase data. just close this, type menu and send. The new supported form will be sent to you.",
            },
          };
        }

        let alternative = network_plan_types.find(
          (plan) => plan.title !== plan_type
        );
        let buyData = await dataPurchaseFlow(
          data.network,
          data.number,
          data.plan,
          data.pin,
          senderNumber,
          alternative,
          plan_type
        );

        if (buyData.status == false) {
          console.log(plan_type, network_plan_types, alternative.title);

          return {
            version: "6.3",
            screen: "DATA_ERROR",
            data: {
              msg: buyData.message,
            },
          };
        } else {
          // TODO: RETURN SUCCESS SCREEN
          return {
            ...SCREEN_RESPONSES.SUCCESS,
            data: {
              extension_message_response: {
                params: {
                  flow_token: `menu_flow_${senderNumber}`,
                  flow_token_new: `menu_flow_${senderNumber}`,
                  id: "data_flow",
                  network: data.network,
                  number: data.number,
                  plan: data.plan,
                  data_plan_type: plan_type,
                  pin: data.pin,
                },
              },
            },
          };

          // {
          //     version: "6.3",
          //     screen: "DATA_SUCCESS",
          //     "data": {
          //     "msg": buyData.message,

          //     }
          //   }
        }

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
  let id = network;
  id = id.toUpperCase();
  let vendorStatus = await status.find();

  try {
    if (vendorStatus[0].vendor == "karldata") {
      if (id === "9MOBILE") {
        const dataplan = await FlowDataPlan.find({
          Network: "9MOBILE",
          enabled: true,
        });
        return dataplan;
      } else if (id === "MTN") {
        const dataplan = await FlowDataPlan.find({
          Network: "MTN",
          enabled: true,
        });
        return dataplan;
      } else if (id === "AIRTEL") {
        const dataplan = await FlowDataPlan.find({
          Network: "AIRTEL",
          enabled: true,
        });
        // const dataplan = await FlowDataPlanUsuf.find({ Network: "AIRTEL", enabled: true})
        return dataplan;
      } else if (id === "GLO") {
        const dataplan = await FlowDataPlan.find({
          Network: "GLO",
          enabled: true,
        });
        return dataplan;
      } else {
        res.status(404).json({ message: "No data found" });
      }
    } else {
      if (id === "9MOBILE") {
        const dataplan = await FlowDataPlanUsuf.find({
          Network: "9MOBILE",
          enabled: true,
        });
        return dataplan;
      } else if (id === "MTN") {
        const dataplan = await FlowDataPlanUsuf.find({
          Network: "MTN",
          enabled: true,
        });
        return dataplan;
      } else if (id === "AIRTEL") {
        const dataplan = await FlowDataPlanUsuf.find({
          Network: "AIRTEL",
          enabled: true,
        });
        return dataplan;
      } else if (id === "GLO") {
        const dataplan = await FlowDataPlanUsuf.find({
          Network: "GLO",
          enabled: true,
        });
        return dataplan;
      } else {
        res.status(404).json({ message: "No data found" });
      }
    }
  } catch (error) {
    logger.error(`error getting data plans: ${error.stack}`);
    return error.message;
  }
};
