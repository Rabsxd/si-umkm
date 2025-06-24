import { createContext } from 'react';

export type AdminView = 'dashboard' | 'pelatihan' | 'produk' | 'user';

export interface AdminNavContextType {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

// Create context with a default value of null.
// The provider in layout.tsx will supply the actual value.
export const AdminNavContext = createContext<AdminNavContextType | null>(null);