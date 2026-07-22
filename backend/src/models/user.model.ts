import mongoose, { Document, Schema } from 'mongoose';
import { Status } from '../enums/status.enum.js';

const defaultImagePath = 'public/images/avatar_default.png';

export interface UserInfo {
  username: string;
  avatarPath: string;
}

export interface UserDashboard {
  bio: string;
  tagline: string;
  banner: string;
}

export interface UserAuthInfo {
  email: string;
  password: string;
}

export interface UserDocument extends Document {
  username: string;
  avatarPath: string;
  authInfo: UserAuthInfo;
  dashboard: UserDashboard;
  status: Status;
}

const userSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    maxlength: 24,
  },
  avatarPath: {
    type: String,
    default: defaultImagePath,
  },
  authInfo: {
    email: { type: String, required: true, unique: true, select: false },
    password: { type: String, required: true, select: false },
  },
  dashboard: {
    bio: { type: String, default: '' },
    tagline: { type: String, default: '' },
    banner: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.ACTIVE,
  },
});

export const User = mongoose.model<UserDocument>('User', userSchema, 'users');
