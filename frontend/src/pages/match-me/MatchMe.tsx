import './MatchMe.css';

import { MessageCircle as MessageCircleIcon } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import FilterPanel, { type FilterField } from '@/components/filter-panel/FilterPanel';
import MatchMePostPanel from '@/components/match-me-post-panel/MatchMePostPanel';
import PaginationBar from '@/components/pagination-bar/PaginationBar';
import { SessionContext } from '@/context/SessionContext';
import { Rank, Region, Role } from '@/enums/account';
import { ApiError } from '@/services/apiError';
import { listMatchMe, type MatchMePost } from '@/services/matchmeService';

type MatchMeFilters = {
  ranks: Rank[];
  roles: Role[];
  regions: Region[];
  description: string;
  username: string;
  dateFrom: string;
  dateTo: string;
};

const emptyFilters: MatchMeFilters = {
  ranks: [],
  roles: [],
  regions: [],
  description: '',
  username: '',
  dateFrom: '',
  dateTo: '',
};

const rankOptions: Rank[] = Object.values(Rank);
const roleOptions: Role[] = Object.values(Role);
const regionOptions: Region[] = Object.values(Region);

const filterPanelFields: FilterField<MatchMeFilters>[] = [
  { kind: 'search', key: 'username', label: 'Username', maxLength: 24 },
  { kind: 'multiSelect', key: 'ranks', label: 'Rank', options: rankOptions },
  { kind: 'multiSelect', key: 'roles', label: 'Roles', options: roleOptions, placeholder: 'All roles' },
  { kind: 'multiSelect', key: 'regions', label: 'Region', options: regionOptions },
  { kind: 'search', key: 'description', label: 'Description' },
  { kind: 'dateRange', fromKey: 'dateFrom', toKey: 'dateTo', fromLabel: 'Posted from', toLabel: 'Posted to' },
];

const PAGE_SIZE: number = 20;

export default function MatchMe() {
  const session = useContext(SessionContext);

  const [postsVersion, setPostsVersion] = useState<number>(0);
  const [appliedFilters, setAppliedFilters] = useState<MatchMeFilters>(emptyFilters);
  const [nextFilters, setNextFilters] = useState<MatchMeFilters>(emptyFilters);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE);
  const [posts, setPosts] = useState<MatchMePost[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled: boolean = false;

    async function fetchPosts(): Promise<void> {
      setLoading(true);
      setError('');

      try {
        const response = await listMatchMe({
          ranks: appliedFilters.ranks,
          roles: appliedFilters.roles,
          regions: appliedFilters.regions,
          search: appliedFilters.description,
          username: appliedFilters.username,
          dateFrom: appliedFilters.dateFrom,
          dateTo: appliedFilters.dateTo,
          page: currentPage,
          pageSize,
        });

        if (cancelled) return;

        setPosts(response.posts);
        setTotalPages(response.totalPages);
      } catch (err) {
        if (cancelled) return;

        setError(err instanceof ApiError ? err.message : 'Failed to load players.');
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
  }, [appliedFilters, currentPage, pageSize, postsVersion]);

  function handlePageSizeChange(size: number): void {
    setPageSize(size);
    setCurrentPage(1);
  }

  function handleApplyFiltersButton(): void {
    setAppliedFilters(nextFilters);
    setCurrentPage(1);
  }

  function handlePostCreated(): void {
    setCurrentPage(1);
    setPostsVersion((v) => v + 1);
  }

  function handlePostDeleted(): void {
    setPostsVersion((v) => v + 1);
  }

  if (session.userId === null) return null;

  return (
    <div className="matchme page">
      <div className="matchme-body">
        <div className="matchme-sidebar">
          <MatchMePostPanel
            userId={session.userId}
            onPostCreated={handlePostCreated}
            onPostDeleted={handlePostDeleted}
          />
          <FilterPanel
            className="matchme-filters"
            fields={filterPanelFields}
            values={nextFilters}
            onChange={setNextFilters}
            submitLabel="Apply Filters"
            onSubmit={handleApplyFiltersButton}
          />
        </div>
        <div className="matchme-content">
          <table className="data-table">
            <colgroup>
              <col className="matchme-col-player" />
              <col className="matchme-col-rank" />
              <col className="matchme-col-role" />
              <col className="matchme-col-region" />
              <col className="matchme-col-description" />
              <col className="matchme-col-date" />
              <col className="matchme-col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th>Player</th>
                <th>
                  <span className="center">Rank</span>
                </th>
                <th>
                  <span className="center">Roles</span>
                </th>
                <th>
                  <span className="center">Region</span>
                </th>
                <th>Description</th>
                <th>
                  <span className="center">Posted</span>
                </th>
                <th>
                  <span className="center">Message</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {error !== '' && (
                <tr>
                  <td colSpan={7} className="matchme-empty">
                    {error}
                  </td>
                </tr>
              )}
              {error === '' && !loading && posts.length === 0 && (
                <tr>
                  <td colSpan={7} className="matchme-empty">
                    No players match the selected filters.
                  </td>
                </tr>
              )}
              {posts.map((candidate) => (
                <tr key={candidate.matchMeId}>
                  <td>
                    <div className="player-cell">
                      <Link to={`/dashboard/${candidate.userId}`}>
                        <img className="player-icon avatar" src={candidate.avatarPath} alt="" />
                      </Link>
                      <div className="player-info stack">
                        <Link to={`/dashboard/${candidate.userId}`}>{candidate.username}</Link>
                        {candidate.tagline && <span className="player-tagline muted">{candidate.tagline}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="center">
                      <img className="rank-icon" src={`/Season_2023_-_${candidate.rank}.webp`} alt={candidate.rank} />
                    </div>
                  </td>
                  <td>
                    <div className="center">
                      {candidate.roles.map((role) => (
                        <img key={role} className="role-icon" src={`/Role_${role}.webp`} alt={role} />
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="center">{candidate.region}</span>
                  </td>
                  <td>
                    <span>{candidate.description}</span>
                  </td>
                  <td>
                    <span className="center matchme-date">
                      {new Date(candidate.dateCreated).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                    </span>
                  </td>
                  <td>
                    <div className="center">
                      {candidate.userId === session.userId ? (
                        <span className="muted">You</span>
                      ) : (
                        <Link className="btn matchme-message-btn" to={`/messages/${candidate.userId}`}>
                          <MessageCircleIcon className="matchme-message-icon" />
                          Message
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {error === '' && posts.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={7}>
                    <PaginationBar
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      pageSize={pageSize}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
