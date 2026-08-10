import mongoose, { Document, Schema, Types } from 'mongoose';

import { Role } from '../enums/account.enum.js';
import { Status } from '../enums/status.enum.js';

export interface MatchMeDocument extends Document {
  userId: Types.ObjectId;
  accountId: Types.ObjectId;
  roles: Role[];
  description: string;
  status: Status;
  dateCreated: Date;
}

const matchMeSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  accountId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'GameAccount',
  },
  roles: {
    type: [String],
    enum: Object.values(Role),
    default: [Role.FILL],
    validate: {
      validator: function (roles: string[]) {
        return roles.length > 0 && roles.length <= 2;
      },
      message: 'Invalid number of roles.',
    },
  },
  description: {
    type: String,
    default: '',
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

matchMeSchema.index({ status: 1, dateCreated: -1 });

export const MatchMe = mongoose.model<MatchMeDocument>('MatchMe', matchMeSchema, 'match_me');
