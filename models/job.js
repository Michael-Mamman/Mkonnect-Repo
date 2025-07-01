// Importing Mongoose
import mongoose from 'mongoose';

// Define the schema for the 'jobs' collection
const jobSchema = new mongoose.Schema({
    jobName: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
    },
    messageType: {
        type: String,
    },
    filter: {
        type: String,
    },
    retry: {
        type: Number,
        default: 0
    },
    successful: {
        type: Boolean,
        default: false
    },
    data: {
        type: Object,
        required: true
    }
}, { timestamps: true }); // Enable timestamps to automatically add 'createdAt' and 'updatedAt' fields

// Create the model from the schema
const Job = mongoose.model('Job', jobSchema);

export default Job;
