'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/layout';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { UserTypeSelector } from './UserTypeSelector';
import { TypingIndicator } from './TypingIndicator';
import { useChat } from '@/hooks/useChat';
import {
  getUserTypeResponse,
  getProjectResponse,
  findScriptedResponse,
  type ScriptedResponse,
} from '@/data/conversationFlows';
import type { Message, UserType, CaseStudy } from '@/types';

// Mock projects for demo
const mockProjects: CaseStudy[] = [
  {
    id: '1',
    slug: 'project-one',
    title: 'Project One',
    description: 'A design project',
    role: 'Lead Designer',
    duration: '3 months',
    outcomes: [],
    technologies: [],
  },
  {
    id: '2',
    slug: 'project-two',
    title: 'Project Two',
    description: 'Another project',
    role: 'Product Designer',
    duration: '2 months',
    outcomes: [],
    technologies: [],
  },
  {
    id: '3',
    slug: 'project-three',
    title: 'Project Three',
    description: 'Third project',
    role: 'UX Designer',
    duration: '4 months',
    outcomes: [],
    technologies: [],
  },
];

// Default quick questions
const defaultQuickQuestions = [
  { id: '1', text: 'What have you been up to recently?' },
  { id: '2', text: 'Favorite project?' },
  { id: '3', text: 'Who even are you?' },
  { id: '4', text: "What's your process?" },
];

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

interface ChatContainerProps {
  className?: string;
  disclaimerVisible?: boolean;
  disclaimerHeight?: number;
}

export function ChatContainer({ className, disclaimerVisible = true, disclaimerHeight = 68 }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [animationStage, setAnimationStage] = useState<0 | 1 | 2 | 3>(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showButtons, setShowButtons] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false); // Full chat interface mode
  const [isApiLoading, setIsApiLoading] = useState(false); // Track API loading state

  // Chat API hook
  const { sendMessage: sendChatMessage } = useChat();

  // Ref to track current userType for async callbacks
  const userTypeRef = useRef<UserType | null>(null);
  userTypeRef.current = userType;

  // Ref for the non-chat scrollable content area — auto-scroll to bottom so hero
  // slides out of view and the question/buttons are always visible on short screens
  const scrollableRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (animationStage >= 3 && !isChatMode && scrollableRef.current) {
      scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
    }
  }, [animationStage, isChatMode]);

  // Orchestrate multi-stage progressive reveal animation
  useEffect(() => {
    if (animationStage === 0) {
      // Stage 0 → 1: Initial expansion + typing delay (1400ms total)
      const timer = setTimeout(() => setAnimationStage(1), 800 + 600);
      return () => clearTimeout(timer);
    }

    if (animationStage === 1) {
      // Stage 1: Show typing indicator immediately (no delay - one fluid animation)
      if (!showBubble) {
        setShowBubble(true);
      }

      // Stage 1 → 2: Typing duration (1800ms)
      const timer = setTimeout(() => setAnimationStage(2), 1800);
      return () => clearTimeout(timer);
    }

    if (animationStage === 2) {
      // Stage 2: Wait 1400ms for message to settle, then show buttons
      if (!showButtons) {
        const timer = setTimeout(() => setShowButtons(true), 1400);
        return () => clearTimeout(timer);
      }

      // Stage 2 → 3: After buttons animate in (900ms + 120ms×3 stagger = 1260ms), then expand input
      const timer = setTimeout(() => {
        setAnimationStage(3);
        setIsAnimating(false);
      }, 1260 + 800);
      return () => clearTimeout(timer);
    }
  }, [animationStage, showButtons, showBubble]);

  // Process message queue with typing indicator delays
  useEffect(() => {
    if (messageQueue.length === 0 || isTyping) return;

    const processNextMessage = async () => {
      setIsTyping(true);

      // Typing delay (simulate typing)
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 500));

      const [nextMessage, ...remaining] = messageQueue;

      // Add the message
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: nextMessage,
          timestamp: Date.now(),
        },
      ]);

      setMessageQueue(remaining);
      setIsTyping(false);
    };

    processNextMessage();
  }, [messageQueue, isTyping]);

  // Queue multiple assistant messages
  const queueAssistantMessages = useCallback((messages: string[]) => {
    setMessageQueue((prev) => [...prev, ...messages]);
  }, []);

  // Process a scripted response (messages + optional project cards)
  const processScriptedResponse = useCallback((response: ScriptedResponse) => {
    // Queue the text messages
    const textMessages = response.messages.map((m) => m.text);
    queueAssistantMessages(textMessages);

    // If response includes project cards, add them after messages finish
    if (response.showProjectCards && response.projectIds) {
      const totalDelay = response.messages.length * 1500 + 500; // Approximate time for messages
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: 'assistant',
            content: '',
            contentType: 'project-cards',
            timestamp: Date.now(),
            metadata: {
              projectIds: response.projectIds,
            },
          },
        ]);
      }, totalDelay);
    }
  }, [queueAssistantMessages]);

  // Handle user type selection
  const handleUserTypeSelect = useCallback((type: UserType) => {
    setUserType(type);
    setHasStarted(true);
    setIsChatMode(true); // Enter full chat mode

    // Add user's selection as a message
    const userTypeLabels: Record<UserType, string> = {
      recruiter: 'I am a recruiter/hiring manager',
      designer: "I'm a fellow designer",
      friend: "I'm a friend or family member",
      lurker: "Just lurking around",
    };

    setMessages([
      {
        id: generateId(),
        role: 'user',
        content: userTypeLabels[type],
        timestamp: Date.now(),
      },
    ]);

    // Get scripted response from conversation flows
    const response = getUserTypeResponse(type);
    processScriptedResponse(response);
  }, [processScriptedResponse]);

  // Handle user sending a message
  const handleSendMessage = useCallback(
    async (content: string, isQuickQuestion = false) => {
      if (!hasStarted) {
        setHasStarted(true);
      }
      if (!isChatMode) {
        setIsChatMode(true); // Enter full chat mode on first message
      }

      // Add user message
      const newUserMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newUserMessage]);

      // 1. Check for scripted response first
      const scriptedResponse = findScriptedResponse(content, {
        userType: userTypeRef.current,
        isQuickQuestion,
      });

      if (scriptedResponse) {
        // Use scripted response
        processScriptedResponse(scriptedResponse);
        return;
      }

      // 2. No scripted match - call LLM
      setIsApiLoading(true);
      try {
        // Get current messages for context (including the new user message)
        const currentMessages = [...messages, newUserMessage];
        const responses = await sendChatMessage(
          content,
          userTypeRef.current,
          currentMessages
        );
        queueAssistantMessages(responses);
      } catch (error) {
        console.error('Error getting LLM response:', error);
        // Fallback handled by useChat hook
      } finally {
        setIsApiLoading(false);
      }
    },
    [hasStarted, isChatMode, messages, processScriptedResponse, queueAssistantMessages, sendChatMessage]
  );

  // Handle quick question selection
  const handleQuickQuestion = useCallback(
    (question: { id: string; text: string }) => {
      handleSendMessage(question.text, true); // Mark as quick question
    },
    [handleSendMessage]
  );

  // Handle project card click
  const handleProjectClick = useCallback(
    (projectId: string) => {
      // Get scripted response for this project
      const scriptedResponse = getProjectResponse(projectId);

      if (scriptedResponse) {
        processScriptedResponse(scriptedResponse);
      } else {
        // Fallback if no scripted response defined
        const project = mockProjects.find((p) => p.id === projectId);
        if (project) {
          queueAssistantMessages([
            `${project.title} was a really fun project to work on!`,
            "Want me to tell you more about it?",
          ]);
        }
      }
    },
    [processScriptedResponse, queueAssistantMessages]
  );

  // Stage-based visibility logic
  const showHero = animationStage >= 0 && !isChatMode; // Hide in chat mode
  const showDivider = animationStage >= 1 && !isChatMode; // Hide in chat mode
  const showTypingIndicator = animationStage === 1 && showBubble;
  const showMessage = animationStage >= 2 && !hasStarted; // Hide after user selects
  const showUserTypeButtons = showButtons && animationStage >= 2 && !hasStarted;
  const showInputSection = animationStage >= 3 || isChatMode;
  const showQuickQuestions = (animationStage >= 3 || isChatMode) && hasStarted && !isTyping && !isApiLoading && messageQueue.length === 0;
  const showInitialQuickQuestions = animationStage >= 3 && !hasStarted && !isChatMode;

  // Interaction lock during animation
  const isInteractionDisabled = isAnimating;

  // Top offset: nav (80px) + actual disclaimer height + 8px gap, or original 160px if dismissed
  const topPx = disclaimerVisible ? 80 + disclaimerHeight + 8 : 160;

  // Container height changes per animation stage for smooth transitions
  // At stage 3 and chat mode: fill down from topPx, cap at 800px, leave 24px at bottom
  const flexHeight = `min(800px, calc(100dvh - ${topPx + 24}px))`;

  const getHeight = () => {
    if (isChatMode) return flexHeight;
    if (animationStage === 0) return '200px';
    if (animationStage === 1) return '290px';
    if (animationStage === 2 && !showButtons) return '290px';
    if (animationStage === 2 && showButtons) return '360px';
    return flexHeight;
  };

  const containerStyle = {
    height: getHeight(),
    transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
    overflow: isChatMode ? 'visible' : animationStage >= 3 ? 'visible' : 'hidden',
  };

  const containerClassName = cn(
    'rounded-b-3xl',
    isChatMode && 'rounded-3xl' // Full rounding in chat mode
  );

  // Outer container positioning — top-anchored, height fills down with 24px bottom min
  const outerContainerStyle = {
    position: 'fixed' as const,
    left: 0,
    right: 0,
    top: topPx,
    zIndex: 40,
    display: 'flex',
    justifyContent: 'center',
    padding: '0 12px',
  };

  return (
    <div style={outerContainerStyle} className={className}>
      <div className={cn(containerClassName, 'w-full max-w-[900px]', (isChatMode || animationStage >= 3) && 'h-full')} style={containerStyle}>
        <GlassCard
          className={cn(
            'w-full p-5 sm:p-10 flex flex-col',
            isChatMode ? 'rounded-3xl' : 'rounded-b-3xl',
            (isChatMode || animationStage >= 3) && 'h-full'
          )}
          padding="none"
        >
          {/* Non-chat scrollable content area — becomes flex-1 at stage 3 so input anchors to bottom */}
          <div ref={animationStage >= 3 && !isChatMode ? scrollableRef : undefined} className={animationStage >= 3 && !isChatMode ? 'flex-1 overflow-y-auto min-h-0' : 'contents'}>
            {/* Stage 0+: Hero Section */}
            {showHero && (
              <div className="mb-8">
                <h1 className="text-4xl max-[440px]:text-2xl font-bold text-white mb-2">
                  Hello I&apos;m Bryce.
                </h1>
                <p className="text-lg max-[440px]:text-sm text-white/90">
                  A product designer who loves turning <em>ideas</em> into <em>reality</em>.
                </p>
              </div>
            )}

            {/* Stage 1+: Divider */}
            {showDivider && (
              <div className="h-px bg-white/20 mb-8 animate-fade-in-slide-down" />
            )}

            {/* Stage 1: Typing Indicator (universal component) */}
            {showTypingIndicator && (
              <div className="mb-6 animate-fade-in-slide-down">
                <TypingIndicator showWrapper={false} />
              </div>
            )}

            {/* Stage 2: Message Bubble (content-sized, text fades in) */}
            {showMessage && (
              <div className="mb-6 max-w-fit">
                <div className="bg-[#262629] rounded-3xl rounded-bl-none px-4 py-3">
                  <p
                    className="text-white text-xl max-[440px]:text-base leading-[25px] max-[440px]:leading-[22px] tracking-[-0.45px] opacity-0 animate-fade-in"
                    style={{ animationDelay: '100ms', fontFamily: 'var(--font-sf-pro)' }}
                  >
                    So I can point you in the right direction — who am I chatting with?
                  </p>
                </div>
              </div>
            )}

            {/* Stage 2+: User Type Buttons (with staggered spring animation) */}
            {showUserTypeButtons && (
              <UserTypeSelector
                onSelect={handleUserTypeSelect}
                disabled={isInteractionDisabled}
                className="mb-8"
              />
            )}
          </div>

          {/* Chat Messages (shown after user type selection) */}
          {hasStarted && showInputSection && (
            <ChatMessages
              messages={messages}
              isTyping={isTyping || isApiLoading}
              onProjectClick={handleProjectClick}
              projects={mockProjects}
              className={cn(
                'mb-8',
                isChatMode ? 'flex-1 min-h-0' : 'max-h-[400px]'
              )}
            />
          )}

          {/* Stage 3+: Input Section — anchored to bottom via flex layout */}
          {showInputSection && (
            <div className={cn('-mx-5 sm:-mx-10', !isChatMode && 'animate-fade-in-slide-down')}>
              <ChatInput
                onSend={handleSendMessage}
                disabled={isInteractionDisabled || isTyping || isApiLoading}
                quickQuestions={defaultQuickQuestions}
                onQuickQuestionSelect={handleQuickQuestion}
                showQuickQuestions={showQuickQuestions || showInitialQuickQuestions}
                autoFocus={!isAnimating || isChatMode}
              />
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
