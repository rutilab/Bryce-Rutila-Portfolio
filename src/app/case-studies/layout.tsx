import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import '@/styles/case-study.css';
import { CaseStudyRouteChrome } from './CaseStudyRouteChrome';
import ChipFooter from '@/components/ChipFooter';
import { BackToTopButton, ScrollCue } from '@/components/case-study';

/**
 * Phone status bar tint + edge-to-edge on notched phones; pairs with CaseStudyRouteChrome.
 * #f1f5fb is the top bar's frosted white over the hero's blue gradient, so the two read as one.
 */
export const viewport: Viewport = {
  themeColor: '#f1f5fb',
  viewportFit: 'cover',
};

export default function CaseStudiesLayout({
  children,
}: {
  children: ReactNode;
}) {
  // One mount here closes every case-study route — the index and each study —
  // rather than repeating the footer in seven page files.
  return (
    <CaseStudyRouteChrome>
      {children}
      <ChipFooter />
      {/* Both show themselves only where there's a hero — see the components */}
      <ScrollCue />
      <BackToTopButton />
    </CaseStudyRouteChrome>
  );
}
