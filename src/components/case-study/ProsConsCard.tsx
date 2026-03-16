'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface ProsConsCardProps {
  type: 'pros' | 'cons';
  items: string[];
  summary?: string;
}

export function ProsConsCard({ type, items, summary }: ProsConsCardProps) {
  const isPros = type === 'pros';

  return (
    <div className={isPros ? 'cs-pros-card' : 'cs-cons-card'}>
      <div className="flex items-center gap-3 mb-4">
        {isPros ? (
          <ThumbsUp className="w-6 h-6 text-[#0dba4f]" />
        ) : (
          <ThumbsDown className="w-6 h-6 text-[#ff3d3d]" />
        )}
        <h3 className="cs-card-title">
          {isPros ? 'Pros' : 'Cons'}
        </h3>
      </div>
      <ul className="space-y-2 mb-4">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span
              className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                isPros ? 'bg-[#0dba4f]' : 'bg-[#ff3d3d]'
              }`}
            />
            <span className="cs-body">{item}</span>
          </li>
        ))}
      </ul>
      {summary && <p className="cs-caption">{summary}</p>}
    </div>
  );
}
