'use client';

import { useTimeOfDay, DEFAULT_TIME_STATE } from '@/hooks/useTimeOfDay';
import { cn } from '@/lib/utils';

interface BackgroundImageProps {
  className?: string;
}

export function BackgroundImage({ className }: BackgroundImageProps) {
  const { backgroundImage, period } = useTimeOfDay();

  return (
    <div className={cn('background-container', className)}>
      {/* Fallback gradient background in case images aren't loaded */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-1000',
          period === 'dawn' && 'bg-gradient-to-b from-orange-300 via-pink-300 to-blue-400',
          period === 'day' && 'bg-gradient-to-b from-blue-400 via-blue-300 to-blue-200',
          period === 'dusk' && 'bg-gradient-to-b from-orange-500 via-pink-500 to-purple-600',
          period === 'night' && 'bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900'
        )}
      />

      {/* Actual background image */}
      <img
        src={backgroundImage}
        alt=""
        className="background-image absolute inset-0"
        onError={(e) => {
          // Hide image if it fails to load, showing gradient fallback
          (e.target as HTMLImageElement).style.opacity = '0';
        }}
      />

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
}
