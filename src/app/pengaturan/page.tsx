'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, updateProfile, updatePassword, User, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import Link from 'next/link';

// --- Komponen Ikon ---
const IconArrowLeft = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

export default function PengaturanPage() {
  const [user, setUser] = useState<User | null>(null);
  
  // State untuk form profil
  const [username, setUsername] = useState('');
  const [nomorHp, setNomorHp] = useState(''); // ✅ State baru untuk nomor HP
  const [initialProfile, setInitialProfile] = useState({ username: '', nomorHp: '' });

  // State untuk form password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State untuk UI
  const [loading, setLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
            const docRef = doc(db, 'users', currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              const profile = {
                  username: data.username || currentUser.displayName || '',
                  nomorHp: data.nomorHp || '' // ✅ Ambil nomor HP dari database
              };
              setUsername(profile.username);
              setNomorHp(profile.nomorHp);
              setInitialProfile(profile);
            }
        } catch (err) {
            console.error("Gagal mengambil data user:", err);
            setError("Gagal memuat data profil.");
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setSuccess('');
      setError('');
      
      const profileHasChanged = username !== initialProfile.username || nomorHp !== initialProfile.nomorHp;
      if (!user || !profileHasChanged) return;

      setIsUpdatingProfile(true);
      
      const updateData: { username: string; nomorHp?: string } = { username };
      if (nomorHp) {
        updateData.nomorHp = nomorHp;
      }
      
      try {
          if (username !== initialProfile.username) {
            await updateProfile(user, { displayName: username });
          }
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, updateData);
          
          setInitialProfile({ username, nomorHp });
          setSuccess('Profil berhasil diperbarui!');
      } catch (err) {
          setError('Gagal memperbarui profil. Silakan coba lagi.');
          console.error(err);
      } finally {
          setIsUpdatingProfile(false);
      }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(''); 
    setError('');

    if (!user || !user.email) {
        setError("Data pengguna tidak lengkap untuk mengubah password.");
        return;
    }
    if (newPassword.length < 6) {
      setError('Password baru harus minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi tidak cocok.');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setSuccess('Password berhasil diubah!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
        if (err.code === 'auth/wrong-password') {
            setError('Password saat ini salah.');
        } else {
            setError('Gagal mengubah password. Silakan coba lagi.');
        }
        console.error(err);
    } finally {
        setIsUpdatingPassword(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-600">Memuat pengaturan...</div>;
  }

  const isProfileChanged = username !== initialProfile.username || nomorHp !== initialProfile.nomorHp;

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors">
                <IconArrowLeft className="h-5 w-5" />
                Kembali ke Dashboard
            </Link>
        </div>
        
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Akun</h1>
            <p className="mt-1 text-gray-600">Kelola informasi profil dan keamanan akun Anda.</p>
            
            {success && <p className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</p>}
            {error && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
            
            <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4 border-t pt-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input id="email" type="email" value={user?.email || ''} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed text-gray-500"/>
                </div>
                 <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nama Pengguna / UMKM</label>
                    <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"/>
                </div>
                {/* ✅ Kolom Input Nomor HP */}
                <div>
                    <label htmlFor="nomorHp" className="block text-sm font-medium text-gray-700">Nomor HP (WhatsApp)</label>
                    <input id="nomorHp" type="tel" value={nomorHp} onChange={(e) => setNomorHp(e.target.value)} placeholder="Contoh: 6281234567890" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"/>
                    <p className="mt-1 text-xs text-gray-500">Gunakan format 62 diawal. Nomor ini akan digunakan pembeli untuk menghubungi Anda.</p>
                </div>
                <div className="text-right">
                    <button type="submit" disabled={isUpdatingProfile || !isProfileChanged} className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed">
                        {isUpdatingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                    </button>
                </div>
            </form>
          </div>

          <div className="border-t pt-8">
             <form onSubmit={handleUpdatePassword} className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">Ubah Password</h2>
                 <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Password Saat Ini</label>
                    <input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"/>
                </div>
                 <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">Password Baru</label>
                    <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"/>
                </div>
                 <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                    <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"/>
                </div>
                 <div className="text-right">
                    <button type="submit" disabled={isUpdatingPassword} className="inline-flex justify-center rounded-md border border-transparent bg-gray-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400">
                        {isUpdatingPassword ? 'Mengubah...' : 'Ubah Password'}
                    </button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </main>
  );
}
