import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const IconUsers = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} /* ...icon code... */ />;
const IconBox = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} /* ...icon code... */ />;
const IconBookOpen = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} /* ...icon code... */ />;

export default async function DashboardHomeView() {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const produkSnapshot = await getDocs(collection(db, 'produk'));
  const pelatihanSnapshot = await getDocs(collection(db, 'pelatihan'));

  const stats = {
    userCount: usersSnapshot.size,
    produkCount: produkSnapshot.size,
    pelatihanCount: pelatihanSnapshot.size,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
      <p className="text-gray-600 mt-1">panel admin Si-UMKM.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg"><IconUsers className="h-8 w-8" /></div>
          <div>
            <p className="text-sm text-gray-500">Total Pengguna</p>
            <p className="text-3xl font-bold text-gray-900">{stats.userCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-green-100 text-green-600 p-3 rounded-lg"><IconBox className="h-8 w-8" /></div>
          <div>
            <p className="text-sm text-gray-500">Total Produk</p>
            <p className="text-3xl font-bold text-gray-900">{stats.produkCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4">
          <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg"><IconBookOpen className="h-8 w-8" /></div>
          <div>
            <p className="text-sm text-gray-500">Total Pelatihan</p>
            <p className="text-3xl font-bold text-gray-900">{stats.pelatihanCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}