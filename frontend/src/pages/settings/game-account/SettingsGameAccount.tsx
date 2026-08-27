import { useContext, useEffect, useState } from 'react';

import MultiSelectButton from '@/components/multi-select-button/MultiSelectButton';
import PageError from '@/components/page-error/PageError';
import { SessionContext, type SessionContextType } from '@/context/SessionContext';
import { Rank, Region } from '@/enums/account';
import type { SaveStatus } from '@/pages/settings/Settings';
import { ApiError } from '@/services/apiError';
import {
  createGameAccount,
  deleteGameAccount,
  getGameAccountByUserId,
  updateGameAccount,
  type GameAccount,
} from '@/services/gameAccountService';

export default function SettingsGameAccount() {
  const session: SessionContextType = useContext(SessionContext);

  const [currentGameAccount, setCurrentGameAccount] = useState<GameAccount | null>(null);
  const [gameAccountName, setGameAccountName] = useState<string>('');
  const [gameAccountRegion, setGameAccountRegion] = useState<Region>(Region.EUW);
  const [gameAccountRank, setGameAccountRank] = useState<Rank>(Rank.UNRANKED);
  const [status, setStatus] = useState<SaveStatus | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadError, setIsLoadError] = useState<boolean>(false);

  function applyAccount(account: GameAccount | null): void {
    setCurrentGameAccount(account);
    setGameAccountName(account?.name ?? '');
    setGameAccountRegion(account?.region ?? Region.EUW);
    setGameAccountRank(account?.rank ?? Rank.UNRANKED);
  }

  useEffect(() => {
    const userId: string | null = session.userId;
    if (!userId) return;

    let cancelled: boolean = false;

    const fetchGameAccount = async (): Promise<void> => {
      try {
        const account: GameAccount | null = await getGameAccountByUserId(userId);

        if (cancelled) return;

        applyAccount(account);
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Error loading game account:', err);
        setIsLoadError(true);
        setIsLoading(false);
      }
    };

    fetchGameAccount();

    return () => {
      cancelled = true;
    };
  }, [session.userId]);

  const isDirty: boolean =
    gameAccountName !== (currentGameAccount?.name ?? '') ||
    gameAccountRegion !== (currentGameAccount?.region ?? Region.EUW) ||
    gameAccountRank !== (currentGameAccount?.rank ?? Rank.UNRANKED);

  function onEdit(): void {
    setStatus(null);
    setIsEditing(true);
  }

  function onCancel(): void {
    applyAccount(currentGameAccount);
    setStatus(null);
    setIsEditing(false);
  }

  async function onSave(): Promise<void> {
    const userId: string | null = session.userId;
    if (!userId) return;

    try {
      setStatus(null);

      const data = { name: gameAccountName.trim(), region: gameAccountRegion, rank: gameAccountRank };

      if (currentGameAccount) {
        await updateGameAccount(currentGameAccount._id, data);
      } else {
        await createGameAccount(userId, data);
      }

      applyAccount(await getGameAccountByUserId(userId));
      setIsEditing(false);
      setStatus({
        type: 'success',
        message: currentGameAccount ? 'Game account saved.' : 'Game account created.',
      });
    } catch (err) {
      console.error('Error saving game account:', err);
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save game account.' });
    }
  }

  async function onDelete(): Promise<void> {
    if (!currentGameAccount) return;

    try {
      setStatus(null);
      await deleteGameAccount(currentGameAccount._id);
      applyAccount(null);
      setStatus({ type: 'success', message: 'Game account deleted.' });
    } catch (err) {
      console.error('Error deleting game account:', err);
      setStatus({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Failed to delete game account.',
      });
    }
  }

  if (isLoading) return <div></div>;
  if (isLoadError) return <PageError message="Error loading game account, check console for more info." />;

  return (
    <>
      <div className="settings-body">
        <div className="settings-section-title">Game account</div>
        <p className="settings-section-hint muted">
          {currentGameAccount
            ? 'Linked. This is the account other players see on your profile and posts.'
            : 'No account linked yet. Create one to show it on your profile and posts.'}
        </p>
        {isEditing ? (
          <>
            <label className="form-label">
              Account name
              <input
                className="form-input"
                type="text"
                value={gameAccountName}
                onChange={(event) => setGameAccountName(event.target.value)}
                maxLength={24}
              />
            </label>
            <div className="settings-two-col-row">
              <MultiSelectButton
                label="Region"
                options={Object.values(Region)}
                selected={[gameAccountRegion]}
                onChange={(next) => setGameAccountRegion(next[0] ?? gameAccountRegion)}
                single
              />
              <MultiSelectButton
                label="Rank"
                options={Object.values(Rank)}
                selected={[gameAccountRank]}
                onChange={(next) => setGameAccountRank(next[0] ?? gameAccountRank)}
                single
                iconSrc={(rank) => `/Season_2023_-_${rank}.webp`}
              />
            </div>
          </>
        ) : (
          currentGameAccount && (
            <div className="game-account-info">
              <img
                className="game-account-rank-icon"
                src={`/Season_2023_-_${currentGameAccount.rank}.webp`}
                alt={currentGameAccount.rank}
              />
              <div className="game-account-details stack">
                <div className="game-account-name">{currentGameAccount.name}</div>
                <div className="game-account-rank-text">
                  {currentGameAccount.rank} · {currentGameAccount.region}
                </div>
              </div>
            </div>
          )
        )}
        {status && <div className={`settings-status settings-status-${status.type}`}>{status.message}</div>}
      </div>
      <div className="settings-actions">
        {isEditing ? (
          <>
            <button type="button" className="btn btn-green" onClick={onSave} disabled={!isDirty}>
              {currentGameAccount ? 'Save' : 'Create'}
            </button>
            <button type="button" className="btn btn-red" onClick={onCancel}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-green" onClick={onEdit}>
              {currentGameAccount ? 'Update' : 'Create'}
            </button>
            {currentGameAccount && (
              <button type="button" className="btn btn-red" onClick={onDelete}>
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
