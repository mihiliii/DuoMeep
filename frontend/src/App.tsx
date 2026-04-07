import { Outlet, useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Navbar from './components/navbar/NavBar';

export interface AuthContextType {
  isAuthed: boolean;
  handleLogin: (userId: string) => void;
  handleLogout: () => void;
}

export function useAuth(): AuthContextType {
  return useOutletContext<AuthContextType>();
}

function App() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('userId');
    if (saved) setIsAuthed(true);
  }, []);

  function handleLogin(userId: string): void {
    localStorage.setItem('userId', userId);
    setIsAuthed(true);
  }

  function handleLogout(): void {
    localStorage.removeItem('userId');
    setIsAuthed(false);
  }

  return (
    <>
      <Navbar isAuthed={isAuthed} onLogout={handleLogout} />
      <Outlet context={{ isAuthed, handleLogin, handleLogout } satisfies AuthContextType} />
    </>
  );
}

export default App;
