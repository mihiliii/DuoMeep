import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ChatDocument extends Document {
  date: Date;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
}

const chatSchema: Schema = new Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000,
  },
});

chatSchema.index({ senderId: 1, receiverId: 1, date: -1, _id: -1 });
chatSchema.index({ senderId: 1, date: -1, _id: -1 });
chatSchema.index({ receiverId: 1, date: -1, _id: -1 });

export const Chat = mongoose.model<ChatDocument>('Chat', chatSchema, 'chats');
