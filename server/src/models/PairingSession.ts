import mongoose, { Schema } from 'mongoose';

const PairingSessionSchema = new Schema(
  {
    code_hash: { type: String, required: true, index: true },
    initiator_device: { type: String, required: true },
    target_device: { type: String },
    status: { type: String, enum: ['pending', 'paired', 'expired'], default: 'pending' },
    expires_at: { type: Date, required: true }
  },
  { timestamps: true }
);

export const PairingSession: any = mongoose.model('PairingSession', PairingSessionSchema);
