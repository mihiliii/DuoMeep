import './Settings.css';
import './Dashboard.css';
import { useState } from 'react';
import { setUserInfo } from '../../services/userService';
import type { UserDashboard } from '../../models/user';
import { useNavigate } from 'react-router-dom';

export default function Settings({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [bio, setBio] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');

  const navigate = useNavigate();

  async function onSave() {
    const userInfo: Partial<UserDashboard> = {
      dashboard: {
        profilePicture: 'public/images/default.png', // Not implemented yet
        bio,
        tagline,
        birthDate: birthDate ? new Date(birthDate) : null,
        gender: null, // Not implemented yet
        games: [], // Not implemented yet
        socials: new Map(), // Not implemented yet
        shownOnProfile: [], // Not implemented yet
      },
    };
    await setUserInfo(localStorage.getItem('userId'), userInfo);
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
          {/* Settings content */}
          <label className="auth-label">
            Bio
            <textarea
              className="auth-textarea"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={80}
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
              maxLength={60}
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
