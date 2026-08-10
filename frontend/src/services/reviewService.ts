import axios from 'axios';
import API_URL from '../config/api';
import { resolveApiError } from './apiError';

export type CreateReviewData = {
  comment: string;
};

export type CreateReviewResponse = {
  message: string;
  reviewId: string;
};

export async function createReview(
  reviewerId: string,
  targetId: string,
  data: CreateReviewData,
): Promise<CreateReviewResponse> {
  try {
    const response = await axios.post<CreateReviewResponse>(`${API_URL}/reviews/${reviewerId}/${targetId}`, data);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export async function deleteReview(reviewerId: string, reviewId: string): Promise<void> {
  try {
    await axios.delete(`${API_URL}/reviews/${reviewerId}/${reviewId}`);
  } catch (err) {
    resolveApiError(err);
  }
}

export type Review = {
  reviewId: string;
  reviewerId: string;
  username: string;
  avatarPath: string;
  comment: string;
  date: string;
};

export type ListReviewsFilters = {
  page?: number;
  pageSize?: number;
};

export type ListReviewsResponse = {
  message: string;
  reviews: Review[];
  totalCount: number;
  totalPages: number;
  page: number;
};

export async function listReviews(targetId: string, filters: ListReviewsFilters = {}): Promise<ListReviewsResponse> {
  try {
    const params: Record<string, number> = {};
    if (filters.page) params.page = filters.page;
    if (filters.pageSize) params.pageSize = filters.pageSize;

    const response = await axios.get<ListReviewsResponse>(`${API_URL}/reviews/${targetId}`, { params });
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export type AdminReview = {
  reviewId: string;
  reviewerId: string;
  reviewerUsername: string;
  reviewerAvatarPath: string;
  targetId: string;
  targetUsername: string;
  targetAvatarPath: string;
  comment: string;
  date: string;
};

export type ListAllReviewsResponse = {
  message: string;
  reviews: AdminReview[];
  totalCount: number;
  totalPages: number;
  page: number;
};

export type ListAllReviewsFilters = {
  reviewer?: string;
  target?: string;
  comment?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
};

export async function listAllReviews(filters: ListAllReviewsFilters = {}): Promise<ListAllReviewsResponse> {
  try {
    const params: Record<string, string | number> = {};
    if (filters.reviewer) params.reviewer = filters.reviewer;
    if (filters.target) params.target = filters.target;
    if (filters.comment) params.comment = filters.comment;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.page) params.page = filters.page;
    if (filters.pageSize) params.pageSize = filters.pageSize;

    const response = await axios.get<ListAllReviewsResponse>(`${API_URL}/reviews`, { params });
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

export async function deleteReviewAsAdmin(reviewId: string): Promise<void> {
  try {
    await axios.delete(`${API_URL}/reviews/${reviewId}`);
  } catch (err) {
    resolveApiError(err);
  }
}
