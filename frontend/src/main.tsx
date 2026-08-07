import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
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
import AdminLogin from './pages/admin/login/AdminLogin.tsx';
import AdminPanel from './pages/admin/panel/AdminPanel.tsx';
import AdminUsers from './pages/admin/panel/users/AdminUsers.tsx';
import AdminReviews from './pages/admin/panel/reviews/AdminReviews.tsx';
import AdminPosts from './pages/admin/panel/posts/AdminPosts.tsx';

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
        path: '/admin',
        element: <Navigate to="/admin/panel" replace />,
      },
      {
        path: '/admin/login',
        element: <AdminLogin />,
      },
      {
        path: '/admin/panel',
        element: <AdminPanel />,
        children: [
          {
            index: true,
            element: <Navigate to="/admin/panel/users" replace />,
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
