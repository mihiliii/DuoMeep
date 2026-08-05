import axios from 'axios';
import API_URL from '../config/api';
import { resolveApiError } from './apiError';

export type CreateReviewData = {
  comment: string;
};

export type UpdateReviewData = Partial<CreateReviewData>;

export type CreateReviewResponse = {
  message: string;
  reviewId: string;
};

export type ReviewResponse = {
  message: string;
  _id: string;
  date: string;
  reviewerId: string;
  targetId: string;
  comment: string;
  status: string;
};

/**
 * Creates a review from the given reviewer for the given target user.
 *
 * @param reviewerId - The reviewer's user ID
 * @param targetId - The reviewed user's ID
 * @param data - `CreateReviewData` containing the comment
 * @returns `CreateReviewResponse` containing the new `reviewId`
 * @throws if the target user doesn't exist, or a review already exists for this pair
 */
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

/**
 * Fetches the review left by the given reviewer for the given target user.
 *
 * @param reviewerId - The reviewer's user ID
 * @param targetId - The reviewed user's ID
 * @returns `ReviewResponse` containing the review's comment and status
 * @throws if no review exists for this pair
 */
export async function getReview(reviewerId: string, targetId: string): Promise<ReviewResponse> {
  try {
    const response = await axios.get<ReviewResponse>(`${API_URL}/reviews/${reviewerId}/${targetId}`);
    return response.data;
  } catch (err) {
    resolveApiError(err);
  }
}

/**
 * Updates the review left by the given reviewer for the given target user.
 *
 * @param reviewerId - The reviewer's user ID
 * @param targetId - The reviewed user's ID
 * @param data - Partial `UpdateReviewData` fields to update
 * @throws if no review exists for this pair
 */
export async function updateReview(reviewerId: string, targetId: string, data: UpdateReviewData): Promise<void> {
  try {
    await axios.put(`${API_URL}/reviews/${reviewerId}/${targetId}`, data);
  } catch (err) {
    resolveApiError(err);
  }
}

/**
 * Deletes (soft-deletes) the review left by the given reviewer for the given target user.
 *
 * @param reviewerId - The reviewer's user ID
 * @param targetId - The reviewed user's ID
 * @throws if no review exists for this pair
 */
export async function deleteReview(reviewerId: string, targetId: string): Promise<void> {
  try {
    await axios.delete(`${API_URL}/reviews/${reviewerId}/${targetId}`);
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

/**
 * Fetches a paginated list of active reviews for the given target user.
 *
 * @param targetId - The reviewed user's ID
 * @param filters - `ListReviewsFilters` for page and pageSize
 * @returns `ListReviewsResponse` containing the matching `reviews` and pagination info
 */
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
