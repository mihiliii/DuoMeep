import type { Request, Response } from 'express';

import { ChatService } from '../services/chat.service.js';
import { HTTP_Status } from '../utils/enums/httpStatus.enum.js';
import { AppError } from '../utils/errors/errors.js';
import {
  createChatValidator,
  listThreadValidator,
  type CreateChatData,
  type ListThreadQuery,
} from '../utils/validators/chat.validator.js';
import { zodParseData } from '../utils/helpers/zod.util.js';

export class ChatController {
  private chatService = new ChatService();

  async createChat(req: Request, res: Response): Promise<void> {
    if (!req.params.senderId || !req.params.receiverId) {
      throw new AppError('Sender Id and Receiver Id parameters are required.', HTTP_Status.BAD_REQUEST);
    }

    const data: CreateChatData = zodParseData(createChatValidator, req.body);

    const response: { chatId: string } = await this.chatService.createChat(
      req.params.senderId,
      req.params.receiverId,
      data,
    );

    res.status(HTTP_Status.CREATED).json({ message: 'OK', ...response });
  }

  async listConversations(req: Request, res: Response): Promise<void> {
    if (!req.params.userId) {
      throw new AppError('User Id parameter is required.', HTTP_Status.BAD_REQUEST);
    }

    const { conversations } = await this.chatService.listConversations(req.params.userId);

    const response = conversations.map((conversation) => ({
      partnerId: conversation.partnerId.toString(),
      username: conversation.username,
      avatarPath: `${req.protocol}://${req.get('host')}/${conversation.avatarPath}`,
      lastMessage: conversation.lastMessage,
      lastMessageDate: conversation.lastMessageDate,
      lastMessageSenderId: conversation.lastMessageSenderId.toString(),
    }));

    res.status(HTTP_Status.OK).json({ message: 'OK', conversations: response });
  }

  async listThread(req: Request, res: Response): Promise<void> {
    if (!req.params.userId || !req.params.partnerId) {
      throw new AppError('User Id and Partner Id parameters are required.', HTTP_Status.BAD_REQUEST);
    }

    const query: ListThreadQuery = zodParseData(listThreadValidator, req.query);

    const { partner, messages, totalCount } = await this.chatService.listThread(
      req.params.userId,
      req.params.partnerId,
      query.page,
      query.pageSize,
    );

    const response = messages
      .map((chat) => {
        const { senderId, receiverId, message } = chat.toObject();

        return {
          chatId: chat._id.toString(),
          senderId: senderId.toString(),
          receiverId: receiverId.toString(),
          message,
          date: chat.dateCreated,
        };
      })
      .reverse();

    res.status(HTTP_Status.OK).json({
      message: 'OK',
      partner: {
        userId: partner._id.toString(),
        username: partner.username,
        avatarPath: `${req.protocol}://${req.get('host')}/${partner.avatarPath}`,
        tagline: partner.tagline,
      },
      messages: response,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / query.pageSize)),
      page: query.page,
    });
  }
}
