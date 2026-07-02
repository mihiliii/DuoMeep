import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MultiSelectDropdown from '../../components/multi-select-dropdown/MultiSelectDropdown';
import { Rank, Role, Region } from '../../types/account';
import './MatchMe.css';

interface MatchRequirements {
  minRank?: Rank;
  role?: Role;
}

interface MatchPlayer {
  id: number;
  username: string;
  rank: string;
  roles: string[];
  region: string;
  description: string;
  requirements: MatchRequirements;
}

const players: MatchPlayer[] = [
  {
    id: 1,
    username: 'saske',
    rank: 'Gold',
    roles: ['Support'],
    region: 'EUNE',
    description: 'Chill support main looking for a consistent ADC duo.',
    requirements: { minRank: Rank.GOLD, role: Role.ADC },
  },
  {
    id: 2,
    username: 'elena',
    rank: 'Platinum',
    roles: ['Mid', 'Top'],
    region: 'EUW',
    description: 'Climbing to Diamond, plays evenings.',
    requirements: { minRank: Rank.PLATINUM },
  },
  {
    id: 3,
    username: 'mihi',
    rank: 'Silver',
    roles: ['Jungle'],
    region: 'EUNE',
    description: 'Learning jungle, good vibes only.',
    requirements: { role: Role.MID },
  },
  {
    id: 4,
    username: 'lehends',
    rank: 'Diamond',
    roles: ['Bot', 'Support'],
    region: 'KR',
    description: 'Smurfing, wants a serious support to climb fast.',
    requirements: { minRank: Rank.DIAMOND, role: Role.SUPPORT },
  },
  {
    id: 5,
    username: 'faker',
    rank: 'Challenger',
    roles: ['Mid'],
    region: 'NA',
    description: 'Grinding ranked all day, looking for a duo that never tilts.',
    requirements: { minRank: Rank.MASTER, role: Role.JUNGLE },
  },
  {
    id: 6,
    username: 'tarzaned',
    rank: 'Bronze',
    roles: ['Top', 'Jungle'],
    region: 'EUW',
    description: 'Casual weekend player, just here for fun and good company.',
    requirements: { role: Role.SUPPORT },
  },
];

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
  const filteredPlayers: MatchPlayer[] = useMemo((): MatchPlayer[] => {
    const query: string = appliedFilters.description.trim().toLowerCase();

    return players.filter((player) => {
      return (
        (appliedFilters.ranks.length === 0 || appliedFilters.ranks.includes(player.rank)) &&
        (appliedFilters.roles.length === 0 || player.roles.some((role) => appliedFilters.roles.includes(role))) &&
        (appliedFilters.regions.length === 0 || appliedFilters.regions.includes(player.region)) &&
        (query === '' || player.description.toLowerCase().includes(query))
      );
    });
  }, [appliedFilters]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalPages: number = Math.max(1, Math.ceil(filteredPlayers.length / PAGE_SIZE));
  const shownPlayers: MatchPlayer[] = filteredPlayers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
        <MultiSelectDropdown
          label="Rank"
          options={rankOptions}
          selected={appliedFilters.ranks}
          onChange={(ranks) => setNewFilters({ ...newFilters, ranks })}
        />
        <MultiSelectDropdown
          label="Role"
          options={roleOptions}
          selected={appliedFilters.roles}
          onChange={(roles) => setNewFilters({ ...newFilters, roles })}
        />
        <MultiSelectDropdown
          label="Region"
          options={regionOptions}
          selected={appliedFilters.regions}
          onChange={(regions) => setNewFilters({ ...newFilters, regions })}
        />
        <input
          type="search"
          className="matchme-search"
          placeholder="Search descriptions..."
          value={appliedFilters.description}
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
          {filteredPlayers.length === 0 && (
            <tr>
              <td colSpan={6} className="matchme-empty">
                No players match the selected filters.
              </td>
            </tr>
          )}
          {shownPlayers.map((candidate) => (
            <tr key={candidate.id}>
              <td>
                <img className="player-icon" src="/Avatar_Default.webp" alt="" />
                <Link to={`/dashboard/${candidate.username}`}>@{candidate.username}</Link>
              </td>
              <td>
                <img className="rank-icon" src={`/Season_2023_-_${candidate.rank}.webp`} alt={candidate.rank} />
              </td>
              <td>
                <div className="role-icons">
                  {candidate.roles.map((role) => (
                    <img key={role} className="role-icon" src={`/Role_${role}.webp`} alt={role} />
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
                    {key}: {String(value)}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredPlayers.length > PAGE_SIZE && (
        <div className="matchme-pagination">
          <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
