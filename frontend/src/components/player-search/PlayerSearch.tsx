import './PlayerSearch.css';

import { Search as SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { searchUsers, type UserSearchResult } from '@/services/userService';

const SEARCH_TIMER: number = 300;
const SEARCH_PAGE_SIZE: number = 5;

export default function PlayerSearch() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchedQuery, setSearchedQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const trimmedQuery: string = searchQuery.trim();
  const hasSearched: boolean = searchedQuery === trimmedQuery;

  useEffect(() => {
    if (!trimmedQuery) return;

    const timeoutId: number = window.setTimeout(() => {
      searchUsers({ username: trimmedQuery, pageSize: SEARCH_PAGE_SIZE })
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
    <form className="player-search" onSubmit={(event) => event.preventDefault()}>
      <SearchIcon className="player-search-icon" />
      <input
        className="player-search-input"
        type="text"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        onFocus={() => setIsSearchOpen(true)}
        onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 150)}
        placeholder="Search Players"
        maxLength={24}
      />
      {isSearchOpen && trimmedQuery && hasSearched && (
        <ul className="player-search-results popover">
          {searchResults.length > 0 ? (
            searchResults.map((result) => (
              <li key={result.userId}>
                <Link className="player-search-result" to={`/dashboard/${result.userId}`} onClick={handleResultClick}>
                  <img className="player-search-result-avatar avatar" src={result.avatarPath} alt="" />
                  <div className="player-search-result-info stack">
                    <span className="player-search-result-username">{result.username}</span>
                    {result.tagline && <span className="player-search-result-tagline ellipsis">{result.tagline}</span>}
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="player-search-empty">No users found</li>
          )}
        </ul>
      )}
    </form>
  );
}
