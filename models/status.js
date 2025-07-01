import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
  status: {
    type: Boolean,
    default: true
  },
  WelcomeBonus: {
    type: Boolean,
    default: true
  },
  vendor: {
    type: String,
    enum: ["karldata", "usufdata"], // Restrict possible values to karldata or usufdata
    default: "karldata" // Set default value to karldata
  }
}, {
  timestamps: true
});

const status = mongoose.model('status', statusSchema);

export default status;
