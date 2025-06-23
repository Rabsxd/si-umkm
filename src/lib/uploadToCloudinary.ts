// export async function uploadToCloudinary(file: File): Promise<string | null> {
//   const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
//   const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

//   const formData = new FormData();
//   formData.append('file', file);
//   formData.append('upload_preset', uploadPreset);

//   try {
//     const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
//       method: 'POST',
//       body: formData,
//     });

//     const data = await res.json();
//     return data.secure_url;
//   } catch (error) {
//     console.error('Upload ke Cloudinary gagal:', error);
//     return null;
//   }
// }




// BUAT LOCAL
// lib/uploadToCloudinary.ts


export async function uploadToCloudinary(file: File): Promise<string | null> {
  const cloudName = 'dqxub9upe'; // Ganti
  const uploadPreset = 'si-umkm-upload'; // Ganti sesuai preset yang kamu buat

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  } catch (error) {
    console.error('Upload ke Cloudinary gagal:', error);
    return null;
  }
}
