'use client';

import dynamic from 'next/dynamic';

const UlasanProdukClient = dynamic(() => import('@/components/UlasanProdukClient'), {
  ssr: false,
});

export default function ClientUlasanWrapper({ produkId }: { produkId: string }) {
  return <UlasanProdukClient produkId={produkId} />;
}
