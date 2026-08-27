import { useContext, useEffect, useState } from 'react';

import PageError from '@/components/page-error/PageError';
import { SessionContext, type SessionContextType } from '@/context/SessionContext';
import type { SaveStatus } from '@/pages/settings/Settings';
import { getUserEmail, updateUser } from '@/services/userService';

export default function SettingsSecurity() {
  const session: SessionContextType = useContext(SessionContext);

  const [email, setEmail] = useState<string>('');
  const [initialEmail, setInitialEmail] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [repeatPassword, setRepeatPassword] = useState<string>('');
  const [status, setStatus] = useState<SaveStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadError, setIsLoadError] = useState<boolean>(false);

  useEffect(() => {
    const userId: string | null = session.userId;
    if (!userId) return;

    let cancelled: boolean = false;

    const fetchEmail = async (): Promise<void> => {
      try {
        const response = await getUserEmail(userId);

        if (cancelled) return;

        setEmail(response.email);
        setInitialEmail(response.email);
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Error loading account security:', err);
        setIsLoadError(true);
        setIsLoading(false);
      }
    };

    fetchEmail();

    return () => {
      cancelled = true;
    };
  }, [session.userId]);

  const isDirty: boolean = email !== initialEmail || currentPassword !== '' || password !== '' || repeatPassword !== '';

  function onRevert(): void {
    setEmail(initialEmail);
    setCurrentPassword('');
    setPassword('');
    setRepeatPassword('');
    setStatus(null);
  }

  async function onSave(): Promise<void> {
    const userId: string | null = session.userId;
    if (!userId) return;

    try {
      setStatus(null);

      if (password && password !== repeatPassword) {
        throw new Error('Passwords do not match.');
      }
      if (password && !currentPassword) {
        throw new Error('Current password is required.');
      }

      await updateUser(userId, {
        authInfo: {
          ...(email && { email }),
          ...(password && { password, currentPassword }),
        },
      });

      setInitialEmail(email);
      setCurrentPassword('');
      setPassword('');
      setRepeatPassword('');
      setStatus({ type: 'success', message: 'Account security saved.' });
    } catch (err) {
      console.error('Error saving account security:', err);
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save account security.' });
    }
  }

  if (isLoading) return <div></div>;
  if (isLoadError) return <PageError message="Error loading account security, check console for more info." />;

  return (
    <>
      <div className="settings-body">
        <div className="settings-section-title">Account security</div>
        <label className="form-label">
          Email
          <input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="form-label">
          Current password
          <input
            className="form-input"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </label>
        <p className="settings-section-hint muted">Required only when setting a new password.</p>
        <div className="settings-two-col-row">
          <label className="form-label">
            New password
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label className="form-label">
            Repeat new password
            <input
              className="form-input"
              type="password"
              value={repeatPassword}
              onChange={(event) => setRepeatPassword(event.target.value)}
            />
          </label>
        </div>
        {status && <div className={`settings-status settings-status-${status.type}`}>{status.message}</div>}
      </div>
      <div className="settings-actions">
        <button className="btn btn-green" onClick={onSave} disabled={!isDirty}>
          Save
        </button>
        <button className="btn btn-red" onClick={onRevert} disabled={!isDirty}>
          Cancel
        </button>
      </div>
    </>
  );
}
