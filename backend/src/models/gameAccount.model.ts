import mongoose, { Document, Schema, Types } from 'mongoose';

import { Rank, Region } from '../utils/enums/account.enum.js';
import { Status } from '../utils/enums/status.enum.js';

export interface GameAccountDocument extends Document {
  name: string;
  region: Region;
  rank: Rank;
  userId: Types.ObjectId;
  status: Status;
  dateCreated: Date;
}

const gameAccountSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    enum: Object.values(Region),
    required: true,
  },
  rank: {
    type: String,
    enum: Object.values(Rank),
    default: Rank.UNRANKED,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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

gameAccountSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { status: Status.ACTIVE } });

export const GameAccount = mongoose.model<GameAccountDocument>('GameAccount', gameAccountSchema, 'game_accounts');
