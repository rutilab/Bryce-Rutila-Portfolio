import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import '@/styles/case-study.css';
import { CaseStudyRouteChrome } from './CaseStudyRouteChrome';

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
  return <CaseStudyRouteChrome>{children}</CaseStudyRouteChrome>;
}
