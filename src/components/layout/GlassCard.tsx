import { cn } from '@/lib/utils';
import type { ReactNode, CSSProperties } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  blur?: number;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-10', // 40px padding
};

export function GlassCard({
  children,
  className,
  padding = 'md',
  blur = 20,
}: GlassCardProps) {
  const style: CSSProperties = {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    borderRadius: '1.5rem',
  };

  return (
    <div
      className={cn(paddingClasses[padding], className)}
      style={style}
    >
      {children}
    </div>
  );
}
