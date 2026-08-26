import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { SessionContext, type SessionContextType } from '@/context/SessionContext';

type RequireSessionProps = {
  sessionKeys: ('userId' | 'adminId')[];
  redirectTo: string;
};

export default function RequireSession({ sessionKeys, redirectTo }: RequireSessionProps) {
  const session: SessionContextType = useContext(SessionContext);

  if (!sessionKeys.some((key) => session[key] !== null)) return <Navigate to={redirectTo} replace />;

  return <Outlet />;
}
