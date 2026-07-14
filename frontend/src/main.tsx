import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import Home from './pages/home/Home';
import Login from './pages/auth/login/Login.tsx';
import Signup from './pages/auth/signup/Signup.tsx';
import Dashboard from './pages/dashboard/Dashboard';
import PageNotFound from './pages/page-not-found/PageNotFound.tsx';
import MatchMe from './pages/match-me/MatchMe.tsx';

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
        path: '/match-me',
        element: <MatchMe />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
