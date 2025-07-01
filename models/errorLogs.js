// Import Mongoose module
import { Schema, model } from 'mongoose';
import mongoose from 'mongoose';

// Define the schema for the log collection
const logSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  level: { type: String, required: true },
  message: { type: String, required: true },
  meta: { type: Schema.Types.Mixed } // Can store any type of data
});

// Define and export the model for the 'logs' collection
const error_logs = mongoose.model('error_logs', logSchema);

export default error_logs;