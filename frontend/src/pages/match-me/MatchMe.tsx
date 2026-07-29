import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MultiSelectButton from '../../components/multi-select-button/MultiSelectButton';
import { Rank, Role, Region } from '../../types/account';
import {
  listMatchMe,
  createMatchMe,
  getMatchMe,
  deleteMatchMe,
  type MatchMePost,
  type MatchMeResponse,
} from '../../services/matchmeService';
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

interface MatchFilters {
  ranks: string[];
  roles: string[];
  regions: string[];
  description: string;
  username: string;
}

export default function MatchMe() {
  const authContext = useContext(AuthContext);
  const [createRoles, setCreateRoles] = useState<string[]>([]);
  const [createDescription, setCreateDescription] = useState<string>('');
  const [isPostingCreate, setIsPostingCreate] = useState<boolean>(false);
  const [createFormError, setCreateFormError] = useState<string>('');
  const [postsVersion, setPostsVersion] = useState<number>(0);
  const [ownPost, setOwnPost] = useState<MatchMeResponse | null>(null);
  const [ownPostChecked, setOwnPostChecked] = useState<boolean>(false);
  const [isDeletingPost, setIsDeletingPost] = useState<boolean>(false);
  const [deletePostError, setDeletePostError] = useState<string>('');

  const [appliedFilters, setAppliedFilters] = useState<MatchFilters>({
    ranks: [],
    roles: [],
    regions: [],
    description: '',
    username: '',
  });
  const [newFilters, setNewFilters] = useState<MatchFilters>({
    ranks: [],
    roles: [],
    regions: [],
    description: '',
    username: '',
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [gotoPageInput, setGotoPageInput] = useState<string>('');
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
    if (!authContext.userId) {
      setOwnPost(null);
      setOwnPostChecked(true);
      return;
    }

    let cancelled: boolean = false;
    setOwnPostChecked(false);

    getMatchMe(authContext.userId)
      .then((post) => {
        if (!cancelled) setOwnPost(post);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.statusCode === 404) {
          setOwnPost(null);
        }
      })
      .finally(() => {
        if (!cancelled) setOwnPostChecked(true);
      });

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
      setOwnPost(null);
      setPostsVersion((v) => v + 1);
    } catch (err) {
      setDeletePostError(err instanceof ApiError ? err.message : 'Failed to delete post.');
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
      setPostsVersion((v) => v + 1);
    } catch (err) {
      setCreateFormError(err instanceof ApiError ? err.message : 'Failed to create post.');
    } finally {
      setIsPostingCreate(false);
    }
  }

  function handleGotoPageSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const page: number = Number(gotoPageInput);
    if (Number.isInteger(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
    setGotoPageInput('');
  }

  return (
    <div className="matchme">
      <header className="matchme-header">
        <h1>Match Me</h1>
        <p className="muted">Players looking for a duo right now.</p>
      </header>
      <div className="matchme-body">
        <div className="matchme-sidebar">
          <div className="matchme-filters">
            <h2 className="matchme-filters-label">Filters</h2>
            <input
              type="search"
              className="matchme-search"
              placeholder="Search Username"
              maxLength={24}
              value={newFilters.username}
              onChange={(e) => setNewFilters({ ...newFilters, username: e.target.value })}
            />
            <MultiSelectButton
              label="Rank"
              options={rankOptions}
              selected={newFilters.ranks}
              onChange={(ranks) => setNewFilters({ ...newFilters, ranks })}
            />
            <MultiSelectButton
              label="Role"
              options={roleOptions}
              selected={newFilters.roles}
              onChange={(roles) => setNewFilters({ ...newFilters, roles })}
            />
            <MultiSelectButton
              label="Region"
              options={regionOptions}
              selected={newFilters.regions}
              onChange={(regions) => setNewFilters({ ...newFilters, regions })}
            />
            <input
              type="search"
              className="matchme-search"
              placeholder="Search Descriptions"
              value={newFilters.description}
              onChange={(e) => setNewFilters({ ...newFilters, description: e.target.value })}
            />
            <button type="button" className="matchme-apply" onClick={handleApplyFiltersButton}>
              Apply Filters
            </button>
          </div>

          {ownPostChecked && ownPost && (
            <div className="matchme-create">
              <h2 className="matchme-filters-label">New Post</h2>

              <p className="muted">You already have an active post.</p>

              {deletePostError !== '' && <p className="matchme-create-error">{deletePostError}</p>}

              <button
                type="button"
                className="matchme-apply"
                onClick={handleDeleteOwnPost}
                disabled={isDeletingPost}
              >
                Delete Post
              </button>
            </div>
          )}

          {ownPostChecked && !ownPost && (
            <div className="matchme-create">
              <h2 className="matchme-filters-label">New Post</h2>

              <MultiSelectButton
                label="Role"
                options={roleOptions}
                selected={createRoles}
                onChange={handleCreateRolesChange}
                placeholder="Select role"
              />

              <textarea
                className="matchme-create-description"
                placeholder="Description (optional)"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
              />

              {createFormError !== '' && <p className="matchme-create-error">{createFormError}</p>}

              <button type="button" className="matchme-apply" onClick={handleCreatePost} disabled={isPostingCreate}>
                Post
              </button>
            </div>
          )}
        </div>
        <div className="matchme-content">
          <table className="matchme-table">
            <colgroup>
              <col />
              <col className="matchme-col-rank" />
              <col className="matchme-col-role" />
              <col className="matchme-col-region" />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>Player</th>
                <th>
                  <span className="flex justify-center">Rank</span>
                </th>
                <th>
                  <span className="flex justify-center">Role</span>
                </th>
                <th>
                  <span className="flex justify-center">Region</span>
                </th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {error !== '' && (
                <tr>
                  <td colSpan={5} className="matchme-empty">
                    {error}
                  </td>
                </tr>
              )}
              {error === '' && !loading && posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="matchme-empty">
                    No players match the selected filters.
                  </td>
                </tr>
              )}
              {posts.map((candidate) => (
                <tr key={candidate.matchMeId}>
                  <td>
                    <div className="player-cell">
                      <img className="player-icon" src={candidate.avatarPath} alt="" />
                      <div className="player-info">
                        <Link to={`/dashboard/${candidate.userId}`}>{candidate.username}</Link>
                        {candidate.tagline && <span className="player-tagline muted">{candidate.tagline}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <img
                        className="rank-icon"
                        src={`/Season_2023_-_${toTitleCase(candidate.rank)}.webp`}
                        alt={candidate.rank}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-center">
                      {candidate.roles.map((role) => (
                        <img key={role} className="role-icon" src={`/Role_${toTitleCase(role)}.webp`} alt={role} />
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="flex justify-center">{candidate.region}</span>
                  </td>
                  <td>
                    <span>{candidate.description}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            {error === '' && !loading && posts.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={5}>
                    <div className="matchme-pagination">
                      <div className="matchme-pagination-pages">
                        <button
                          type="button"
                          className="matchme-pagination-btn"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          &lt;
                        </button>
                        <span>
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          type="button"
                          className="matchme-pagination-btn"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          &gt;
                        </button>
                      </div>
                      <form className="matchme-goto" onSubmit={handleGotoPageSubmit}>
                        <label>
                          Page:
                          <input
                            type="number"
                            className="matchme-goto-input"
                            min={1}
                            max={totalPages}
                            value={gotoPageInput}
                            onChange={(event) => setGotoPageInput(event.target.value)}
                          />
                        </label>
                        <button type="submit" className="matchme-goto-submit">
                          Go
                        </button>
                      </form>
                    </div>
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
