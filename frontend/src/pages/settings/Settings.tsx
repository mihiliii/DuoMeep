import './Settings.css';

import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { SessionContext, type SessionContextType } from '@/context/SessionContext';
import { ApiError } from '@/services/apiError';
import {
  createGameAccount,
  getGameAccountByUserId,
  updateGameAccount,
  type GameAccountResponse,
} from '@/services/gameAccountService';
import {
  getDashboard,
  getUserEmail,
  updateAvatar,
  updateBanner,
  updateUser,
  type UpdateUserData,
} from '@/services/userService';
import { Rank, Region } from '@/enums/account';

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
  const [currentGameAccount, setCurrentGameAccount] = useState<GameAccountResponse | null>(null);
  const [gameAccountName, setGameAccountName] = useState<string>('');
  const [gameAccountRegion, setGameAccountRegion] = useState<Region>(Region.EUW);
  const [gameAccountRank, setGameAccountRank] = useState<Rank>(Rank.UNRANKED);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [repeatPassword, setRepeatPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isPageError, setIsPageError] = useState<boolean>(false);

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
          getGameAccountByUserId(params.userId).catch((err: unknown) => {
            if (err instanceof ApiError && err.statusCode === 404) return null;
            throw err;
          }),
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
  if (isPageError) return <div>Error loading settings, check console for more info.</div>;

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
            <label className="form-label">
              Region
              <select
                className="form-input"
                value={gameAccountRegion}
                onChange={(event) => setGameAccountRegion(event.target.value as Region)}
              >
                {Object.values(Region).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-label">
              Rank
              <select
                className="form-input"
                value={gameAccountRank}
                onChange={(event) => setGameAccountRank(event.target.value as Rank)}
              >
                {Object.values(Rank).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
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
