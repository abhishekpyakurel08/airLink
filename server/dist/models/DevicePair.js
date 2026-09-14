import mongoose, { Schema } from 'mongoose';
const DevicePairSchema = new Schema({
    pairId: { type: String, required: true, unique: true, index: true },
    extensionDeviceId: { type: String, required: true },
    mobileDeviceId: { type: String },
    pairSecret: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'paired', 'revoked'],
        default: 'pending'
    },
    pairedAt: { type: Date }
}, { timestamps: true });
export const DevicePair = mongoose.model('DevicePair', DevicePairSchema);
