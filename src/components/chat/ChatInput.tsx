'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface QuickQuestion {
  id: string;
  text: string;
}

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  quickQuestions?: QuickQuestion[];
  onQuickQuestionSelect?: (question: QuickQuestion) => void;
  showQuickQuestions?: boolean;
  autoFocus?: boolean;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Or ask me anything...',
  className,
  quickQuestions = [],
  onQuickQuestionSelect,
  showQuickQuestions = true,
  autoFocus = false,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus when enabled
  useEffect(() => {
    if (autoFocus && textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [autoFocus, disabled]);

  // Auto-resize textarea as content grows (upward)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (question: QuickQuestion) => {
    if (onQuickQuestionSelect) {
      onQuickQuestionSelect(question);
    } else {
      onSend(question.text);
    }
  };

  const containerStyle = {
    background: 'rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: '1.5rem',
    overflow: 'hidden', // clip scrollbar within rounded corners
    // Fixed max-width centered with auto margins.
    // 100% = full glass card width (wrapper has negative margins canceling GlassCard padding).
    // Margins absorb shrinkage from ~80px down to 24px, then input shrinks.
    width: 'min(calc(100% - 48px), 740px)',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  return (
    <div
      className={cn(
        'relative',
        className,
        disabled && 'opacity-50'
      )}
      style={containerStyle}
    >
      {/* Text input area with send button */}
      <div className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-[64px] sm:pb-[76px]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className={cn(
            'w-full bg-transparent resize-none outline-none',
            'text-[#e5e5e5] text-xl max-[440px]:text-base leading-[25px] max-[440px]:leading-[22px] tracking-[-0.45px]',
            'placeholder:text-white/40',
            'pr-12',
            disabled && 'cursor-not-allowed'
          )}
          style={{ fontFamily: 'var(--font-sf-pro)' }}
        />

        {/* Send button - positioned 12px above the dividing line */}
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className={cn(
            'absolute right-6 bottom-[12px]',
            'rounded-[12px] p-2',
            'border border-white/50',
            'shadow-[0px_4px_12px_0px_rgba(0,0,0,0.3)]',
            'transition-all',
            value.trim()
              ? 'bg-black cursor-pointer hover:bg-black/80'
              : 'backdrop-blur-[50px] bg-black/5',
            'disabled:opacity-30 disabled:cursor-not-allowed'
          )}
          aria-label="Send message"
        >
          {/* lucide/send-horizontal icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className={value.trim() ? 'text-white' : 'text-white/60'}
          >
            <path
              d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904l-18-8.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 12h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Separator line + quick questions — hidden on short viewports (<650px height) */}
      {showQuickQuestions && quickQuestions.length > 0 && (
        <div className="[@media(max-height:650px)]:hidden">
          <div className="mx-6 h-px bg-white/15" />

          {/* Quick questions */}
          <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-2 flex overflow-x-auto gap-2 sm:gap-3">
            {quickQuestions.map((question) => (
              <button
                key={question.id}
                onClick={() => handleQuickQuestion(question)}
                disabled={disabled}
                className={cn(
                  'backdrop-blur-[50px] bg-black/5 border border-white/50 rounded-[12px]',
                  'px-2.5 py-2 sm:px-3 sm:py-3 shrink-0',
                  'shadow-[0px_4px_12px_0px_rgba(0,0,0,0.3)]',
                  'text-[#e7e7e7] text-[17px] max-[440px]:text-sm leading-[22px] max-[440px]:leading-[20px] tracking-[-0.43px] max-[440px]:tracking-[-0.3px]',
                  'transition-all hover:bg-black hover:text-white cursor-pointer',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                style={{ fontFamily: 'var(--font-sf-pro)' }}
              >
                {question.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
