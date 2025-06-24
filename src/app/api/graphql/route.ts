// Lokasi file: app/api/graphql/route.ts (atau lokasi file API Anda)

import { NextResponse } from 'next/server';
// ✅ BARU: Tambahkan 'doc' dan 'getDoc' untuk mengambil satu dokumen
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const { search = '', kategori = 'Semua' } = await request.json();
    const produkCollection = collection(db, 'produk');
    let produkQuery: any = produkCollection;

    if (kategori && kategori !== 'Semua') {
      produkQuery = query(produkCollection, where('kategori', '==', kategori));
    }

    const snapshot = await getDocs(produkQuery);
    let produkList = snapshot.docs.map(doc => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        ...data,
        ownerId: data.ownerId, // Pastikan ownerId ada di objek
      };
    });

    if (search) {
      produkList = produkList.filter((item: any) =>
        item.nama?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // ✅ MODIFIKASI: Kita akan ambil rating DAN data penjual secara bersamaan
    const produkWithDetails = await Promise.all(
      produkList.map(async (produk) => {
        // --- Siapkan semua query yang dibutuhkan ---
        const ulasanQuery = getDocs(query(collection(db, 'ulasan'), where('produkId', '==', produk.id)));
        
        // Siapkan pengambilan data user HANYA JIKA ada ownerId
        const userQuery = produk.ownerId 
          ? getDoc(doc(db, 'users', produk.ownerId)) 
          : Promise.resolve(null); // Jika tidak ada ownerId, langsung selesaikan

        // --- Jalankan semua query secara paralel untuk efisiensi maksimal ---
        const [ulasanSnapshot, userDoc] = await Promise.all([ulasanQuery, userQuery]);

        // --- Proses hasil query rating ---
        const jumlahUlasan = ulasanSnapshot.size;
        let totalRating = 0;
        ulasanSnapshot.forEach(doc => {
          totalRating += doc.data().rating;
        });
        const rataRataRating = jumlahUlasan > 0 ? totalRating / jumlahUlasan : 0;
        
        // --- Proses hasil query user (penjual) ---
        let namaPenjual = 'Tidak diketahui';
        let nomorHpPenjual = null;
        if (userDoc && userDoc.exists()) {
          const userData = userDoc.data();
          namaPenjual = userData.username || 'Tidak diketahui'; // Asumsi nama ada di field 'username'
          nomorHpPenjual = userData.nomorHp || null;
        }

        // --- Gabungkan semua data menjadi satu objek ---
        return {
          ...produk,
          rataRataRating,
          jumlahUlasan,
          namaPenjual,     // <-- data baru
          nomorHpPenjual,   // <-- data baru untuk tombol WA
        };
      })
    );

    return NextResponse.json({ data: { produk: produkWithDetails } });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Gagal mengambil data produk' }, { status: 500 });
  }
}