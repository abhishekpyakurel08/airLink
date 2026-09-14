import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  pairId: string;
  senderRole: 'extension' | 'mobile';
  actionType: string;
  payload?: any;
  timestamp: Date;
}

const ActivityLogSchema = new Schema({
  pairId: { type: String, required: true, index: true },
  senderRole: { type: String, required: true, enum: ['extension', 'mobile'] },
  actionType: { type: String, required: true },
  payload: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

export const ActivityLog: any = mongoose.model('ActivityLog', ActivityLogSchema);
