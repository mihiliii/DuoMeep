import './Home.css';

import { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';

import bardImage from '@/assets/bard.jpg';
import homepageImage from '@/assets/homepage.jpg';
import { SessionContext } from '@/context/SessionContext';

export default function Home() {
  const { userId } = useContext(SessionContext);

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
        <p className="home-main-sub">Connect with players who fit your rank, role, and vibe.</p>
        <div className="home-main-actions">
          <Link to="/auth/login" className="home-main-btn home-main-btn-secondary">
            Login
          </Link>
          <Link to="/auth/signup" className="home-main-btn">
            Sign Up
          </Link>
        </div>
      </div>
      <div className="home-steps">
        <div className="home-step">
          <span className="home-step-num">01</span>
          <h3>Link your account</h3>
          <p>
            Add your in-game name, your region and the rank you actually play at. A tagline and a short bio do the rest,
            so people know who they are queueing with before they ever message you.
          </p>
        </div>
        <div className="home-step">
          <span className="home-step-num">02</span>
          <h3>Post what you want</h3>
          <p>
            Pick up to two roles you are happy to lock in and say what you are after: a serious climb, relaxed normals,
            or simply someone who will not dodge at champion select.
          </p>
        </div>
        <div className="home-step">
          <span className="home-step-num">03</span>
          <h3>Filter, message, review</h3>
          <p>
            Narrow the board by rank, role and region until only real matches are left, message whoever fits, then leave
            a review once you have played. Good duos become easy to spot.
          </p>
        </div>
      </div>
      <div className="about-main">
        <div className="about-content">
          <img src={bardImage} alt="Bard" className="about-image" />
          <div className="about-right">
            <h2 className="about-title">About</h2>
            <p className="about-lead">
              Solo queue hands you four strangers every game. DuoMeep exists to help you find the one player you would
              have picked on purpose.
            </p>
            <ul className="about-details">
              <li>Built for League of Legends across NA, EUW, EUNE and KR</li>
              <li>Filter by rank, role and region, so the board only shows people you would actually queue with</li>
              <li>Reviews stay on a player's profile, so a reliable duo builds a reputation that travels with them</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
