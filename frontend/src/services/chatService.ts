import axios from 'axios';

import API_URL from '@/config/api';

import { resolveApiError } from './apiError';

export type Conversation = {
  partnerId: string;
  username: string;
  avatarPath: string;
  lastMessage: string;
  lastMessageDate: string;
  lastMessageSenderId: string;
};

export type ListConversationsResponse = {
  message: string;
  conversations: Conversation[];
};

export async function listConversations(userId: string): Promise<ListConversationsResponse> {
  try {
    const response = await axios.get<ListConversationsResponse>(`${API_URL}/chats/${userId}`);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export type ChatMessage = {
  chatId: string;
  senderId: string;
  receiverId: string;
  message: string;
  date: string;
};

export type ThreadPartner = {
  userId: string;
  username: string;
  avatarPath: string;
  tagline: string;
};

export type GetThreadFilters = {
  page?: number;
  pageSize?: number;
};

export type GetThreadResponse = {
  message: string;
  partner: ThreadPartner;
  messages: ChatMessage[];
  totalCount: number;
  totalPages: number;
  page: number;
};

export async function getThread(
  userId: string,
  partnerId: string,
  filters: GetThreadFilters = {},
): Promise<GetThreadResponse> {
  try {
    const params: Record<string, number> = {};
    if (filters.page) params.page = filters.page;
    if (filters.pageSize) params.pageSize = filters.pageSize;

    const response = await axios.get<GetThreadResponse>(`${API_URL}/chats/${userId}/${partnerId}`, { params });
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export type SendMessageData = {
  message: string;
};

export type SendMessageResponse = {
  message: string;
  chatId: string;
};

export async function sendMessage(
  senderId: string,
  receiverId: string,
  data: SendMessageData,
): Promise<SendMessageResponse> {
  try {
    const response = await axios.post<SendMessageResponse>(`${API_URL}/chats/${senderId}/${receiverId}`, data);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}
