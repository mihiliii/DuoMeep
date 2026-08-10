import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../../../../components/pagination/Pagination';
import FilterPanel, { type FilterField } from '../../../../components/filter-panel/FilterPanel';
import { Rank, Region } from '../../../../types/account';
import { searchUsers, deleteUser, type UserSearchResult } from '../../../../services/userService';
import { ApiError } from '../../../../services/apiError';

const PAGE_SIZE: number = 10;

const rankOptions: Rank[] = Object.values(Rank);
const regionOptions: Region[] = Object.values(Region);

type UserFilters = {
  username: string;
  account: string;
  ranks: Rank[];
  regions: Region[];
  dateFrom: string;
  dateTo: string;
};

const emptyFilters: UserFilters = {
  username: '',
  account: '',
  ranks: [],
  regions: [],
  dateFrom: '',
  dateTo: '',
};

const userFilterFields: FilterField<UserFilters>[] = [
  { kind: 'search', key: 'username', label: 'Username' },
  { kind: 'search', key: 'account', label: 'Game account' },
  { kind: 'multiSelect', key: 'ranks', label: 'Rank', options: rankOptions },
  { kind: 'multiSelect', key: 'regions', label: 'Region', options: regionOptions },
  { kind: 'dateRange', fromKey: 'dateFrom', toKey: 'dateTo', fromLabel: 'Created from', toLabel: 'Created to' },
];

export default function AdminUsers() {
  const [appliedFilters, setAppliedFilters] = useState<UserFilters>(emptyFilters);
  const [newFilters, setNewFilters] = useState<UserFilters>(emptyFilters);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [version, setVersion] = useState<number>(0);
  const [confirmingId, setConfirmingId] = useState<string>('');

  useEffect(() => {
    let cancelled: boolean = false;

    async function fetchUsers(): Promise<void> {
      setLoading(true);
      setError('');

      try {
        const response = await searchUsers({
          ...appliedFilters,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });

        if (cancelled) return;
        setUsers(response.results);
        setTotalPages(response.totalPages);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load users.');
        setUsers([]);
        setTotalPages(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, currentPage, version]);

  function handleApplySearch(): void {
    setAppliedFilters(newFilters);
    setCurrentPage(1);
  }

  async function handleDelete(userId: string): Promise<void> {
    if (confirmingId !== userId) {
      setConfirmingId(userId);
      return;
    }

    setConfirmingId('');

    try {
      await deleteUser(userId);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete user.');
    }
  }

  return (
    <div className="admin-body">
      <FilterPanel
        className="admin-filters"
        fields={userFilterFields}
        values={newFilters}
        onChange={setNewFilters}
        submitLabel="Search"
        onSubmit={handleApplySearch}
      />
      <div className="admin-content">
        <table className="data-table">
          <colgroup>
            <col />
            <col className="admin-col-account" />
            <col className="admin-col-rank" />
            <col className="admin-col-region" />
            <col className="admin-col-date" />
            <col className="admin-col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>User</th>
              <th>Game account</th>
              <th>Rank</th>
              <th>Region</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {error !== '' && (
              <tr>
                <td colSpan={6} className="admin-empty">
                  {error}
                </td>
              </tr>
            )}
            {error === '' && !loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-empty">
                  No users found.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.userId}>
                <td>
                  <div className="admin-user-cell">
                    <Link to={`/dashboard/${user.userId}`}>
                      <img className="admin-avatar avatar" src={user.avatarPath} alt="" />
                    </Link>
                    <div className="stack">
                      <Link to={`/dashboard/${user.userId}`}>{user.username}</Link>
                      {user.tagline && <span className="muted player-tagline">{user.tagline}</span>}
                    </div>
                  </div>
                </td>
                <td className="admin-comment">{user.accountName || <span className="muted">None</span>}</td>
                <td>{user.rank || <span className="muted">-</span>}</td>
                <td>{user.region || <span className="muted">-</span>}</td>
                <td className="admin-nowrap">
                  {new Date(user.dateCreated).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                </td>
                <td>
                  <button type="button" className="btn btn-red" onClick={() => handleDelete(user.userId)}>
                    {confirmingId === user.userId ? 'Confirm?' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {totalPages > 1 && (
            <tfoot>
              <tr>
                <td colSpan={6}>
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
