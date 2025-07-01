{

  event: 'charge.success',

  data: {

    id: 3498050173,

    domain: 'test',

    status: 'success',

    reference: '1706388938895d34v325flrwjwzv3',

    amount: 50000,

    message: null,

    gateway_response: 'Approved',

    paid_at: '2024-01-27T20:55:39.000Z',

    created_at: '2024-01-27T20:55:39.000Z',

    channel: 'dedicated_nuban',

    currency: 'NGN',

    ip_address: null,

    metadata: {

      receiver_account_number: '1238132511',

      receiver_bank: 'Test Bank',

      custom_fields: [Array]

    },

    fees_breakdown: null,

    log: null,

    fees: 500,

    fees_split: null,

    authorization: {

      authorization_code: 'AUTH_ngfo3i79hj',

      bin: '008XXX',

      last4: 'X553',

      exp_month: null,

      exp_year: '2024',

      channel: 'dedicated_nuban',

      card_type: 'transfer',

      bank: null,

      country_code: 'NG',

      brand: 'Managed Account',

      reusable: false,

      signature: null,

      account_name: null,

      sender_country: 'NG',

      sender_bank: null,

      sender_bank_account_number: 'XXXXXX4553',

      receiver_bank_account_number: '1238132511',

      receiver_bank: 'Test Bank'

    },

    customer: {

      id: 156736644,

      first_name: 'Michael',

      last_name: 'Mamman',

      email: 'michaelyak66@gmail.com',

      customer_code: 'CUS_e79l9jdlfile584',

      phone: '2347030034134',

      metadata: {},

      risk_action: 'default',

      international_format_phone: '+2347030034134'

    },

    plan: {},

    subaccount: {},

    split: {},

    order_id: null,

    paidAt: '2024-01-27T20:55:39.000Z',

    requested_amount: 50000,

    pos_transaction_data: null,

    source: null

  }

}


















# import requests
# import json

# # Define the API endpoint
# url = 'https://graph.facebook.com/v18.0/FROM_PHONE_NUMBER_ID/messages'

# # Replace with your actual values
# from_phone_number_id = 'YOUR_FROM_PHONE_NUMBER_ID'
# access_token = 'YOUR_ACCESS_TOKEN'
# phone_number = 'RECIPIENT_PHONE_NUMBER'

# # Define the headers
# headers = {
#     'Authorization': 'Bearer ' + access_token,
#     'Content-Type': 'application/json'
# }

# # Define the request payload
# payload = {
#     "messaging_product": "whatsapp",
#     "recipient_type": "individual",
#     "to": phone_number,
#     "type": "template",
#     "template": {
#         "name": "TEMPLATE_NAME",
#         "language": {
#             "code": "LANGUAGE_AND_LOCALE_CODE"
#         },
#         "components": [
#             {
#                 "type": "header",
#                 "parameters": [
#                     {
#                         "type": "image",
#                         "image": {
#                             "link": "http(s)://URL"
#                         }
#                     }
#                 ]
#             },
#             {
#                 "type": "body",
#                 "parameters": [
#                     {
#                         "type": "text",
#                         "text": "TEXT_STRING"
#                     },
#                     {
#                         "type": "currency",
#                         "currency": {
#                             "fallback_value": "VALUE",
#                             "code": "USD",
#                             "amount_1000": NUMBER
#                         }
#                     },
#                     {
#                         "type": "date_time",
#                         "date_time": {
#                             "fallback_value": "MONTH DAY, YEAR"
#                         }
#                     }
#                 ]
#             },
#             {
#                 "type": "button",
#                 "sub_type": "quick_reply",
#                 "index": "0",
#                 "parameters": [
#                     {
#                         "type": "payload",
#                         "payload": "PAYLOAD"
#                     }
#                 ]
#             },
#             {
#                 "type": "button",
#                 "sub_type": "quick_reply",
#                 "index": "1",
#                 "parameters": [
#                     {
#                         "type": "payload",
#                         "payload": "PAYLOAD"
#                     }
#                 ]
#             }
#         ]
#     }
# }

# # Convert payload to JSON
# data = json.dumps(payload)

# # Make the POST request
# response = requests.post(url, headers=headers, data=data)

# # Print the response
# print(response.status_code)
# print(response.json())









#                 const regex = /^(MTN|GLO|AIRTEL|9MOBILE)\s+(\d+(\.\d+)?)\s*(GB|MB)\s*-\s*₦(\d+)/i;
#                 const priceRegex = /₦(\d+)/;

#                 let match, matchPrice;
                
#                 for (let i = 0; i < history.length; i++) {
#                   match = regex.exec(history[i].messageBody);
#                   matchPrice = priceRegex.exec(history[i].messageBody);
                
#                   if (match && matchPrice) {
#                     // Both match and matchPrice are not null, you can break the loop
#                     break;
#                   }
#                 }
                                

                
#                 console.log("match", match)
#                 console.log("matchprice", matchPrice)
#                 // Check if there is a match and extract the values
#                 const networkName = match ? match[1] : null;
#                 const dataPlan = match ? match[2] : null;
#                 const price = matchPrice ? matchPrice[1] : null; 
#                 const networkAndDataPlan = match ? `${match[1]} ${match[2]}` : null;
#                 console.log('Price without currency symbol:', price);                
#                 console.log('Network Name:', networkName);
#                 console.log('Data Plan:', dataPlan);
#                 console.log('Plan:', networkAndDataPlan);
#                 let networkId
#                 let amount_needed = Math.abs(user.balance - price);

#                 // responseMessage = `pin is correct.`;

#                 // const planNumberRegex = /^(?:[1-9]|[1-9]\d)$/;
#                 // const isValidPlanNumber = planNumberRegex.test(text);

#                 // const inputString = history[1].messageBody;

#  let history = await getLastThreeConversations(senderNumber)
#           let intent1 = history[0].intent;
#           let intent2 = history[1].intent;
#           let intent3 = history[2].intent;
#           console.log(intent1)
#           console.log(intent2)
#           console.log(intent3)
#           let intentpin;
#           let entitypin;
#           const pinRegex = /^\d{4}$/;
#           if (contactEntities ){
#             entitypin = contactEntities[0].value
#           }
#           if (intent){
#             intentpin = text
#           }


#           // console.log(history)


   
#     // Example usage:
#     // const accessToken = "your-access-token"; // Make sure to replace with your actual access token
#     // sendMessage("+123456789", "Hello, World!", "phone_number_id_here", accessToken);
    



# // const sendMessage = async (senderNumber, messageBody, phone_number_id) => {

# //   axios({
# //     method: "POST", // Required, HTTP method, a string, e.g. POST, GET
# //     url:
# //       "https://graph.facebook.com/v12.0/" +
# //       phone_number_id +
# //       "/messages?access_token=" +
# //       token,
# //     data: {
# //       messaging_product: "whatsapp",
# //       to: senderNumber,
# //       text: { body: messageBody },
# //     },
# //     headers: { "Content-Type": "application/json" },
# //   });
# // res.sendStatus(200);

#   // console.log(" ahbi",messageBody);
#   // Send a response back to the user
#   // console.log(senderNumber)
#   // const prefix = "whatsapp";
#   // const number = `${prefix}:${senderNumber}`;
#   // client.messages.create({
#   //   body: messageBody,
#   //   from: whatsappnNumber,
#   //   // to: number,
#   //   to:"whatsapp:+2347030034134" 
#   // })
#   // .then(
#   //   // message => res.status(200).json({message: "OK", response: message})
#   //   )
#   // .catch((error) => {console.log(error);;
#   // });

# // }




#                   // const user = await User.findOne({ phoneNumber: senderNumber });
#                   let history = await getLastThreeConversations(senderNumber)
#                   let intent1 = history[0].messageBody;
#                   let intent2 = history[1].messageBody;
#                   console.log(intent1)
#                   console.log(intent2)
#                   // Define a regular expression to match the network name (MTN, GLO, AIRTEL, or 9MOBILE)
#                   const networkRegex = /^(MTN|GLO|AIRTEL|9MOBILE)\s+/;
                  
#                   // Use the exec method to find the match
#                   const match1 = networkRegex.exec(intent1);
#                   const match2 = networkRegex.exec(intent2);
#                   // Check if there is a match and get the network name
#                   const networkName1 = match1 ? match1[1] : null;
#                   const networkName2 = match2 ? match2[1] : null;

#                   console.log('Network Name:', networkName1);
#                   console.log('Network Name:', networkName2);
#                   let network;
#                   if (networkName1 != null){
#                     network = networkName1;
#                   }else if (networkName2 != null){
#                     network = networkName2
#                   }
        