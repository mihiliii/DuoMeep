import mongoose, { Document, Schema } from 'mongoose';

import { Status } from '../utils/enums/status.enum.js';
import type { UserAuthInfo, UserDashboard } from '../utils/types/user.type.js';

const defaultImagePath = 'public/images/avatar_default.png';

export interface UserDocument extends Document {
  username: string;
  avatarPath: string;
  authInfo: UserAuthInfo;
  dashboard: UserDashboard;
  status: Status;
  dateCreated: Date;
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
  dateCreated: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

export const User = mongoose.model<UserDocument>('User', userSchema, 'users');
