'use client';

import { ReactNode } from 'react';

interface TwoColumnLayoutProps {
  left: ReactNode;
  right: ReactNode;
  gap?: string;
}

export function TwoColumnLayout({
  left,
  right,
  gap = '40px',
}: TwoColumnLayoutProps) {
  return (
    <div
      className="flex flex-col lg:flex-row"
      style={{ gap }}
    >
      <div className="flex-1">{left}</div>
      <div className="flex-1">{right}</div>
    </div>
  );
}
