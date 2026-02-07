import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Navigation, BackgroundImage } from '@/components/layout';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BAR 9000 | Bryce\'s Portfolio',
  description: 'A product designer who loves turning ideas into reality. Chat with BAR 9000 to learn more about my work.',
  openGraph: {
    title: 'BAR 9000 | Bryce\'s Portfolio',
    description: 'A product designer who loves turning ideas into reality.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BackgroundImage />
        <Navigation />
        {children}
      </body>
    </html>
  );
}
