import { Outlet } from 'react-router-dom';

import './App.css';
import Navbar from './components/navbar/NavBar';
import Footer from './components/footer/Footer';
import { SessionContext } from './context/SessionContext';
import { useStoredId } from './hooks/useStoredId';

export default function App() {
  const [userId, setUserId] = useStoredId('userId');
  const [adminId, setAdminId] = useStoredId('adminId');

  return (
    <SessionContext value={{ userId, setUserId, adminId, setAdminId }}>
      <div className="app-layout">
        <Navbar />
        <main className="app-main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </SessionContext>
  );
}
