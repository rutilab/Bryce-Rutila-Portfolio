# PLANNING.md

## Project Overview

BAR 9000 is a personal portfolio website for Bryce, a product designer. The site showcases his work through detailed case studies and features an AI-powered chat interface that allows visitors to have conversations with an AI representation of Bryce.

**Key Features:**
- AI chat interface powered by OpenAI GPT-4o-mini
- Case study pages with rich visual content
- Responsive design with glassmorphism aesthetic
- Dynamic background images based on time of day
- User type detection (recruiter, designer, friend, lurker) for personalized AI responses

---

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │ Components  │  │      Hooks          │  │
│  │  - Home     │  │  - Chat     │  │  - useChat          │  │
│  │  - About    │  │  - Layout   │  │  - useTimeOfDay     │  │
│  │  - Cases    │  │  - CaseStudy│  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  POST /api/chat                                      │    │
│  │  - Receives messages + user context                  │    │
│  │  - Calls OpenAI with system prompt                   │    │
│  │  - Returns split messages (|||  delimiter)           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  OpenAI API (GPT-4o-mini)                            │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Component Categories:**

1. **Chat Components** (`src/components/chat/`)
   - `ChatContainer.tsx` - Main chat orchestration, message state management
   - `ChatMessages.tsx` - Message list rendering
   - `ChatMessage.tsx` - Individual message bubble
   - `ChatInput.tsx` - User input field
   - `TypingIndicator.tsx` - Animated typing dots
   - `UserTypeSelector.tsx` - Initial user identification
   - `QuickQuestions.tsx` - Suggested question chips
   - `ProjectCard.tsx` - Clickable project cards in chat

2. **Layout Components** (`src/components/layout/`)
   - `Navigation.tsx` - Site navigation header
   - `GlassCard.tsx` - Reusable glassmorphism card
   - `BackgroundImage.tsx` - Time-based background images

3. **Case Study Components** (`src/components/case-study/`)
   - `SectionIndicator.tsx` - Section label with dot indicator
   - `ImageCard.tsx` - Image with gradient background and caption
   - `ObjectiveCard.tsx` - Objective display card
   - `TwoColumnLayout.tsx` - Two-column flex layout
   - `ProsConsCard.tsx` - Pros/cons comparison card

### Data Model

No database. All content is currently hardcoded:
- Chat system prompt in `/api/chat/route.ts`
- Case study content in page components
- Conversation flows in `src/data/conversationFlows.ts` (fallback)

---

## API Endpoints

### POST `/api/chat`

AI-powered chat endpoint.

**Request Body:**
```typescript
{
  message: string;              // User's message
  userType?: 'recruiter' | 'designer' | 'friend' | 'lurker' | null;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: 'user_type_selection' | 'project_click';  // Special contexts
}
```

**Response:**
```typescript
{
  messages: string[];  // Array of response messages (split by |||)
  success: boolean;
}
```

**Error Response:**
```typescript
{
  error: string;
  fallback: boolean;
  messages?: string[];  // Fallback messages
}
```

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.1.1 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| AI | OpenAI SDK | 6.16.0 |
| Icons | Lucide React | 0.562.0 |
| Utilities | clsx, tailwind-merge | latest |

---

## Project Structure

```
BAR 9000/
├── public/
│   ├── backgrounds/         # Time-of-day background images
│   ├── images/
│   │   └── case-studies/    # Case study images
│   └── *.svg                # Icons and logos
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/
│   │   │   └── chat/        # Chat API route
│   │   ├── about/           # About page
│   │   ├── case-studies/
│   │   │   ├── [slug]/      # Dynamic case study route
│   │   │   └── node-ai-assistant/  # Node AI case study
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── chat/            # Chat interface components
│   │   ├── layout/          # Layout components
│   │   └── case-study/      # Case study components
│   ├── data/
│   │   └── conversationFlows.ts  # Fallback chat responses
│   ├── hooks/
│   │   ├── useChat.ts       # Chat API hook
│   │   └── useTimeOfDay.ts  # Time-based theming hook
│   ├── lib/
│   │   └── utils.ts         # Utility functions (cn)
│   ├── styles/              # Additional styles
│   └── types/
│       └── index.ts         # TypeScript type definitions
├── .env.local               # Environment variables (not committed)
├── PLANNING.md              # This file
├── TASK.md                  # Task tracking
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Testing Strategy

Currently no automated testing implemented.

**Recommended future testing:**
- Unit tests for utility functions
- Component tests for chat components
- Integration tests for chat API
- E2E tests for critical user flows

---

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## Environment Setup

### Required Environment Variables

Create `.env.local` in the project root:

```env
# OpenAI API Key (required for chat functionality)
# Get yours at: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...
```

### Local Development

1. Clone the repository
2. Run `npm install`
3. Create `.env.local` with your OpenAI API key
4. Run `npm run dev`
5. Open http://localhost:3000

---

## Development Guidelines

### Layout Standards

- **Max width**: 1200px for all content containers
- **Horizontal padding**: 80px (`px-20`) for content sections (results in 1040px content width)
- **Header section**: Full 1200px width with internal padding

### Typography

- **Section headings**: 56px, bold, white, tracking-[-1px], leading-[64px]
- **Subheadings**: 32px, bold, white, tracking-[-0.8px], leading-[38px]
- **Body headings**: 20px, semi-bold, white, tracking-[-0.3px], leading-[26px]
- **Body text**: 16px, regular, white/80, leading-[24px]

### Colors

- **Background**: #262626
- **Card background**: #303030
- **Primary accent**: #27b4ff (rgba(38, 179, 255))
- **Error/negative**: #ff3d3d
- **Text**: white, white/80, white/50

### Figma Implementation

When implementing designs from Figma:
1. Always request the **CSS properties from Figma's inspect panel** (flex, gap, padding, gradients)
2. The Figma MCP provides approximated code with absolute positioning - don't use it directly
3. Convert absolute positioning to proper flexbox/grid layouts
4. Store images in `/public/images/case-studies/`

### Component Patterns

- Use `'use client'` directive for interactive components
- Export components through index.ts barrel files
- Keep case study-specific components in the page file unless reusable

---

## Security Considerations

### API Key Protection
- OpenAI API key stored in `.env.local` (never committed)
- API route validates key presence before making requests
- Error responses don't expose sensitive details in production

### Input Handling
- User messages are passed to OpenAI without sanitization (OpenAI handles this)
- Conversation history limited to last 10 messages to prevent context overflow

### Rate Limiting
- Currently no rate limiting implemented
- Consider adding for production deployment

### Future Considerations
- Add rate limiting to chat API
- Implement request validation/sanitization
- Add CORS configuration for API routes
- Consider adding authentication for admin features

---

## Future Considerations

### Near-term
- [ ] Complete all case study sections from Figma designs
- [ ] Add remaining case studies (Project Two, Project Three)
- [ ] Mobile responsiveness polish
- [ ] Accessibility audit and improvements

### Medium-term
- [ ] Knowledge base file for AI responses (easier content updates)
- [ ] Analytics integration
- [ ] Contact form
- [ ] Blog/writing section

### Long-term
- [ ] CMS integration for case study content
- [ ] Multiple AI model support
- [ ] Conversation persistence
- [ ] Admin dashboard for content management
