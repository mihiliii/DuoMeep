import './NavBar.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../../context/AuthContext';
import { searchUsers, type UserSearchResult } from '../../services/userService';

const SEARCH_TIMER: number = 200;

function MatchMeIcon() {
  return (
    <svg
      className="navbar-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MessagesIcon() {
  return (
    <svg
      className="navbar-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      className="navbar-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      className="navbar-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.58-6 8-6s8 2 8 6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className="navbar-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      className="navbar-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function Navbar() {
  const authContext: AuthContextType = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchedQuery, setSearchedQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const trimmedQuery: string = searchQuery.trim();
  const hasSearched: boolean = searchedQuery === trimmedQuery;

  function handleLogout(): void {
    authContext.setUserId(null);
    setIsMenuOpen(false);
  }

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

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
      </div>
      <div className="navbar-center">
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
                        <div className="navbar-search-result-info">
                          <span className="navbar-search-result-username">{result.username}</span>
                          {result.tagline && <span className="navbar-search-result-tagline">{result.tagline}</span>}
                        </div>
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
            <div className="navbar-menu" ref={menuRef}>
              <button
                type="button"
                className="navbar-icon-link navbar-menu-trigger"
                onClick={() => setIsMenuOpen((open) => !open)}
                title="Menu"
                aria-label="Menu"
              >
                <MenuIcon />
              </button>
              {isMenuOpen && (
                <ul className="navbar-menu-dropdown">
                  <li>
                    <Link to="/match-me" onClick={() => setIsMenuOpen(false)}>
                      <MatchMeIcon />
                      Match Me
                    </Link>
                  </li>
                  <li>
                    <Link to="/messages" onClick={() => setIsMenuOpen(false)}>
                      <MessagesIcon />
                      Messages
                    </Link>
                  </li>
                  <li>
                    <Link to={`/dashboard/${authContext.userId}`} onClick={() => setIsMenuOpen(false)}>
                      <ProfileIcon />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link to={`/settings/${authContext.userId}`} onClick={() => setIsMenuOpen(false)}>
                      <SettingsIcon />
                      Settings
                    </Link>
                  </li>
                  <li>
                    <Link to="/" onClick={handleLogout}>
                      <LogoutIcon />
                      Logout
                    </Link>
                  </li>
                </ul>
              )}
            </div>
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
