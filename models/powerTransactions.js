// conversation.model.js
import mongoose from 'mongoose';

const powerTransactionsSchema = new mongoose.Schema({
  senderNumber: {
    type: String,
  },
  package: {
    type: String,
  },
  meter_number: {
    type: String,
  },
  token: {
    type: String,
  },
  amount: {
    type: String,
  },
  customer_name: {
    type: String,
  },
  customer_address: {
    type: String,
  },
  profit: {
    type: Number,
  },
  id: {
    type: String,
  },
},{
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const powerTransactions = mongoose.model('powerTransactions', powerTransactionsSchema);

export default powerTransactions;
