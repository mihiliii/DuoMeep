import { Outlet } from 'react-router-dom';

import './App.css';
import Navbar from './components/navbar/NavBar';
import Footer from './components/footer/Footer';
import { useState } from 'react';
import { AuthContext } from './context/AuthContext';

export default function App() {
  const [userId, setUserIdState] = useState<string | null>(localStorage.getItem('userId'));

  function setUserId(id: string | null): void {
    if (id) {
      localStorage.setItem('userId', id);
    } else {
      localStorage.removeItem('userId');
    }
    setUserIdState(id);
  }

  return (
    <>
      <AuthContext value={{ userId, setUserId }}>
        <div className="app-layout">
          <Navbar />
          <main className="app-main">
            <Outlet />
          </main>
          <Footer />
        </div>
      </AuthContext>
    </>
  );
}
