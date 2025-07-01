import mongoose from 'mongoose';

const powerSchema = new mongoose.Schema({
    senderNumber: {
        type: String,
    },
    meterNumber: {
        type: String,
    },
    amount: {
        type: String,
    },
    discoName: {
        type: String,
    },
    pin: {
        type: String,
    },
    meterName: {
        type: String,
    },
    meterAddress: {
        type: String,
    },
    profit: {
        type: Number,
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const power = mongoose.model('power', powerSchema);

export default power;
