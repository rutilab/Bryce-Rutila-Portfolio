import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import '@/styles/case-study.css';
import { CaseStudyRouteChrome } from './CaseStudyRouteChrome';
import CaterpillarFooter from '@/components/CaterpillarFooter';
import { BackToTopButton, ScrollCue, CaseStudyNav } from '@/components/case-study';

/** Light browser chrome + edge-to-edge on notched phones; pairs with CaseStudyRouteChrome. */
export const viewport: Viewport = {
  themeColor: '#fcfcfc',
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
      <CaseStudyNav />
      {children}
      <CaterpillarFooter />
      {/* Both show themselves only where there's a hero — see the components */}
      <ScrollCue />
      <BackToTopButton />
    </CaseStudyRouteChrome>
  );
}
