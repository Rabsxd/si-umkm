import './globals.css';
import Image from 'next/image';
import logoSrc from './logo.png';

export const metadata = {
  title: 'Si-UMKM',
  description: 'Platform UMKM',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <header className="bg-blue-600 shadow-md">
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}