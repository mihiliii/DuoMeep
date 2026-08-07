import { Types, type PipelineStage } from 'mongoose';
import { AppError } from '../errors/errors.js';
import { HTTP_Status } from '../enums/httpStatus.enum.js';
import { Status } from '../enums/status.enum.js';
import { User, type UserDocument } from '../models/user.model.js';
import { Chat, type ChatDocument } from '../models/chat.model.js';
import type { ConversationRow } from '../types/chat.type.js';
import type { CreateChatData } from '../validators/chat.validator.js';

export class ChatService {
  async createChat(senderId: string, receiverId: string, data: CreateChatData): Promise<{ chatId: string }> {
    const { message }: CreateChatData = data;

    if (senderId === receiverId) {
      throw new AppError('Cannot message yourself.', HTTP_Status.BAD_REQUEST);
    }

    this.toObjectId(senderId);
    this.toObjectId(receiverId);

    const [sender, receiver]: [UserDocument | null, UserDocument | null] = await Promise.all([
      User.findOne({ _id: senderId, status: Status.ACTIVE }),
      User.findOne({ _id: receiverId, status: Status.ACTIVE }),
    ]);

    if (!sender) {
      throw new AppError('User id (' + senderId + ') not found.', HTTP_Status.NOT_FOUND);
    }

    if (!receiver) {
      throw new AppError('User id (' + receiverId + ') not found.', HTTP_Status.NOT_FOUND);
    }

    const newChat: ChatDocument = await Chat.create({ senderId, receiverId, message });

    if (!newChat) {
      throw new AppError('Failed to create Chat.', HTTP_Status.INTERNAL_SERVER_ERROR);
    }

    return { chatId: newChat._id.toString() };
  }

  async listThread(
    userId: string,
    partnerId: string,
    page: number,
    pageSize: number,
  ): Promise<{ partner: UserDocument; messages: ChatDocument[]; totalCount: number }> {
    if (userId === partnerId) {
      throw new AppError('Cannot message yourself.', HTTP_Status.BAD_REQUEST);
    }

    this.toObjectId(userId);
    this.toObjectId(partnerId);

    const partner: UserDocument | null = await User.findOne({ _id: partnerId, status: Status.ACTIVE });

    if (!partner) {
      throw new AppError('User id (' + partnerId + ') not found.', HTTP_Status.NOT_FOUND);
    }

    const filter: Record<string, unknown> = {
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    };

    const [messages, totalCount]: [ChatDocument[], number] = await Promise.all([
      Chat.find(filter)
        .sort({ dateCreated: -1, _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      Chat.countDocuments(filter),
    ]);

    return { partner, messages, totalCount };
  }

  async listConversations(userId: string): Promise<{ conversations: ConversationRow[] }> {
    const actorId: Types.ObjectId = this.toObjectId(userId);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          $or: [{ senderId: actorId }, { receiverId: actorId }],
        },
      },

      { $sort: { dateCreated: -1, _id: -1 } },

      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$senderId', actorId] }, '$receiverId', '$senderId'],
          },
          lastMessageId: { $first: '$_id' },
          lastMessage: { $first: '$message' },
          lastMessageDate: { $first: '$dateCreated' },
          lastMessageSenderId: { $first: '$senderId' },
        },
      },

      // The $project is required: aggregation bypasses Mongoose `select: false`, so a bare $lookup
      // would pull authInfo.email and the password hash into the response.
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'partner',
          pipeline: [{ $match: { status: Status.ACTIVE } }, { $project: { _id: 1, username: 1, avatarPath: 1 } }],
        },
      },

      { $unwind: '$partner' },

      {
        $project: {
          _id: 0,
          partnerId: '$_id',
          username: '$partner.username',
          avatarPath: '$partner.avatarPath',
          lastMessageId: 1,
          lastMessage: 1,
          lastMessageDate: 1,
          lastMessageSenderId: 1,
        },
      },

      { $sort: { lastMessageDate: -1, lastMessageId: -1 } },
    ];

    const conversations: ConversationRow[] = await Chat.aggregate<ConversationRow>(pipeline);

    return { conversations };
  }

  private toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('User id (' + id + ') is invalid.', HTTP_Status.BAD_REQUEST);
    }

    return new Types.ObjectId(id);
  }
}
