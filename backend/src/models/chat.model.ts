import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ChatDocument extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
  dateCreated: Date;
}

const chatSchema: Schema = new Schema({
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
  dateCreated: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

export const Chat = mongoose.model<ChatDocument>('Chat', chatSchema, 'chats');
