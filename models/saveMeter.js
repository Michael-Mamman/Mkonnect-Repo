import mongoose from 'mongoose';

const saveMeterSchema = new mongoose.Schema({
    senderNumber: {
        type: String,
        required: true,
    },
    meterNumber: {
        type: String,
    },
    meterName: {
        type: String,
    },
    meterAddress: {
        type: String,
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const saveMeter = mongoose.model('saveMeter', saveMeterSchema);

export default saveMeter;
