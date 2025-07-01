// Function to fetch meter validation using fetch
import fetch from 'node-fetch';

export const fetchMeterValidation = async (meterNumber, discoName) => {
  console.log("Fetching meter validation for:", { meterNumber, discoName });

  const url = `https://mkonnect.com.ng/test?meterNumber=${meterNumber}&discoName=${discoName}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${JSON.stringify(response)}`);
    }

    const data = await response.json();
    console.log(JSON.stringify(data));
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(`Error fetching meter validation: ${JSON.stringify(error.message)}`);
  }
};

export const fetchMeterValidationn = (meterNumber, discoName) => {
    // const url = "https://mkonnect.com.ng/test";
    console.log("Fetching meter validation for:", { meterNumber, discoName });
  
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://mkonnect.com.ng/test?meterNumber=${meterNumber}&discoName=${discoName}`,
      headers: { }
    };
    
    return axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        let data = response.data
        return data
      })
      .catch((error) => {
        console.log(error);
      });
  
  };
  


const SCREEN_RESPONSES = {
  APPOINTMENT: {
    version: "3.0",
    screen: "APPOINTMENT",
    data: {
      department: [
        { id: "shopping", title: "Shopping & Groceries" },
        { id: "clothing", title: "Clothing & Apparel" },
        { id: "home", title: "Home Goods & Decor" },
        { id: "electronics", title: "Electronics & Appliances" },
        { id: "beauty", title: "Beauty & Personal Care" },
      ],
      location: [
        { id: "1", title: "King\u2019s Cross, London" },
        { id: "2", title: "Oxford Street, London" },
        { id: "3", title: "Covent Garden, London" },
        { id: "4", title: "Piccadilly Circus, London" },
      ],
      is_location_enabled: true,
      date: [
        { id: "2024-01-01", title: "Mon Jan 01 2024" },
        { id: "2024-01-02", title: "Tue Jan 02 2024" },
        { id: "2024-01-03", title: "Wed Jan 03 2024" },
      ],
      is_date_enabled: true,
      time: [
        { id: "10:30", title: "10:30" },
        { id: "11:00", title: "11:00", enabled: false },
        { id: "11:30", title: "11:30" },
        { id: "12:00", title: "12:00", enabled: false },
        { id: "12:30", title: "12:30" },
      ],
      is_time_enabled: true,
    },
  },
  DETAILS: {
    version: "3.0",
    screen: "DETAILS",
    data: {
      department: "beauty",
      location: "1",
      date: "2024-01-01",
      time: "11:30",
    },
  },
  SUMMARY: {
    version: "3.0",
    screen: "SUMMARY",
    data: {
      appointment: "Beauty & Personal Care Department at Kings Cross, London\nMon Jan 01 2024 at 11:30.",
      details: "Name: John Doe\nEmail: john@example.com\nPhone: 123456789\n\nA free skin care consultation, please",
      department: "beauty",
      location: "1",
      date: "2024-01-01",
      time: "11:30",
      name: "John Doe",
      email: "john@example.com",
      phone: "123456789",
      more_details: "A free skin care consultation, please",
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
  TERMS: {
    version: "3.0",
    screen: "TERMS",
    data: {},
  },
  SUCCESS: {
    version: "3.0",
    screen: "SUCCESS",
    data: {
      extension_message_response: {
        params: {
          flow_token: "REPLACE_FLOW_TOKEN",
          some_param_name: "PASS_CUSTOM_VALUE",
        },
      },
    },
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
      ...SCREEN_RESPONSES.APPOINTMENT,
      data: {
        ...SCREEN_RESPONSES.APPOINTMENT.data,
        // these fields are disabled initially. Each field is enabled when previous fields are selected
        is_location_enabled: false,
        is_date_enabled: false,
        is_time_enabled: false,
      },
    };
  }

  if (action === "data_exchange") {
    switch (screen) {
      case "QUESTION_ONE":
        let state = `State: ${data.company}`;
        let meterNumber = `Meter Number: ${data.meter_number}`;
        let amount = `Amount: ₦${data.amount}`;

        try {
          const results = await fetchMeterValidation(data.meter_number, data.company);
            //   if (!results){
            //   throw new Error(`HTTP error! status: ${JSON.stringify(results)}`);
            // }
          const result = [{"name":"LONGWA","address":"(STATE LOWCOST)"}]
          console.log(!result)
          if (result) {
            const { name, address } = result;
            let title = "Your meter details have been validated. Please confirm the details and proceed.";

            if (result) {
              title = "An error occurred while validating your meter details. Please check your meter information and try again.";
              return {
                ...SCREEN_RESPONSES.SCREEN_TWO,
                version: "3.0",
                screen: "ERROR",
                data: {
                  title: title,
                  error_message: "SOMETHING WENT WRONG",
                },
              };
            } else {
              return {
                ...SCREEN_RESPONSES.SCREEN_TWO,
                data: {
                  title: title,
                  name: result[0].name,
                  state: state,
                  address: result[0].address,
                  meterNumber: meterNumber,
                  amount: amount,
                },
              };
            }
          } else {
            return {
              ...SCREEN_RESPONSES.ERROR,
              data: {
                title: "An error occurred while validating your meter details. Please check your meter information and try again.",
                error_message: "error",
              },
            };
          }
        } catch (error) {
          console.log("Error during meter validation fetch:", error.stack);
          return {
            ...SCREEN_RESPONSES.ERROR,
            data: {
              title: "An error occurred during meter validation fetch.",
              error_message: error.message,
            },
          };
        }

      // Add other cases if needed

      case "APPOINTMENT":
        return {
          ...SCREEN_RESPONSES.APPOINTMENT,
          data: {
            ...SCREEN_RESPONSES.APPOINTMENT.data,
            is_location_enabled: Boolean(data.department),
            is_date_enabled: Boolean(data.department) && Boolean(data.location),
            is_time_enabled: Boolean(data.department) && Boolean(data.location) && Boolean(data.date),
            location: SCREEN_RESPONSES.APPOINTMENT.data.location.slice(0, 3),
            date: SCREEN_RESPONSES.APPOINTMENT.data.date.slice(0, 3),
            time: SCREEN_RESPONSES.APPOINTMENT.data.time.slice(0, 3),
          },
        };

      case "DETAILS":
        const departmentName = SCREEN_RESPONSES.APPOINTMENT.data.department.find(dept => dept.id === data.department).title;
        const locationName = SCREEN_RESPONSES.APPOINTMENT.data.location.find(loc => loc.id === data.location).title;
        const dateName = SCREEN_RESPONSES.APPOINTMENT.data.date.find(date => date.id === data.date).title;

        const appointment = `${departmentName} at ${locationName}\n${dateName} at ${data.time}`;
        const details = `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\n"${data.more_details}"`;

        return {
          ...SCREEN_RESPONSES.SUMMARY,
          data: {
            appointment,
            details,
            ...data,
          },
        };

      case "SUMMARY":
        return {
          ...SCREEN_RESPONSES.SUCCESS,
          data: {
            extension_message_response: {
              params: {
                flow_token,
              },
            },
          },
        };

      default:
        break;
    }
  }

  console.error("Unhandled request body:", decryptedBody);
  throw new Error("Unhandled endpoint request. Make sure you handle the request action & screen logged above.");
};
