import { Outlet } from 'react-router-dom';

import Navbar from './components/navbar/NavBar';
import { useState } from 'react';
import { AuthContext } from './context/AuthContext';

export default function App() {
  const [userId, setUserIdState] = useState<string | null>(localStorage.getItem('userId'));
  const [username, setUsernameState] = useState<string | null>(localStorage.getItem('username'));

  function setUserId(id: string | null): void {
    if (id) {
      localStorage.setItem('userId', id);
    } else {
      localStorage.removeItem('userId');
    }
    setUserIdState(id);
  }

  function setUsername(name: string | null): void {
    if (name) {
      localStorage.setItem('username', name);
    } else {
      localStorage.removeItem('username');
    }
    setUsernameState(name);
  }

  return (
    <>
      <AuthContext value={{ userId, setUserId, username, setUsername }}>
        <Navbar />
        <Outlet />
      </AuthContext>
    </>
  );
}
