import './NavBar.css';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../../context/AuthContext';
import { searchUsers, type UserSearchResult } from '../../services/userService';

const SEARCH_TIMER: number = 1000;

export default function Navbar() {
  const authContext: AuthContextType = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchedQuery, setSearchedQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const trimmedQuery: string = searchQuery.trim();
  const hasSearched: boolean = searchedQuery === trimmedQuery;

  function handleLogout(): void {
    authContext.setUserId(null);
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
            <Link to={`/settings/${authContext.userId}`}> Settings </Link>
            <Link to="/" onClick={handleLogout}>
              Logout
            </Link>
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
