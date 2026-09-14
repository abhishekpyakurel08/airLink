import mongoose, { Schema } from 'mongoose';

const DeviceSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['PHONE', 'BROWSER', 'DESKTOP'] },
    platform: { type: String, required: true },
    last_seen: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Device: any = mongoose.model('Device', DeviceSchema);
