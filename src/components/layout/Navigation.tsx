'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SourceOutlined from '@mui/icons-material/SourceOutlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import { cn } from '@/lib/utils';
import { FlyIcon } from '@/components/icons/FlyIcon';
import { useCanPrimaryHover } from '@/hooks/useCanPrimaryHover';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/case-studies', label: 'Projects' },
  { href: '/about', label: 'About Me' },
];

export function Navigation() {
  const pathname = usePathname();
  const canPrimaryHover = useCanPrimaryHover();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

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
  }, [pathname]);

  if (pathname.startsWith('/admin')) return null;

  const isLightPage = pathname === '/';

  /** Resting label and icon, per the design — the same on every page. */
  const restingColor = 'rgba(0, 0, 0, 0.35)';

  return (
    <nav
      className={cn(
        'fixed top-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
      )}
    >
      <div
        className="flex items-center rounded-full p-1"
        style={{
          background: isLightPage ? 'rgba(0, 0, 0, 0.10)' : 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex h-12 items-center gap-1 rounded-full px-4 sm:px-6',
                'whitespace-nowrap transition-colors duration-200',
                !isActive && canPrimaryHover && 'hover:bg-black/10'
              )}
              style={{
                // Left unset when resting so the hover class isn't outranked.
                ...(isActive ? { background: '#141510' } : null),
                color: isActive ? '#ffffff' : restingColor,
              }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                {item.label === 'Home' ? (
                  <FlyIcon active={isActive} width={22.68} height={21.06} />
                ) : item.label === 'Projects' ? (
                  <SourceOutlined sx={{ fontSize: 24, color: 'inherit' }} />
                ) : (
                  <BadgeOutlined sx={{ fontSize: 24, color: 'inherit' }} />
                )}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-sf-pro)',
                  fontSize: 17,
                  fontWeight: 600,
                  lineHeight: '22px',
                  letterSpacing: '-0.43px',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
