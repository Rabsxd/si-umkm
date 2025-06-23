'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // Impor Link
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Interface untuk data Pelatihan
interface Pelatihan {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string; // Diasumsikan formatnya 'YYYY-MM-DD' atau yang bisa diparsing oleh new Date()
  link: string;
}

// Komponen Ikon
const IconArrowRight = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

const IconArrowLeft = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);


export default function PelatihanPage() {
  const [pelatihanList, setPelatihanList] = useState<Pelatihan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPelatihan = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'pelatihan'));
        const data = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        })) as Pelatihan[];
        // Mengurutkan pelatihan berdasarkan tanggal terbaru
        data.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
        setPelatihanList(data);
      } catch (error) {
        console.error('Gagal ambil data pelatihan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPelatihan();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('id-ID', { month: 'short' });
    return { day, month };
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ✅ REVISI: Header dibuat lebih tipis */}
      <div className="bg-blue-600 border-b border-blue-700">
        <div className="container mx-auto px-6 py-6"> {/* Padding vertikal dikurangi */}
            <div className="mb-3"> {/* Margin bottom dikurangi */}
                <Link href="/" className="inline-flex items-center gap-2 text-white-400 hover:text-white font-semibold transition-colors">
                    <IconArrowLeft className="h-5 w-5" />
                    Kembali ke Home
                </Link>
            </div>
            <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight text-white">Program Pelatihan & Pembinaan</h1> {/* Font sedikit dikecilkan */}
                <p className="mt-1 text-md text-blue-200">Tingkatkan kompetensi dan kembangkan usaha Anda melalui program pilihan.</p> {/* Font sedikit dikecilkan */}
            </div>
        </div>
      </div>

      {/* --- Konten Utama --- */}
      <div className="container mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Memuat data pelatihan...</p>
          </div>
        ) : pelatihanList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800">Belum Ada Program Tersedia</h3>
            <p className="text-gray-500 mt-2">Silakan cek kembali di lain waktu untuk informasi pelatihan terbaru.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {pelatihanList.map((item) => {
              const { day, month } = formatDate(item.tanggal);
              return (
                <div key={item.id} className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex items-start p-5 transform hover:-translate-y-1">
                  
                  <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-800 rounded-md p-3 w-20 text-center mr-5">
                    <span className="text-3xl font-bold">{day}</span>
                    <span className="text-sm font-semibold uppercase">{month}</span>
                  </div>

                  <div className="flex flex-col flex-grow h-full">
                    <h2 className="text-xl font-bold text-gray-900">{item.judul}</h2>
                    <p className="text-gray-600 mt-2 mb-4 flex-grow">{item.deskripsi}</p>
                    
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors self-start"
                    >
                      Lihat Detail / Daftar
                      <IconArrowRight className="w-4 h-4" />
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
