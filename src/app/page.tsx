'use client';

import Link from "next/link";
import Image from 'next/image'; // Impor komponen Image dari Next.js
import logoSrc from './logo.png'; // Impor file logo Anda

// Komponen Ikon untuk bagian fitur (lebih baik diletakkan di file terpisah nantinya)
const IconUpload = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V8.25a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 8.25v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 17.25z" />
  </svg>
);

const IconStar = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const IconAcademic = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path d="M12 14l9-5-9-5-9 5 9 5z" />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v5.5a2.5 2.5 0 002.5 2.5h1.5a2.5 2.5 0 002.5-2.5V14m-9 5.5a2.5 2.5 0 002.5 2.5h1.5a2.5 2.5 0 002.5-2.5V14" />
  </svg>
);


export default function HomePage() {
  return (
    <main className="bg-white text-gray-800">
      {/* --- Navbar dengan Logo --- */}
      <header className="sticky top-0 z-50 bg-blue-600 shadow-md">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image 
                src={logoSrc} 
                alt="Logo SI UMKM" 
                width={40} 
                height={40}
                className="rounded-full"
            />
            <span className="text-xl font-bold text-white hidden sm:block">Si-UMKM</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm text-blue-100">
                Ingin bergabung bersama kami?
            </span>
            <Link 
              href="/login" 
              className="bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-gray-200 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* --- Hero Section dengan Logo --- */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white pt-20 pb-24 sm:pt-24 sm:pb-32">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-48 left-1/2 -ml-24 h-[50rem] w-[50rem] rounded-full blur-3xl bg-blue-200/20"></div>
        </div>
        <div className="container mx-auto px-6 text-center relative">
          
          {/* Logo Utama di Hero Section */}
          <div className="mb-8 drop-shadow-lg">
            <Image
                src={logoSrc}
                alt="Logo Utama SI UMKM"
                width={120}
                height={120}
                className="mx-auto cursor-pointer"
                priority // Prioritaskan pemuatan gambar ini
            />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            <span className="text-blue-600">Selamat Datang</span> di Si-UMKM
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
            Platform modern untuk membantu pelaku UMKM mendaftarkan produk,
            mendapatkan ulasan, dan mengakses program pelatihan dari pemerintah.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/lihat-produk" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-300">
              Lihat Produk
            </Link>
            <Link href="/pelatihan" className="inline-block bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-200 transform hover:-translate-y-1 transition-all duration-300">
              Program Pelatihan
            </Link>
          </div>
        </div>
      </section>

      {/* Fitur Utama */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Semua yang Anda Butuhkan di Satu Platform</h2>
                <p className="mt-4 text-lg text-gray-600">Dari promosi produk hingga peningkatan kapasitas usaha.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <IconUpload className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Publikasikan Produk</h3>
                <p className="text-gray-600">Daftarkan dan promosikan produk UMKM Anda dengan mudah untuk menjangkau lebih banyak pelanggan.</p>
              </div>
              {/* Card 2 */}
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <IconStar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Ulasan & Rating</h3>
                <p className="text-gray-600">Dapatkan masukan berharga dan bangun kepercayaan konsumen melalui sistem ulasan yang transparan.</p>
              </div>
              {/* Card 3 */}
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <IconAcademic className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Pelatihan UMKM</h3>
                <p className="text-gray-600">Akses program pembinaan dan pelatihan dari pemerintah untuk meningkatkan skill dan skala usaha Anda.</p>
              </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto text-center p-6 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Si-UMKM – Dinas Koperasi & UKM Kota. All Rights Reserved.
        </div>
      </footer>
    </main>
  );
}
