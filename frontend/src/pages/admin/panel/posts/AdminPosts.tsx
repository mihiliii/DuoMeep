import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../../../../components/pagination/Pagination';
import { listMatchMe, deleteMatchMe, type MatchMePost } from '../../../../services/matchmeService';
import { ApiError } from '../../../../services/apiError';

const PAGE_SIZE: number = 10;

export default function AdminPosts() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [posts, setPosts] = useState<MatchMePost[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [version, setVersion] = useState<number>(0);
  const [confirmingId, setConfirmingId] = useState<string>('');

  useEffect(() => {
    let cancelled: boolean = false;

    async function fetchPosts(): Promise<void> {
      setLoading(true);
      setError('');

      try {
        const response = await listMatchMe({ page: currentPage, pageSize: PAGE_SIZE });

        if (cancelled) return;
        setPosts(response.posts);
        setTotalPages(response.totalPages);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load posts.');
        setPosts([]);
        setTotalPages(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [currentPage, version]);

  async function handleDelete(post: MatchMePost): Promise<void> {
    if (confirmingId !== post.matchMeId) {
      setConfirmingId(post.matchMeId);
      return;
    }

    setConfirmingId('');

    try {
      await deleteMatchMe(post.userId);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete post.');
    }
  }

  return (
    <table className="data-table">
      <colgroup>
        <col className="admin-col-account" />
        <col className="admin-col-rank" />
        <col className="admin-col-region" />
        <col />
        <col className="admin-col-date" />
        <col className="admin-col-actions" />
      </colgroup>
      <thead>
        <tr>
          <th>Player</th>
          <th>Rank</th>
          <th>Region</th>
          <th>Description</th>
          <th>Posted</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {error !== '' && (
          <tr>
            <td colSpan={6} className="admin-empty">
              {error}
            </td>
          </tr>
        )}
        {error === '' && !loading && posts.length === 0 && (
          <tr>
            <td colSpan={6} className="admin-empty">
              No posts yet.
            </td>
          </tr>
        )}
        {posts.map((post) => (
          <tr key={post.matchMeId}>
            <td>
              <div className="admin-user-cell">
                <Link to={`/dashboard/${post.userId}`}>
                  <img className="admin-avatar avatar" src={post.avatarPath} alt="" />
                </Link>
                <Link to={`/dashboard/${post.userId}`} className="ellipsis">
                  {post.username}
                </Link>
              </div>
            </td>
            <td>{post.rank}</td>
            <td>{post.region}</td>
            <td className="admin-comment">{post.description}</td>
            <td className="admin-nowrap">
              {new Date(post.dateCreated).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
            </td>
            <td>
              <button type="button" className="btn btn-red" onClick={() => handleDelete(post)}>
                {confirmingId === post.matchMeId ? 'Confirm?' : 'Delete'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
      {totalPages > 1 && (
        <tfoot>
          <tr>
            <td colSpan={6}>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}
