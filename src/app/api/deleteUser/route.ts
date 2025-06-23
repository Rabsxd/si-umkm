import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

// Inisialisasi Firebase Admin SDK (hanya sekali)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const db = getFirestore();

    // 1. Hapus semua produk milik user
    const produkSnapshot = await db.collection('produk').where('ownerId', '==', userId).get();
    const batch = db.batch();
    produkSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // 2. Hapus user dari Authentication
    await getAuth().deleteUser(userId);

    // 3. Hapus user dari Firestore
    await db.collection('users').doc(userId).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}