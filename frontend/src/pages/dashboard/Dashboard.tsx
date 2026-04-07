import './Dashboard.css';
import { useEffect, useState } from 'react';
import { getUserInfo } from '../../services/userService';
import { type UserInfo } from '../../models/user';

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

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    try {
      const userId: string | null = localStorage.getItem('userId');

      if (!userId) {
        console.error('No userId found in localStorage');
        return;
      }

      getUserInfo(userId).then((userInfo: UserInfo) => {
        setUserInfo(userInfo);
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }, []);

  return (
    <div className="dash">
      <header className="dash-header">
        <div>
          <h1>Profile</h1>
          <p className="muted">Manage your profile and find your next duo.</p>
        </div>

        <button className="btn">Edit profile</button>
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
            <div className="profile-top">
              <div className="avatar" aria-label="User avatar">
                <img
                  src="https://wiki.leagueoflegends.com/en-us/images/Little_Legend_Dango_profileicon.png?d69ff"
                  alt="Avatar"
                />
              </div>

              <div className="profile-meta">
                <h2>{user.username}</h2>
                <p className="muted">{user.tagline}</p>
              </div>
            </div>

            <div className="chips">
              <span className="chip">{user.region}</span>
              <span className="chip">{user.role}</span>
              <span className="chip">{user.rank}</span>
              <span className="chip">{user.duoGoal}</span>
            </div>

            <p className="bio">{user.bio}</p>

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
    </div>
  );
}
