import './AdminPanel.css';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext, type AdminContextType } from '../../../context/AdminContext';

export default function AdminPanel() {
  const navigate = useNavigate();
  const adminContext: AdminContextType = useContext(AdminContext);

  useEffect(() => {
    if (adminContext.adminId === null) {
      navigate('/admin/login', { replace: true });
    }
  }, [adminContext.adminId, navigate]);

  if (adminContext.adminId === null) return <div></div>;

  return (
    <div className="admin-panel page">
      <header className="page-header">
        <h1>Admin panel</h1>
        <p className="muted">Nothing here yet.</p>
      </header>
    </div>
  );
}
