import { createContext } from 'react';

export interface AuthContextType {
  userId: string | null;
  setUserId: (userId: string | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  userId: null,
  setUserId: () => {},
});
