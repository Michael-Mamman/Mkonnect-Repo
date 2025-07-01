// conversation.model.js
import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  senderNumber: {
    type: String,
    required: true,
  },
  intent: {
    type: String,
    required: true,
  },
  messageBody: {
    type: String,
    required: true,
  },
  responseMessage: {
    type: String,
  },
},{
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
