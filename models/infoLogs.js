// Import Mongoose module
import { Schema } from 'mongoose';
import mongoose from 'mongoose';

// Define the schema for the log collection
const logSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  level: { type: String, required: true },
  message: { type: String, required: true },
  meta: { type: Schema.Types.Mixed } // Can store any type of data
});

// Define and export the model for the 'logs' collection
const info_logs = mongoose.model('info_logs', logSchema);

export default info_logs;