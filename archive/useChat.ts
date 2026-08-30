'use client';

import { useState, useCallback } from 'react';
import type { Message, UserType } from '@/types';

interface ChatResponse {
  messages: string[];
  success?: boolean;
  error?: string;
  fallback?: boolean;
}

interface UseChatReturn {
  sendMessage: (
    content: string,
    userType: UserType | null,
    conversationHistory: Message[],
    context?: 'user_type_selection' | 'project_click'
  ) => Promise<string[]>;
  isLoading: boolean;
  error: string | null;
}

// Fallback responses when API is unavailable
const FALLBACK_RESPONSES = {
  default: [
    "That's a great question!",
    "I'd love to tell you more about that. Feel free to explore my case studies for detailed examples.",
  ],
  user_type_selection: {
    recruiter: [
      "I was hoping you'd say that haha",
      "Okay, putting on my professional voice now — here's what I've been working on...",
    ],
    designer: [
      "Hey, always great to connect with fellow designers!",
      "I'd love to chat about process, tools, or just nerd out about design.",
      "What's on your mind?",
    ],
    friend: [
      "Oh hey! Thanks for checking this out!",
      "This is my portfolio site — feel free to poke around!",
    ],
    lurker: [
      "A lurker, huh? I respect that.",
      "Feel free to explore at your own pace. I'm here if you have questions!",
    ],
  },
  project_click: [
    "That was a really fun project to work on!",
    "Want me to tell you more, or would you prefer to check out the full case study?",
  ],
};

export function useChat(): UseChatReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (
      content: string,
      userType: UserType | null,
      conversationHistory: Message[],
      context?: 'user_type_selection' | 'project_click'
    ): Promise<string[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            userType,
            conversationHistory: conversationHistory.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            context,
          }),
        });

        const data: ChatResponse = await response.json();

        // If API returns fallback flag, use fallback responses
        if (data.fallback) {
          console.warn('Using fallback responses:', data.error);
          return getFallbackResponse(context, userType);
        }

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get response');
        }

        return data.messages || getFallbackResponse(context, userType);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Chat error:', errorMessage);
        setError(errorMessage);

        // Return fallback responses on error
        return getFallbackResponse(context, userType);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { sendMessage, isLoading, error };
}

// Helper to get fallback responses
function getFallbackResponse(
  context?: 'user_type_selection' | 'project_click',
  userType?: UserType | null
): string[] {
  if (context === 'user_type_selection' && userType) {
    return FALLBACK_RESPONSES.user_type_selection[userType] || FALLBACK_RESPONSES.default;
  }

  if (context === 'project_click') {
    return FALLBACK_RESPONSES.project_click;
  }

  return FALLBACK_RESPONSES.default;
}
