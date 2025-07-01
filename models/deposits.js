// conversation.model.js
import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema({
   phoneNumber: {
    type: String,
    required: true,
    },
    email: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  }
},{
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const deposite = mongoose.model('deposite', depositSchema);

export default deposite;
