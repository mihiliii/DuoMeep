import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MultiSelectButton from '../../components/multi-select-button/MultiSelectButton';
import { Rank, Role, Region } from '../../types/account';
import { listMatchMe, type MatchMePosting } from '../../services/matchmeService';
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
}

export default function MatchMe() {
  const [appliedFilters, setAppliedFilters] = useState<MatchFilters>({
    ranks: [],
    roles: [],
    regions: [],
    description: '',
  });
  const [newFilters, setNewFilters] = useState<MatchFilters>({
    ranks: [],
    roles: [],
    regions: [],
    description: '',
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [postings, setPostings] = useState<MatchMePosting[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled: boolean = false;

    async function fetchPostings(): Promise<void> {
      setLoading(true);
      setError('');

      try {
        const response = await listMatchMe({
          ranks: appliedFilters.ranks as Rank[],
          roles: appliedFilters.roles as Role[],
          regions: appliedFilters.regions as Region[],
          search: appliedFilters.description,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });

        if (cancelled) return;
        setPostings(response.postings);
        setTotalPages(response.totalPages);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load players.');
        setPostings([]);
        setTotalPages(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPostings();

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, currentPage]);

  function handleApplyFiltersButton(): void {
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  }

  return (
    <div className="matchme">
      <header className="matchme-header">
        <h1>Match Me</h1>
        <p className="muted">Players looking for a duo right now.</p>
      </header>
      <div className="matchme-filters">
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
          placeholder="Search descriptions..."
          value={newFilters.description}
          onChange={(e) => setNewFilters({ ...newFilters, description: e.target.value })}
        />
        <button type="button" className="matchme-apply" onClick={handleApplyFiltersButton}>
          Apply Filters
        </button>
      </div>
      <table className="matchme-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Rank</th>
            <th>Role</th>
            <th>Region</th>
            <th>Description</th>
            <th>Requirements</th>
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
          {error === '' && !loading && postings.length === 0 && (
            <tr>
              <td colSpan={6} className="matchme-empty">
                No players match the selected filters.
              </td>
            </tr>
          )}
          {postings.map((candidate) => (
            <tr key={candidate.matchMeId}>
              <td>
                <img className="player-icon" src={candidate.avatarPath} alt="" />
                <Link to={`/dashboard/${candidate.userId}`}>@{candidate.username}</Link>
              </td>
              <td>
                <img
                  className="rank-icon"
                  src={`/Season_2023_-_${toTitleCase(candidate.rank)}.webp`}
                  alt={candidate.rank}
                />
              </td>
              <td>
                <div className="role-icons">
                  {candidate.roles.map((role) => (
                    <img key={role} className="role-icon" src={`/Role_${toTitleCase(role)}.webp`} alt={role} />
                  ))}
                </div>
              </td>
              <td>
                <span>{candidate.region}</span>
              </td>
              <td>
                <span>{candidate.description}</span>
              </td>
              <td>
                {Object.entries(candidate.requirements).map(([key, value]) => (
                  <span key={key} className="req-tag">
                    {key}: {toTitleCase(String(value))}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="matchme-pagination">
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
      )}
    </div>
  );
}
