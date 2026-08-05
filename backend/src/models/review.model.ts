import mongoose, { Document, Schema, Types } from 'mongoose';
import { Status } from '../enums/status.enum.js';

export interface ReviewDocument extends Document {
  date: Date;
  reviewerId: Types.ObjectId;
  targetId: Types.ObjectId;
  comment: string;
  status: Status;
}

const reviewSchema: Schema = new Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comment: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.ACTIVE,
  },
});

reviewSchema.index({ targetId: 1, status: 1 });

export const Review = mongoose.model<ReviewDocument>('Review', reviewSchema, 'reviews');
