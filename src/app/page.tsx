'use client';

import { useEffect } from 'react';
import HalftoneCanvas from '@/components/HalftoneCanvas';

export default function Home() {
  useEffect(() => {
    document.body.style.background = '#ffffff';
    document.body.style.cursor     = 'none';
    return () => {
      document.body.style.background = '';
      document.body.style.cursor     = '';
    };
  }, []);

  return <HalftoneCanvas />;
}
