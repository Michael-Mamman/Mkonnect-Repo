// conversation.model.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  senderNumber: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  network: {
    type: String,
    required: true,
  },
  plan_name: {
    type: String,
    required: true,
  },
  plan_amount: {
    type: String,
    required: true,
  },
  profit: {
    type: Number,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },  
  vendor: {
    type: String,
    required: false,
  }
},{
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const transaction = mongoose.model('transaction', transactionSchema);

export default transaction;
