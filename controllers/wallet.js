import Deposite from '../models/deposits.js';
import User from '../models/users.js';
import { saveConversation, sendFlowMessageEndpoint, sendMessage, sendTemplateMessage } from './utils/utils.js';
import logger from './logs.js';
import dotenv from 'dotenv';
import phoneNumber from '../models/phoneNumber.js';
import WelcomeBonus from '../models/welcomeBonus.js';
import Welcomestatus from '../models/status.js';
dotenv.config();
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID

export const wallet = async (req, res) => {
    try {
        const eventData = req.body.data; // Assuming the webhook payload is in req.body.data

        // Extract relevant data from the webhook payload
        let { customer, amount, status } = eventData;
        let { phone, email } = customer;
        amount = amount / 100
        let transactionFee = amount * 0.01 // 1% transaction fee
        amount = amount - transactionFee

        // if(amount > 1000){
        //     amount = amount - 20
        // }else{
        //     amount = amount - 10
        // } 

        let internationalFormat = '234' + phone.slice(1);        
        // Update user's account balance based on the payment status
        const findUser = await User.findOne({ email: email });
        let id = await phoneNumber.findOne({user: findUser.phoneNumber})
        if (id && id.WaId){
            id = id.WaId
        }else{
         id = PHONE_NUMBER_ID
        }
        if (status === 'success' && req.body.event === 'charge.success') {
            // Create a transaction record (optional)
            const transaction = new Deposite({
                phoneNumber: phone,
                email: email,
                amount: amount,
                status: status,
            });
            await transaction.save();
            
            if (findUser) {
                let newBalance = parseFloat(findUser.balance) + parseFloat(amount);
                let newBalanceH = parseFloat(findUser.balanceHistory) + parseFloat(amount);

                const user = await User.findOneAndUpdate({ email: email }, { $set: { balance: newBalance.toString(), balanceHistory: newBalanceH.toString() }  }, { new: true });

                
                const responseMessage = `Hey ${findUser.fullName.split(" ")[0]}! 🎉 Great news! Your deposit of ₦${amount} has been successfully processed! \n🚀 Your account is now boosted with an updated balance of ₦${user.balance}. Note that a transaction fee of 1% has been removed. \n💰 Got questions or just want to chat? We're here for you anytime! 😊 \n\nHappy spending! 🌟`
                
                const msg = await sendMessage(findUser.phoneNumber, responseMessage, id);

                // Apply the welcome bonus if eligible
                let sys_status = await Welcomestatus.find()
                sys_status = sys_status[0].WelcomeBonus

                if(sys_status){

                    await applyWelcomeBonus(user, findUser, id);

                }

                await sendFlowMessageEndpoint(
                    findUser.phoneNumber,
                    `menu_flow_${findUser.phoneNumber}`,
                    "1051816780241701",
                    id,
                    `‎\nWhat would you like to do today? 🥳 \n‎`,
                    "Menu",
                    "MENU"
                  ) 
                const saveConvo = await saveConversation(findUser.phoneNumber, "deposit_successful", "deposit", responseMessage);
                res.sendStatus(200);

                
            } else {
                logger.error(JSON.stringify(eventData));
            }
        } else {
            const responseMessage = `Oh no! 😔 \nWe're sorry to inform you that your deposit of ₦${amount} couldn't be processed at this time. Please double-check your payment details and try again. If you continue to experience issues, feel free to reach out to our support team for assistance. \nWe're here to help you get back on track! 💪`
            const msg = await sendMessage(findUser.phoneNumber, responseMessage, id);
            const saveConvo = await saveConversation(findUser.phoneNumber, "deposit_fail", "deposit", responseMessage);
        }
    } catch (error) {
        logger.error(`Error processing webhook:${error.stack}`);
        res.status(200).send('Internal Server Error');
    }
}






const applyWelcomeBonus = async (user, findUser, id) => {
  try {
    // Check if the user has already received the welcome bonus
    const existingBonus = await WelcomeBonus.findOne({ phoneNumber: user.phoneNumber });

    if (existingBonus) {
      logger.info(`User ${user.email} has already received the welcome bonus.`);
      return; // Exit if the user has already received the bonus
    }

    // Check if the user is eligible based on balance history
    if (parseFloat(findUser.balanceHistory) === 0) {
      const bonusAmount = 150;

      // Add the bonus to the user's balance
      let updatedBalance = parseFloat(user.balance) + bonusAmount;

      // Update the user's wallet in the database
      await User.findOneAndUpdate(
        { email: user.email },
        { $set: { balance: updatedBalance.toString() } },
        { new: true }
      );

      // Save the welcome bonus record to prevent duplication
      const bonusRecord = new WelcomeBonus({
        phoneNumber: user.phoneNumber,
        amount: bonusAmount,
      });
      await bonusRecord.save();

      // Notify the user about their welcome bonus
      const bonusMessage = `🎉 Welcome bonus unlocked! 🎁 We've added ₦${bonusAmount} to your wallet. Use it to get 500MB of data! 🚀\n\nYour current balance is ₦${updatedBalance} 🌟`;
      await sendMessage(user.phoneNumber, bonusMessage, id);

      // Log the action
      logger.info(`Welcome bonus of ₦${bonusAmount} applied to user ${user.email}.`);
    } else {
      logger.info(`User ${user.email} is not eligible for the welcome bonus.`);
    }
  } catch (error) {
    logger.error(`Error applying welcome bonus: ${error.stack}`);
    throw error;
  }
};


