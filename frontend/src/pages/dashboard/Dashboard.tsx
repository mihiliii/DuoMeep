import './Dashboard.css';
import { useEffect, useState } from 'react';
import { getDashboard, type UserData } from '../../services/userService';
import { getGameAccountByUserId, type GameAccountResponse } from '../../services/gameAccountService';
import { ApiError } from '../../services/apiError';
import { useParams } from 'react-router-dom';

function toTitleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default function Dashboard() {
  const params: { userId?: string } = useParams();
  const [dashboard, setDashboard] = useState<UserData | null>(null);
  const [gameAccount, setGameAccount] = useState<GameAccountResponse | null>(null);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isPageError, setIsPageError] = useState<boolean>(false);

  useEffect(() => {
    const fetchDashboard = async (): Promise<void> => {
      try {
        if (!params.userId) {
          throw new Error('User ID is required in URL params.');
        }

        const [data, account]: [UserData, GameAccountResponse | null] = await Promise.all([
          getDashboard(params.userId),
          getGameAccountByUserId(params.userId).catch((err: unknown) => {
            if (err instanceof ApiError && err.statusCode === 404) return null;
            throw err;
          }),
        ]);
        setDashboard(data);
        setGameAccount(account);
        setIsPageLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setIsPageError(true);
      }
    };
    fetchDashboard();
  }, [params.userId]);

  if (isPageLoading) return <div></div>;
  if (isPageError) return <div>Error loading user info, check console for more info.</div>;

  return (
    <div className="dash">
      <main className="dash-grid">
        <div className="card profile">
          <div
            className="profile-banner"
            style={
              dashboard?.dashboard.banner
                ? { backgroundImage: `url(${dashboard.dashboard.banner})` }
                : { backgroundColor: 'gray' }
            }
          />
          <div className="profile-body">
            <div className="profile-top">
              <div className="profile-identity">
                <div className="profile-avatar">
                  <img src={dashboard?.userInfo.avatarPath} alt="Avatar" />
                </div>
                <div className="profile-top-names">
                  <div className="profile-top-displayname">
                    <span>{dashboard?.userInfo.username}</span>
                  </div>
                  <div className="profile-top-tagline">
                    <span>{dashboard?.dashboard.tagline}</span>
                  </div>
                </div>
              </div>
              {gameAccount ? (
                <div className="game-account-info">
                  <img
                    className="game-account-rank-icon"
                    src={`/Season_2023_-_${toTitleCase(gameAccount.rank)}.webp`}
                    alt={gameAccount.rank}
                  />
                  <div className="game-account-details">
                    <div className="game-account-name-region">
                      <span>{gameAccount.name}</span>
                      <span className="muted">{gameAccount.region}</span>
                    </div>
                    <div className="game-account-rank-text">{toTitleCase(gameAccount.rank)}</div>
                  </div>
                </div>
              ) : (
                <p className="muted">No game account linked yet.</p>
              )}
            </div>
          </div>
        </div>
        <div className="card">
          <h3>Your activity</h3>
          <p className="muted">Later: messages, matches, saved duos, etc.</p>
          <div className="activity">
            <div className="activity-item">
              <span className="badge">New</span>
              <span>2 new duo requests</span>
            </div>
            <div className="activity-item">
              <span className="badge">Tip</span>
              <span>Complete your profile for better matches</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
