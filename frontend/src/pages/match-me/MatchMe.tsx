import './MatchMe.css';

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import FilterPanel, { type FilterField } from '@/components/filter-panel/FilterPanel';
import MultiSelectButton from '@/components/multi-select-button/MultiSelectButton';
import PaginationBar from '@/components/pagination-bar/PaginationBar';
import { SessionContext } from '@/context/SessionContext';
import { Rank, Region, Role } from '@/enums/account';
import { ApiError } from '@/services/apiError';
import { getGameAccountByUserId, type GameAccountResponse } from '@/services/gameAccountService';
import {
  createMatchMe,
  deleteMatchMe,
  getMatchMe,
  listMatchMe,
  type ListMatchMeResponse,
  type MatchMePost,
  type MatchMeResponse,
} from '@/services/matchmeService';

type OwnPostState =
  | { status: 'loading' }
  | { status: 'posted'; post: MatchMeResponse; account: GameAccountResponse | null }
  | { status: 'canPost'; account: GameAccountResponse }
  | { status: 'noAccount' }
  | { status: 'error'; message: string };

type MatchMeFilters = {
  ranks: Rank[];
  roles: Role[];
  regions: Region[];
  description: string;
  username: string;
  dateFrom: string;
  dateTo: string;
};

function nullOn404<T>(err: unknown): T | null {
  if (err instanceof ApiError && err.statusCode === 404) return null;
  throw err;
}

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

  const [createPostRoles, setcreatePostRoles] = useState<Role[]>([]);
  const [createPostDescription, setCreatePostDescription] = useState<string>('');
  const [createPostError, setCreatePostError] = useState<string>('');
  const [isPostingCreate, setIsPostingCreate] = useState<boolean>(false);

  const [postsVersion, setPostsVersion] = useState<number>(0);
  const [ownPostState, setOwnPostState] = useState<OwnPostState>({ status: 'loading' });
  const [isDeletingPost, setIsDeletingPost] = useState<boolean>(false);
  const [deletePostError, setDeletePostError] = useState<string>('');
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

  useEffect(() => {
    if (!session.userId) return;

    let cancelled: boolean = false;

    async function fetchOwnPost(): Promise<void> {
      try {
        const [post, account]: [MatchMeResponse | null, GameAccountResponse | null] = await Promise.all([
          getMatchMe(session.userId as string).catch(nullOn404<MatchMeResponse>),
          getGameAccountByUserId(session.userId as string).catch(nullOn404<GameAccountResponse>),
        ]);

        if (cancelled) return;

        if (post) {
          setOwnPostState({ status: 'posted', post, account });
        } else if (account) {
          setOwnPostState({ status: 'canPost', account });
        } else {
          setOwnPostState({ status: 'noAccount' });
        }
      } catch (err) {
        if (cancelled) return;
        setOwnPostState({
          status: 'error',
          message: err instanceof ApiError ? err.message : 'Could not load your post.',
        });
      }
    }

    fetchOwnPost();

    return () => {
      cancelled = true;
    };
  }, [session.userId, postsVersion]);

  function handlePageSizeChange(size: number): void {
    setPageSize(size);
    setCurrentPage(1);
  }

  async function handleDeleteOwnPost(): Promise<void> {
    if (!session.userId) return;

    setIsDeletingPost(true);
    setDeletePostError('');

    try {
      await deleteMatchMe(session.userId);
      setPostsVersion((v) => v + 1);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        setPostsVersion((v) => v + 1);
      } else {
        setDeletePostError('Failed to delete post.');
      }
    } finally {
      setIsDeletingPost(false);
    }
  }

  function handleApplyFiltersButton(): void {
    setAppliedFilters(nextFilters);
    setCurrentPage(1);
  }

  function handleCreateRolesChange(roles: Role[]): void {
    setcreatePostRoles(roles.slice(0, 2));
  }

  async function handleCreatePost(): Promise<void> {
    if (!session.userId) return;

    if (createPostRoles.length === 0) {
      setCreatePostError('Please select roles');
      return;
    }

    setIsPostingCreate(true);
    setCreatePostError('');

    try {
      await createMatchMe(session.userId, { roles: createPostRoles, description: createPostDescription });
      setcreatePostRoles([]);
      setCreatePostDescription('');
      setCurrentPage(1);
      setPostsVersion((v) => v + 1);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setCreatePostError('You already have an active post.');
        setPostsVersion((v) => v + 1);
      } else if (err instanceof ApiError && err.statusCode === 404) {
        setCreatePostError('You need a linked game account to post.');
        setPostsVersion((v) => v + 1);
      } else {
        setCreatePostError('Failed to create post.');
      }
    } finally {
      setIsPostingCreate(false);
    }
  }

  return (
    <div className="matchme page">
      <div className="matchme-body">
        <div className="matchme-sidebar">
          {session.userId && (
            <div className="matchme-create">
              <h2 className="matchme-label">Post</h2>
              {ownPostState.status === 'loading' && (
                <>
                  <p className="muted">Loading...</p>
                </>
              )}

              {ownPostState.status === 'error' && (
                <>
                  <p className="error-text">{ownPostState.message}</p>
                </>
              )}

              {ownPostState.status === 'noAccount' && (
                <>
                  <p className="muted">
                    <Link to={`/settings/${session.userId}`}>Link a game account to post here.</Link>
                  </p>
                </>
              )}

              {ownPostState.status === 'posted' && (
                <>
                  {ownPostState.account && (
                    <div className="filter-field stack">
                      <span className="field-label">Game account</span>
                      <div className="matchme-own-account">
                        <img
                          className="matchme-own-rank-icon"
                          src={`/Season_2023_-_${ownPostState.account.rank}.webp`}
                          alt={ownPostState.account.rank}
                        />
                        <div className="stack">
                          <span className="matchme-own-account-name">{ownPostState.account.name}</span>
                          <span className="muted matchme-own-account-meta">
                            {ownPostState.account.rank} · {ownPostState.account.region}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="filter-field stack">
                    <span className="field-label">Roles</span>
                    <div className="matchme-own-roles">
                      {ownPostState.post.roles.map((role) => (
                        <img key={role} className="role-icon" src={`/Role_${role}.webp`} alt={role} />
                      ))}
                    </div>
                  </div>
                  {ownPostState.post.description !== '' && (
                    <div className="filter-field stack">
                      <span className="field-label">Description</span>
                      <p className="matchme-own-description">{ownPostState.post.description}</p>
                    </div>
                  )}
                  <div className="filter-field stack">
                    <span className="field-label">Posted</span>
                    <p className="matchme-own-date">
                      {new Date(ownPostState.post.dateCreated).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  {deletePostError !== '' && <p className="error-text">{deletePostError}</p>}
                  <button
                    type="button"
                    className="filter-apply"
                    onClick={handleDeleteOwnPost}
                    disabled={isDeletingPost}
                  >
                    Delete Post
                  </button>
                </>
              )}

              {ownPostState.status === 'canPost' && (
                <>
                  <div className="filter-field stack">
                    <span className="field-label">Game account</span>
                    <div className="matchme-own-account">
                      <img
                        className="matchme-own-rank-icon"
                        src={`/Season_2023_-_${ownPostState.account.rank}.webp`}
                        alt={ownPostState.account.rank}
                      />
                      <div className="stack">
                        <span className="matchme-own-account-name">{ownPostState.account.name}</span>
                        <span className="muted matchme-own-account-meta">
                          {ownPostState.account.rank} · {ownPostState.account.region}
                        </span>
                      </div>
                    </div>
                  </div>
                  <MultiSelectButton
                    label="Roles"
                    options={roleOptions}
                    selected={createPostRoles}
                    onChange={handleCreateRolesChange}
                    placeholder="Select roles"
                  />
                  <label className="filter-field stack">
                    <span className="field-label">Description</span>
                    <input
                      type="text"
                      className="filter-search"
                      placeholder="What are you looking for?"
                      value={createPostDescription}
                      onChange={(e) => setCreatePostDescription(e.target.value)}
                    />
                  </label>
                  {createPostError !== '' && <p className="error-text">{createPostError}</p>}
                  <button type="button" className="filter-apply" onClick={handleCreatePost} disabled={isPostingCreate}>
                    Post
                  </button>
                </>
              )}
            </div>
          )}
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
              </tr>
            </thead>
            <tbody>
              {error !== '' && (
                <tr>
                  <td colSpan={6} className="matchme-empty">
                    {error}
                  </td>
                </tr>
              )}
              {error === '' && !loading && posts.length === 0 && (
                <tr>
                  <td colSpan={6} className="matchme-empty">
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
                      <img
                        className="rank-icon"
                        src={`/Season_2023_-_${candidate.rank}.webp`}
                        alt={candidate.rank}
                      />
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
                </tr>
              ))}
            </tbody>
            {error === '' && posts.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={6}>
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
