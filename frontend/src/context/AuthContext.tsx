import { createContext } from 'react';

export interface IAuthContext {
  userId: string | null;
  setUserId: (userId: string | null) => void;
  username: string | null;
  setUsername: (username: string | null) => void;
}

export const AuthContext = createContext<IAuthContext>({
  userId: null,
  setUserId: () => {},
  username: null,
  setUsername: () => {},
});
