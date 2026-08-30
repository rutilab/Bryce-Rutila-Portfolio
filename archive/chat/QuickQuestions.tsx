'use client';

import { cn } from '@/lib/utils';

interface QuickQuestion {
  id: string;
  text: string;
}

interface QuickQuestionsProps {
  questions: QuickQuestion[];
  onSelect: (question: QuickQuestion) => void;
  disabled?: boolean;
  className?: string;
}

export function QuickQuestions({
  questions,
  onSelect,
  disabled = false,
  className,
}: QuickQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-3', className, disabled && 'pointer-events-none')}>
      {questions.map((question) => (
        <button
          key={question.id}
          onClick={() => onSelect(question)}
          disabled={disabled}
          className={cn(
            'chip font-medium',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {question.text}
        </button>
      ))}
    </div>
  );
}
