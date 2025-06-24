'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { onAuthStateChanged, signOut, User, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import logoSrc from '../logo.png';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';

// --- Tipe Data ---
type Produk = {
  id: string;
  nama: string;
  deskripsi: string;
  harga: number;
  kategori: string;
  tanggal: Timestamp;
  gambarUrl?: string;
};

// --- Komponen Ikon ---
const IconLayoutDashboard = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;
const IconBox = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>;
const IconPlusCircle = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconLogout = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>;
const IconStar = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>;
const IconSettings = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438 1.001s.145.761.438 1.001l1.003.827c.424.35.534.954.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.332.183-.582.495-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-1.001s-.145-.761-.437-1.001l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.075-.124.072-.044.146-.087.22-.127.332-.183.582-.495.645-.87l.213-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconDotsVertical = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>;
const IconTrash = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const IconUpload = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>;

// --- Dashboard: Home View ---
const DashboardHomeView = ({ user, nomorHp, onNavigate }: { user: User | null; nomorHp?: string; onNavigate: (view: string) => void; }) => {
    const [produkCount, setProdukCount] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const produkQuery = query(collection(db, 'produk'), where('ownerId', '==', user.uid));
                const produkSnapshot = await getDocs(produkQuery);
                setProdukCount(produkSnapshot.size);
                if (produkSnapshot.size > 0) {
                    const produkIds = produkSnapshot.docs.map(doc => doc.id);
                    const ulasanQuery = query(collection(db, 'ulasan'), where('produkId', 'in', produkIds.slice(0, 30)));
                    const ulasanSnapshot = await getDocs(ulasanQuery);
                    let totalRating = 0;
                    ulasanSnapshot.forEach(ulasanDoc => totalRating += ulasanDoc.data().rating);
                    const count = ulasanSnapshot.size;
                    setReviewCount(count);
                    setAverageRating(count > 0 ? totalRating / count : 0);
                }
            } catch (error) {
                console.error("Gagal memuat statistik:", error);
            }
        };
        fetchData();
    }, [user]);

    return (
        <>
            {(!nomorHp || nomorHp.trim() === '') && (
                <div className="mb-6 p-4 rounded-md bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                    <p><strong>Peringatan:</strong> Pastikan anda sudah mengisi <em>Nomor HP</em> di pengaturan, agar pelanggan dapat menghubungi Anda melalui WhatsApp.</p>
                </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900">Selamat Datang, {user?.displayName || 'Pengguna'} 👋</h1>
            <p className="text-gray-600 mt-1">Ini adalah ringkasan aktivitas UMKM Anda.</p>
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
            <div className="mt-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <button onClick={() => onNavigate('tambah')} className="group text-left bg-white p-6 rounded-xl shadow-md hover:bg-blue-500 transition-colors flex items-center gap-4 cursor-pointer">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg group-hover:bg-white/90 group-hover:text-blue-700 transition-colors">
                            <IconPlusCircle className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900 group-hover:text-white transition-colors">Tambah Produk Baru</p>
                            <p className="text-sm text-gray-500 group-hover:text-blue-100 transition-colors">Daftarkan produk unggulan Anda.</p>
                        </div>
                    </button>
                    <button onClick={() => onNavigate('produk')} className="group text-left bg-white p-6 rounded-xl shadow-md hover:bg-green-500 transition-colors flex items-center gap-4 cursor-pointer">
                        <div className="bg-green-100 text-green-600 p-3 rounded-lg group-hover:bg-white/90 group-hover:text-green-700 transition-colors">
                            <IconBox className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900 group-hover:text-white transition-colors">Kelola Produk</p>
                            <p className="text-sm text-gray-500 group-hover:text-green-100 transition-colors">Lihat dan ubah produk Anda.</p>
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
};


// --- Dashboard: Produk View ---
const ProdukView = ({ user, onNavigate }: { user: User | null; onNavigate: (view: string, id?: string) => void; }) => {
    const [produkList, setProdukList] = useState<Produk[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [produkToDelete, setProdukToDelete] = useState<{id: string, nama: string} | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;
        const fetchProduk = async () => {
             setLoading(true);
            try {
                const q = query(collection(db, 'produk'), where('ownerId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const list = querySnapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() } as Produk));
                setProdukList(list);
            } catch (err) { console.error('Gagal ambil data produk:', err); } 
            finally { setLoading(false); }
        };
        fetchProduk();
    }, [user]);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        if (openMenuId) { document.addEventListener("mousedown", handleClickOutside); }
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [openMenuId]);

    const handleDeleteClick = (id: string, nama: string) => {
        setProdukToDelete({ id, nama });
        setIsModalOpen(true);
        setOpenMenuId(null);
    };

    const confirmDelete = async () => {
        if (!produkToDelete) return;
        try {
            await deleteDoc(doc(db, 'produk', produkToDelete.id));
            setProdukList(prev => prev.filter(p => p.id !== produkToDelete.id));
        } catch (error) { console.error('Gagal hapus produk:', error); } 
        finally {
            setIsModalOpen(false);
            setProdukToDelete(null);
        }
    };

    const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Produk Saya</h1>
                    <p className="mt-2 text-gray-600">Kelola semua produk yang Anda jual di sini.</p>
                </div>
                <button onClick={() => onNavigate('tambah')} className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors cursor-pointer">
                    <IconPlusCircle className="h-5 w-5" />
                    <span>Tambah Produk</span>
                </button>
            </div>
            {loading ? <p>Memuat produk...</p> : produkList.length === 0 ? <div className="text-center py-16 bg-white rounded-lg shadow-sm"><h3 className="text-xl font-semibold text-gray-800">Anda Belum Punya Produk</h3><p className="text-gray-500 mt-2">Mulailah dengan menambahkan produk pertama Anda.</p><button onClick={() => onNavigate('tambah')} className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700">Tambah Produk</button></div> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {produkList.map((produk) => (
                    <div key={produk.id} className="bg-white rounded-lg shadow-md flex flex-col">
                        <div className="relative w-full aspect-square rounded-t-lg overflow-hidden">
                            <Image src={produk.gambarUrl || 'https://via.placeholder.com/300'} alt={produk.nama} fill className="object-cover" />
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <h2 className="text-base font-bold text-gray-800 truncate">{produk.nama}</h2>
                            <p className="text-sm text-gray-500 mt-1">{produk.kategori}</p>
                            <p className="text-lg font-semibold text-blue-600 mt-1">{formatRupiah(produk.harga)}</p>
                            <div className="flex-grow"></div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center gap-2">
                                <Link href={`/lihat-produk/${produk.id}?from=produk`} className="flex-1 text-center bg-blue-50 text-blue-700 text-sm font-semibold py-2 px-3 rounded-md hover:bg-blue-100 transition-colors">Lihat Detail</Link>
                                <div className="relative" ref={openMenuId === produk.id ? menuRef : null}>
                                    <button onClick={() => setOpenMenuId(openMenuId === produk.id ? null : produk.id)} className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"><IconDotsVertical className="h-5 w-5 text-gray-500" /></button>
                                    {openMenuId === produk.id && (
                                    <div className="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                        <Link href={`/produk/edit/${produk.id}`} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</Link>
                                        <button onClick={() => handleDeleteClick(produk.id, produk.nama)} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer">Hapus</button>
                                    </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                 ))}
            </div>
            )}
             {isModalOpen && produkToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-auto">
                    <div className="text-center">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100"><IconTrash className="h-6 w-6 text-red-600" /></div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mt-3">Hapus Produk</h3>
                    <div className="mt-2 px-4 text-sm text-gray-500"><p>Anda yakin ingin menghapus produk "{produkToDelete.nama}"? Aksi ini tidak dapat dibatalkan.</p></div>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button type="button" onClick={confirmDelete} className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 cursor-pointer">Ya, Hapus</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 cursor-pointer">Batal</button>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

// --- Dashboard: Tambah Produk View ---
const TambahProdukView = ({ user, onNavigate }: { user: User | null, onNavigate: (view: string) => void }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({ nama: '', deskripsi: '', harga: '', kategori: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [highlightPaste, setHighlightPaste] = useState(false);
    const kategoriList = ['Makanan', 'Minuman', 'Kerajinan', 'Pakaian', 'Elektronik', 'Mainan', 'Lainnya'];

    const handleImageFile = useCallback((file: File | null) => {
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('File yang diunggah bukan gambar.');
                return;
            }
            setError('');
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    }, []);

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (items) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        const file = items[i].getAsFile();
                        handleImageFile(file);
                        setHighlightPaste(true);
                        setTimeout(() => setHighlightPaste(false), 800); // efek highlight sementara
                        event.preventDefault();
                        break;
                    }
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [handleImageFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => handleImageFile(e.target.files?.[0] || null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !imageFile || !formData.kategori) {
            setError('Harap lengkapi semua data dan unggah gambar.');
            return;
        }
        setIsSubmitting(true);
        try {
            const imageUrl = await uploadToCloudinary(imageFile);
            if (!imageUrl) throw new Error("Gagal unggah gambar");

            await addDoc(collection(db, 'produk'), {
                ...formData,
                harga: parseInt(formData.harga),
                ownerId: user.uid,
                tanggal: Timestamp.now(),
                gambarUrl: imageUrl,
            });
            setSuccess('Produk berhasil ditambahkan! Mengalihkan...');
            setTimeout(() => onNavigate('produk'), 2000);
        } catch (err) {
            setError('Gagal menambah produk.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Tambah Produk Baru</h1>
            <p className="mt-1 text-gray-600 mb-8">Isi detail produk Anda di bawah ini.</p>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-8">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="tambah-nama" className="block text-sm font-medium text-gray-700">Nama Produk</label>
                        <input id="tambah-nama" name="nama" type="text" value={formData.nama} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="tambah-deskripsi" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                        <textarea id="tambah-deskripsi" name="deskripsi" value={formData.deskripsi} onChange={handleChange} required rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="tambah-harga" className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
                            <input id="tambah-harga" name="harga" type="number" value={formData.harga} onChange={handleChange} required placeholder="Contoh: 50000" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900" />
                        </div>
                        <div>
                            <label htmlFor="tambah-kategori" className="block text-sm font-medium text-gray-700">Kategori</label>
                            <select id="tambah-kategori" name="kategori" value={formData.kategori} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 cursor-pointer">
                                <option value="" disabled>Pilih Kategori</option>
                                {kategoriList.map((item) => (<option key={item} value={item}>{item}</option>))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gambar Produk</label>
                        <label htmlFor="tambah-file-upload"
                            className={`mt-1 flex justify-center items-center w-full h-full px-6 py-10 border-2 border-dashed rounded-md cursor-pointer transition-colors
                            ${highlightPaste ? 'border-blue-500 bg-blue-50 animate-pulse' : 'border-gray-300 hover:border-blue-500'}`}>
                            <div className="space-y-1 text-center">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Preview" width={200} height={200} className="mx-auto h-40 w-40 object-cover rounded-md" />
                                ) : (
                                    <IconUpload className="mx-auto h-12 w-12 text-gray-400" />
                                )}
                                <div className="flex text-sm text-gray-600 justify-center">
                                    <span className="font-medium text-blue-600">Unggah file</span><p className="pl-1">atau seret dan lepas</p>
                                </div>
                                <p className="text-xs text-gray-500">Bisa juga tekan <strong>Ctrl + V</strong> untuk paste gambar</p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF Hingga 10MB</p>
                            </div>
                        </label>
                        <input id="tambah-file-upload" name="file-upload" type="file" accept="image/*" onChange={handleImageChange} required={!imageFile} className="sr-only" />
                    </div>
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</p>}
                <div className="pt-5 border-t border-gray-200 flex justify-end">
                    <button type="button" onClick={() => onNavigate('dashboard')} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="ml-3 inline-flex justify-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer">{isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}</button>
                </div>
            </form>
        </div>
    );
};

// --- Dashboard: Pengaturan View (DENGAN NOMOR HP) ---
const PengaturanView = ({ user }: { user: User | null }) => {
    const [username, setUsername] = useState('');
    const [nomorHp, setNomorHp] = useState('');
    const [initialProfile, setInitialProfile] = useState({ username: '', nomorHp: '' });

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if(user) {
            const fetchUserData = async () => {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const usernameData = data.username || user.displayName || '';
                    const nomorHpData = data.nomorHp || '';
                    setUsername(usernameData);
                    setNomorHp(nomorHpData);
                    setInitialProfile({ username: usernameData, nomorHp: nomorHpData });
                }
            }
            fetchUserData();
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(''); setError('');
        if (!user || (username === initialProfile.username && nomorHp === initialProfile.nomorHp)) return;
        setIsUpdatingProfile(true);
        try {
            if (username !== initialProfile.username) {
                await updateProfile(user, { displayName: username });
            }
            await updateDoc(doc(db, 'users', user.uid), { username, nomorHp });
            setInitialProfile({ username, nomorHp });
            setSuccess('Profil berhasil diperbarui!');
        } catch (err) {
            setError('Gagal memperbarui profil.');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(''); setError('');
        if (!user?.email) return;
        if (newPassword !== confirmPassword) { setError("Password baru tidak cocok."); return; }
        setIsUpdatingPassword(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setSuccess('Password berhasil diubah!');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (err) {
            setError('Gagal mengubah password. Pastikan password saat ini benar.');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {(!nomorHp || nomorHp.trim() === '') && (
                <div className="mb-6 p-4 rounded-md bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                    <p><strong>Peringatan:</strong> Anda belum mengisi <em>Nomor HP</em>. Mohon lengkapi agar pelanggan dapat menghubungi Anda.</p>
                </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900">Pengaturan Akun</h1>
            <p className="mt-1 text-gray-600 mb-8">Kelola informasi profil dan keamanan akun Anda.</p>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Informasi Profil</h2>
                    {success && <p className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</p>}
                    {error && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                    <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4 border-t pt-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input id="email" type="email" value={user?.email || ''} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-500" />
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nama Pengguna / UMKM</label>
                            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 placeholder:text-gray-500" />
                        </div>
                        <div>
                            <label htmlFor="nomorHp" className="block text-sm font-medium text-gray-700">Nomor HP (WhatsApp)</label>
                            <input id="nomorHp" type="tel" value={nomorHp} onChange={(e) => setNomorHp(e.target.value)} placeholder="Contoh: 6281234567890" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 placeholder:text-gray-500" />
                            <p className="mt-1 text-xs text-gray-500">Gunakan format 62 di awal. Nomor ini akan digunakan pembeli untuk menghubungi Anda.</p>
                        </div>
                        <div className="text-right">
                            <button type="submit" disabled={isUpdatingProfile || (username === initialProfile.username && nomorHp === initialProfile.nomorHp)} className="inline-flex justify-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer">Simpan Perubahan Profil</button>
                        </div>
                    </form>
                </div>
                <div>
                    <form onSubmit={handleUpdatePassword} className="space-y-4 border-t pt-6">
                        <h2 className="text-lg font-medium text-gray-900">Ubah Password</h2>
                        <div>
                            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Password Saat Ini</label>
                            <input id="current-password" type="password" placeholder="Masukkan password saat ini" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 placeholder:text-gray-500" />
                        </div>
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">Password Baru</label>
                            <input id="new-password" type="password" placeholder="Minimal 6 karakter" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 placeholder:text-gray-500" />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                            <input id="confirm-password" type="password" placeholder="Ulangi password baru" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 placeholder:text-gray-500" />
                        </div>
                        <div className="text-right">
                            <button type="submit" disabled={isUpdatingPassword} className="inline-flex justify-center rounded-md bg-gray-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 cursor-pointer">Ubah Password</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};




// --- Komponen Dashboard Utama ---
export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const router = useRouter();

  // Baca hash saat mount
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) setActiveView(hash);
  }, []);

  // Update menu saat hash berubah (back/forward)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setActiveView(hash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Navigasi menu + update hash
  const handleNavigate = (view: string, id?: string) => {
    setActiveView(view);
    setEditId(id);
    window.location.hash = view;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  const renderActiveView = () => {
      switch(activeView) {
          case 'produk':
              return <ProdukView user={user} onNavigate={handleNavigate} />;
          case 'tambah':
              return <TambahProdukView user={user} onNavigate={handleNavigate} />;
          case 'pengaturan':
              return <PengaturanView user={user} />;
          case 'dashboard':
          default:
              return <DashboardHomeView user={user} onNavigate={handleNavigate} />;
      }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Memuat...</p></div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-blue-800 text-white">
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
            <div className="flex items-center gap-3"><Image src={logoSrc} alt="Logo" width={40} height={40} className="rounded-full" /><span>Si-UMKM</span></div>
            <button onClick={handleLogout} title="Logout" className="p-2 rounded-lg hover:bg-blue-700 cursor-pointer"><IconLogout className="h-6 w-6" /></button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
            <button onClick={() => handleNavigate('dashboard')} className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer ${activeView === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}><IconLayoutDashboard className="h-6 w-6" /><span>Dashboard</span></button>
            <button onClick={() => handleNavigate('produk')} className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer ${activeView === 'produk' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}><IconBox className="h-6 w-6" /><span>Produk Saya</span></button>
            <button onClick={() => handleNavigate('tambah')} className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer ${activeView === 'tambah' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}><IconPlusCircle className="h-6 w-6" /><span>Tambah Produk</span></button>
            <button onClick={() => handleNavigate('pengaturan')} className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer ${activeView === 'pengaturan' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}><IconSettings className="h-6 w-6" /><span>Pengaturan</span></button>
        </nav>
        <div className="p-4 text-center text-xs text-blue-300">&copy; {new Date().getFullYear()} Si-UMKM</div>
      </aside>

      {/* SIDEBAR MOBILE (DRAWER) */}
      <div className={`fixed inset-0 z-40 flex lg:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Overlay */}
        <div className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-60' : 'opacity-0'}`} onClick={() => setMobileMenuOpen(false)}></div>

        {/* Sidebar Panel */}
        <div className={`relative flex flex-col w-64 bg-blue-800 text-white h-full shadow-xl transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b border-blue-700">
            <div className="flex items-center gap-3">
              <Image src={logoSrc} alt="Logo" width={40} height={40} className="rounded-full" />
              <span className="font-semibold">Si-UMKM</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-2">
            <button onClick={() => { handleNavigate('dashboard'); setMobileMenuOpen(false); }} className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors ${activeView === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}><IconLayoutDashboard className="h-6 w-6" /><span>Dashboard</span></button>
            <button onClick={() => { handleNavigate('produk'); setMobileMenuOpen(false); }} className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors ${activeView === 'produk' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}><IconBox className="h-6 w-6" /><span>Produk Saya</span></button>
            <button onClick={() => { handleNavigate('tambah'); setMobileMenuOpen(false); }} className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors ${activeView === 'tambah' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}><IconPlusCircle className="h-6 w-6" /><span>Tambah Produk</span></button>
            <button onClick={() => { handleNavigate('pengaturan'); setMobileMenuOpen(false); }} className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors ${activeView === 'pengaturan' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}><IconSettings className="h-6 w-6" /><span>Pengaturan</span></button>
          </nav>
          <div className="mt-auto">
            <div className="p-4 text-center text-xs text-blue-300 border-t border-blue-700/50">&copy; {new Date().getFullYear()} Si-UMKM</div>
            <button onClick={handleLogout} title="Logout" className="w-full p-4 bg-blue-900 hover:bg-blue-700 cursor-pointer flex items-center justify-center gap-3 transition-colors">
              <IconLogout className="h-6 w-6" />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        {/* Topbar mobile */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-2">
            <Image src={logoSrc} alt="Logo" width={32} height={32} className="rounded-full" />
            <span className="font-bold text-blue-800">Si-UMKM</span>
          </div>
        </div>
        <div className="container mx-auto">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}
