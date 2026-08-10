import './Dashboard.css';
import { useContext, useEffect, useState, type FormEvent } from 'react';
import { getDashboard, getUserInfo, type UserData } from '../../services/userService';
import { getGameAccountByUserId, type GameAccountResponse } from '../../services/gameAccountService';
import { listReviews, createReview, deleteReview, type Review } from '../../services/reviewService';
import { ApiError } from '../../services/apiError';
import { Link, useParams } from 'react-router-dom';
import { SessionContext, type SessionContextType } from '../../context/SessionContext';
import Pagination from '../../components/pagination/Pagination';

const REVIEW_PAGE_SIZE = 5;
const REVIEW_COMMENT_MAX_LENGTH = 2000;

function toTitleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default function Dashboard() {
  const params: { userId?: string } = useParams();
  const session: SessionContextType = useContext(SessionContext);
  const [dashboard, setDashboard] = useState<UserData | null>(null);
  const [gameAccount, setGameAccount] = useState<GameAccountResponse | null>(null);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isPageError, setIsPageError] = useState<boolean>(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPage, setReviewsPage] = useState<number>(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState<number>(1);
  const [myAvatarPath, setMyAvatarPath] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewFormError, setReviewFormError] = useState<string | null>(null);

  const isOwnProfile: boolean = !!session.userId && session.userId === params.userId;
  const isOtherProfile: boolean = !!session.userId && !!params.userId && session.userId !== params.userId;

  useEffect(() => {
    const fetchDashboard = async (): Promise<void> => {
      try {
        if (!params.userId) {
          throw new Error('User ID is required in URL params.');
        }

        const [data, account]: [UserData, GameAccountResponse | null] = await Promise.all([
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
        const data = await listReviews(params.userId, { page: 1, pageSize: REVIEW_PAGE_SIZE });
        setReviews(data.reviews);
        setReviewsPage(1);
        setReviewsTotalPages(data.totalPages);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    fetchReviews();
  }, [params.userId]);

  useEffect(() => {
    const fetchMyAvatar = async (): Promise<void> => {
      if (!session.userId) {
        setMyAvatarPath(null);
        return;
      }

      try {
        const info = await getUserInfo(session.userId);
        setMyAvatarPath(info.avatarPath);
      } catch (err) {
        console.error('Error fetching my avatar:', err);
      }
    };
    fetchMyAvatar();
  }, [session.userId]);

  async function refreshReviews(): Promise<void> {
    if (!params.userId) return;

    const data = await listReviews(params.userId, { page: 1, pageSize: REVIEW_PAGE_SIZE });
    setReviews(data.reviews);
    setReviewsPage(1);
    setReviewsTotalPages(data.totalPages);
  }

  async function handleGoToReviewsPage(page: number): Promise<void> {
    if (!params.userId || page === reviewsPage) return;

    const data = await listReviews(params.userId, { page, pageSize: REVIEW_PAGE_SIZE });
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
                {isOwnProfile && (
                  <Link className="btn profile-action" to={`/settings/${params.userId}`}>
                    <svg
                      className="navbar-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Settings
                  </Link>
                )}
                {isOtherProfile && (
                  <Link className="btn profile-action" to={`/messages/${params.userId}`}>
                    <svg
                      className="navbar-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
                    </svg>
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
                src={`/Season_2023_-_${toTitleCase(gameAccount.rank)}.webp`}
                alt={gameAccount.rank}
              />
              <div className="game-account-details stack">
                <div className="game-account-name">{gameAccount.name}</div>
                <div className="game-account-rank-text">
                  {toTitleCase(gameAccount.rank)} · {gameAccount.region}
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
          {isOtherProfile && (
            <form className="review-form" onSubmit={handleSubmitReview}>
              {myAvatarPath && <img className="review-avatar avatar" src={myAvatarPath} alt="Your avatar" />}
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
            <Pagination currentPage={reviewsPage} totalPages={reviewsTotalPages} onPageChange={handleGoToReviewsPage} />
          </div>
        </div>
      </main>
    </div>
  );
}
