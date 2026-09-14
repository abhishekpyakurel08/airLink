import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    avatar_url: { type: String },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' }
  },
  { timestamps: true }
);

export const User: any = mongoose.model('User', UserSchema);
