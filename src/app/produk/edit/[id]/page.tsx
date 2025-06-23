'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';
import Image from 'next/image';

const kategoriList = ['Makanan', 'Minuman', 'Kerajinan', 'Pakaian', 'Elektronik', 'Mainan', 'Lainnya'];

// --- Komponen Ikon ---
const IconArrowLeft = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
);
const IconUpload = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
);

export default function EditProdukPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gambarLama, setGambarLama] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    harga: '',
    kategori: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProduk = async (uid: string, produkId: string) => {
        try {
            const docRef = doc(db, 'produk', produkId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.ownerId !== uid) {
                    setError('Anda tidak punya akses untuk mengedit produk ini.');
                    setTimeout(() => router.push('/produk'), 2000);
                    return;
                }

                setFormData({
                    nama: data.nama || '',
                    deskripsi: data.deskripsi || '',
                    harga: data.harga?.toString() || '',
                    kategori: data.kategori || '',
                });
                setGambarLama(data.gambarUrl || null);
                setImagePreview(data.gambarUrl || null);
            } else {
                setError('Produk tidak ditemukan.');
                 setTimeout(() => router.push('/produk'), 2000);
            }
        } catch (err) {
            console.error(err);
            setError('Gagal memuat data produk.');
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (typeof id === 'string') {
          fetchProduk(currentUser.uid, id);
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  const handleImageFile = useCallback((file: File | null) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('File yang coba Anda tempel/unggah bukan gambar.');
        return;
      }
      setError('');
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            handleImageFile(file);
            event.preventDefault();
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handleImageFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ✅ FIX: Mengubah `undefined` menjadi `null` untuk menghindari error tipe
    const file = e.target.files?.[0] || null;
    handleImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      let imageUrl = gambarLama;

      if (imageFile) {
        const uploadedUrl = await uploadToCloudinary(imageFile);
        if (!uploadedUrl) throw new Error('Gagal mengunggah gambar baru.');
        imageUrl = uploadedUrl;
      }

      await updateDoc(doc(db, 'produk', id as string), {
        ...formData,
        harga: parseInt(formData.harga),
        gambarUrl: imageUrl,
      });

      setSuccess('Produk berhasil diperbarui! Anda akan diarahkan...');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      console.error('Gagal update produk:', err);
      setError('Terjadi kesalahan saat memperbarui produk.');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-20">Memuat data produk...</div>
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 border-b border-blue-700">
        <div className="container mx-auto px-6 py-4">
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-white hover:text-white font-semibold transition-colors cursor-pointer">
                <IconArrowLeft className="h-5 w-5" />
                Kembali
            </button>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl py-10 px-6">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Produk</h1>
            <p className="mt-1 text-gray-600">Perbarui detail produk Anda di bawah ini.</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700">Nama Produk</label>
              <input id="nama" name="nama" type="text" value={formData.nama} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"/>
            </div>
            
            <div>
              <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea id="deskripsi" name="deskripsi" value={formData.deskripsi} onChange={handleChange} required rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="harga" className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
                  <input id="harga" name="harga" type="number" value={formData.harga} onChange={handleChange} required placeholder="Contoh: 50000" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"/>
                </div>
                <div>
                    <label htmlFor="kategori" className="block text-sm font-medium text-gray-700">Kategori</label>
                     <select id="kategori" name="kategori" value={formData.kategori} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900">
                      <option value="" disabled>Pilih Kategori</option>
                      {kategoriList.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Gambar Produk (Ganti jika perlu)</label>
              <label htmlFor="file-upload" className="mt-1 flex justify-center items-center w-full h-full px-6 py-10 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors">
                  <div className="space-y-1 text-center">
                      {imagePreview ? (
                          <Image src={imagePreview} alt="Preview Produk" width={200} height={200} className="mx-auto h-40 w-40 object-cover rounded-md"/>
                      ) : (
                          <IconUpload className="mx-auto h-12 w-12 text-gray-400" />
                      )}
                      <div className="flex text-sm text-gray-600 justify-center">
                          <span className="font-medium text-blue-600">Ganti gambar</span>
                          <p className="pl-1">atau seret dan lepas</p>
                      </div>
                      <p className="text-xs text-gray-500">Bisa juga tekan <strong>Ctrl + V</strong> untuk paste gambar</p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF Hingga 10MB</p>
                  </div>
              </label>
              <input id="file-upload" name="file-upload" type="file" accept="image/*" onChange={handleImageChange} className="sr-only"/>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
          {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</p>}

          <div className="pt-5 border-t border-gray-200">
            <div className="flex justify-end">
              <button type="button" onClick={() => router.back()} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer">
                Batal
              </button>
              <button type="submit" disabled={isSubmitting} className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer">
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
