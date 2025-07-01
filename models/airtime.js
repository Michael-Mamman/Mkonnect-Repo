// conversation.model.js
import mongoose from 'mongoose';

const airtimeSchema = new mongoose.Schema({
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
  airtime_type: {
    type: String,
    required: true,
  },
  profit: {
    type: Number,
  },
  plan_amount: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
},{
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const airtime = mongoose.model('airtime', airtimeSchema);

export default airtime;
