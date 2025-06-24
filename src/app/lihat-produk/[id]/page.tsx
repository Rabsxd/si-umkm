import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ClientUlasanWrapper from './client-ulasan-wrapper';

type ProdukDetail = {
  id: string;
  nama: string;
  deskripsi: string;
  harga: number;
  kategori: string;
  gambarUrl: string;
  ownerId: string;
  tanggal: any;
  namaPenjual?: string;
};

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// --- Komponen Ikon ---
const IconArrowLeft = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);
// ✅ Ikon baru untuk WhatsApp
const IconWhatsApp = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" {...props}>
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.5-97.8-27.2l-6.9-4.1-72.7 19.1L48 352.3l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
    </svg>
);

export async function generateStaticParams() {
  const snapshot = await getDocs(collection(db, 'produk'));
  return snapshot.docs.map(doc => ({ id: doc.id }));
}

export async function generateMetadata({ params }: Props) {
  const docRef = doc(db, 'produk', params.id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return {};
  const data = docSnap.data() as ProdukDetail;
  return {
    title: data.nama + ' - Produk UMKM',
    description: data.deskripsi,
  };
}

export default async function DetailProdukPage({ params, searchParams }: Props) {
  const { id } = params;
  const docRef = doc(db, 'produk', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return notFound();
  }

  const produk = { id, ...docSnap.data() } as ProdukDetail;

  let namaPenjual = 'Tidak diketahui';
  let nomorHpPenjual = null; // ✅ Variabel baru untuk nomor HP

  try {
    const userSnap = await getDoc(doc(db, 'users', produk.ownerId));
    if (userSnap.exists()) {
      const userData = userSnap.data();
      namaPenjual = userData.username || 'Tidak diketahui';
      nomorHpPenjual = userData.nomorHp || null; // ✅ Ambil nomor HP
    }
  } catch (e) {
    namaPenjual = 'Gagal memuat';
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const from = searchParams?.from;
  const backUrl = from === 'produk' ? '/dashboard' : '/lihat-produk';
  const backText = from === 'produk' ? 'Kembali ke Dashboard' : 'Kembali ke Semua Produk';

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6">
            <Link href={backUrl} className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors">
                <IconArrowLeft className="h-5 w-5" />
                {backText}
            </Link>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="w-full">
              <div className="aspect-square relative rounded-lg overflow-hidden shadow-inner bg-gray-100">
                <Image
                  src={produk.gambarUrl || 'https://via.placeholder.com/800'}
                  alt={produk.nama}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full self-start">
                {produk.kategori}
              </span>

              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 mt-3">
                {produk.nama}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Dijual oleh: <span className="font-semibold text-gray-700">{namaPenjual}</span>
              </p>

              <p className="text-4xl font-bold text-blue-600 my-4">
                {formatRupiah(produk.harga)}
              </p>
              
              {/* ✅ Tombol Hubungi Penjual (hanya muncul jika ada nomor HP) */}
              {nomorHpPenjual && (
                <a 
                    href={`https://wa.me/${nomorHpPenjual}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 mb-4 inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-500 hover:bg-green-600"
                >
                    <IconWhatsApp className="h-6 w-6" />
                    Hubungi Penjual via WhatsApp
                </a>
              )}
              
              <div className="prose prose-sm text-gray-600 max-w-none mt-2">
                <h3 className="font-semibold text-gray-800">Deskripsi Produk</h3>
                <p className="whitespace-pre-wrap">{produk.deskripsi}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-gray-200">
             <ClientUlasanWrapper produkId={id} />
          </div>
        </div>
      </div>
    </main>
  );
}
