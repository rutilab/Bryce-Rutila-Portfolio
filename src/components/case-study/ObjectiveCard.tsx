'use client';

import { Sparkles, Target, Smile } from 'lucide-react';

interface ObjectiveCardProps {
  icon: 'sparkles' | 'target' | 'smile';
  title: string;
  description: string;
}

const iconMap = {
  sparkles: Sparkles,
  target: Target,
  smile: Smile,
};

export function ObjectiveCard({ icon, title, description }: ObjectiveCardProps) {
  const IconComponent = iconMap[icon];

  return (
    <div className="flex gap-4 p-6 rounded-2xl bg-[#303030]">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#27b4ff]/20 flex items-center justify-center">
        <IconComponent className="w-5 h-5 text-[#27b4ff]" />
      </div>
      <div>
        <h4 className="text-lg font-semibold text-white mb-1">{title}</h4>
        <p className="text-base text-white/80">{description}</p>
      </div>
    </div>
  );
}
