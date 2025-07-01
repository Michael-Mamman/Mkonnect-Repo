// conversation.model.js
import mongoose from 'mongoose';

const pendingPowerTransactionsSchema = new mongoose.Schema({
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
  status: {
    type: String,
  },
},{
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const pendingPowerTransactions = mongoose.model('pendingPowerTransactions', pendingPowerTransactionsSchema);

export default pendingPowerTransactions;
