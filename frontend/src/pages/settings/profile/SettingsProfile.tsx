import { useContext, useEffect, useRef, useState } from 'react';

import PageError from '@/components/page-error/PageError';
import { SessionContext, type SessionContextType } from '@/context/SessionContext';
import type { SaveStatus } from '@/pages/settings/Settings';
import { getDashboard, updateAvatar, updateBanner, updateUser } from '@/services/userService';

type ProfileSnapshot = {
  username: string;
  bio: string;
  tagline: string;
  avatarPreview: string | null;
  bannerPreview: string | null;
};

export default function SettingsProfile() {
  const session: SessionContextType = useContext(SessionContext);

  const [username, setUsername] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<ProfileSnapshot | null>(null);
  const [status, setStatus] = useState<SaveStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadError, setIsLoadError] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const userId: string | null = session.userId;
    if (!userId) return;

    let cancelled: boolean = false;

    const fetchProfile = async (): Promise<void> => {
      try {
        const dashboard = await getDashboard(userId);

        if (cancelled) return;

        setUsername(dashboard.userInfo.username);
        setAvatarPreview(dashboard.userInfo.avatarPath);
        setBannerPreview(dashboard.dashboard.banner || null);
        setTagline(dashboard.dashboard.tagline);
        setBio(dashboard.dashboard.bio);
        setSnapshot({
          username: dashboard.userInfo.username,
          bio: dashboard.dashboard.bio,
          tagline: dashboard.dashboard.tagline,
          avatarPreview: dashboard.userInfo.avatarPath,
          bannerPreview: dashboard.dashboard.banner || null,
        });
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Error loading profile:', err);
        setIsLoadError(true);
        setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [session.userId]);

  const isDirty: boolean =
    snapshot !== null &&
    (username !== snapshot.username ||
      bio !== snapshot.bio ||
      tagline !== snapshot.tagline ||
      avatarFile !== null ||
      bannerFile !== null);

  function handleAvatarChangeButton(event: React.ChangeEvent<HTMLInputElement>): void {
    const file: File | undefined = event.target.files?.[0];

    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleBannerChangeButton(event: React.ChangeEvent<HTMLInputElement>): void {
    const file: File | undefined = event.target.files?.[0];

    if (!file) return;

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  }

  function handleBioChangeButton(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    setBio(event.target.value);
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight + 'px';
  }

  function onRevert(): void {
    if (!snapshot) return;

    setUsername(snapshot.username);
    setBio(snapshot.bio);
    setTagline(snapshot.tagline);
    setAvatarFile(null);
    setAvatarPreview(snapshot.avatarPreview);
    setBannerFile(null);
    setBannerPreview(snapshot.bannerPreview);
    setStatus(null);
  }

  async function onSave(): Promise<void> {
    const userId: string | null = session.userId;
    if (!userId) return;

    try {
      setStatus(null);

      const trimmedUsername: string = username.trim();
      const saves: Promise<void>[] = [updateUser(userId, { username: trimmedUsername, bio, tagline })];

      if (avatarFile) {
        saves.push(updateAvatar(userId, avatarFile));
      }
      if (bannerFile) {
        saves.push(updateBanner(userId, bannerFile));
      }

      await Promise.all(saves);

      setUsername(trimmedUsername);
      setAvatarFile(null);
      setBannerFile(null);
      setSnapshot({ username: trimmedUsername, bio, tagline, avatarPreview, bannerPreview });
      setStatus({ type: 'success', message: 'Profile saved.' });
    } catch (err) {
      console.error('Error saving profile:', err);
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save profile.' });
    }
  }

  if (isLoading) return <div></div>;
  if (isLoadError) return <PageError message="Error loading profile, check console for more info." />;

  return (
    <>
      <div className="settings-body">
        <div className="settings-section-title">Profile</div>
        <div className="settings-banner-picker">
          <div
            className="settings-banner-preview"
            style={bannerPreview ? { backgroundImage: `url(${bannerPreview})` } : undefined}
          >
            <button className="image-overlay center" type="button" onClick={() => bannerInputRef.current?.click()}>
              Change banner
            </button>
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            style={{ display: 'none' }}
            onChange={handleBannerChangeButton}
          />
        </div>
        <div className="settings-profile-row">
          <div className="settings-avatar-picker">
            <div className="settings-avatar-preview">
              {avatarPreview ? (
                <img className="avatar" src={avatarPreview} alt="Avatar preview" />
              ) : (
                <div className="settings-avatar-placeholder" />
              )}
              <button
                className="image-overlay settings-avatar-overlay center"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                Change photo
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              style={{ display: 'none' }}
              onChange={handleAvatarChangeButton}
            />
          </div>
          <div className="settings-profile-fields stack">
            <label className="form-label">
              Username
              <input
                className="form-input"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                maxLength={24}
              />
            </label>
            <label className="form-label">
              Tagline
              <input
                className="form-input"
                type="text"
                value={tagline}
                onChange={(event) => setTagline(event.target.value)}
                maxLength={40}
              />
            </label>
          </div>
        </div>
        <label className="form-label">
          Bio
          <textarea
            ref={bioRef}
            className="form-input form-input--grow"
            rows={1}
            value={bio}
            onChange={handleBioChangeButton}
            maxLength={80}
          />
        </label>
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
