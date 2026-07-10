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

const dashboardSchema = new Schema(
  {
    bio: { type: String, default: '' },
    tagline: { type: String, default: '' },
    banner: { type: String, default: '' },
  },
  { _id: false },
);

const authInfoSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { _id: false },
);

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
    type: authInfoSchema,
    required: true,
    select: false,
  },
  dashboard: {
    type: dashboardSchema,
    default: function () {
      return {};
    },
  },
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.ACTIVE,
  },
});

export const User = mongoose.model<UserDocument>('User', userSchema, 'users');
