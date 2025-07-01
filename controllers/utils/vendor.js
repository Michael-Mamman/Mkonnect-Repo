import status from "../../models/status.js";
import logger from "../logs.js";

const VENDORS = {
  KARL_DATA: "karldata",
  USUF_DATA: "usufdata",
};

const NETWORK_IDS = {
  karldata: {
    "MTN 1.0": 7,
    "MTN 2.0": 8,
    "MTN 3.0": 44,
    "MTN 5.0": 11,
    "MTN 10.0": 43,
    "MTN 500.0": 212,
    "MTN 20.0": 223,
    "MTN 40.0": 224,
    "GLO 200.0": 246,
    "GLO 500.0": 247,
    "GLO 1.0": 248,
    "GLO 2.0": 249,
    "GLO 3.0": 250,
    "GLO 5.0": 251,
    "GLO 10.0": 252,
    "AIRTEL 100.0": 225,
    "AIRTEL 300.0": 226,
    "AIRTEL 500.0": 227,
    "AIRTEL 1.0": 228,
    "AIRTEL 2.0": 229,
    "AIRTEL 5.0": 230,
    "AIRTEL 10.0": 231,
    "AIRTEL 20.0": 233,
    "9MOBILE 25.0": 253,
    "9MOBILE 500.0": 254,
    "9MOBILE 1.0": 255,
    "9MOBILE 2.0": 258,
    "9MOBILE 3.0": 259,
    "9MOBILE 4.0": 260,
    "9MOBILE 4.5": 261,
    "9MOBILE 5.0": 262,
    "9MOBILE 10.0": 263,
    "9MOBILE 11.0": 264,
  },
  usufdata: {
    "MTN 500.0": 6,
    "MTN 1.0": 7,
    "MTN 2.0": 8,
    "MTN 3.0": 44,
    "MTN 5.0": 11,
    "MTN 10.0": 43,
    "MTN 20.0": 51,
    "MTN 40.0": 219,
    "GLO 200.0": 264,
    "GLO 500.0": 263,
    "GLO 1.0": 258,
    "GLO 2.0": 259,
    "GLO 3.0": 260,
    "GLO 5.0": 261,
    "GLO 10.0": 262,
    "AIRTEL 100.0": 244,
    "AIRTEL 300.0": 243,
    "AIRTEL 500.0": 242,
    "AIRTEL 1.0": 239,
    "AIRTEL 2.0": 240,
    "AIRTEL 5.0": 241,
    "AIRTEL 10.0": 250,
    "AIRTEL 20.0": 251,
    "9MOBILE 500.0": 284,
    "9MOBILE 1.0": 280,
    "9MOBILE 2.0": 281,
    "9MOBILE 3.0": 282,
    "9MOBILE 4.0": 287,
    "9MOBILE 5.0": 283,
    "9MOBILE 10.0": 285,
  },
};

export const vendor = async (plan) => {
  try {
    const vendorStatus = await status.find();
    const vendorName = vendorStatus[0]?.vendor;

    if (vendorName === VENDORS.KARL_DATA) {
      // logger.log("Karl Vendor error");
      return getNetworkId(plan, vendorName, NETWORK_IDS);
    } else if (vendorName === VENDORS.USUF_DATA) {
      // logger.log("Usuf Vendor error");
      return getNetworkId(plan, vendorName, NETWORK_IDS);
    } else {
      // logger.log("Vendor error");
      throw new Error("Unknown vendor");
    }
  } catch (error) {
    logger.error(`Error in vendor function ${error.stack}`);
    throw error;
  }
};

const getNetworkId = (plan, vendorName, networkIds) => {
  const [network, amount] = plan.split(" ");
  const networkId = networkIds[vendorName]?.[plan];

  if (!networkId) {
    throw new Error("Invalid plan");
  }
  console.log(networkId);
  return networkId;
};


// import status from "../../models/status.js";
// import logger from "../logs.js";

// export const vendor = async (plan) => {
//   let vendor = await status.find();
//   console.log(vendor);
//   console.log(vendor[0].vendor == "karldata")
//   if (vendor[0].vendor == "karldata") {
//     console.log(plan, "================================jjj====================================================")
//     let networkId;
//     switch (plan) {
//       // ========================MTN=========================//
//       case "MTN 1.0":
//         networkId = 7;
//         break;
//       case "MTN 2.0":
//         networkId = 8;
//         break;
//       case "MTN 3.0":
//         networkId = 44;
//         break;
//       case "MTN 5.0":
//         networkId = 11;
//         break;
//       case "MTN 10.0":
//         networkId = 43;
//         break;
//       case "MTN 500.0":
//         networkId = 212;
//         break;
//       // ========================GLO=========================//
//       case "GLO 200.0":
//         networkId = 246;
//         break;
//       case "GLO 500.0":
//         networkId = 247;
//         break;
//       case "GLO 1.0":
//         networkId = 248;
//         break;
//       case "GLO 2.0":
//         networkId = 249;
//         break;
//       case "GLO 3.0":
//         networkId = 250;
//         break;
//       case "GLO 5.0":
//         networkId = 251;
//         break;
//       case "GLO 10.0":
//         networkId = 252;
//         break;
//       // ========================AIRTEL=========================//
//       case "AIRTEL 100.0":
//         networkId = 225;
//         break;
//       case "AIRTEL 300.0":
//         networkId = 226;
//         break;
//       case "AIRTEL 500.0":
//         networkId = 227;
//         break;
//       case "AIRTEL 1.0":
//         networkId = 228;
//         break;
//       case "AIRTEL 2.0":
//         networkId = 229;
//         break;
//       case "AIRTEL 5.0":
//         networkId = 230;
//         break;
//       case "AIRTEL 10.0":
//         networkId = 231;
//         break;
//       case "AIRTEL 20.0":
//         networkId = 233;
//         break;

//       // ========================9MOBILE=========================//
//       case "9MOBILE 25.0":
//         networkId = 253;
//         break;
//       case "9MOBILE 500.0":
//         networkId = 254;
//         break;
//       case "9MOBILE 1.0":
//         networkId = 255;
//         break;
//       case "9MOBILE 2.0":
//         networkId = 258;
//         break;
//       case "9MOBILE 3.0":
//         networkId = 259;
//         break;
//       case "9MOBILE 4.0":
//         networkId = 260;
//         break;
//       case "9MOBILE 4.5":
//         networkId = 261;
//         break;
//       case "9MOBILE 5.0":
//         networkId = 262;
//         break;
//       case "9MOBILE 10.0":
//         networkId = 263;
//         break;
//       case "9MOBILE 11.0":
//         networkId = 264;
//         break;
//       default:
//         break;
//     }
//     logger.log("karl Vedor error")
//     console.log("================================jjj====================================================")

//     return networkId;

//   } else if (vendor[0].vendor == "usufdata") {
//     let networkId;
//     switch (plan) {
//       // ========================MTN=========================//
//       case "MTN 500.0":
//         networkId = 6;
//         break;
//       case "MTN 1.0":
//         networkId = 7;
//         break;
//       case "MTN 2.0":
//         networkId = 8;
//         break;
//       case "MTN 3.0":
//         networkId = 44;
//         break;
//       case "MTN 5.0":
//         networkId = 11;
//         break;
//       case "MTN 10.0":
//         networkId = 43;
//         break;
//       // ========================GLO=========================//
//       case "GLO 200.0":
//         networkId = 264;
//         break;
//       case "GLO 500.0":
//         networkId = 263;
//         break;
//       case "GLO 1.0":
//         networkId = 258;
//         break;
//       case "GLO 2.0":
//         networkId = 259;
//         break;
//       case "GLO 3.0":
//         networkId = 260;
//         break;
//       case "GLO 5.0":
//         networkId = 261;
//         break;
//       case "GLO 10.0":
//         networkId = 262;
//         break;
//       // ========================AIRTEL=========================//
//       case "AIRTEL 100.0":
//         networkId = 244;
//         break;
//       case "AIRTEL 300.0":
//         networkId = 243;
//         break;
//       case "AIRTEL 500.0":
//         networkId = 242;
//         break;
//       case "AIRTEL 1.0":
//         networkId = 239;
//         break;
//       case "AIRTEL 2.0":
//         networkId = 240;
//         break;
//       case "AIRTEL 5.0":
//         networkId = 241;
//         break;
//       case "AIRTEL 10.0":
//         networkId = 250;
//         break;
//       case "AIRTEL 20.0":
//         networkId = 251;
//         break;

//       // ========================9MOBILE=========================//
//       case "9MOBILE 500.0":
//         networkId = 282;
//         break;
//       case "9MOBILE 1.0":
//         networkId = 280;
//         break;
//       case "9MOBILE 2.0":
//         networkId = 281;
//         break;
//       case "9MOBILE 3.0":
//         networkId = 282;
//         break;
//       case "9MOBILE 4.0":
//         networkId = 287;
//         break;
//       case "9MOBILE 5.0":
//         networkId = 283;
//         break;
//       case "9MOBILE 10.0":
//         networkId = 285;
//         break;
//       default:
//         break;
//     }
//     logger.log("usuf Vedor error")
//     return networkId;
//   }

//   logger.log("Vedor error")


// };
