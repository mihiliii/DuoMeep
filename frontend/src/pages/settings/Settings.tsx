import './Settings.css';

import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import MultiSelectButton from '@/components/multi-select-button/MultiSelectButton';
import PageError from '@/components/page-error/PageError';
import { SessionContext, type SessionContextType } from '@/context/SessionContext';
import { Rank, Region } from '@/enums/account';
import { ApiError } from '@/services/apiError';
import {
  createGameAccount,
  deleteGameAccount,
  getGameAccountByUserId,
  updateGameAccount,
  type GameAccount,
} from '@/services/gameAccountService';
import {
  getDashboard,
  getUserEmail,
  updateAvatar,
  updateBanner,
  updateUser,
  type UpdateUserData,
} from '@/services/userService';

export default function Settings() {
  const session: SessionContextType = useContext(SessionContext);
  const params: { userId?: string } = useParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [currentGameAccount, setCurrentGameAccount] = useState<GameAccount | null>(null);
  const [gameAccountName, setGameAccountName] = useState<string>('');
  const [gameAccountRegion, setGameAccountRegion] = useState<Region>(Region.EUW);
  const [gameAccountRank, setGameAccountRank] = useState<Rank>(Rank.UNRANKED);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [repeatPassword, setRepeatPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isPageError, setIsPageError] = useState<boolean>(false);
  const [isConfirmingAccountDelete, setIsConfirmingAccountDelete] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchSettings = async (): Promise<void> => {
      try {
        if (!params.userId || session.userId !== params.userId) {
          navigate(params.userId ? `/dashboard/${params.userId}` : '/', { replace: true });
          return;
        }

        const [dashboard, account, emailResponse] = await Promise.all([
          getDashboard(params.userId),
          getGameAccountByUserId(params.userId),
          getUserEmail(params.userId),
        ]);

        setUsername(dashboard.userInfo.username);
        setAvatarPreview(dashboard.userInfo.avatarPath);
        setBannerPreview(dashboard.dashboard.banner || null);
        setTagline(dashboard.dashboard.tagline);
        setBio(dashboard.dashboard.bio);
        setCurrentGameAccount(account);
        setGameAccountName(account?.name ?? '');
        setGameAccountRegion(account?.region ?? Region.EUW);
        setGameAccountRank(account?.rank ?? Rank.UNRANKED);
        setEmail(emailResponse.email);
        setIsPageLoading(false);
      } catch (err) {
        console.error('Error loading settings:', err);
        setIsPageError(true);
        setIsPageLoading(false);
      }
    };
    fetchSettings();
  }, [session.userId, params.userId, navigate]);

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

  async function handleDeleteGameAccount(): Promise<void> {
    if (!currentGameAccount) return;

    if (!isConfirmingAccountDelete) {
      setIsConfirmingAccountDelete(true);
      return;
    }

    try {
      setError('');
      await deleteGameAccount(currentGameAccount._id);
      setCurrentGameAccount(null);
      setGameAccountName('');
      setGameAccountRegion(Region.EUW);
      setGameAccountRank(Rank.UNRANKED);
    } catch (err) {
      console.error('Error deleting game account:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to delete game account.');
    } finally {
      setIsConfirmingAccountDelete(false);
    }
  }

  async function onSave(): Promise<void> {
    try {
      setError('');

      if (!session.userId) {
        throw new Error('User not authenticated.');
      }
      if (password && password !== repeatPassword) {
        throw new Error('Passwords do not match.');
      }

      const updateData: UpdateUserData = {};
      if (username) updateData.username = username;
      updateData.bio = bio;
      updateData.tagline = tagline;
      if (email || password) updateData.authInfo = { ...(email && { email }), ...(password && { password }) };

      const saves: Promise<void>[] = [];

      if (Object.keys(updateData).length > 0) {
        saves.push(updateUser(session.userId, updateData));
      }
      if (avatarFile) {
        saves.push(updateAvatar(session.userId, avatarFile));
      }
      if (bannerFile) {
        saves.push(updateBanner(session.userId, bannerFile));
      }
      if (gameAccountName) {
        const gameAccountData = { name: gameAccountName, region: gameAccountRegion, rank: gameAccountRank };
        saves.push(
          currentGameAccount
            ? updateGameAccount(currentGameAccount._id, gameAccountData)
            : createGameAccount(session.userId, gameAccountData).then(() => undefined),
        );
      }

      await Promise.all(saves);
      navigate(`/dashboard/${session.userId}`);
    } catch (err) {
      console.error('Error saving profile changes:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile changes.');
    }
  }

  if (isPageLoading) return <div></div>;
  if (isPageError) return <PageError message="Error loading settings, check console for more info." />;

  return (
    <div className="settings-page page">
      <div className="card">
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
                  placeholder="Your username..."
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
                  placeholder="Your tagline..."
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
              placeholder="Tell us about yourself..."
              maxLength={80}
            />
          </label>
          <div className="settings-section-title">Account security</div>
          <label className="form-label">
            Email
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
            />
          </label>
          <div className="settings-two-col-row">
            <label className="form-label">
              New password
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </label>
            <label className="form-label">
              Repeat new password
              <input
                className="form-input"
                type="password"
                value={repeatPassword}
                onChange={(event) => setRepeatPassword(event.target.value)}
                placeholder="••••••••"
              />
            </label>
          </div>
          <div className="settings-section-title">Game account</div>
          <label className="form-label">
            Account name
            <input
              className="form-input"
              type="text"
              value={gameAccountName}
              onChange={(event) => setGameAccountName(event.target.value)}
              placeholder="Your in-game name..."
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
          {currentGameAccount && (
            <button
              type="button"
              className="btn btn-red settings-delete-account"
              onClick={handleDeleteGameAccount}
              onBlur={() => setIsConfirmingAccountDelete(false)}
            >
              {isConfirmingAccountDelete ? 'Confirm delete?' : 'Delete game account'}
            </button>
          )}
          {error && <p className="muted">{error}</p>}
        </div>
        <div className="settings-actions">
          <button className="btn btn-green" onClick={onSave}>
            Save
          </button>
          <button className="btn btn-red" onClick={() => navigate(`/dashboard/${params.userId}`)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
