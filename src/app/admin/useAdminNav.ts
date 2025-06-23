import { useContext } from 'react';
import { AdminNavContext } from './admin-nav-context';

export const useAdminNav = () => useContext(AdminNavContext);