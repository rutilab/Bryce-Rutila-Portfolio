import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Geist, Geist_Mono, Inter, Battambang, IBM_Plex_Mono, Chakra_Petch } from 'next/font/google';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { SiteHeader } from '@/components/layout';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Loaded via next/font to avoid FOUT — CSS @import loads fonts too late
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'block',
});

const battambang = Battambang({
  variable: '--font-battambang',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'block',
});

/** Headings: the hero, page titles, BRYCE on the footer chip. Cut corners to match the board's 45° bends. */
const chakraPetch = Chakra_Petch({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400'],
  display: 'block',
});

/** Default Safari / mobile browser UI tint; case-studies layout overrides to white. */
export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

/** Empty string is a common .env mistake and breaks `new URL('')` → 500 on every route. */
function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    try {
      new URL(fromEnv);
      return fromEnv.replace(/\/$/, '');
    } catch {
      /* fall through */
    }
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`.replace(/\/$/, '');
  return 'http://localhost:3000';
}

const siteUrl = resolveSiteUrl();

// The preview image is app/opengraph-image.tsx (BRYCE on BR1); Next adds its
// og:image and twitter:image tags. The tab icon is app/icon.svg (the blue BR fly).
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
    <html
      lang="en"
      // Inline overflow-x: clip so sticky can't be broken by a stale CSS bundle that still
      // emits overflow-x: hidden (see globals.css). clip + visible-y keeps body from becoming
      // a scroll container; sticky pins to the viewport again.
      style={{ overflowX: 'clip' }}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${battambang.variable} ${ibmPlexMono.variable} ${chakraPetch.variable} antialiased`}
        style={{ background: '#faf7f2', color: '#141510', overflowX: 'clip' }}
      >
        <SiteHeader />
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
