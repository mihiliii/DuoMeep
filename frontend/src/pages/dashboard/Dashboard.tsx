import './Dashboard.css';
import { useEffect, useState } from 'react';
import { getUserInfoUsername } from '../../services/userService';
import { type UserDashboard } from '../../models/user';
import { useParams } from 'react-router-dom';
import Settings from './Settings';

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

  const { username }: { username?: string } = useParams();

  const [userInfo, setUserInfo] = useState<UserDashboard | null>(null);
  const [isUserOwnProfile, setIsUserOwnProfile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [pageLoaded, setPageLoaded] = useState<boolean>(false);
  const [pageError, setPageError] = useState<boolean>(false);

  useEffect(() => {
    try {
      const userId: string | null = localStorage.getItem('userId');

      if (!userId) {
        throw new Error('UserId not found in localStorage - user might not be logged in');
      }

      if (!username) {
        throw new Error('Username is required in URL params');
      }

      getUserInfoUsername(username).then((userInfo: UserDashboard) => {
        setUserInfo(userInfo);
        setPageLoaded(true);
        setIsUserOwnProfile(localStorage.getItem('username') === username);
      });
    } catch (err: unknown) {
      console.error('Error fetching user info:', err);
      setPageError(true);
    }
  }, []);

  if (!pageLoaded) return <div></div>;
  if (pageError) return <div>Error loading user info, check console for more info.</div>;

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
          {/* BANNER */}
          <div
            className="profile-banner"
            style={{
              backgroundImage: 'url(https://pbs.twimg.com/media/E6crCruVIAAYArr.jpg)',
            }}
          />

          {/* BODY */}
          <div className="profile-body">
            <div className="chips-and-settings">
              <div className="chips">
                <span className="chip">{user.region}</span>
                <span className="chip">{user.role}</span>
                <span className="chip">{user.rank}</span>
                <span className="chip">{user.duoGoal}</span>
              </div>
            </div>

            <div className="profile-top">
              <div className="avatar" aria-label="User avatar">
                <img src={userInfo?.dashboard.profilePicture} alt="Avatar" />
              </div>

              <div className="profile-meta">
                <p>{userInfo?.username}</p>
                <p className="muted">{userInfo?.dashboard.tagline}</p>
              </div>

              {/* <div className="settings">
                {isUserOwnProfile && (
                  <button className="btn-settings" onClick={() => setIsSettingsOpen(true)}>
                    <span>Edit profile</span>
                  </button>
                )}
              </div> */}
            </div>

            <p className="bio">{userInfo?.dashboard.bio}</p>

            <div className="stats">
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
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
