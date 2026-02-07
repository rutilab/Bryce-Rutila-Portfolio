/**
 * Conversation Flows - Scripted Responses
 *
 * This file contains all pre-written responses for the chat interface.
 * Edit this file to customize Bryce's personality and responses.
 *
 * The LLM is only called when no scripted response matches.
 */

import type { UserType } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

export interface ScriptedMessage {
  text: string;
  delay?: number; // Optional delay before this message (ms)
}

export interface ScriptedResponse {
  messages: ScriptedMessage[];
  // Optional: Show project cards after messages
  showProjectCards?: boolean;
  projectIds?: string[];
  // Optional: Suggest follow-up quick questions
  suggestedQuestions?: string[];
}

export interface KeywordTrigger {
  // Keywords/phrases that trigger this response (case-insensitive)
  keywords: string[];
  // If true, requires exact match. If false, checks if message contains keyword
  exactMatch?: boolean;
  response: ScriptedResponse;
}

// =============================================================================
// USER TYPE GREETING RESPONSES
// =============================================================================

export const userTypeResponses: Record<UserType, ScriptedResponse> = {
  recruiter: {
    messages: [
      { text: "I was hoping you'd say that haha" },
      { text: "Okay, putting on my professional voice now — here's what I've been working on..." },
    ],
    showProjectCards: true,
    projectIds: ['1', '2', '3'], // Your featured projects for recruiters
  },

  designer: {
    messages: [
      { text: "Hey, always great to connect with fellow designers!" },
      { text: "I'd love to chat about process, tools, or just nerd out about design." },
      { text: "What's on your mind?" },
    ],
    suggestedQuestions: ["What's your process?", "Favorite tools?"],
  },

  friend: {
    messages: [
      { text: "Oh hey! Thanks for checking this out!" },
      { text: "This is my portfolio site — feel free to poke around!" },
    ],
  },

  lurker: {
    messages: [
      { text: "A lurker, huh? I respect that." },
      { text: "Feel free to explore at your own pace. I'm here if you have questions!" },
    ],
  },
};

// =============================================================================
// QUICK QUESTION RESPONSES
// =============================================================================

export const quickQuestionResponses: Record<string, ScriptedResponse> = {
  // Key should match the quick question text exactly
  "What have you been up to recently?": {
    messages: [
      { text: "Lately I've been heads down on some really exciting projects!" },
      { text: "I've been exploring the intersection of AI and design — figuring out how to make complex tech feel simple and human." },
      { text: "Want to see some of what I've been working on?" },
    ],
    showProjectCards: true,
    projectIds: ['1', '2'],
  },

  "Favorite project?": {
    messages: [
      { text: "Ooh, that's like asking me to pick a favorite child haha" },
      { text: "But if I had to choose... I'd say Project One has a special place in my heart." },
      { text: "The constraints were wild, but that's what made solving it so satisfying." },
    ],
    showProjectCards: true,
    projectIds: ['1'],
  },

  "Who even are you?": {
    messages: [
      { text: "Ha! Fair question." },
      { text: "I'm Bryce — a product designer who gets way too excited about turning messy problems into elegant solutions." },
      { text: "I've spent the last few years working on products that millions of people use, and honestly? I still get a kick out of seeing someone use something I designed." },
    ],
  },

  "What's your process?": {
    messages: [
      { text: "My process is pretty collaborative and iterative." },
      { text: "I usually start by getting obsessively curious about the problem — talking to users, digging into data, questioning assumptions." },
      { text: "Then it's lots of sketching, prototyping, and testing. I'm a big believer in getting feedback early and often." },
      { text: "The polished pixels come last, once I know we're solving the right problem the right way." },
    ],
  },
};

// =============================================================================
// KEYWORD TRIGGERS
// =============================================================================

/**
 * Keyword triggers for common questions/phrases.
 * These catch variations of questions that don't match quick questions exactly.
 *
 * Order matters! First match wins.
 */
export const keywordTriggers: KeywordTrigger[] = [
  // Contact/Hiring
  {
    keywords: ['hire', 'hiring', 'job', 'position', 'role', 'opportunity', 'contract', 'freelance'],
    response: {
      messages: [
        { text: "I'm always open to hearing about interesting opportunities!" },
        { text: "The best way to reach me is through email or LinkedIn — you can find both in my contact info." },
        { text: "What kind of role are you thinking?" },
      ],
    },
  },

  // Resume/CV
  {
    keywords: ['resume', 'cv', 'curriculum'],
    response: {
      messages: [
        { text: "I can definitely share my resume!" },
        { text: "Check out the About page for a downloadable version, or feel free to browse my case studies here for the full picture." },
      ],
    },
  },

  // Contact
  {
    keywords: ['contact', 'email', 'reach', 'linkedin', 'twitter', 'social'],
    response: {
      messages: [
        { text: "You can find all my contact info on the About page!" },
        { text: "I'm most responsive on email, but I'm also on LinkedIn if that's easier." },
      ],
    },
  },

  // Tools
  {
    keywords: ['tools', 'figma', 'sketch', 'software', 'stack', 'tech stack'],
    response: {
      messages: [
        { text: "I'm pretty tool-agnostic, but Figma is my daily driver." },
        { text: "For prototyping I'll use Figma, Framer, or code depending on the fidelity I need." },
        { text: "I also dabble in code — enough to prototype and have productive conversations with engineers." },
      ],
    },
  },

  // Experience/Background
  {
    keywords: ['experience', 'background', 'years', 'worked', 'companies', 'previous'],
    response: {
      messages: [
        { text: "I've been designing professionally for several years now." },
        { text: "I've worked across startups and larger companies, which has given me a good range of experience — from scrappy 0-to-1 work to scaling design systems." },
        { text: "The case studies here show some of my best work. Anything specific you'd like to know?" },
      ],
    },
  },

  // Hello/Greeting (only exact matches - standalone greetings)
  {
    keywords: ['hello', 'hi', 'hey', 'howdy', 'sup', 'yo', 'hi!', 'hey!', 'hello!'],
    exactMatch: true,
    response: {
      messages: [
        { text: "Hey again! What can I help you with?" },
      ],
    },
  },

  // Thanks
  {
    keywords: ['thanks', 'thank you', 'thx', 'appreciate'],
    response: {
      messages: [
        { text: "Of course! Happy to help." },
        { text: "Let me know if there's anything else you'd like to know!" },
      ],
    },
  },
];

// =============================================================================
// PROJECT-SPECIFIC RESPONSES
// =============================================================================

/**
 * Responses when users click on project cards.
 * Key is the project ID.
 */
export const projectResponses: Record<string, ScriptedResponse> = {
  '1': {
    messages: [
      { text: "Project One was a really fun project to work on!" },
      { text: "The challenge was figuring out how to simplify a complex workflow without losing the power users needed." },
      { text: "Want me to walk you through the highlights, or would you prefer to dive into the full case study?" },
    ],
  },
  '2': {
    messages: [
      { text: "Ah, Project Two! This one taught me a lot." },
      { text: "It was all about finding the balance between moving fast and building something sustainable." },
      { text: "The case study has all the juicy details if you want to dig in." },
    ],
  },
  '3': {
    messages: [
      { text: "Project Three was a unique challenge." },
      { text: "We had really tight constraints, which honestly made the design process more creative." },
      { text: "Check out the case study to see how we approached it!" },
    ],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Find a scripted response for a message.
 * Returns null if no match found (should fall back to LLM).
 */
export function findScriptedResponse(
  message: string,
  context?: {
    userType?: UserType | null;
    isQuickQuestion?: boolean;
    projectId?: string;
  }
): ScriptedResponse | null {
  const normalizedMessage = message.toLowerCase().trim();

  // 1. Check if it's a quick question (exact match)
  if (context?.isQuickQuestion) {
    const quickResponse = quickQuestionResponses[message];
    if (quickResponse) return quickResponse;
  }

  // 2. Check quick questions by exact text match
  for (const [question, response] of Object.entries(quickQuestionResponses)) {
    if (normalizedMessage === question.toLowerCase()) {
      return response;
    }
  }

  // 3. Check keyword triggers
  for (const trigger of keywordTriggers) {
    for (const keyword of trigger.keywords) {
      if (trigger.exactMatch) {
        if (normalizedMessage === keyword.toLowerCase()) {
          return trigger.response;
        }
      } else {
        if (normalizedMessage.includes(keyword.toLowerCase())) {
          return trigger.response;
        }
      }
    }
  }

  // 4. No match found - will fall back to LLM
  return null;
}

/**
 * Get the response for a user type selection.
 */
export function getUserTypeResponse(userType: UserType): ScriptedResponse {
  return userTypeResponses[userType];
}

/**
 * Get the response for clicking a project card.
 */
export function getProjectResponse(projectId: string): ScriptedResponse | null {
  return projectResponses[projectId] || null;
}
