'use client';

import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
  showWrapper?: boolean; // Whether to show the outer flex wrapper
}

export function TypingIndicator({ className, showWrapper = true }: TypingIndicatorProps) {
  const bubble = (
    <div className={cn('bg-[#262629] rounded-3xl rounded-bl-none px-4 py-3 w-fit', !showWrapper && className)}>
      <div className="flex items-center gap-1.5 h-[25px]">
        <span className="typing-dot w-2 h-2 bg-white/60 rounded-full" />
        <span className="typing-dot w-2 h-2 bg-white/60 rounded-full" />
        <span className="typing-dot w-2 h-2 bg-white/60 rounded-full" />
      </div>
    </div>
  );

  if (!showWrapper) {
    return bubble;
  }

  return (
    <div className={cn('flex w-full justify-start', className)}>
      {bubble}
    </div>
  );
}
