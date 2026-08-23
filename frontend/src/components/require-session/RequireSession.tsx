import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { SessionContext, type SessionContextType } from '@/context/SessionContext';

type RequireSessionProps = {
  sessionKey: 'userId' | 'adminId';
  redirectTo: string;
};

export default function RequireSession({ sessionKey, redirectTo }: RequireSessionProps) {
  const session: SessionContextType = useContext(SessionContext);

  if (session[sessionKey] === null) return <Navigate to={redirectTo} replace />;

  return <Outlet />;
}
