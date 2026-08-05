import './Dashboard.css';
import { useContext, useEffect, useState, type FormEvent } from 'react';
import { getDashboard, type UserData } from '../../services/userService';
import { getGameAccountByUserId, type GameAccountResponse } from '../../services/gameAccountService';
import {
  listReviews,
  createReview,
  updateReview,
  deleteReview,
  getReview,
  type Review,
  type ReviewResponse,
} from '../../services/reviewService';
import { ApiError } from '../../services/apiError';
import { useParams } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../../context/AuthContext';

const REVIEW_PAGE_SIZE = 5;

function toTitleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default function Dashboard() {
  const params: { userId?: string } = useParams();
  const authContext: AuthContextType = useContext(AuthContext);
  const [dashboard, setDashboard] = useState<UserData | null>(null);
  const [gameAccount, setGameAccount] = useState<GameAccountResponse | null>(null);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isPageError, setIsPageError] = useState<boolean>(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPage, setReviewsPage] = useState<number>(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState<number>(1);
  const [myReview, setMyReview] = useState<ReviewResponse | null>(null);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewFormError, setReviewFormError] = useState<string | null>(null);

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
    const fetchMyReview = async (): Promise<void> => {
      if (!authContext.userId || !params.userId || authContext.userId === params.userId) {
        setMyReview(null);
        setReviewComment('');
        return;
      }

      try {
        const data = await getReview(authContext.userId, params.userId);
        setMyReview(data);
        setReviewComment(data.comment);
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 404) {
          setMyReview(null);
          setReviewComment('');
          return;
        }
        console.error('Error fetching my review:', err);
      }
    };
    fetchMyReview();
  }, [authContext.userId, params.userId]);

  async function refreshReviews(): Promise<void> {
    if (!params.userId) return;

    const data = await listReviews(params.userId, { page: 1, pageSize: REVIEW_PAGE_SIZE });
    setReviews(data.reviews);
    setReviewsPage(1);
    setReviewsTotalPages(data.totalPages);
  }

  async function handleLoadMoreReviews(): Promise<void> {
    if (!params.userId || reviewsPage >= reviewsTotalPages) return;

    const nextPage = reviewsPage + 1;
    const data = await listReviews(params.userId, { page: nextPage, pageSize: REVIEW_PAGE_SIZE });
    setReviews((prev) => [...prev, ...data.reviews]);
    setReviewsPage(nextPage);
    setReviewsTotalPages(data.totalPages);
  }

  async function handleSubmitReview(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!authContext.userId || !params.userId) return;

    setIsSubmittingReview(true);
    setReviewFormError(null);
    try {
      if (myReview) {
        await updateReview(authContext.userId, params.userId, { comment: reviewComment });
      } else {
        await createReview(authContext.userId, params.userId, { comment: reviewComment });
      }
      const data = await getReview(authContext.userId, params.userId);
      setMyReview(data);
      await refreshReviews();
    } catch (err) {
      console.error('Error submitting review:', err);
      setReviewFormError(err instanceof ApiError ? err.message : 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  }

  async function handleDeleteReview(): Promise<void> {
    if (!authContext.userId || !params.userId) return;

    setIsSubmittingReview(true);
    setReviewFormError(null);
    try {
      await deleteReview(authContext.userId, params.userId);
      setMyReview(null);
      setReviewComment('');
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
    <div className="dash">
      <main className="dash-grid">
        <div className="card profile">
          <div
            className="profile-banner"
            style={
              dashboard?.dashboard.banner
                ? { backgroundImage: `url(${dashboard.dashboard.banner})` }
                : { backgroundColor: 'gray' }
            }
          />
          <div className="profile-body">
            <div className="profile-top">
              <div className="profile-identity">
                <div className="profile-avatar">
                  <img src={dashboard?.userInfo.avatarPath} alt="Avatar" />
                </div>
                <div className="profile-top-names">
                  <div className="profile-top-displayname">
                    <span>{dashboard?.userInfo.username}</span>
                  </div>
                  <div className="profile-top-tagline">
                    <span>{dashboard?.dashboard.tagline}</span>
                  </div>
                </div>
              </div>
              {gameAccount ? (
                <div className="game-account-info">
                  <img
                    className="game-account-rank-icon"
                    src={`/Season_2023_-_${toTitleCase(gameAccount.rank)}.webp`}
                    alt={gameAccount.rank}
                  />
                  <div className="game-account-details">
                    <div className="game-account-name-region">
                      <span>{gameAccount.name}</span>
                      <span className="muted">{gameAccount.region}</span>
                    </div>
                    <div className="game-account-rank-text">{toTitleCase(gameAccount.rank)}</div>
                  </div>
                </div>
              ) : (
                <p className="muted">No game account linked yet.</p>
              )}
            </div>
          </div>
        </div>
        <div className="card">
          <h3>Reviews</h3>
          {authContext.userId && params.userId && authContext.userId !== params.userId && (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <textarea
                className="review-comment-input"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Write a review..."
                maxLength={2000}
                required
              />
              <div className="review-form-buttons">
                {myReview && (
                  <button type="button" className="btn" onClick={handleDeleteReview} disabled={isSubmittingReview}>
                    Delete
                  </button>
                )}
                <button type="submit" className="btn" disabled={isSubmittingReview}>
                  {myReview ? 'Update' : 'Submit'}
                </button>
              </div>
              {reviewFormError && <p className="review-form-error">{reviewFormError}</p>}
            </form>
          )}
          <div className="review-list">
            {reviews.length === 0 ? (
              <p className="muted">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div className="review-item" key={review.reviewId}>
                  <img className="review-avatar" src={review.avatarPath} alt={review.username} />
                  <div className="review-item-body">
                    <div className="review-item-header">
                      <span className="review-item-username">{review.username}</span>
                    </div>
                    <p className="review-item-comment">{review.comment}</p>
                  </div>
                </div>
              ))
            )}
            {reviewsPage < reviewsTotalPages && (
              <button className="btn" onClick={handleLoadMoreReviews}>
                Load more
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
