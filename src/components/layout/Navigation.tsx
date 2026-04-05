'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCanPrimaryHover } from '@/hooks/useCanPrimaryHover';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/about', label: 'About Me' },
];

/** Matches home hero (`page.tsx`); 32×32 asset at `public/cursors/butterfly-cursor.png`. */
const BUTTERFLY_CURSOR = `url('/cursors/butterfly-cursor.png') 0 0, auto`;

export function Navigation() {
  const pathname = usePathname();
  const canPrimaryHover = useCanPrimaryHover();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // White-background pages use a lighter nav; dark-background pages use the dark glass style
  const isLightPage = pathname === '/';

  const navStyle = {
    background: isLightPage ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '9999px',
    padding: '0.25rem',
  };

  return (
    <nav
      className={cn(
        'fixed top-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
      )}
      style={pathname === '/' ? { cursor: BUTTERFLY_CURSOR } : undefined}
    >
      <div className="flex items-center gap-1" style={navStyle}>
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'bg-black text-white'
                  : isLightPage
                    ? canPrimaryHover
                      ? 'text-black/60 hover:text-black hover:bg-black/10'
                      : 'text-black/60'
                    : canPrimaryHover
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-white/80'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
