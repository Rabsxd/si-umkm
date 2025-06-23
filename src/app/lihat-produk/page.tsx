'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Tambahkan import Apollo Client
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

// Definisikan tipe data Produk
type Produk = {
  id: string;
  nama: string;
  deskripsi: string;
  harga: number;
  kategori: string;
  gambarUrl?: string;
  ownerId: string;
  namaPenjual?: string;
  nomorHp?: string;
};

type User = {
  id: string;
  nama: string;
  nomorHp: string;
};

// Daftar kategori produk
const kategoriList = ['Semua', 'Makanan', 'Minuman', 'Kerajinan', 'Pakaian', 'Elektronik', 'Mainan', 'Lainnya'];

// Komponen Ikon
const IconSearch = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);
const IconArrowLeft = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);
const IconWhatsApp = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" {...props}>
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.5-97.8-27.2l-6.9-4.1-72.7 19.1L48 352.3l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
    </svg>
);

// Apollo Client instance
const client = new ApolloClient({
  uri: '/api/graphql',
  cache: new InMemoryCache(),
});

// Komponen Halaman Lihat Produk
export default function LihatProdukPage() {
  const [filteredList, setFilteredList] = useState<Produk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('Semua');
  const [userMap, setUserMap] = useState<{ [id: string]: User }>({});
  const router = useRouter();

  // Fetch produk dari GraphQL
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search, kategori }),
    })
      .then(res => res.json())
      .then(({ data }) => {
        setFilteredList(data.produk);
      })
      .catch((error) => {
        console.error("Gagal mengambil data produk:", error);
        setFilteredList([]);
      })
      .finally(() => setIsLoading(false));
  }, [search, kategori]);

  // Fetch semua user (seller)
  useEffect(() => {
    fetch('/api/users') // Ganti endpoint sesuai API user kamu
      .then(res => res.json())
      .then((users: User[]) => {
        const map: { [id: string]: User } = {};
        users.forEach(user => {
          map[user.id] = user;
        });
        setUserMap(map);
      });
  }, []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 border-b border-blue-700 relative">
        <div className="container mx-auto px-6 py-4">
            <div className="mb-4">
                <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-white font-semibold transition-colors">
                    <IconArrowLeft className="h-5 w-5" />
                    Kembali ke Home
                </Link>
            </div>
            <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight text-white">Jelajahi Produk UMKM</h1>
                <p className="mt-1 text-md text-blue-200">Temukan berbagai produk unggulan dari para pelaku UMKM lokal.</p>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <IconSearch className="h-5 w-5 text-blue-200" />
                </div>
                <input
                  type="text"
                  placeholder="Cari nama produk..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border-blue-400 bg-white/10 py-2 pl-10 pr-4 shadow-sm text-white placeholder-blue-200 focus:bg-white focus:text-gray-900 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full rounded-md border-blue-400 bg-white/10 py-2 shadow-sm text-white focus:bg-white focus:text-gray-900 focus:border-blue-500 focus:ring-blue-500 transition-colors cursor-pointer"
              >
                {kategoriList.map((item) => (
                  <option key={item} value={item} className="text-gray-900">{item}</option>
                ))}
              </select>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex justify-center py-10"><p className="text-gray-600">Memuat produk...</p></div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-800">Oops! Produk tidak ditemukan.</h3>
            <p className="text-gray-500 mt-2">Coba ganti kata kunci pencarian atau filter kategori Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredList.map((produk) => (
              <div 
                key={produk.id} 
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <div className="cursor-pointer" onClick={() => router.push(`/lihat-produk/${produk.id}`)}>
                  <div className="relative w-full aspect-square overflow-hidden">
                    <Image
                      src={produk.gambarUrl || 'https://via.placeholder.com/300'}
                      alt={produk.nama}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {produk.kategori}
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-base font-bold text-gray-800 truncate">{produk.nama}</h2>
                    {/* <p className="text-xs text-gray-500 mt-1">
                      Penjual: <span className="font-medium text-gray-600">{produk.namaPenjual || 'Tidak diketahui'}</span>
                    </p> */}
                    <p className="text-lg font-semibold text-blue-600 mt-1">{formatRupiah(produk.harga)}</p>
                  </div>
                </div>
                
                <div className="p-4 pt-0 mt-auto">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => router.push(`/lihat-produk/${produk.id}`)}
                      className="inline-flex justify-center items-center bg-blue-50 text-blue-700 py-2 px-3 rounded-md font-semibold hover:bg-blue-100 transition-colors text-sm cursor-pointer"
                    >
                      Lihat Detail
                    </button>
                    {userMap[produk.ownerId]?.nomorHp && (
                      <a
                        href={`https://wa.me/${userMap[produk.ownerId].nomorHp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center gap-2 bg-green-500 text-white py-2 px-3 rounded-md font-semibold hover:bg-green-600 transition-colors text-sm"
                        title="Hubungi via WhatsApp"
                      >
                        <IconWhatsApp className="h-4 w-4" />
                        <span>Hubungi</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
