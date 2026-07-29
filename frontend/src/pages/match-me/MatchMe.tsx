import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MultiSelectButton from '../../components/multi-select-button/MultiSelectButton';
import { Rank, Role, Region } from '../../types/account';
import { listMatchMe, type MatchMePost } from '../../services/matchmeService';
import { ApiError } from '../../services/apiError';
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
  }, [appliedFilters, currentPage]);

  function handleApplyFiltersButton(): void {
    setAppliedFilters(newFilters);
    setCurrentPage(1);
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
