import './MatchMePostPanel.css';

import { useEffect, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';

import MultiSelectButton from '@/components/multi-select-button/MultiSelectButton';
import { Role } from '@/enums/account';
import { ApiError } from '@/services/apiError';
import { getGameAccountByUserId, type GameAccount } from '@/services/gameAccountService';
import { createMatchMe, deleteMatchMe, getMatchMe, type MatchMeResponse } from '@/services/matchmeService';

type OwnPostState =
  | { status: 'loading' }
  | { status: 'posted'; post: MatchMeResponse; account: GameAccount | null }
  | { status: 'canPost'; account: GameAccount }
  | { status: 'noAccount' }
  | { status: 'error'; message: string };

type MatchMePostPanelProps = {
  userId: string;
  onPostCreated: () => void;
  onPostDeleted: () => void;
};

function nullOn404<T>(err: unknown): T | null {
  if (err instanceof ApiError && err.statusCode === 404) return null;
  throw err;
}

const roleOptions: Role[] = Object.values(Role);

export default function MatchMePostPanel({ userId, onPostCreated, onPostDeleted }: MatchMePostPanelProps) {
  const [createPostRoles, setCreatePostRoles] = useState<Role[]>([]);
  const [createPostDescription, setCreatePostDescription] = useState<string>('');
  const [createPostError, setCreatePostError] = useState<string>('');

  const [ownPostState, setOwnPostState] = useState<OwnPostState>({ status: 'loading' });
  const [deletePostError, setDeletePostError] = useState<string>('');
  const [ownPostVersion, setOwnPostVersion] = useState<number>(0);

  useEffect(() => {
    let cancelled: boolean = false;

    const fetchOwnPost = async (): Promise<void> => {
      try {
        const [post, account]: [MatchMeResponse | null, GameAccount | null] = await Promise.all([
          getMatchMe(userId).catch(nullOn404<MatchMeResponse>),
          getGameAccountByUserId(userId).catch(nullOn404<GameAccount>),
        ]);

        if (cancelled) return;

        if (post) {
          setOwnPostState({ status: 'posted', post, account });
        } else if (account) {
          setOwnPostState({ status: 'canPost', account });
        } else {
          setOwnPostState({ status: 'noAccount' });
        }
      } catch (err) {
        if (cancelled) return;
        setOwnPostState({
          status: 'error',
          message: err instanceof ApiError ? err.message : 'Could not load your post.',
        });
      }
    };

    fetchOwnPost();

    return () => {
      cancelled = true;
    };
  }, [userId, ownPostVersion]);

  function handleCreateRolesChange(roles: Role[]): void {
    setCreatePostRoles(roles.slice(0, 2));
  }

  async function handleCreatePost(): Promise<void> {
    if (createPostRoles.length === 0) {
      setCreatePostError('Please select roles');
      return;
    }

    setCreatePostError('');

    try {
      await createMatchMe(userId, { roles: createPostRoles, description: createPostDescription });
      setCreatePostRoles([]);
      setCreatePostDescription('');
      setOwnPostVersion((v) => v + 1);
      onPostCreated();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setCreatePostError('You already have an active post.');
        setOwnPostVersion((v) => v + 1);
      } else if (err instanceof ApiError && err.statusCode === 404) {
        setCreatePostError('You need a linked game account to post.');
        setOwnPostVersion((v) => v + 1);
      } else {
        setCreatePostError('Failed to create post.');
      }
    }
  }

  async function handleDeleteOwnPost(): Promise<void> {
    setDeletePostError('');

    try {
      await deleteMatchMe(userId);
      setOwnPostVersion((v) => v + 1);
      onPostDeleted();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        setOwnPostVersion((v) => v + 1);
        onPostDeleted();
      } else {
        setDeletePostError('Failed to delete post.');
      }
    }
  }

  function renderGameAccount(account: GameAccount): JSX.Element {
    return (
      <div className="post-panel-field stack">
        <span className="field-label">Game account</span>
        <div className="post-panel-account">
          <img className="post-panel-rank-icon" src={`/Season_2023_-_${account.rank}.webp`} alt={account.rank} />
          <div className="stack">
            <span className="post-panel-account-name">{account.name}</span>
            <span className="muted post-panel-account-meta">
              {account.rank} · {account.region}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-panel">
      <h2 className="post-panel-label">Post</h2>
      {ownPostState.status === 'loading' && <p className="muted">Loading...</p>}

      {ownPostState.status === 'error' && <p className="error-text">{ownPostState.message}</p>}

      {ownPostState.status === 'noAccount' && (
        <p className="muted">
          <Link to={`/settings/${userId}`}>Link a game account to post here.</Link>
        </p>
      )}

      {ownPostState.status === 'posted' && (
        <>
          {ownPostState.account && renderGameAccount(ownPostState.account)}
          <div className="post-panel-field stack">
            <span className="field-label">Roles</span>
            <div className="post-panel-roles">
              {ownPostState.post.roles.map((role) => (
                <img key={role} className="post-panel-role-icon" src={`/Role_${role}.webp`} alt={role} />
              ))}
            </div>
          </div>
          {ownPostState.post.description !== '' && (
            <div className="post-panel-field stack">
              <span className="field-label">Description</span>
              <p className="post-panel-description">{ownPostState.post.description}</p>
            </div>
          )}
          <div className="post-panel-field stack">
            <span className="field-label">Posted</span>
            <p className="post-panel-date">
              {new Date(ownPostState.post.dateCreated).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
            </p>
          </div>
          {deletePostError !== '' && <p className="error-text">{deletePostError}</p>}
          <button type="button" className="post-panel-submit" onClick={handleDeleteOwnPost}>
            Delete Post
          </button>
        </>
      )}

      {ownPostState.status === 'canPost' && (
        <>
          {renderGameAccount(ownPostState.account)}
          <MultiSelectButton
            label="Roles"
            options={roleOptions}
            selected={createPostRoles}
            onChange={handleCreateRolesChange}
            placeholder="Select roles"
          />
          <label className="post-panel-field stack">
            <span className="field-label">Description</span>
            <input
              type="text"
              className="post-panel-input"
              placeholder="Description"
              value={createPostDescription}
              onChange={(e) => setCreatePostDescription(e.target.value)}
            />
          </label>
          {createPostError !== '' && <p className="error-text">{createPostError}</p>}
          <button type="button" className="post-panel-submit" onClick={handleCreatePost}>
            Post
          </button>
        </>
      )}
    </div>
  );
}
