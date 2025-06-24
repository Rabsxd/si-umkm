'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, updateProfile, User } from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import logoSrc from '../logo.png';

// --- Komponen Ikon ---
const IconGoogle = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 9.196C34.523 5.644 29.638 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" /><path fill="#FF3D00" d="M6.306 14.691c-1.258 3.079-2.022 6.479-2.022 10.009c0 3.53 0.764 6.93 2.022 10.009l-5.314 4.138C1.186 35.079 0 30.019 0 24.691s1.186-10.388 3.006-14.138L6.306 14.691z" /><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-4.792-3.725C30.463 36.753 27.463 38 24 38c-3.866 0-7.262-1.789-9.643-4.559l-5.454 4.266C11.533 41.247 17.389 44 24 44z" /><path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-0.792 2.237-2.231 4.166-4.087 5.571l4.792 3.725C38.975 34.636 42 30.138 42 24.691c0-2.115-0.345-4.145-0.959-6.024L43.611 20.083z" /></svg>
);
const IconEmail = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" /></svg>
);
const IconLock = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
);
const IconUser = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
);
const IconClose = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);
const IconArrowLeft = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
);
const IconPhone = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" /></svg>
);

function RegisterModal({ isOpen, onClose, onRegisterSuccess }: { isOpen: boolean; onClose: () => void; onRegisterSuccess: () => void; }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nomorHp, setNomorHp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!username || !email || !password || !nomorHp) {
            setError('Harap lengkapi semua kolom.');
            return;
        }
        if (password.length < 6) {
            setError('Password harus memiliki minimal 6 karakter.');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await updateProfile(user, { displayName: username });
            
            await setDoc(doc(db, 'users', user.uid), { 
                email, 
                username, 
                nomorHp,
                createdAt: new Date(),
                role: 'user' // Otomatis set peran sebagai 'user'
            });

            setSuccess('Pendaftaran berhasil! Anda akan dapat login sebentar lagi.');
            onRegisterSuccess();
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Email ini sudah terdaftar. Silakan gunakan email lain atau login.');
            } else {
                setError('Terjadi kesalahan saat mendaftar.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/50 cursor-pointer" onClick={onClose}></div>
            <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-xl m-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900" id="modal-title">Buat Akun Baru</h2>
                        <p className="mt-1 text-sm text-gray-600">Gabung dengan ribuan UMKM lainnya.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <IconClose className="h-6 w-6" />
                    </button>
                </div>
                {success ? (
                    <div className="text-center py-10"><p className="text-green-600 font-semibold">{success}</p></div>
                ) : (
                    <form onSubmit={handleRegister} className="mt-6 space-y-4">
                        <div className="relative"><IconUser className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" placeholder="Nama UMKM / Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full rounded-md border-gray-300 py-2.5 pl-10 pr-4 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"/></div>
                        <div className="relative"><IconEmail className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-md border-gray-300 py-2.5 pl-10 pr-4 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"/></div>
                        <div className="relative"><IconPhone className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="tel" placeholder="Nomor HP (Contoh: 628...)" value={nomorHp} onChange={(e) => setNomorHp(e.target.value)} required className="w-full rounded-md border-gray-300 py-2.5 pl-10 pr-4 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"/></div>
                        <div className="relative"><IconLock className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="password" placeholder="Password (min. 6 karakter)" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-md border-gray-300 py-2.5 pl-10 pr-4 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"/></div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-md font-semibold shadow-sm hover:bg-blue-700 disabled:bg-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer">{loading ? 'Mendaftarkan...' : 'Daftar'}</button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function LoginPage() {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const router = useRouter();

    // ✅ REVISI: Fungsi terpisah untuk mengarahkan pengguna berdasarkan peran
    const redirectUser = async (user: User) => {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists() && userSnapshot.data().role === 'admin') {
            router.push('/admin/dashboard'); // Arahkan ke dashboard admin
        } else {
            router.push('/dashboard'); // Arahkan ke dashboard pengguna biasa
        }
    };
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setLoginError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            await redirectUser(userCredential.user); // ✅ Panggil fungsi redirect
        } catch (err: any) {
            setLoginError('Email atau password salah. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setLoginError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const userDocRef = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userDocRef);

            if (!userSnapshot.exists()) {
                await setDoc(userDocRef, {
                    username: user.displayName || 'Pengguna Google',
                    email: user.email,
                    nomorHp: user.phoneNumber || '', 
                    createdAt: new Date(),
                    role: 'user' // Pengguna Google otomatis jadi 'user'
                });
            }
            await redirectUser(user); // ✅ Panggil fungsi redirect
        } catch (error: any) {
            if (error.code !== 'auth/popup-closed-by-user') {
                setLoginError('Gagal login dengan Google. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleRegisterSuccess = () => {
        setTimeout(() => {
            setIsRegisterModalOpen(false);
        }, 3000);
    };

    return (
        <>
            <main className="min-h-screen w-full flex flex-col lg:flex-row bg-gray-50">
                {/* Sidebar biru, tampil di atas pada mobile */}
                <div className="flex w-full lg:w-1/3 items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 p-8 sm:p-12 text-white relative overflow-hidden">
                    <div className="z-10 text-center">
                        <Image
                            src={logoSrc}
                            alt="Logo SI UMKM"
                            width={100}
                            height={100}
                            className="mx-auto mb-6 cursor-pointer"
                        />
                        <h1 className="text-3xl font-bold tracking-tight">Si-UMKM</h1>
                        <p className="mt-4 text-base sm:text-xl text-blue-100 max-w-sm mx-auto">
                            Platform Digital untuk membawa Usaha Mikro, Kecil, dan Menengah ke level selanjutnya.
                        </p>
                    </div>
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
                </div>

                {/* Form login */}
                <div className="w-full lg:w-2/3 flex items-center justify-center bg-gray-50 p-6 sm:p-12 relative">
                    <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                        <IconArrowLeft className="h-5 w-5" />
                        Kembali ke Home
                    </Link>

                    <div className="max-w-md w-full">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mt-16 lg:mt-0">Selamat Datang Kembali!</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Belum punya akun?{' '}
                                <button onClick={() => setIsRegisterModalOpen(true)} className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                                    Daftar di sini
                                </button>
                            </p>
                        </div>
                        <div className="mt-8">
                            <button onClick={handleGoogleLogin} disabled={loading} className="w-full inline-flex items-center justify-center gap-3 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-60 transition-all cursor-pointer">
                                <IconGoogle className="h-5 w-5" /> Login dengan Google
                            </button>
                            <div className="relative mt-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div><div className="relative flex justify-center text-sm"><span className="bg-gray-50 px-2 text-gray-500">ATAU</span></div></div>
                            
                            <form onSubmit={handleLogin} className="mt-6 space-y-4">
                                <div className="relative">
                                    <IconEmail className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="w-full rounded-md border-gray-300 py-2.5 pl-10 pr-4 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"/>
                                </div>
                                <div className="relative">
                                    <IconLock className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="w-full rounded-md border-gray-300 py-2.5 pl-10 pr-4 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"/>
                                </div>
                                {loginError && <p className="text-sm text-red-600">{loginError}</p>}
                                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-md font-semibold shadow-sm hover:bg-blue-700 disabled:bg-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer">
                                    {loading ? 'Memproses...' : 'Login'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <RegisterModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onRegisterSuccess={handleRegisterSuccess}
            />
        </>
    );
}
