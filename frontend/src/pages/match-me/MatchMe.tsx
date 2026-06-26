import { Link } from 'react-router-dom';
import './MatchMe.css';

interface MatchCandidate {
  id: number;
  username: string;
  rank: string;
  roles: string[];
  region: string;
  description: string;
  requirements: Record<string, string>;
}

const candidates: MatchCandidate[] = [
  {
    id: 1,
    username: 'saske',
    rank: 'Gold',
    roles: ['Support'],
    region: 'EUNE',
    description: 'Chill support main looking for a consistent ADC duo.',
    requirements: { minRank: 'Gold', role: 'ADC', voice: 'Discord' },
  },
  {
    id: 2,
    username: 'elena',
    rank: 'Platinum',
    roles: ['Mid', 'Top'],
    region: 'EUW',
    description: 'Climbing to Diamond, plays evenings.',
    requirements: { minRank: 'Platinum', availability: 'Evenings' },
  },
  {
    id: 3,
    username: 'mihi',
    rank: 'Silver',
    roles: ['Jungle'],
    region: 'EUNE',
    description: 'Learning jungle, good vibes only.',
    requirements: { role: 'Mid', voice: 'Optional' },
  },
  {
    id: 4,
    username: 'lehends',
    rank: 'Diamond',
    roles: ['Bot', 'Support'],
    region: 'KR',
    description: 'Smurfing, wants a serious support to climb fast.',
    requirements: { minRank: 'Diamond', role: 'Support', voice: 'Discord' },
  },
];

export default function MatchMe() {
  return (
    <div className="matchme">
      <header className="matchme-header">
        <h1>Match Me</h1>
        <p className="muted">Players looking for a duo right now.</p>
      </header>
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
          {candidates.map((candidate: MatchCandidate) => (
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
