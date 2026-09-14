import mongoose, { Schema, Document } from 'mongoose';

export interface IDevicePair extends Document {
  pairId: string;
  extensionDeviceId: string;
  mobileDeviceId?: string;
  pairSecret: string;
  status: 'pending' | 'paired' | 'revoked';
  pairedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DevicePairSchema = new Schema(
  {
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
  },
  { timestamps: true }
);

export const DevicePair: any = mongoose.model('DevicePair', DevicePairSchema);
