import './Dashboard.css';
import { useContext, useEffect, useState } from 'react';
import { getDashboard } from '../../services/userService';
import { type IUserDashboard } from '../../models/user';
import { useParams } from 'react-router-dom';
import Settings from './Settings';
import { AuthContext } from '../../context/AuthContext';

export default function Dashboard() {
  const user = {
    username: 'Elena',
    tagline: 'Best bardo eune mwah',
    rank: 'Gold IV',
    role: 'Support',
    region: 'EUW',
    duoGoal: 'Climb & chill',
    bio: 'Looking for a consistent duo. Good vibes, no flaming.',
    stats: {
      matches: 124,
      winrate: '52%',
      availability: 'Evenings',
    },
  };

  const { userId } = useContext(AuthContext);
  const { username }: { username?: string } = useParams();

  const [dashboard, setDashboard] = useState<IUserDashboard | null>(null);

  const [isDashboardOwner, setIsDashboardOwner] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isPageLoaded, setIsPageLoaded] = useState<boolean>(false);
  const [isPageError, setIsPageError] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (!userId) {
        throw new Error('UserId not found in localStorage - user might not be logged in');
      }

      if (!username) {
        throw new Error('Username is required in URL params');
      }

      getDashboard(username).then((dashboardData: IUserDashboard) => {
        setDashboard(dashboardData);
        setIsDashboardOwner(userId === dashboardData.userId);
        setIsPageLoaded(true);
      });
    } catch (err) {
      console.error('Error fetching user info:', err);
      setIsPageError(true);
    }
  }, [userId, username]);

  if (isPageError) return <div>Error loading user info, check console for more info.</div>;
  if (!isPageLoaded) return <div></div>;

  return (
    <div className="dash">
      <header className="dash-header">
        <div>
          <h1>Profile</h1>
          <p className="muted">Manage your profile and find your next duo.</p>
        </div>
      </header>

      <main className="dash-grid">
        <section className="card profile">
          <div
            className="profile-banner"
            style={{
              backgroundImage: 'url(https://pbs.twimg.com/media/E6crCruVIAAYArr.jpg)',
            }}
          />

          <div className="profile-body">
            {isDashboardOwner && (
              <button className="Btn-settings" onClick={() => setIsSettingsOpen(true)}>
                <svg
                  className="icon-settings"
                  viewBox="0 0 64 64"
                  xmlns="http://www.w3.org/2000/svg"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                >
                  <path d="M45,14.67l-2.76,2a1,1,0,0,1-1,.11L37.65,15.3a1,1,0,0,1-.61-.76l-.66-3.77a1,1,0,0,0-1-.84H30.52a1,1,0,0,0-1,.77l-.93,3.72a1,1,0,0,1-.53.65l-3.3,1.66a1,1,0,0,1-1-.08l-3-2.13a1,1,0,0,0-1.31.12l-3.65,3.74a1,1,0,0,0-.13,1.26l1.87,2.88a1,1,0,0,1,.1.89L16.34,27a1,1,0,0,1-.68.63l-3.85,1.06a1,1,0,0,0-.74,1v4.74a1,1,0,0,0,.8,1l3.9.8a1,1,0,0,1,.72.57l1.42,3.15a1,1,0,0,1-.05.92l-2.13,3.63a1,1,0,0,0,.17,1.24L19.32,49a1,1,0,0,0,1.29.09L23.49,47a1,1,0,0,1,1-.1l3.74,1.67a1,1,0,0,1,.59.75l.66,3.79a1,1,0,0,0,1,.84h4.89a1,1,0,0,0,1-.86l.58-4a1,1,0,0,1,.58-.77l3.58-1.62a1,1,0,0,1,1,.09l3.14,2.12a1,1,0,0,0,1.3-.15L50,45.06a1,1,0,0,0,.09-1.27l-2.08-3a1,1,0,0,1-.09-1l1.48-3.43a1,1,0,0,1,.71-.59L53.77,35a1,1,0,0,0,.8-1V29.42a1,1,0,0,0-.8-1l-3.72-.78a1,1,0,0,1-.73-.62l-1.45-3.65a1,1,0,0,1,.11-.94l2.15-3.14A1,1,0,0,0,50,18l-3.71-3.25A1,1,0,0,0,45,14.67Z" />
                  <circle cx="32.82" cy="31.94" r="9.94" />
                </svg>
              </button>
            )}

            <div className="profile-top">
              <div className="profile-avatar" aria-label="User avatar">
                <img src={dashboard?.userInfo.avatarPath} alt="Avatar" />
              </div>

              <div className="profile-top-right">
                <div className="profile-top-names">
                  <div className="profile-top-displayname">
                    <span>{dashboard?.userInfo.displayName}</span>
                  </div>

                  <div className="profile-top-username">
                    <span>@{username}</span>
                  </div>
                </div>

                <div className="profile-top-chips">
                  <span className="chip">{user.region}</span>
                  <span className="chip">{user.role}</span>
                  <span className="chip">{user.rank}</span>
                  <span className="chip">{user.duoGoal}</span>
                </div>

                {/* <span className="muted">{dashboard?.userProfile.tagline}</span> */}
              </div>
            </div>

            <div className="profile-bio">
              <span className="profile-title">Bio</span>
              <span className="profile-bio">{dashboard?.userProfile.bio}</span>
            </div>

            <div className="stats">
              <h3>Game stats</h3>
              <div className="stats-links">
                <a
                  href="https://op.gg/lol/summoners/eune/lehends%20fanboy-saske"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-link"
                >
                  <div className="stat">
                    <img src="https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/91ae2e211d99a8beff2f2febed20ba51fec055ac-3840x2160.jpg?accountingTag=LoL"></img>
                  </div>
                </a>
                <div className="stat">
                  <img src="https://assets.xboxservices.com/assets/4e/bc/4ebcb533-e184-42f3-833b-9aa47a81f39e.jpg?n=153142244433_Poster-Image-1084_1920x720.jpg"></img>
                </div>
                <div className="stat">
                  <img src="https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/b73db1e6cf4c92e8e3550fc20a5b124f802a8165-1920x1080.jpg?accountingTag=TFT&auto=format&fit=fill&q=80&w=1082"></img>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
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
        </section>
      </main>
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentAvatarUrl={dashboard?.userInfo.avatarPath ?? null} />
    </div>
  );
}
