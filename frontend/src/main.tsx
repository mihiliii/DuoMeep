import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import Home from './pages/home/Home';
import Login from './pages/auth/login/Login.tsx';
import Signup from './pages/auth/signup/Signup.tsx';
import Dashboard from './pages/dashboard/Dashboard';
import Settings from './pages/settings/Settings.tsx';
import PageNotFound from './pages/page-not-found/PageNotFound.tsx';
import MatchMe from './pages/match-me/MatchMe.tsx';
import Messages from './pages/messages/Messages.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <PageNotFound />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/auth/login',
        element: <Login />,
      },
      {
        path: '/auth/signup',
        element: <Signup />,
      },
      {
        path: '/dashboard/:userId',
        element: <Dashboard />,
      },
      {
        path: '/settings/:userId',
        element: <Settings />,
      },
      {
        path: '/match-me',
        element: <MatchMe />,
      },
      {
        path: '/messages/:partnerId?',
        element: <Messages />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
