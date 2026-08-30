'use client';

import { cn } from '@/lib/utils';
import type { UserType } from '@/types';

interface UserTypeSelectorProps {
  onSelect: (userType: UserType) => void;
  disabled?: boolean;
  className?: string;
}

const userTypes: { type: UserType; label: string }[] = [
  { type: 'recruiter', label: 'Recruiter/Hiring Manager' },
  { type: 'designer', label: 'Fellow Designer' },
  { type: 'friend', label: 'Friend/Family' },
  { type: 'lurker', label: 'Lurker' },
];

export function UserTypeSelector({ onSelect, disabled = false, className }: UserTypeSelectorProps) {
  return (
    <div className={cn('', className, disabled && 'pointer-events-none')}>
      {/* User type buttons */}
      <div className="flex flex-wrap gap-2 sm:gap-4">
        {userTypes.map(({ type, label }, index) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            disabled={disabled}
            style={{
              animationDelay: `${index * 120}ms`,
              fontFamily: 'var(--font-sf-pro)',
            }}
            className={cn(
              'backdrop-blur-[50px] bg-black/5 border border-white/50 rounded-[12px]',
              'px-2.5 py-2 sm:px-3 sm:py-3',
              'shadow-[0px_4px_12px_0px_rgba(0,0,0,0.3)]',
              'text-[#e7e7e7] text-[17px] max-[440px]:text-sm leading-[22px] max-[440px]:leading-[20px] tracking-[-0.43px] max-[440px]:tracking-[-0.3px]',
              'transition-all hover:bg-black hover:text-white cursor-pointer',
              'animate-spring-in',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
