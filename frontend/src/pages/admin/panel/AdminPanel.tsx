import './AdminPanel.css';
import { useContext, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { SessionContext, type SessionContextType } from '../../../context/SessionContext';

export default function AdminPanel() {
  const navigate = useNavigate();
  const session: SessionContextType = useContext(SessionContext);

  useEffect(() => {
    if (session.adminId === null) {
      navigate('/admin/login', { replace: true });
    }
  }, [session.adminId, navigate]);

  if (session.adminId === null) return <div></div>;

  return (
    <div className="admin-panel page">
      <Outlet />
    </div>
  );
}
