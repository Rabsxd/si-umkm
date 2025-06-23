'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAdminNav } from '../useAdminNav';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy, query, where, getDoc } from 'firebase/firestore';
import Image from 'next/image';

// --- Tipe Data ---
interface Pelatihan {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string; 
  link: string;
}
interface Produk {
  id: string;
  nama: string;
  harga: number;
  kategori: string;
  gambarUrl?: string;
  ownerId: string;
  namaPenjual?: string;
};
interface AdminUserData {
  id: string;
  username: string;
  email: string;
  nomorHp: string;
  role?: string;
}

// --- Komponen Ikon (Diringkas) ---
const IconUsers = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.683c.65-.911 1.036-2.026 1.036-3.215a5.25 5.25 0 00-10.5 0 6.375 6.375 0 0111.964 4.683z" /></svg>;
const IconBox = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>;
const IconBookOpen = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const IconPlus = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const IconTrash = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const IconPencil = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;
const IconClose = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;


// --- Komponen Modal Pelatihan ---
const PelatihanModal = ({ isOpen, onClose, onSave, pelatihan, mode }: { isOpen: boolean; onClose: () => void; onSave: (data: Omit<Pelatihan, 'id'>) => void; pelatihan: Partial<Pelatihan> | null; mode: 'add' | 'edit' }) => {
    const [formData, setFormData] = useState({ judul: '', deskripsi: '', tanggal: '', link: '' });

    useEffect(() => {
        if (mode === 'edit' && pelatihan) {
            setFormData({
                judul: pelatihan.judul || '',
                deskripsi: pelatihan.deskripsi || '',
                tanggal: pelatihan.tanggal || '',
                link: pelatihan.link || '',
            });
        } else {
            setFormData({ judul: '', deskripsi: '', tanggal: '', link: '' });
        }
    }, [pelatihan, mode]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{mode === 'add' ? 'Tambah Pelatihan Baru' : 'Edit Pelatihan'}</h2>
                    <button onClick={onClose}><IconClose className="h-6 w-6 text-gray-500 hover:text-gray-800" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="judul" className="block text-sm font-medium text-gray-700">Judul Pelatihan</label>
                        <input type="text" name="judul" id="judul" value={formData.judul} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                        <textarea name="deskripsi" id="deskripsi" value={formData.deskripsi} onChange={handleChange} required rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"></textarea>
                    </div>
                    <div>
                        <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">Tanggal (YYYY-MM-DD)</label>
                        <input type="date" name="tanggal" id="tanggal" value={formData.tanggal} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="link" className="block text-sm font-medium text-gray-700">Link Pendaftaran</label>
                        <input type="url" name="link" id="link" value={formData.link} onChange={handleChange} required placeholder="https://" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900" />
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700">Batal</button>
                        <button type="submit" className="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Dashboard: Pelatihan View ---
const PelatihanView = () => {
    const [pelatihanList, setPelatihanList] = useState<Pelatihan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentPelatihan, setCurrentPelatihan] = useState<Partial<Pelatihan> | null>(null);

    const fetchPelatihan = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'pelatihan'), orderBy('tanggal', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() } as Pelatihan));
            setPelatihanList(data);
        } catch (error) {
            console.error('Gagal ambil data pelatihan:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPelatihan();
    }, [fetchPelatihan]);

    const handleOpenModal = (mode: 'add' | 'edit', pelatihan?: Pelatihan) => {
        setModalMode(mode);
        setCurrentPelatihan(pelatihan || null);
        setIsModalOpen(true);
    };

    const handleSave = async (data: Omit<Pelatihan, 'id'>) => {
        if (modalMode === 'add') {
            await addDoc(collection(db, 'pelatihan'), { ...data, createdAt: Timestamp.now() });
        } else if (modalMode === 'edit' && currentPelatihan?.id) {
            await updateDoc(doc(db, 'pelatihan', currentPelatihan.id), data);
        }
        setIsModalOpen(false);
        fetchPelatihan();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Anda yakin ingin menghapus pelatihan ini?")) {
            await deleteDoc(doc(db, 'pelatihan', id));
            fetchPelatihan();
        }
    };
    
    return (
        <>
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Kelola Pelatihan</h1>
                <p className="mt-2 text-gray-600">Tambah, edit, atau hapus program pelatihan untuk UMKM.</p>
            </div>
            <button onClick={() => handleOpenModal('add')} className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors cursor-pointer">
                <IconPlus className="h-5 w-5" />
                <span>Tambah Pelatihan</span>
            </button>
        </div>

        {loading ? (
            <p>Memuat data...</p>
        ) : (
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pelatihanList.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{item.judul}</div></td>
                                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{new Date(item.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => handleOpenModal('edit', item)} className="text-indigo-600 hover:text-indigo-900 p-1 cursor-pointer"><IconPencil className="h-5 w-5" /></button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 p-1 cursor-pointer"><IconTrash className="h-5 w-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        <PelatihanModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            pelatihan={currentPelatihan}
            mode={modalMode}
        />
    </>
    );
};

// --- Dashboard: Kelola Produk View ---
const ProdukAdminView = () => {
    const [produkList, setProdukList] = useState<Produk[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAllProduk = useCallback(async () => {
        setLoading(true);
        try {
            const produkSnapshot = await getDocs(collection(db, "produk"));
            const produkData = await Promise.all(
                produkSnapshot.docs.map(async (docItem) => {
                    const data = docItem.data();
                    const produk = { id: docItem.id, ...data } as Produk;
                    
                    const userDoc = await getDoc(doc(db, 'users', produk.ownerId));
                    produk.namaPenjual = userDoc.exists() ? userDoc.data().username : 'Tidak diketahui';

                    return produk;
                })
            );
            setProdukList(produkData);
        } catch (error) {
            console.error("Gagal mengambil semua data produk:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllProduk();
    }, [fetchAllProduk]);
    
    const handleDelete = async (id: string) => {
        if(window.confirm("Anda yakin ingin menghapus produk ini secara permanen?")){
            await deleteDoc(doc(db, "produk", id));
            fetchAllProduk();
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Semua Produk</h1>
            <p className="mt-2 text-gray-600 mb-8">Lihat dan hapus semua produk yang diunggah oleh pengguna.</p>
            {loading ? (
                <p>Memuat data produk...</p>
            ) : (
                 <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penjual</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {produkList.map((produk) => (
                                <tr key={produk.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <Image className="h-10 w-10 rounded-md object-cover cursor-pointer" src={produk.gambarUrl || 'https://via.placeholder.com/150'} alt={produk.nama} width={40} height={40} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{produk.nama}</div>
                                                <div className="text-sm text-gray-500">{produk.kategori}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produk.namaPenjual}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(produk.harga)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(produk.id)} className="text-red-600 hover:text-red-900 p-1 cursor-pointer"><IconTrash className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// --- ✅ Dashboard: Kelola User View (BARU) ---
const KelolaUserView = () => {
    const [userList, setUserList] = useState<AdminUserData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as AdminUserData));
            setUserList(usersData);
        } catch (error) {
            console.error("Gagal mengambil data pengguna:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleDeleteUser = async (userId: string) => {
        if (window.confirm("PERINGATAN: Menghapus pengguna akan menghapus akun otentikasi dan data database. Lanjutkan?")) {
            try {
                const res = await fetch('/api/deleteUser', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                });
                if (!res.ok) throw new Error('Gagal menghapus user');
                fetchUsers();
            } catch (error) {
                console.error("Gagal menghapus pengguna:", error);
                alert("Gagal menghapus pengguna.");
            }
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Semua Pengguna</h1>
            <p className="mt-2 text-gray-600 mb-8">Lihat dan hapus data pengguna dari platform.</p>
            {loading ? (
                <p>Memuat data pengguna...</p>
            ) : (
                 <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. HP</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {userList.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.nomorHp || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {user.role !== 'admin' && (
                                            <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 p-1 cursor-pointer"><IconTrash className="h-5 w-5" /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};


// --- DashboardHomeView ---
const DashboardHomeView = () => {
  const [stats, setStats] = useState({ userCount: 0, produkCount: 0, pelatihanCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const produkSnapshot = await getDocs(collection(db, 'produk'));
        const pelatihanSnapshot = await getDocs(collection(db, 'pelatihan'));

        setStats({
          userCount: usersSnapshot.size,
          produkCount: produkSnapshot.size,
          pelatihanCount: pelatihanSnapshot.size
        });
      } catch (error) {
        console.error("Gagal mengambil data statistik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">panel admin Si-UMKM.</p>
        
        {loading ? (
            <p className="mt-8 text-center">Memuat statistik...</p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-lg"><IconUsers className="h-8 w-8" /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Pengguna</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.userCount}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
                    <div className="bg-green-100 text-green-600 p-3 rounded-lg"><IconBox className="h-8 w-8" /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Produk</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.produkCount}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
                    <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg"><IconBookOpen className="h-8 w-8" /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Pelatihan</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.pelatihanCount}</p>
                    </div>
                </div>
            </div>
        )}
        {/* <div className="mt-10 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800">Panel Kontrol</h2>
            <p className="mt-2 text-gray-600">Anda dapat mengelola berbagai aspek dari platform melalui menu navigasi di sebelah kiri.</p>
        </div> */}
    </div>
  );
}

// --- Komponen Dashboard Admin Utama ---
export default function AdminDashboardPage() {
  const { activeView } = useAdminNav();

  const renderView = () => {
    switch(activeView) {
        case 'pelatihan':
            return <PelatihanView />;
        case 'produk':
            return <ProdukAdminView />; 
        case 'user':
            return <KelolaUserView />; // ✅ Menampilkan view baru
        case 'dashboard':
        default:
            return <DashboardHomeView />;
    }
  };

  return (
      <div className="container mx-auto">
          {renderView()}
      </div>
  );
}
