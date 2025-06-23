import { createContext } from 'react';

export const AdminNavContext = createContext({
  activeView: 'dashboard',
  setActiveView: (_view: string) => {},
});