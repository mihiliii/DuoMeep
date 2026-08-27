import './NavBar.css';

import {
  LogOut as LogOutIcon,
  Menu as MenuIcon,
  MessageCircle as MessageCircleIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  UserRound as UserRoundIcon,
  Users as UsersIcon,
} from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { SessionContext, type SessionContextType } from '@/context/SessionContext';
import { searchUsers, type UserSearchResult } from '@/services/userService';

const SEARCH_TIMER: number = 200;

export default function Navbar() {
  const session: SessionContextType = useContext(SessionContext);
  const isAdminSession: boolean = session.adminId !== null;
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchedQuery, setSearchedQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const trimmedQuery: string = searchQuery.trim();
  const hasSearched: boolean = searchedQuery === trimmedQuery;

  function handleLogout(): void {
    session.setUserId(null);
    setIsMenuOpen(false);
  }

  function handleAdminLogout(): void {
    session.setAdminId(null);
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
      searchUsers({ username: trimmedQuery, pageSize: 3 })
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
        {isAdminSession && (
          <div className="navbar-admin-nav">
            <NavLink to="/admin/users" className="navbar-admin-link">
              Users
            </NavLink>
            <NavLink to="/admin/reviews" className="navbar-admin-link">
              Reviews
            </NavLink>
            <NavLink to="/admin/posts" className="navbar-admin-link">
              Posts
            </NavLink>
          </div>
        )}
        {session.userId && !isAdminSession && (
          <form className="navbar-search" onSubmit={(event) => event.preventDefault()}>
            <SearchIcon className="navbar-search-icon" />
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
              <ul className="navbar-search-results popover">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <li key={result.userId}>
                      <Link
                        className="navbar-search-result"
                        to={`/dashboard/${result.userId}`}
                        onClick={handleResultClick}
                      >
                        <img className="navbar-search-result-avatar avatar" src={result.avatarPath} alt="" />
                        <div className="navbar-search-result-info stack">
                          <span className="navbar-search-result-username">{result.username}</span>
                          {result.tagline && (
                            <span className="navbar-search-result-tagline ellipsis">{result.tagline}</span>
                          )}
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
        {session.userId && !isAdminSession && (
          <>
            <div className="navbar-menu" ref={menuRef}>
              <button
                type="button"
                className="navbar-icon-link navbar-menu-trigger center"
                onClick={() => setIsMenuOpen((open) => !open)}
                title="Menu"
                aria-label="Menu"
              >
                <MenuIcon className="navbar-icon" />
              </button>
              {isMenuOpen && (
                <ul className="navbar-menu-dropdown popover">
                  <li>
                    <Link to="/match-me" onClick={() => setIsMenuOpen(false)}>
                      <UsersIcon className="navbar-icon" />
                      Match Me
                    </Link>
                  </li>
                  <li>
                    <Link to="/messages" onClick={() => setIsMenuOpen(false)}>
                      <MessageCircleIcon className="navbar-icon" />
                      Messages
                    </Link>
                  </li>
                  <li>
                    <Link to={`/dashboard/${session.userId}`} onClick={() => setIsMenuOpen(false)}>
                      <UserRoundIcon className="navbar-icon" />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link to={`/settings/${session.userId}`} onClick={() => setIsMenuOpen(false)}>
                      <SettingsIcon className="navbar-icon" />
                      Settings
                    </Link>
                  </li>
                  <li>
                    <Link to="/" onClick={handleLogout}>
                      <LogOutIcon className="navbar-icon" />
                      Logout
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </>
        )}
        {!session.userId && !isAdminSession && (
          <>
            <Link to="/">Home</Link>
            <Link to="/auth/login">Login</Link>
            <Link to="/auth/signup">Sign up</Link>
          </>
        )}
        {isAdminSession && (
          <Link to="/admin/login" onClick={handleAdminLogout}>
            Log out
          </Link>
        )}
      </div>
    </nav>
  );
}
