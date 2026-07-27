import './Settings.css';
import '../Dashboard.css';
import { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getDashboard,
  updateUser,
  updateAvatar,
  getUserEmail,
  type UpdateUserData,
} from '../../../services/userService';
import {
  createGameAccount,
  updateGameAccount,
  getGameAccountByUserId,
  type GameAccountResponse,
} from '../../../services/gameAccountService';
import { ApiError } from '../../../services/apiError';
import { Rank, Region } from '../../../types/account';
import { AuthContext, type AuthContextType } from '../../../context/AuthContext';

export default function Settings() {
  const authContext: AuthContextType = useContext(AuthContext);
  const params: { userId?: string } = useParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentGameAccount, setCurrentGameAccount] = useState<GameAccountResponse | null>(null);
  const [gameAccountName, setGameAccountName] = useState<string>('');
  const [gameAccountRegion, setGameAccountRegion] = useState<Region>(Region.EUW);
  const [gameAccountRank, setGameAccountRank] = useState<Rank>(Rank.UNRANKED);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [repeatPassword, setRepeatPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchSettings = async (): Promise<void> => {
      try {
        if (!params.userId || authContext.userId !== params.userId) {
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
      }
    };
    fetchSettings();
  }, [authContext.userId, params.userId, navigate]);

  function handleAvatarChangeButton(event: React.ChangeEvent<HTMLInputElement>): void {
    const file: File | undefined = event.target.files?.[0];

    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleBioChangeButton(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    setBio(event.target.value);
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight + 'px';
  }

  async function onSave(): Promise<void> {
    try {
      setError('');

      if (!authContext.userId) {
        throw new Error('User not authenticated.');
      }
      if (password && password !== repeatPassword) {
        throw new Error('Passwords do not match.');
      }

      const updateData: UpdateUserData = {};
      if (username) updateData.username = username;
      if (bio || tagline) updateData.dashboard = { bio, tagline };
      if (email || password) updateData.authInfo = { ...(email && { email }), ...(password && { password }) };

      const saves: Promise<void>[] = [];

      if (Object.keys(updateData).length > 0) {
        saves.push(updateUser(authContext.userId, updateData));
      }
      if (avatarFile) {
        saves.push(updateAvatar(authContext.userId, avatarFile));
      }
      if (gameAccountName) {
        const gameAccountData = { name: gameAccountName, region: gameAccountRegion, rank: gameAccountRank };
        saves.push(
          currentGameAccount
            ? updateGameAccount(currentGameAccount._id, gameAccountData)
            : createGameAccount(authContext.userId, gameAccountData).then(() => undefined),
        );
      }

      await Promise.all(saves);
      navigate(`/dashboard/${authContext.userId}`);
    } catch (err) {
      console.error('Error saving profile changes:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile changes.');
    }
  }

  if (isPageLoading) return <div></div>;

  return (
    <div className="settings-page">
      <div className="card settings-card">
        <div className="settings-header">
          <h3>Settings</h3>
        </div>
        <div className="settings-body">
          <div className="settings-profile-row">
            <div className="settings-avatar-picker">
              <div className="settings-avatar-preview">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" />
                ) : (
                  <div className="settings-avatar-placeholder" />
                )}
                <button className="settings-avatar-overlay" type="button" onClick={() => fileInputRef.current?.click()}>
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
            <div className="settings-profile-fields">
              <label className="auth-label">
                Username
                <input
                  className="auth-input"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Your username..."
                  maxLength={24}
                />
              </label>
              <label className="auth-label">
                Tagline
                <input
                  className="auth-input"
                  type="text"
                  value={tagline}
                  onChange={(event) => setTagline(event.target.value)}
                  placeholder="Your tagline..."
                  maxLength={40}
                />
              </label>
            </div>
          </div>
          <label className="auth-label">
            Bio
            <textarea
              ref={bioRef}
              className="auth-input auth-input--grow"
              rows={1}
              value={bio}
              onChange={handleBioChangeButton}
              placeholder="Tell us about yourself..."
              maxLength={80}
            />
          </label>
          <div className="settings-section-title">Game account</div>
          <label className="auth-label">
            Account name
            <input
              className="auth-input"
              type="text"
              value={gameAccountName}
              onChange={(event) => setGameAccountName(event.target.value)}
              placeholder="Your in-game name..."
              maxLength={24}
            />
          </label>
          <div className="settings-two-col-row">
            <label className="auth-label">
              Region
              <select
                className="auth-input"
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
            <label className="auth-label">
              Rank
              <select
                className="auth-input"
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
          <div className="settings-section-title">Account security</div>
          <label className="auth-label">
            Email
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
            />
          </label>
          <div className="settings-two-col-row">
            <label className="auth-label">
              New password
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </label>
            <label className="auth-label">
              Repeat new password
              <input
                className="auth-input"
                type="password"
                value={repeatPassword}
                onChange={(event) => setRepeatPassword(event.target.value)}
                placeholder="••••••••"
              />
            </label>
          </div>
          {error && <p className="muted">{error}</p>}
        </div>
        <div className="settings-actions">
          <button className="btn" onClick={onSave}>
            Save
          </button>
          <button className="btn" onClick={() => navigate(`/dashboard/${params.userId}`)}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
