import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMatchMe extends Document {
  userId: Types.ObjectId;
}

const matchMeSchema: Schema = new mongoose.Schema({
  userId: {
    type: Types.ObjectId,
  },
});

export const MatchMe = mongoose.model<IMatchMe>('MatchMe', matchMeSchema, 'match_me');
