import { Outlet } from 'react-router-dom';

import './App.css';
import Navbar from './components/navbar/NavBar';
import Footer from './components/footer/Footer';
import { useState } from 'react';
import { AuthContext } from './context/AuthContext';
import { AdminContext } from './context/AdminContext';

export default function App() {
  const [userId, setUserIdState] = useState<string | null>(localStorage.getItem('userId'));
  const [adminId, setAdminIdState] = useState<string | null>(localStorage.getItem('adminId'));

  function setUserId(id: string | null): void {
    if (id) {
      localStorage.setItem('userId', id);
    } else {
      localStorage.removeItem('userId');
    }
    setUserIdState(id);
  }

  function setAdminId(id: string | null): void {
    if (id) {
      localStorage.setItem('adminId', id);
    } else {
      localStorage.removeItem('adminId');
    }
    setAdminIdState(id);
  }

  return (
    <AuthContext value={{ userId, setUserId }}>
      <AdminContext value={{ adminId, setAdminId }}>
        <div className="app-layout">
          <Navbar />
          <main className="app-main">
            <Outlet />
          </main>
          <Footer />
        </div>
      </AdminContext>
    </AuthContext>
  );
}
