'use client';

import { cn } from '@/lib/utils';
import type { Message, CaseStudy } from '@/types';

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
  onProjectClick?: (projectId: string) => void;
  projects?: CaseStudy[]; // For rendering project cards
}

export function ChatMessage({
  message,
  isLatest = false,
  onProjectClick,
  projects = [],
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const contentType = message.contentType || 'text';

  // Render project cards
  if (contentType === 'project-cards' && message.metadata?.projectIds) {
    const projectsToShow = projects.filter((p) =>
      message.metadata?.projectIds?.includes(p.id)
    );

    return (
      <div
        className={cn(
          'flex w-full justify-start',
          isLatest && 'animate-slide-up'
        )}
      >
        <div className="flex gap-3 overflow-x-auto max-w-full pb-2">
          {projectsToShow.map((project) => (
            <button
              key={project.id}
              onClick={() => onProjectClick?.(project.id)}
              className="flex-shrink-0 w-48 h-32 bg-black/40 backdrop-blur-sm rounded-xl
                         hover:bg-black/50 transition-colors cursor-pointer
                         flex items-end p-3"
            >
              <span className="text-white/80 text-sm font-medium text-left">
                {project.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Render single project card
  if (contentType === 'project-card' && message.metadata?.projectId) {
    const project = projects.find((p) => p.id === message.metadata?.projectId);
    if (project) {
      return (
        <div
          className={cn(
            'flex w-full justify-start',
            isLatest && 'animate-slide-up'
          )}
        >
          <button
            onClick={() => onProjectClick?.(project.id)}
            className="w-48 h-32 bg-black/40 backdrop-blur-sm rounded-xl
                       hover:bg-black/50 transition-colors cursor-pointer
                       flex items-end p-3"
          >
            <span className="text-white/80 text-sm font-medium text-left">
              {project.title}
            </span>
          </button>
        </div>
      );
    }
  }

  // Render image message
  if (contentType === 'image' && message.metadata?.imageUrl) {
    return (
      <div
        className={cn(
          'flex w-full',
          isUser ? 'justify-end' : 'justify-start',
          isLatest && 'animate-slide-up'
        )}
      >
        <div className="max-w-[70%] rounded-2xl overflow-hidden">
          <img
            src={message.metadata.imageUrl}
            alt={message.content || 'Chat image'}
            className="w-full h-auto"
          />
        </div>
      </div>
    );
  }

  // Render text message (default)
  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start',
        isLatest && 'animate-slide-up'
      )}
    >
      <div
        className={cn(
          'px-4 py-3 rounded-3xl',
          isUser
            ? 'bg-cyan-500 text-white rounded-br-none'
            : 'bg-[#262629] text-white rounded-bl-none'
        )}
      >
        <p
          className="text-base sm:text-xl leading-[22px] sm:leading-[25px] tracking-[-0.45px] whitespace-pre-wrap"
          style={{ fontFamily: 'var(--font-sf-pro)' }}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
}
