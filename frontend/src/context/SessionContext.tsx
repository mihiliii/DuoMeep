import { createContext } from 'react';

export interface SessionContextType {
  userId: string | null;
  setUserId: (userId: string | null) => void;
  adminId: string | null;
  setAdminId: (adminId: string | null) => void;
}

export const SessionContext = createContext<SessionContextType>({
  userId: null,
  setUserId: () => {},
  adminId: null,
  setAdminId: () => {},
});
