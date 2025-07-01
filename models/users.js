import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    unique: true,
    trim: true,
  },
  fullName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (value) {
        // Using a simple regex for email validation
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
      },
      message: props => `${props.value} is not a valid email address!`,
    },
  },
  transactionPin: {
    type: String,
    minlength: 4,
    maxlength: 4,
    trim: true,
  },
  balance: {
    type: String,
    default: '0',
    trim: true,
  },
  balanceHistory: {
    type: String,
    default: '0',
    trim: true,
  },
  paystackId: {
    type: String,
    default: '',
    trim: true,
  },
  accountNumber: {
    type: String,
    default: '',
    trim: true,
  },
  accountName: {
    type: String,
    default: '',
    trim: true,
  },
  bank: {
    type: String,
    default: '',
    trim: true,
  },
  consent: {
    type: Boolean,
    default: true,
    trim: true,
  },
  message: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});



// Define pre-save middleware
userSchema.pre('save', function(next) {
  // Concatenate phoneNumber with a string and save it to concatenatedPhoneNumber
  this.message = `https://wa.me/${this.phoneNumber}`;
  next();
});



const User = mongoose.model('User', userSchema);

export default User;
