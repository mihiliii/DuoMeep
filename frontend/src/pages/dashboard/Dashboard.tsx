import './Dashboard.css';

import { MessageCircle as MessageCircleIcon, Settings as SettingsIcon } from 'lucide-react';
import { useContext, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import PaginationBar from '@/components/pagination-bar/PaginationBar';
import { SessionContext, type SessionContextType } from '@/context/SessionContext';
import { ApiError } from '@/services/apiError';
import { getGameAccountByUserId, type GameAccount } from '@/services/gameAccountService';
import { createReview, deleteReview, listReviews, type Review } from '@/services/reviewService';
import { getDashboard, getUserInfo, type UserProfile } from '@/services/userService';

const REVIEW_PAGE_SIZE = 20;
const REVIEW_COMMENT_MAX_LENGTH = 2000;

export default function Dashboard() {
  const params: { userId?: string } = useParams();
  const session: SessionContextType = useContext(SessionContext);
  const [dashboard, setDashboard] = useState<UserProfile | null>(null);
  const [gameAccount, setGameAccount] = useState<GameAccount | null>(null);
  const [ownerAvatarPath, setOwnerAvatarPath] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPage, setReviewsPage] = useState<number>(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState<number>(1);
  const [reviewsPageSize, setReviewsPageSize] = useState<number>(REVIEW_PAGE_SIZE);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewFormError, setReviewFormError] = useState<string | null>(null);

  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isPageError, setIsPageError] = useState<boolean>(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  const isOwnerProfile: boolean = session.userId === params.userId;

  useEffect(() => {
    const fetchDashboard = async (): Promise<void> => {
      try {
        if (!params.userId) {
          throw new Error('User ID is required in URL params.');
        }

        const [data, account]: [UserProfile, GameAccount | null] = await Promise.all([
          getDashboard(params.userId),
          getGameAccountByUserId(params.userId).catch((err: unknown) => {
            if (err instanceof ApiError && err.statusCode === 404) return null;
            throw err;
          }),
        ]);
        setDashboard(data);
        setGameAccount(account);
        setIsPageLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setIsPageError(true);
      }
    };
    fetchDashboard();
  }, [params.userId]);

  useEffect(() => {
    const fetchReviews = async (): Promise<void> => {
      if (!params.userId) return;

      try {
        const data = await listReviews(params.userId, { page: 1, pageSize: reviewsPageSize });
        setReviews(data.reviews);
        setReviewsPage(1);
        setReviewsTotalPages(data.totalPages);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    fetchReviews();
  }, [params.userId, reviewsPageSize]);

  useEffect(() => {
    const fetchOwnerAvatar = async (): Promise<void> => {
      if (!session.userId) {
        setOwnerAvatarPath(null);
        return;
      }

      try {
        const info = await getUserInfo(session.userId);
        setOwnerAvatarPath(info.avatarPath);
      } catch (err) {
        console.error('Error fetching my avatar:', err);
      }
    };
    fetchOwnerAvatar();
  }, [session.userId]);

  function handleReviewsPageSizeChange(size: number): void {
    setReviewsPageSize(size);
  }

  async function refreshReviews(): Promise<void> {
    if (!params.userId) return;

    const data = await listReviews(params.userId, { page: 1, pageSize: reviewsPageSize });
    setReviews(data.reviews);
    setReviewsPage(1);
    setReviewsTotalPages(data.totalPages);
  }

  async function handleGoToReviewsPage(page: number): Promise<void> {
    if (!params.userId || page === reviewsPage) return;

    const data = await listReviews(params.userId, { page, pageSize: reviewsPageSize });
    setReviews(data.reviews);
    setReviewsPage(page);
    setReviewsTotalPages(data.totalPages);
  }

  async function handleSubmitReview(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!session.userId || !params.userId) return;

    setIsSubmittingReview(true);
    setReviewFormError(null);
    try {
      await createReview(session.userId, params.userId, { comment: reviewComment });
      setReviewComment('');
      await refreshReviews();
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewFormError(err instanceof ApiError ? err.message : 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  }

  async function handleDeleteReview(reviewId: string): Promise<void> {
    if (!session.userId) return;

    setIsSubmittingReview(true);
    setReviewFormError(null);
    try {
      await deleteReview(session.userId, reviewId);
      await refreshReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      setReviewFormError(err instanceof ApiError ? err.message : 'Failed to delete review.');
    } finally {
      setIsSubmittingReview(false);
    }
  }

  if (isPageLoading) return <div></div>;
  if (isPageError) return <div>Error loading user info, check console for more info.</div>;

  return (
    <div className="dash page">
      <main className="dash-grid">
        <div className="card profile">
          <div
            className="profile-banner"
            style={
              dashboard?.dashboard.banner
                ? { backgroundImage: `url(${dashboard.dashboard.banner})` }
                : { backgroundColor: '#d0d0d0' }
            }
          />
          <div className="profile-body">
            <div className="profile-top">
              <div className="profile-identity">
                <img className="profile-avatar avatar" src={dashboard?.userInfo.avatarPath} alt="Avatar" />
                <div className="profile-top-names stack">
                  <div className="profile-top-username">
                    <span>{dashboard?.userInfo.username}</span>
                  </div>
                  <div className="profile-top-tagline">
                    <span>{dashboard?.dashboard.tagline}</span>
                  </div>
                </div>
              </div>
              <div className="profile-actions">
                {isOwnerProfile && (
                  <Link className="btn profile-action" to={`/settings/${params.userId}`}>
                    <SettingsIcon className="profile-action-icon" />
                    Settings
                  </Link>
                )}
                {!isOwnerProfile && (
                  <Link className="btn profile-action" to={`/messages/${params.userId}`}>
                    <MessageCircleIcon className="profile-action-icon" />
                    Message
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="card about-card">
          <h3 className="card-title">Game account</h3>
          {gameAccount ? (
            <div className="game-account-info">
              <img
                className="game-account-rank-icon"
                src={`/Season_2023_-_${gameAccount.rank}.webp`}
                alt={gameAccount.rank}
              />
              <div className="game-account-details stack">
                <div className="game-account-name">{gameAccount.name}</div>
                <div className="game-account-rank-text">
                  {gameAccount.rank} · {gameAccount.region}
                </div>
              </div>
            </div>
          ) : (
            <p className="muted">No game account linked yet.</p>
          )}
          {dashboard?.dashboard.bio && (
            <>
              <h3 className="card-title">Bio</h3>
              <p className="bio">{dashboard.dashboard.bio}</p>
            </>
          )}
        </div>
        <div className="card">
          <h3 className="card-title">Reviews</h3>
          {!isOwnerProfile && (
            <form className="review-form" onSubmit={handleSubmitReview}>
              {ownerAvatarPath && <img className="review-avatar avatar" src={ownerAvatarPath} alt="Your avatar" />}
              <div className="review-form-fields stack">
                <textarea
                  className="review-comment-input"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Write a review..."
                  maxLength={REVIEW_COMMENT_MAX_LENGTH}
                  required
                />
                {reviewComment && (
                  <div className="review-form-buttons">
                    {reviewFormError && <p className="review-form-error error-text">{reviewFormError}</p>}
                    <button type="submit" className="btn btn-green" disabled={isSubmittingReview}>
                      Post review
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}
          <div className="review-list">
            {reviews.length === 0 ? (
              <p className="review-item muted">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div className="review-item" key={review.reviewId}>
                  {session.userId === review.reviewerId && (
                    <button
                      type="button"
                      className="review-item-delete center"
                      onClick={() => handleDeleteReview(review.reviewId)}
                      disabled={isSubmittingReview}
                      aria-label="Delete review"
                    >
                      ×
                    </button>
                  )}
                  <Link to={`/dashboard/${review.reviewerId}`}>
                    <img className="review-avatar avatar" src={review.avatarPath} alt={review.username} />
                  </Link>
                  <div className="review-item-body">
                    <div className="review-item-header">
                      <Link className="review-item-username" to={`/dashboard/${review.reviewerId}`}>
                        {review.username}
                      </Link>
                      <span className="review-item-date">
                        {new Date(review.date).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="review-item-comment">{review.comment}</p>
                  </div>
                </div>
              ))
            )}
            {reviews.length > 0 && (
              <PaginationBar
                currentPage={reviewsPage}
                totalPages={reviewsTotalPages}
                onPageChange={handleGoToReviewsPage}
                pageSize={reviewsPageSize}
                onPageSizeChange={handleReviewsPageSizeChange}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
