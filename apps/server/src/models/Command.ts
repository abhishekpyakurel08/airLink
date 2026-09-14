import mongoose, { Schema } from 'mongoose';

const CommandSchema = new Schema(
  {
    session_id: { type: String, required: true, index: true },
    device_id: { type: String, required: true },
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const Command: any = mongoose.model('Command', CommandSchema);
