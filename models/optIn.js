// conversation.model.js
import mongoose from 'mongoose';

const optin = new mongoose.Schema({
  optin: {
    type: Boolean,
    required: true,
    },
  senderNumber: {
    type: String,
    required: true,
  }
},{
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const opt_status = mongoose.model('opt_status', optin);

export default opt_status;
