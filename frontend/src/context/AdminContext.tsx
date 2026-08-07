import { createContext } from 'react';

export interface AdminContextType {
  adminId: string | null;
  setAdminId: (adminId: string | null) => void;
}

export const AdminContext = createContext<AdminContextType>({
  adminId: null,
  setAdminId: () => {},
});
