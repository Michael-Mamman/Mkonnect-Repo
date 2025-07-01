// conversation.model.js
import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  receiverNumber: {
    type: String,
    required: true,
    },
  senderNumber: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  intent: {
    type: String,
    required: true,
  },
  network: {
    type: String,
    required: true,
  }
},{
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const plan_select = mongoose.model('plan_select', planSchema);

export default plan_select;
