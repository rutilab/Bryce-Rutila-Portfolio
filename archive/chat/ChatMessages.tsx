'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import type { Message, CaseStudy } from '@/types';

interface ChatMessagesProps {
  messages: Message[];
  isTyping?: boolean;
  className?: string;
  onProjectClick?: (projectId: string) => void;
  projects?: CaseStudy[];
}

export function ChatMessages({
  messages,
  isTyping = false,
  className,
  onProjectClick,
  projects = [],
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or typing state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'flex flex-col gap-3 overflow-y-auto',
        className
      )}
    >
      {messages.map((message, index) => (
        <ChatMessage
          key={message.id}
          message={message}
          isLatest={index === messages.length - 1 && !isTyping}
          onProjectClick={onProjectClick}
          projects={projects}
        />
      ))}

      {isTyping && <TypingIndicator />}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
