import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Navbar from './components/navbar/NavBar';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import Signup from './pages/signup/Signup';
import Dashboard from './pages/dashboard/Dashboard';
import About from './pages/about/About';

function App() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('isAuthed');
    if (saved === 'true') setIsAuthed(true);
  }, []);

  function handleLoginSuccess() {
    setIsAuthed(true);
    localStorage.setItem('isAuthed', 'true');
  }

  function handleLogout() {
    setIsAuthed(false);
    localStorage.removeItem('isAuthed');
  }

  return (
    <>
      <Navbar isAuthed={isAuthed} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/login"
          element={
            isAuthed ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={isAuthed ? <Dashboard /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </>
  );
}

export default App;
