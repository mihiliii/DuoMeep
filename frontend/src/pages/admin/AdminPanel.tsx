import './AdminPanel.css';

import { Outlet } from 'react-router-dom';

export default function AdminPanel() {
  return (
    <div className="admin-panel page">
      <Outlet />
    </div>
  );
}
