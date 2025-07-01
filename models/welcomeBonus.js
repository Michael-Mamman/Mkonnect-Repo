import mongoose from "mongoose";

const WelcomeBonusSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    unique: true,
    required: true, // Ensures phoneNumber is mandatory
    trim: true,
  },
  amount: {
    type: Number,
    default: 0, // No need for a string default for a Number type
    min: 0, // Prevents negative values
  },
  receivedAt: {
    type: Date,
    default: Date.now, // Automatically sets the timestamp for when the bonus is received
  },
});

const WelcomeBonus = mongoose.model("WelcomeBonus", WelcomeBonusSchema);

export default WelcomeBonus;
