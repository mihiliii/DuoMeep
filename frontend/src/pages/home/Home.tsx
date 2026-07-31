import './Home.css';
import { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import homepageImage from '../../assets/homepage.jpg';
import bardImage from '../../assets/bard.jpg';

export default function Home() {
  const { userId } = useContext(AuthContext);

  if (userId) {
    return <Navigate to="/match-me" replace />;
  }

  return (
    <div className="home">
      <div
        className="home-main"
        style={{ backgroundImage: `linear-gradient(rgba(14,14,14,0.7), rgba(14,14,14,0.7)), url(${homepageImage})` }}
      >
        <h1 className="home-main-title">
          Find your
          <br />
          perfect duo
        </h1>
        <p className="home-main-sub">Match with players who fit your rank, role, and vibe.</p>
        <Link to="/auth/signup" className="home-main-cta">
          Sign Up Now
        </Link>
      </div>
      <div className="home-steps">
        <div className="home-step">
          <span className="home-step-num">01</span>
          <h3>Create your profile</h3>
          <p>Set your rank, roles, and region so the right players can find you.</p>
        </div>
        <div className="home-step">
          <span className="home-step-num">02</span>
          <h3>Browse players</h3>
          <p>Filter by rank, role, and region to find someone who matches your playstyle.</p>
        </div>
        <div className="home-step">
          <span className="home-step-num">03</span>
          <h3>Start playing</h3>
          <p>Connect and climb together.</p>
        </div>
      </div>
      <div className="about-main">
        <div className="about-content">
          <div className="about-left">
            <img src={bardImage} alt="Bard" className="about-bard" />
          </div>
          <div className="about-right">
            <h2 className="about-title">About</h2>
            <p className="about-lead">A duo finder built for players who take the game seriously.</p>
            <ul className="about-details">
              <li>For League of Legends</li>
              <li>Solo queue, better together</li>
              <li>Free to use, always</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
