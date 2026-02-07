'use client';

interface SectionIndicatorProps {
  label: string;
}

export function SectionIndicator({ label }: SectionIndicatorProps) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-3 h-3 rounded-full bg-white" />
      <span className="text-sm text-white/50 uppercase tracking-[0.1em]">
        {label}
      </span>
    </div>
  );
}
