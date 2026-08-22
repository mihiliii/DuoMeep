import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import App from './App.tsx';
import AdminPanel from './pages/admin/AdminPanel.tsx';
import AdminLogin from './pages/admin/login/AdminLogin.tsx';
import AdminPosts from './pages/admin/posts/AdminPosts.tsx';
import AdminReviews from './pages/admin/reviews/AdminReviews.tsx';
import AdminUsers from './pages/admin/users/AdminUsers.tsx';
import Login from './pages/auth/login/Login.tsx';
import Signup from './pages/auth/signup/Signup.tsx';
import Dashboard from './pages/dashboard/Dashboard';
import Home from './pages/home/Home';
import MatchMe from './pages/match-me/MatchMe.tsx';
import Messages from './pages/messages/Messages.tsx';
import PageNotFound from './pages/page-not-found/PageNotFound.tsx';
import Settings from './pages/settings/Settings.tsx';

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
      {
        path: '/admin/login',
        element: <AdminLogin />,
      },
      {
        path: '/admin',
        element: <AdminPanel />,
        children: [
          {
            index: true,
            element: <Navigate to="/admin/users" replace />,
          },
          {
            path: 'users',
            element: <AdminUsers />,
          },
          {
            path: 'reviews',
            element: <AdminReviews />,
          },
          {
            path: 'posts',
            element: <AdminPosts />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
