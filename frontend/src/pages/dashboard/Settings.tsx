import './Settings.css';
import './Dashboard.css';
import { useState, useRef } from 'react';
import { updateDisplayName, updateAvatar } from '../../services/userService';
import { useNavigate } from 'react-router-dom';

export default function Settings({ isOpen, onClose, currentAvatarUrl }: { isOpen: boolean; onClose: () => void; currentAvatarUrl: string | null }) {
  const [displayName, setDisplayName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatarUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const file: File | undefined = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleBioChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    setBio(event.target.value);
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight + 'px';
  }

  async function onSave(): Promise<void> {
    const userId: string | null = localStorage.getItem('userId');
    if (!userId) return;

    const saves: Promise<void>[] = [];
    if (displayName) saves.push(updateDisplayName(userId, displayName));
    if (avatarFile) saves.push(updateAvatar(userId, avatarFile));

    await Promise.all(saves);
    navigate(0);
  }

  if (!isOpen) return null;

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
                <button
                  className="settings-avatar-overlay"
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
                onChange={handleAvatarChange}
              />
            </div>

            <div className="settings-profile-fields">
              <label className="auth-label">
                Display Name
                <input
                  className="auth-input"
                  type="text"
                  value={displayName}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDisplayName(event.target.value)}
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
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBirthDate(event.target.value)}
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
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTagline(event.target.value)}
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
              onChange={handleBioChange}
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
