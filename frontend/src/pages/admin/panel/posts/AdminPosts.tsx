import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../../../../components/pagination/Pagination';
import MultiSelectButton from '../../../../components/multi-select-button/MultiSelectButton';
import { Rank, Region } from '../../../../types/account';
import { listMatchMe, deleteMatchMe, type MatchMePost } from '../../../../services/matchmeService';
import { ApiError } from '../../../../services/apiError';

const PAGE_SIZE: number = 10;

const rankOptions: Rank[] = Object.values(Rank);
const regionOptions: Region[] = Object.values(Region);

type PostFilters = {
  username: string;
  account: string;
  ranks: Rank[];
  regions: Region[];
  search: string;
  dateFrom: string;
  dateTo: string;
};

const emptyFilters: PostFilters = {
  username: '',
  account: '',
  ranks: [],
  regions: [],
  search: '',
  dateFrom: '',
  dateTo: '',
};

export default function AdminPosts() {
  const [appliedFilters, setAppliedFilters] = useState<PostFilters>(emptyFilters);
  const [newFilters, setNewFilters] = useState<PostFilters>(emptyFilters);
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
        const response = await listMatchMe({
          ...appliedFilters,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });

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
  }, [appliedFilters, currentPage, version]);

  function handleApplySearch(): void {
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  }

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
    <div className="admin-body">
      <div className="admin-filters">
        <h2 className="matchme-filters-label">Filters</h2>
        <label className="matchme-field stack">
          <span className="field-label">Player</span>
          <input
            type="search"
            className="matchme-search"
            placeholder="Search"
            value={newFilters.username}
            onChange={(e) => setNewFilters({ ...newFilters, username: e.target.value })}
          />
        </label>
        <label className="matchme-field stack">
          <span className="field-label">Game account</span>
          <input
            type="search"
            className="matchme-search"
            placeholder="Search"
            value={newFilters.account}
            onChange={(e) => setNewFilters({ ...newFilters, account: e.target.value })}
          />
        </label>
        <MultiSelectButton
          label="Rank"
          options={rankOptions}
          selected={newFilters.ranks}
          onChange={(ranks) => setNewFilters({ ...newFilters, ranks: ranks as Rank[] })}
        />
        <MultiSelectButton
          label="Region"
          options={regionOptions}
          selected={newFilters.regions}
          onChange={(regions) => setNewFilters({ ...newFilters, regions: regions as Region[] })}
        />
        <label className="matchme-field stack">
          <span className="field-label">Description</span>
          <input
            type="search"
            className="matchme-search"
            placeholder="Search"
            value={newFilters.search}
            onChange={(e) => setNewFilters({ ...newFilters, search: e.target.value })}
          />
        </label>
        <label className="matchme-field stack">
          <span className="field-label">Posted from</span>
          <input
            type="date"
            className="matchme-date-input"
            value={newFilters.dateFrom}
            max={newFilters.dateTo || undefined}
            onChange={(e) => setNewFilters({ ...newFilters, dateFrom: e.target.value })}
          />
        </label>
        <label className="matchme-field stack">
          <span className="field-label">Posted to</span>
          <input
            type="date"
            className="matchme-date-input"
            value={newFilters.dateTo}
            min={newFilters.dateFrom || undefined}
            onChange={(e) => setNewFilters({ ...newFilters, dateTo: e.target.value })}
          />
        </label>
        <button type="button" className="matchme-apply" onClick={handleApplySearch}>
          Search
        </button>
      </div>
      <div className="admin-content">
        <table className="data-table">
          <colgroup>
            <col />
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
              <th>Game account</th>
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
                <td colSpan={7} className="admin-empty">
                  {error}
                </td>
              </tr>
            )}
            {error === '' && !loading && posts.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-empty">
                  No posts found.
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
                <td className="admin-comment">{post.accountName}</td>
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
                <td colSpan={7}>
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
