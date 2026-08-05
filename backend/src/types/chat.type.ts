import type { Types } from 'mongoose';

export interface ConversationRow {
  partnerId: Types.ObjectId;
  username: string;
  avatarPath: string;
  lastMessageId: Types.ObjectId;
  lastMessage: string;
  lastMessageDate: Date;
  lastMessageSenderId: Types.ObjectId;
}
