import { useContext } from 'react';
import { AdminNavContext } from './admin-nav-context';

export const useAdminNav = () => {
  const context = useContext(AdminNavContext);
  if (!context) {
    throw new Error('useAdminNav must be used within an AdminNavContext.Provider');
  }
  return context;
};