'use client';

import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Komponen Ikon Bintang
const IconStar = (props: React.ComponentProps<'svg'>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10.868 2.884c.321-.662 1.215-.662 1.536 0l1.681 3.462a1 1 0 00.951.692h3.911c.714 0 .999.964.45 1.412l-3.138 2.28a1 1 0 00-.364 1.118l1.232 3.845c.223.696-.588 1.258-1.15.865L11.75 12.852a1 1 0 00-1.5 0l-2.944 2.148c-.562.41-1.373-.17-1.15-.865l1.232-3.845a1 1 0 00-.364-1.118L2.894 8.45c-.55-.448-.264-1.412.45-1.412h3.91a1 1 0 00.952-.692l1.681-3.462z" clipRule="evenodd" />
  </svg>
);


export default function UlasanProdukClient({ produkId }: { produkId: string }) {
  // ✅ Menggunakan state dari kode awal Anda
  const [ulasanList, setUlasanList] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [komentar, setKomentar] = useState('');
  const [rating, setRating] = useState(5); // Default rating 5 bintang

  const [loadingUlasan, setLoadingUlasan] = useState(true);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ MENGGUNAKAN LOGIKA useEffect ASLI ANDA YANG SUDAH TERBUKTI BERFUNGSI
  useEffect(() => {
    if (!produkId) return;

    // Query sederhana tanpa 'orderBy' untuk menghindari masalah indeks
    const q = query(collection(db, 'ulasan'), where('produkId', '==', produkId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      
      // Mengurutkan data di sisi client setelah diambil
      list.sort((a, b) => b.tanggal.toMillis() - a.tanggal.toMillis());

      setUlasanList(list);
      setLoadingUlasan(false);
    }, (err) => {
        console.error("Gagal mengambil data ulasan:", err);
        setLoadingUlasan(false);
    });

    return () => unsubscribe();
  }, [produkId]);

  // ✅ MENGGUNAKAN LOGIKA PENGIRIMAN DATA ASLI ANDA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!komentar.trim() || !username.trim()) {
      setError('Nama dan Komentar tidak boleh kosong.');
      return;
    }
    if (rating === 0) {
      setError('Silakan berikan rating bintang.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'ulasan'), {
        produkId,
        username,
        komentar,
        rating,
        tanggal: Timestamp.now(),
      });
      setSuccess('Ulasan Anda berhasil dikirim!');
      // Reset form
      setUsername('');
      setKomentar('');
      setRating(5);
    } catch (error) {
      setError('Gagal mengirim ulasan. Silakan coba lagi.');
      console.error('Gagal kirim ulasan:', error);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      {/* ✅ UI FORM BARU YANG KEREN */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4">Tulis Ulasan Anda</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">Nama Anda</label>
            <input
              type="text"
              id="nama"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder=""
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <IconStar
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`h-7 w-7 cursor-pointer transition-colors ${
                    (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <label htmlFor="komentar" className="block text-sm font-medium text-gray-700 mb-1">Komentar</label>
          <textarea
            id="komentar"
            rows={3}
            value={komentar}
            onChange={(e) => setKomentar(e.target.value)}
            placeholder=""
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
          />
        </div>
        
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        {success && <p className="text-sm text-green-600 mt-2">{success}</p>}
        
        <button type="submit" disabled={isSubmitting} className="mt-4 inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300">
          {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
        </button>
      </form>

      {/* ✅ UI DAFTAR ULASAN YANG LEBIH BAIK */}
      <div className="mt-8 space-y-6">
        {loadingUlasan ? (
          <p className="text-sm text-gray-500">Memuat ulasan...</p>
        ) : ulasanList.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada ulasan untuk produk ini.</p>
        ) : (
          ulasanList.map((ulasan) => (
            <div key={ulasan.id} className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-800">{ulasan.username}</p>
                <div className="flex items-center">
                  {[...Array(Number(ulasan.rating) || 0)].map((_, i) => (
                    <IconStar key={`filled-${ulasan.id}-${i}`} className="h-4 w-4 text-yellow-400" />
                  ))}
                  {[...Array(5 - (Number(ulasan.rating) || 0))].map((_, i) => (
                    <IconStar key={`empty-${ulasan.id}-${i}`} className="h-4 w-4 text-gray-300" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {ulasan.tanggal?.toDate().toLocaleString('id-ID') || 'Baru saja'}
              </p>
              <p className="text-gray-700 text-sm mt-2">{ulasan.komentar}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
