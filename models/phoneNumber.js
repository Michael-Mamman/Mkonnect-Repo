import mongoose from 'mongoose';

const number = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: true,
    },
  WaId: {
    type: String,
    required: true,
  }
},{
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const phoneNumber = mongoose.model('phoneNumber', number);

export default phoneNumber;
