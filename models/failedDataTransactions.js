// conversation.model.js
import mongoose from 'mongoose';

const failedTransactionSchema = new mongoose.Schema({
  senderNumber: {
    type: String,
  },
  recipient: {
    type: String,
  },
  network: {
    type: String,
  },
  plan_name: {
    type: String,
  },
  plan_amount: {
    type: String,
  },
  payload: {
    type: String,
  },
},{
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const failedTransaction = mongoose.model('failedTransaction', failedTransactionSchema);

export default failedTransaction;
