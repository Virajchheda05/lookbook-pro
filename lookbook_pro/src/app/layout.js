// src/app/layout.js
// Root layout for Next.js

import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Lookbook Pro - AI Virtual Try-On',
  description: 'Revolutionary AI-powered virtual try-on platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}