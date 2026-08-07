import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MultiSelectButton from '../../components/multi-select-button/MultiSelectButton';
import Pagination from '../../components/pagination/Pagination';
import { Rank, Role, Region } from '../../types/account';
import {
  listMatchMe,
  createMatchMe,
  getMatchMe,
  deleteMatchMe,
  type MatchMePost,
  type MatchMeResponse,
} from '../../services/matchmeService';
import { getGameAccountByUserId, type GameAccountResponse } from '../../services/gameAccountService';
import { ApiError } from '../../services/apiError';
import { AuthContext } from '../../context/AuthContext';
import './MatchMe.css';

function toTitleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

const rankOptions: Rank[] = Object.values(Rank);
const roleOptions: Role[] = Object.values(Role);
const regionOptions: Region[] = Object.values(Region);

const PAGE_SIZE: number = 5;

type OwnPostState =
  | { status: 'loading' }
  | { status: 'posted'; post: MatchMeResponse; account: GameAccountResponse | null }
  | { status: 'canPost'; account: GameAccountResponse }
  | { status: 'noAccount' }
  | { status: 'error'; message: string };

function nullOn404<T>(err: unknown): T | null {
  if (err instanceof ApiError && err.statusCode === 404) return null;
  throw err;
}

interface MatchFilters {
  ranks: string[];
  roles: string[];
  regions: string[];
  description: string;
  username: string;
  dateFrom: string;
  dateTo: string;
}

export default function MatchMe() {
  const authContext = useContext(AuthContext);
  const [createRoles, setCreateRoles] = useState<string[]>([]);
  const [createDescription, setCreateDescription] = useState<string>('');
  const [isPostingCreate, setIsPostingCreate] = useState<boolean>(false);
  const [createFormError, setCreateFormError] = useState<string>('');
  const [postsVersion, setPostsVersion] = useState<number>(0);
  const [ownPostState, setOwnPostState] = useState<OwnPostState>({ status: 'loading' });
  const [isDeletingPost, setIsDeletingPost] = useState<boolean>(false);
  const [deletePostError, setDeletePostError] = useState<string>('');

  const [appliedFilters, setAppliedFilters] = useState<MatchFilters>({
    ranks: [],
    roles: [],
    regions: [],
    description: '',
    username: '',
    dateFrom: '',
    dateTo: '',
  });
  const [newFilters, setNewFilters] = useState<MatchFilters>({
    ranks: [],
    roles: [],
    regions: [],
    description: '',
    username: '',
    dateFrom: '',
    dateTo: '',
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
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
          ranks: appliedFilters.ranks as Rank[],
          roles: appliedFilters.roles as Role[],
          regions: appliedFilters.regions as Region[],
          search: appliedFilters.description,
          username: appliedFilters.username,
          dateFrom: appliedFilters.dateFrom,
          dateTo: appliedFilters.dateTo,
          page: currentPage,
          pageSize: PAGE_SIZE,
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
  }, [appliedFilters, currentPage, postsVersion]);

  useEffect(() => {
    const userId: string | null = authContext.userId;
    if (!userId) return;

    let cancelled: boolean = false;

    async function fetchOwnPost(): Promise<void> {
      try {
        const [post, account]: [MatchMeResponse | null, GameAccountResponse | null] = await Promise.all([
          getMatchMe(userId as string).catch(nullOn404<MatchMeResponse>),
          getGameAccountByUserId(userId as string).catch(nullOn404<GameAccountResponse>),
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
  }, [authContext.userId, postsVersion]);

  async function handleDeleteOwnPost(): Promise<void> {
    if (!authContext.userId) return;

    setIsDeletingPost(true);
    setDeletePostError('');

    try {
      await deleteMatchMe(authContext.userId);
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
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  }

  function handleCreateRolesChange(roles: string[]): void {
    setCreateRoles(roles.slice(0, 2));
  }

  async function handleCreatePost(): Promise<void> {
    if (!authContext.userId) return;

    if (createRoles.length === 0) {
      setCreateFormError('Please select roles');
      return;
    }

    setIsPostingCreate(true);
    setCreateFormError('');

    try {
      await createMatchMe(authContext.userId, { roles: createRoles as Role[], description: createDescription });
      setCreateRoles([]);
      setCreateDescription('');
      setCurrentPage(1);
      setPostsVersion((v) => v + 1);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setCreateFormError('You already have an active post.');
        setPostsVersion((v) => v + 1);
      } else if (err instanceof ApiError && err.statusCode === 404) {
        setCreateFormError('You need a linked game account to post.');
        setPostsVersion((v) => v + 1);
      } else {
        setCreateFormError('Failed to create post.');
      }
    } finally {
      setIsPostingCreate(false);
    }
  }

  return (
    <div className="matchme page">
      <div className="matchme-body">
        <div className="matchme-sidebar">
          {authContext.userId && (
            <div className="matchme-create">
              {ownPostState.status === 'loading' && (
                <>
                  <h2 className="matchme-filters-label">Your post</h2>
                  <p className="muted">Loading...</p>
                </>
              )}

              {ownPostState.status === 'error' && (
                <>
                  <h2 className="matchme-filters-label">Your post</h2>
                  <p className="error-text">{ownPostState.message}</p>
                </>
              )}

              {ownPostState.status === 'noAccount' && (
                <>
                  <h2 className="matchme-filters-label">New post</h2>
                  <p className="muted">
                    <Link to={`/settings/${authContext.userId}`}>Link a game account</Link> to post here.
                  </p>
                </>
              )}

              {ownPostState.status === 'posted' && (
                <>
                  <h2 className="matchme-filters-label">Your post</h2>
                  {ownPostState.account && (
                    <div className="matchme-field stack">
                      <span className="field-label">Game account</span>
                      <div className="matchme-own-account">
                        <img
                          className="matchme-own-rank-icon"
                          src={`/Season_2023_-_${toTitleCase(ownPostState.account.rank)}.webp`}
                          alt={ownPostState.account.rank}
                        />
                        <div className="stack">
                          <span className="matchme-own-account-name">{ownPostState.account.name}</span>
                          <span className="muted matchme-own-account-meta">
                            {toTitleCase(ownPostState.account.rank)} · {ownPostState.account.region}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="matchme-field stack">
                    <span className="field-label">Roles</span>
                    <div className="matchme-own-roles">
                      {ownPostState.post.roles.map((role) => (
                        <img key={role} className="role-icon" src={`/Role_${toTitleCase(role)}.webp`} alt={role} />
                      ))}
                    </div>
                  </div>
                  {ownPostState.post.description !== '' && (
                    <div className="matchme-field stack">
                      <span className="field-label">Description</span>
                      <p className="matchme-own-description">{ownPostState.post.description}</p>
                    </div>
                  )}
                  <div className="matchme-field stack">
                    <span className="field-label">Posted</span>
                    <p className="matchme-own-date">
                      {new Date(ownPostState.post.dateCreated).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  {deletePostError !== '' && <p className="error-text">{deletePostError}</p>}
                  <button
                    type="button"
                    className="matchme-apply"
                    onClick={handleDeleteOwnPost}
                    disabled={isDeletingPost}
                  >
                    Delete Post
                  </button>
                </>
              )}

              {ownPostState.status === 'canPost' && (
                <>
                  <h2 className="matchme-filters-label">New post</h2>
                  <div className="matchme-field stack">
                    <span className="field-label">Game account</span>
                    <div className="matchme-own-account">
                      <img
                        className="matchme-own-rank-icon"
                        src={`/Season_2023_-_${toTitleCase(ownPostState.account.rank)}.webp`}
                        alt={ownPostState.account.rank}
                      />
                      <div className="stack">
                        <span className="matchme-own-account-name">{ownPostState.account.name}</span>
                        <span className="muted matchme-own-account-meta">
                          {toTitleCase(ownPostState.account.rank)} · {ownPostState.account.region}
                        </span>
                      </div>
                    </div>
                  </div>
                  <MultiSelectButton
                    label="Roles"
                    options={roleOptions}
                    selected={createRoles}
                    onChange={handleCreateRolesChange}
                    placeholder="Select roles"
                  />
                  <label className="matchme-field stack">
                    <span className="field-label">Description</span>
                    <input
                      type="text"
                      className="matchme-search"
                      placeholder="What are you looking for?"
                      value={createDescription}
                      onChange={(e) => setCreateDescription(e.target.value)}
                    />
                  </label>
                  {createFormError !== '' && <p className="error-text">{createFormError}</p>}
                  <button type="button" className="matchme-apply" onClick={handleCreatePost} disabled={isPostingCreate}>
                    Post
                  </button>
                </>
              )}
            </div>
          )}
          <div className="matchme-filters">
            <h2 className="matchme-filters-label">Filters</h2>
            <label className="matchme-field stack">
              <span className="field-label">Username</span>
              <input
                type="search"
                className="matchme-search"
                placeholder="Search"
                maxLength={24}
                value={newFilters.username}
                onChange={(e) => setNewFilters({ ...newFilters, username: e.target.value })}
              />
            </label>
            <MultiSelectButton
              label="Rank"
              options={rankOptions}
              selected={newFilters.ranks}
              onChange={(ranks) => setNewFilters({ ...newFilters, ranks })}
            />
            <MultiSelectButton
              label="Roles"
              options={roleOptions}
              selected={newFilters.roles}
              onChange={(roles) => setNewFilters({ ...newFilters, roles })}
              placeholder="All roles"
            />
            <MultiSelectButton
              label="Region"
              options={regionOptions}
              selected={newFilters.regions}
              onChange={(regions) => setNewFilters({ ...newFilters, regions })}
            />
            <label className="matchme-field stack">
              <span className="field-label">Description</span>
              <input
                type="search"
                className="matchme-search"
                placeholder="Search"
                value={newFilters.description}
                onChange={(e) => setNewFilters({ ...newFilters, description: e.target.value })}
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
            <button type="button" className="matchme-apply" onClick={handleApplyFiltersButton}>
              Apply Filters
            </button>
          </div>
        </div>
        <div className="matchme-content">
          <table className="matchme-table">
            <colgroup>
              <col className="matchme-col-player" />
              <col className="matchme-col-rank" />
              <col className="matchme-col-role" />
              <col className="matchme-col-region" />
              <col />
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
                        src={`/Season_2023_-_${toTitleCase(candidate.rank)}.webp`}
                        alt={candidate.rank}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="center">
                      {candidate.roles.map((role) => (
                        <img key={role} className="role-icon" src={`/Role_${toTitleCase(role)}.webp`} alt={role} />
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
            {error === '' && !loading && posts.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={6}>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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
