import './NavBar.css';
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../../context/AuthContext';
import { searchUsers, type UserSearchResult } from '../../services/userService';

const SEARCH_TIMER: number = 1000;

export default function Navbar() {
  const navigate = useNavigate();
  const authContext: AuthContextType = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchedQuery, setSearchedQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const trimmedQuery: string = searchQuery.trim();
  const hasSearched: boolean = searchedQuery === trimmedQuery;

  function handleLogoutButton(): void {
    authContext.setUserId(null);
    navigate('/');
  }

  useEffect(() => {
    if (!trimmedQuery) return;

    const timeoutId: number = window.setTimeout(() => {
      searchUsers(trimmedQuery)
        .then((response) => {
          setSearchResults(response.results);
          setSearchedQuery(trimmedQuery);
        })
        .catch((err: unknown) => console.error('Error searching for players:', err));
    }, SEARCH_TIMER);

    return () => window.clearTimeout(timeoutId);
  }, [trimmedQuery]);

  function handleResultClick(): void {
    setSearchQuery('');
    setSearchedQuery('');
    setSearchResults([]);
    setIsSearchOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">DuoMeep</div>
        {authContext.userId && (
          <form className="navbar-search" onSubmit={(event) => event.preventDefault()}>
            <svg
              className="navbar-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="navbar-search-input"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 150)}
              placeholder="Search Players"
              maxLength={24}
            />
            {isSearchOpen && trimmedQuery && hasSearched && (
              <ul className="navbar-search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <li key={result.userId}>
                      <Link
                        className="navbar-search-result"
                        to={`/dashboard/${result.userId}`}
                        onClick={handleResultClick}
                      >
                        <img className="navbar-search-result-avatar" src={result.avatarPath} alt="" />
                        <span>{result.username}</span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="navbar-search-empty">No users found</li>
                )}
              </ul>
            )}
          </form>
        )}
      </div>
      <div className="navbar-right">
        {authContext.userId ? (
          <>
            <Link to="/match-me">Match Me</Link>
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
            <Link to="/">Home</Link>
            <Link to="/auth/login">Login</Link>
            <Link to="/auth/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
