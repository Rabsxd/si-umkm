'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import logoSrc from '../logo.png'; // Pastikan path logo ini benar

// --- Komponen Ikon untuk Dashboard ---
const IconLayoutDashboard = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
);
const IconBox = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
);
const IconPlusCircle = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const IconLogout = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
);
// ✅ Ikon Baru
const IconStar = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
);
const IconSettings = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438 1.001s.145.761.438 1.001l1.003.827c.424.35.534.954.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.332.183-.582.495-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-1.001s-.145-.761-.437-1.001l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.075-.124.072-.044.146-.087.22-.127.332-.183.582-.495.645-.87l.213-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);


export default function DashboardPage() {
  const [userData, setUserData] = useState<{ username: string; email: string } | null>(null);
  const [produkCount, setProdukCount] = useState(0);
  // ✅ State baru untuk statistik ulasan
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          // Ambil data user
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData({ username: data.username, email: data.email });
          } else {
            setUserData({ username: user.displayName || 'Pengguna Baru', email: user.email || '-' });
          }

          // Ambil data produk dan statistik ulasan
          const produkQuery = query(collection(db, 'produk'), where('ownerId', '==', user.uid));
          const produkSnapshot = await getDocs(produkQuery);
          setProdukCount(produkSnapshot.size);

          if (produkSnapshot.size > 0) {
            const produkIds = produkSnapshot.docs.map(doc => doc.id);
            const ulasanQuery = query(collection(db, 'ulasan'), where('produkId', 'in', produkIds.slice(0, 30)));
            const ulasanSnapshot = await getDocs(ulasanQuery);
            
            let totalRating = 0;
            ulasanSnapshot.forEach(ulasanDoc => {
              totalRating += ulasanDoc.data().rating;
            });
            
            const count = ulasanSnapshot.size;
            setReviewCount(count);
            setAverageRating(count > 0 ? totalRating / count : 0);
          }

        } catch (error) {
          console.error('Gagal mengambil data dashboard:', error);
          router.push('/login');
        } finally {
            setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout gagal:', error);
      alert('Gagal logout. Coba lagi.');
    }
  };

  if (loading || !userData) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <p className="text-gray-600">Memuat dashboard...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* --- Sidebar --- */}
      <aside className="hidden lg:flex flex-col w-64 bg-blue-800 text-white">
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
            <div className="flex items-center gap-3">
                <Image src={logoSrc} alt="Logo SI UMKM" width={40} height={40} className="rounded-full" />
                <span className="text-xl font-bold">Si-UMKM</span>
            </div>
            <button onClick={handleLogout} title="Logout" className="p-2 rounded-lg hover:bg-blue-700 transition-colors">
                <IconLogout className="h-6 w-6" />
            </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-700">
                <IconLayoutDashboard className="h-6 w-6" />
                <span>Dashboard</span>
            </Link>
            <Link href="/produk" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <IconBox className="h-6 w-6" />
                <span>Produk Saya</span>
            </Link>
             <Link href="/produk/tambah" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <IconPlusCircle className="h-6 w-6" />
                <span>Tambah Produk</span>
            </Link>
             {/* ✅ REVISI: Menu Pengaturan ditambahkan */}
             <Link href="/pengaturan" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <IconSettings className="h-6 w-6" />
                <span>Pengaturan</span>
            </Link>
        </nav>
        <div className="p-4 text-center text-xs text-blue-300">
            &copy; {new Date().getFullYear()} Si-UMKM
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 p-6 sm:p-10">
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Selamat Datang, {userData.username} 👋</h1>
            <p className="text-gray-600 mt-1">Ini adalah ringkasan aktivitas UMKM Anda.</p>
            
            {/* ✅ REVISI: Kartu Statistik diperbanyak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                            <IconBox className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Jumlah Produk</p>
                            <p className="text-2xl font-bold text-gray-900">{produkCount}</p>
                        </div>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
                            <IconStar className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Ulasan</p>
                            <p className="text-2xl font-bold text-gray-900">{reviewCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                            <IconStar className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Rata-rata Rating</p>
                            <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)} <span className="text-base font-normal text-gray-500">/ 5</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Aksi Cepat --- */}
            <div className="mt-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Link href="/produk/tambah" className="group bg-white p-6 rounded-xl shadow-md hover:bg-blue-500 transition-colors flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg group-hover:bg-white/90 group-hover:text-blue-700 transition-colors">
                            <IconPlusCircle className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900 group-hover:text-white transition-colors">Tambah Produk Baru</p>
                            <p className="text-sm text-gray-500 group-hover:text-blue-100 transition-colors">Daftarkan produk unggulan Anda.</p>
                        </div>
                    </Link>
                     <Link href="/produk" className="group bg-white p-6 rounded-xl shadow-md hover:bg-green-500 transition-colors flex items-center gap-4">
                        <div className="bg-green-100 text-green-600 p-3 rounded-lg group-hover:bg-white/90 group-hover:text-green-700 transition-colors">
                            <IconBox className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900 group-hover:text-white transition-colors">Kelola Produk</p>
                            <p className="text-sm text-gray-500 group-hover:text-green-100 transition-colors">Lihat dan ubah produk Anda.</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
