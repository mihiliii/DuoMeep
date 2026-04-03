import { Outlet, useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Navbar from './components/navbar/NavBar';

export interface AuthContextType {
  isAuthed: boolean;
  handleLoginSuccess: () => void;
  handleLogout: () => void;
}

export function useAuth(): AuthContextType {
  return useOutletContext<AuthContextType>();
}

function App() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('isAuthed');
    if (saved === 'true') setIsAuthed(true);
  }, []);

  function handleLoginSuccess(): void {
    setIsAuthed(true);
    localStorage.setItem('isAuthed', 'true');
  }

  function handleLogout(): void {
    setIsAuthed(false);
    localStorage.removeItem('isAuthed');
  }

  return (
    <>
      <Navbar isAuthed={isAuthed} onLogout={handleLogout} />
      <Outlet context={{ isAuthed, handleLoginSuccess, handleLogout }} />
    </>
  );
}

export default App;
