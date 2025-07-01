import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    trim: true,
  },

  email: {
    type: String,
    trim: true,
  },
 
  accountNumberWema: {
    type: String,
    default: '',
    trim: true,
  },
  accountNameWema: {
    type: String,
    default: '',
    trim: true,
  },
  bankWema: {
    type: String,
    default: '',
    trim: true,
  },
  accountNumberPaystack: {
    type: String,
    default: '',
    trim: true,
  },
  accountNamePaystack: {
    type: String,
    default: '',
    trim: true,
  },
  bankPaystack: {
    type: String,
    default: '',
    trim: true,
  },
}, {
  timestamps: true,
});



const BankDetails = mongoose.model('BankDetails', userSchema);

export default BankDetails;
