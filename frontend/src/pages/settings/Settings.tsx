import './Settings.css';

import { useContext, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';

import { SessionContext, type SessionContextType } from '@/context/SessionContext';

export type SaveStatus = {
  type: 'success' | 'error';
  message: string;
};

const TABS: { path: string; label: string }[] = [
  { path: 'profile', label: 'Profile' },
  { path: 'security', label: 'Account security' },
  { path: 'game-account', label: 'Game account' },
];

export default function Settings() {
  const session: SessionContextType = useContext(SessionContext);
  const params: { userId?: string } = useParams();
  const navigate = useNavigate();

  const isOwnSettings: boolean = Boolean(params.userId) && session.userId === params.userId;

  useEffect(() => {
    if (isOwnSettings) return;

    navigate(params.userId ? `/dashboard/${params.userId}` : '/', { replace: true });
  }, [isOwnSettings, params.userId, navigate]);

  if (!isOwnSettings) return <div></div>;

  return (
    <div className="settings-page page">
      <div className="settings-layout">
        <nav className="settings-nav">
          {TABS.map((tab) => (
            <NavLink key={tab.path} to={tab.path} className="settings-nav-item">
              {tab.label}
            </NavLink>
          ))}
        </nav>
        <div className="card settings-panel">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
