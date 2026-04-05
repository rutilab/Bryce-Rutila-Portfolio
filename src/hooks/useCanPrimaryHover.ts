'use client';

import { useState, useEffect } from 'react';

/**
 * True when the device’s primary input can hover (e.g. desktop mouse).
 * Touch-first devices report false, which avoids synthetic mouseenter/hover
 * sticking after taps (e.g. same screen coords as a previous link).
 */
export function useCanPrimaryHover() {
  const [can, setCan] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover)');
    const sync = () => setCan(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return can;
}
