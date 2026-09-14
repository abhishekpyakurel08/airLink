import mongoose, { Schema } from 'mongoose';
const ActivityLogSchema = new Schema({
    pairId: { type: String, required: true, index: true },
    senderRole: { type: String, required: true, enum: ['extension', 'mobile'] },
    actionType: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
});
export const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
