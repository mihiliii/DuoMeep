import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MultiSelectDropdown from '../../components/multi-select-dropdown/MultiSelectDropdown';
import { Rank, Role, Region } from '../../types/account';
import './MatchMe.css';

interface MatchRequirements {
  minRank?: Rank;
  role?: Role;
}

interface MatchCandidate {
  id: number;
  username: string;
  rank: string;
  roles: string[];
  region: string;
  description: string;
  requirements: MatchRequirements;
}

const candidates: MatchCandidate[] = [
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
];

const rankOptions: Rank[] = Object.values(Rank);
const roleOptions: Role[] = Object.values(Role);
const regionOptions: Region[] = Object.values(Region);

export default function MatchMe() {
  const [selectedRanks, setSelectedRanks] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const filteredCandidates: MatchCandidate[] = useMemo(
    () =>
      candidates.filter((candidate: MatchCandidate) => {
        const rankMatch: boolean = selectedRanks.length === 0 || selectedRanks.includes(candidate.rank);
        const roleMatch: boolean =
          selectedRoles.length === 0 || candidate.roles.some((role: string) => selectedRoles.includes(role));
        const regionMatch: boolean = selectedRegions.length === 0 || selectedRegions.includes(candidate.region);
        return rankMatch && roleMatch && regionMatch;
      }),
    [selectedRanks, selectedRoles, selectedRegions],
  );

  return (
    <div className="matchme">
      <header className="matchme-header">
        <h1>Match Me</h1>
        <p className="muted">Players looking for a duo right now.</p>
      </header>
      <div className="matchme-filters">
        <MultiSelectDropdown label="Rank" options={rankOptions} selected={selectedRanks} onChange={setSelectedRanks} />
        <MultiSelectDropdown label="Role" options={roleOptions} selected={selectedRoles} onChange={setSelectedRoles} />
        <MultiSelectDropdown
          label="Region"
          options={regionOptions}
          selected={selectedRegions}
          onChange={setSelectedRegions}
        />
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
          {filteredCandidates.length === 0 && (
            <tr>
              <td colSpan={6} className="matchme-empty">
                No players match the selected filters.
              </td>
            </tr>
          )}
          {filteredCandidates.map((candidate: MatchCandidate) => (
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
                  {candidate.roles.map((role: string) => (
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
    </div>
  );
}
