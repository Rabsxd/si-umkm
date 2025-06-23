import { NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const { search = '', kategori = 'Semua' } = await request.json();

    const q = collection(db, 'produk');
    let produkQuery: any = q;

    // Filter kategori jika bukan "Semua"
    if (kategori && kategori !== 'Semua') {
      produkQuery = query(q, where('kategori', '==', kategori));
    }

    const snapshot = await getDocs(produkQuery);
    let produk = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Record<string, any>),
    }));

    // Filter search di sisi server
    if (search) {
      produk = produk.filter((item: any) =>
        item.nama?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ data: { produk } });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data produk' }, { status: 500 });
  }
}