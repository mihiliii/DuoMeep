import './DashboardSettings.css';
import '../Dashboard.css';
import { useState, useRef, useContext } from 'react';
import { updateUserProfile, updateAvatar } from '../../../services/userService';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../../../context/AuthContext';

interface DashboardSettingsProps {
  onClose: () => void;
  currentAvatarUrl: string | null;
}

export default function DashboardSettings({ onClose, currentAvatarUrl }: DashboardSettingsProps) {
  const authContext: AuthContextType = useContext(AuthContext);
  const [displayName, setDisplayName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatarUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

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
      if (!authContext.userId) {
        throw new Error('User not authenticated');
      }

      const saves: Promise<void>[] = [];

      if (displayName) {
        saves.push(updateUserProfile(authContext.userId, { displayName }));
      }
      if (avatarFile) {
        saves.push(updateAvatar(authContext.userId, avatarFile));
      }

      await Promise.all(saves);
      navigate(0);
    } catch (err) {
      console.error('Error saving profile changes:', err);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h1>Settings</h1>
        </div>
        <div className="modal-body">
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
                Display Name
                <input
                  className="auth-input"
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Your display name..."
                  maxLength={40}
                />
              </label>
              <label className="auth-label">
                Birth Date
                <input
                  className="auth-input"
                  type="date"
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                />
              </label>
            </div>
          </div>
          <label className="auth-label">
            Tagline
            <input
              className="auth-input"
              type="text"
              value={tagline}
              onChange={(event) => setTagline(event.target.value)}
              placeholder="Your tagline..."
              maxLength={60}
            />
          </label>
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
        </div>
        <button className="btn" onClick={onSave}>
          Save changes
        </button>
        <button className="btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
