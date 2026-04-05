import type { Metadata, Viewport } from 'next';
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

/** Default Safari / mobile browser UI tint; case-studies layout overrides to white. */
export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Bryce's Portfolio",
  description:
    'A product designer who loves turning ideas into reality. Chat with BAR 9000 to learn more about my work.',
  openGraph: {
    title: "Bryce's Portfolio",
    description: 'A product designer who loves turning ideas into reality.',
    type: 'website',
    siteName: "Bryce's Portfolio",
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bryce's Portfolio",
    description: 'A product designer who loves turning ideas into reality.',
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
