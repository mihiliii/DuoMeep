import mongoose, { Document, Schema } from 'mongoose';

export interface AdminDocument extends Document {
  username: string;
  password: string;
}

const adminSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

export const Admin = mongoose.model<AdminDocument>('Admin', adminSchema, 'admins');
