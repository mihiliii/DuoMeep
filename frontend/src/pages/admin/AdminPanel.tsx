import './AdminPanel.css';

import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { SessionContext, type SessionContextType } from '@/context/SessionContext';

export default function AdminPanel() {
  const session: SessionContextType = useContext(SessionContext);

  if (session.adminId === null) return <Navigate to="/admin/login" replace />;

  return (
    <div className="admin-panel page">
      <Outlet />
    </div>
  );
}
