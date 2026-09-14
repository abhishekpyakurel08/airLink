import mongoose, { Schema } from 'mongoose';

const SessionSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    device_a: { type: String, required: true },
    device_b: { type: String, required: true },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    expires_at: { type: Date }
  },
  { timestamps: true }
);

export const Session: any = mongoose.model('Session', SessionSchema);
