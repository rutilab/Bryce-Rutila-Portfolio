// User types for conversation routing
export type UserType = 'recruiter' | 'designer' | 'friend' | 'lurker';

// Time periods for background images
export type TimePeriod = 'dawn' | 'day' | 'dusk' | 'night';

// Message content types for rich messages
export type MessageContentType = 'text' | 'image' | 'project-card' | 'project-cards';

// Chat message structure
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  contentType?: MessageContentType; // default: 'text'
  timestamp: number;
  metadata?: {
    isScripted?: boolean;
    flowId?: string;
    stepId?: string;
    imageUrl?: string;        // for image messages
    projectId?: string;       // for single project card
    projectIds?: string[];    // for multiple project cards
  };
}

// Chat state structure
export interface ChatState {
  messages: Message[];
  userType: UserType | null;
  currentFlow: string | null;
  currentStep: string | null;
  isLoading: boolean;
  hasStarted: boolean;
}

// Quick question structure
export interface QuickQuestion {
  id: string;
  text: string;
  shortText?: string;
  answer?: string;
  contexts: ('initial' | 'post_intro' | 'always')[];
  userTypes?: UserType[];
}

// Scripted flow structures
export interface FlowOption {
  text: string;
  nextStep: string;
  userMessage?: string;
}

export interface FlowStep {
  id: string;
  messages: string[];
  delay?: number;
  options?: FlowOption[];
  nextStep?: string;
  action?: 'show_quick_questions' | 'show_cta' | 'end_flow';
}

export interface ConversationFlow {
  id: string;
  userType: UserType;
  steps: FlowStep[];
}

// Case study structure
export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail?: string;
  role: string;
  duration: string;
  outcomes: string[];
  technologies: string[];
  content?: string;
}

// Knowledge base structures
export interface PersonalInfo {
  name: string;
  title: string;
  location?: string;
  yearsExperience: number;
  elevatorPitch: string;
  personality: string[];
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  highlights: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  role: string;
  duration: string;
  outcomes: string[];
  technologies: string[];
  caseStudyUrl?: string;
}

export interface Skills {
  design: string[];
  tools: string[];
  soft: string[];
}

export interface ProcessStep {
  name: string;
  description: string;
}

export interface ProcessInfo {
  summary: string;
  steps: ProcessStep[];
}

export interface ContactInfo {
  email?: string;
  linkedin?: string;
  twitter?: string;
  calendly?: string;
  github?: string;
}

export interface KnowledgeBase {
  personal: PersonalInfo;
  experience: Experience[];
  projects: Project[];
  skills: Skills;
  process: ProcessInfo;
  funFacts: string[];
  contact: ContactInfo;
}
