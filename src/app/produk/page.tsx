'use client';

import { useEffect, useState, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
const IconPlus = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
);
const IconDotsVertical = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
);
const IconTrash = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
);
const IconArrowLeft = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);


export default function ProdukPage() {
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produkToDelete, setProdukToDelete] = useState<{id: string, nama: string} | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const q = query(collection(db, 'produk'), where('ownerId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          const list = querySnapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() } as Produk));
          setProdukList(list);
        } catch (err) {
          console.error('Gagal ambil data produk:', err);
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    } catch (error) {
      console.error('Gagal hapus produk:', error);
      alert('Terjadi kesalahan saat menghapus produk.');
    } finally {
      setIsModalOpen(false);
      setProdukToDelete(null);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <div className="bg-blue-600 border-b border-blue-700">
          <div className="container mx-auto px-6 py-8">
              <div className="mb-4">
                  <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-200 hover:text-white font-semibold transition-colors">
                      <IconArrowLeft className="h-5 w-5" />
                      Kembali ke Dashboard
                  </Link>
              </div>
              <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Produk Saya</h1>
                    <p className="mt-2 text-blue-200">Kelola semua produk yang Anda jual di sini.</p>
                </div>
                <Link href="/produk/tambah" className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-gray-200 transition-colors">
                    <IconPlus className="h-5 w-5" />
                    <span>Tambah Produk</span>
                </Link>
              </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {loading ? (
            <p className="text-center text-gray-600 py-10">Memuat produk Anda...</p>
          ) : produkList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800">Anda Belum Punya Produk</h3>
              <p className="text-gray-500 mt-2">Mulailah dengan menambahkan produk pertama Anda.</p>
              <Link href="/produk/tambah" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-700">
                Tambah Produk
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {produkList.map((produk) => (
                <div key={produk.id} className="bg-white rounded-lg shadow-md flex flex-col">
                  <div className="relative w-full aspect-square rounded-t-lg overflow-hidden">
                    <Image
                      src={produk.gambarUrl || 'https://via.placeholder.com/300'}
                      alt={produk.nama}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h2 className="text-base font-bold text-gray-800 truncate">{produk.nama}</h2>
                    <p className="text-sm text-gray-500 mt-1">{produk.kategori}</p>
                    <p className="text-lg font-semibold text-blue-600 mt-1">{formatRupiah(produk.harga)}</p>
                    <div className="flex-grow"></div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center gap-2">
                      {/* ✅ REVISI: Menambahkan query parameter ?from=produk */}
                      <Link href={`/lihat-produk/${produk.id}?from=produk`} className="flex-1 text-center bg-blue-50 text-blue-700 text-sm font-semibold py-2 px-3 rounded-md hover:bg-blue-100 transition-colors">
                        Lihat Detail
                      </Link>
                      
                      <div className="relative" ref={openMenuId === produk.id ? menuRef : null}>
                        <button onClick={() => setOpenMenuId(openMenuId === produk.id ? null : produk.id)} className="p-2 rounded-full hover:bg-gray-100">
                          <IconDotsVertical className="h-5 w-5 text-gray-500" />
                        </button>
                        {openMenuId === produk.id && (
                          <div className="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <button onClick={() => router.push(`/produk/edit/${produk.id}`)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</button>
                            <button onClick={() => handleDeleteClick(produk.id, produk.nama)} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Hapus</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && produkToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-auto">
            <div className="text-center">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <IconTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-3">Hapus Produk</h3>
              <div className="mt-2 px-4 text-sm text-gray-500">
                <p>Anda yakin ingin menghapus produk "{produkToDelete.nama}"? Aksi ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button type="button" onClick={confirmDelete} className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700">
                Ya, Hapus
              </button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
