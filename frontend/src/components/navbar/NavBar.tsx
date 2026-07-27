import './NavBar.css';
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const authContext: AuthContextType = useContext(AuthContext);

  function handleLogoutButton(): void {
    authContext.setUserId(null);
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">DuoMeep</div>
        <div>{authContext.userId ? <Link to="/match-me">Match Me</Link> : <Link to="/">Home</Link>}</div>
      </div>
      <div className="navbar-right">
        {authContext.userId ? (
          <>
            <Link to={`/dashboard/${authContext.userId}`}> Profile </Link>
            <Link to={`/dashboard/${authContext.userId}/settings`}> Settings </Link>
            <button onClick={handleLogoutButton} className="Btn">
              <div className="sign">
                <svg viewBox="0 0 512 512">
                  <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                </svg>
              </div>
              <div className="text">Logout</div>
            </button>
          </>
        ) : (
          <>
            <Link to="/auth/login">Login</Link>
            <Link to="/auth/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
