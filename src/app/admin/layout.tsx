'use client';

import { useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AdminNavContext, AdminView } from './admin-nav-context';
import { useAdminNav } from './useAdminNav';

// --- Ikon Sidebar ---
const IconLayoutDashboard = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const IconBookOpen = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const IconBox = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const IconUsers = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.683c.65-.911 1.036-2.026 1.036-3.215a5.25 5.25 0 00-10.5 0 6.375 6.375 0 0111.964 4.683z" />
  </svg>
);

const IconLogout = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

const IconMenu = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const Sidebar = () => {
  const { activeView, setActiveView, isSidebarOpen, closeSidebar } = useAdminNav();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const navItems = [
    { id: 'dashboard' as AdminView, label: 'Dashboard', icon: IconLayoutDashboard },
    { id: 'pelatihan' as AdminView, label: 'Kelola Pelatihan', icon: IconBookOpen },
    { id: 'produk' as AdminView, label: 'Kelola Produk', icon: IconBox },
    { id: 'user' as AdminView, label: 'Kelola Pengguna', icon: IconUsers },
  ];

  return (
    <>
      {/* Overlay untuk menutup sidebar di mobile */}
      {isSidebarOpen && <div onClick={closeSidebar} className="fixed inset-0 z-20 bg-black/50 lg:hidden" />}

      <aside
        className={`fixed top-0 left-0 z-30 flex h-full w-64 transform flex-col bg-gray-800 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold">ADMIN PANEL</span>
          </div>
          {/* Tombol logout ini hanya untuk mobile, di dalam sidebar */}
          <button onClick={handleLogout} title="Logout" className="p-2 rounded-lg hover:bg-gray-700 cursor-pointer lg:hidden">
            <IconLogout className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                activeView === item.id ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        {/* Tombol logout untuk desktop di bagian bawah */}
        <div className="p-4 border-t border-gray-800 hidden lg:block">
           <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-700">
              <IconLogout className="h-6 w-6" />
              <span>Logout</span>
           </button>
        </div>
      </aside>
    </>
  );
};

const MobileHeader = () => {
  const { toggleSidebar } = useAdminNav();
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-gray-700 border-b lg:hidden">
      <button onClick={toggleSidebar} className="text-white" aria-label="Buka menu">
        <IconMenu className="w-6 h-6" />
      </button>
      <span className="text-lg font-bold">Admin Panel</span>
      <div className="w-6" /> {/* Spacer agar judul di tengah */}
    </header>
  );
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [activeView, _setActiveView] = useState<AdminView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  // Baca hash saat mount
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as AdminView;
    if (hash && ['dashboard', 'pelatihan', 'produk', 'user'].includes(hash)) {
      _setActiveView(hash);
    }
  }, []);

  // Update activeView saat hash berubah (back/forward)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '') as AdminView;
      if (hash && ['dashboard', 'pelatihan', 'produk', 'user'].includes(hash)) {
        _setActiveView(hash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (!userSnapshot.exists() || userSnapshot.data().role !== 'admin') {
          router.push('/login');
        } else {
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Memverifikasi akses admin...</div>;
  }

  // Fungsi-fungsi yang akan dimasukkan ke context
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  const setActiveView = (view: AdminView) => {
    window.location.hash = view; // update hash, trigger hashchange
    closeSidebar();
  };

  return (
    <AdminNavContext.Provider value={{ activeView, setActiveView, isSidebarOpen, toggleSidebar, closeSidebar }}>
      <div className="min-h-screen bg-gray-100">
        <Sidebar /> {/* Sidebar sekarang mengatur visibilitasnya sendiri */}
        <div className="flex flex-col flex-1 lg:ml-64">
          <MobileHeader />
          <main className="flex-1 p-6 sm:p-10">
            {children}
          </main>
        </div>
      </div>
    </AdminNavContext.Provider>
  );
}
