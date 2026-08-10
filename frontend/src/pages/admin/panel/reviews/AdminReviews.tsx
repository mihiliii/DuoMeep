import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '@/components/pagination/Pagination';
import FilterPanel, { type FilterField } from '@/components/filter-panel/FilterPanel';
import { listAllReviews, deleteReviewAsAdmin, type AdminReview } from '@/services/reviewService';
import { ApiError } from '@/services/apiError';

const PAGE_SIZE: number = 10;

type ReviewFilters = {
  reviewer: string;
  target: string;
  comment: string;
  dateFrom: string;
  dateTo: string;
};

const emptyFilters: ReviewFilters = {
  reviewer: '',
  target: '',
  comment: '',
  dateFrom: '',
  dateTo: '',
};

const reviewFilterFields: FilterField<ReviewFilters>[] = [
  { kind: 'search', key: 'reviewer', label: 'Reviewer' },
  { kind: 'search', key: 'target', label: 'Target' },
  { kind: 'search', key: 'comment', label: 'Comment' },
  { kind: 'dateRange', fromKey: 'dateFrom', toKey: 'dateTo', fromLabel: 'Date from', toLabel: 'Date to' },
];

export default function AdminReviews() {
  const [appliedFilters, setAppliedFilters] = useState<ReviewFilters>(emptyFilters);
  const [newFilters, setNewFilters] = useState<ReviewFilters>(emptyFilters);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [version, setVersion] = useState<number>(0);
  const [confirmingId, setConfirmingId] = useState<string>('');

  useEffect(() => {
    let cancelled: boolean = false;

    async function fetchReviews(): Promise<void> {
      setLoading(true);
      setError('');

      try {
        const response = await listAllReviews({
          ...appliedFilters,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });

        if (cancelled) return;
        setReviews(response.reviews);
        setTotalPages(response.totalPages);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load reviews.');
        setReviews([]);
        setTotalPages(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchReviews();

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, currentPage, version]);

  function handleApplySearch(): void {
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  }

  async function handleDelete(reviewId: string): Promise<void> {
    if (confirmingId !== reviewId) {
      setConfirmingId(reviewId);
      return;
    }

    setConfirmingId('');

    try {
      await deleteReviewAsAdmin(reviewId);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete review.');
    }
  }

  return (
    <div className="admin-body">
      <FilterPanel
        className="admin-filters"
        fields={reviewFilterFields}
        values={newFilters}
        onChange={setNewFilters}
        submitLabel="Search"
        onSubmit={handleApplySearch}
      />
      <div className="admin-content">
        <table className="data-table">
          <colgroup>
            <col className="admin-col-account" />
            <col className="admin-col-account" />
            <col />
            <col className="admin-col-date" />
            <col className="admin-col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>Reviewer</th>
              <th>Target</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {error !== '' && (
              <tr>
                <td colSpan={5} className="admin-empty">
                  {error}
                </td>
              </tr>
            )}
            {error === '' && !loading && reviews.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty">
                  No reviews found.
                </td>
              </tr>
            )}
            {reviews.map((review) => (
              <tr key={review.reviewId}>
                <td>
                  <div className="admin-user-cell">
                    <Link to={`/dashboard/${review.reviewerId}`}>
                      <img className="admin-avatar avatar" src={review.reviewerAvatarPath} alt="" />
                    </Link>
                    <Link to={`/dashboard/${review.reviewerId}`} className="ellipsis">
                      {review.reviewerUsername}
                    </Link>
                  </div>
                </td>
                <td>
                  <div className="admin-user-cell">
                    <Link to={`/dashboard/${review.targetId}`}>
                      <img className="admin-avatar avatar" src={review.targetAvatarPath} alt="" />
                    </Link>
                    <Link to={`/dashboard/${review.targetId}`} className="ellipsis">
                      {review.targetUsername}
                    </Link>
                  </div>
                </td>
                <td className="admin-comment">{review.comment}</td>
                <td className="admin-nowrap">
                  {new Date(review.date).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                </td>
                <td>
                  <button type="button" className="btn btn-red" onClick={() => handleDelete(review.reviewId)}>
                    {confirmingId === review.reviewId ? 'Confirm?' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {totalPages > 1 && (
            <tfoot>
              <tr>
                <td colSpan={5}>
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
