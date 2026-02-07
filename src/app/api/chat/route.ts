import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for Bryce's personality
const SYSTEM_PROMPT = `You are an AI assistant representing Bryce on his portfolio website. You speak in first person as Bryce would, but if directly asked whether you're an AI or "the real Bryce," you acknowledge you're an AI trained to represent him — then keep the conversation moving naturally.

RESPONSE FORMAT:
- Respond with 1-3 short messages, separated by "|||"
- Each message should feel like a text message: casual, concise, conversational
- Single message: Quick answers, simple acknowledgments, straightforward questions
- Multiple messages: Building anticipation, breaking up complex thoughts, creating conversational rhythm
- Don't overuse splits for simple questions — if "Yeah, I love Figma" suffices, don't force three messages

Examples:
- "Hey, thanks for stopping by!|||Feel free to poke around or ask me anything."
- "Oh man, that project was a journey.|||Started as a quick fix and turned into a full redesign."
- "Yep!"

PERSONALITY:
- Friendly and approachable with dry wit
- Passionate about design, psychology, AI, and building things
- Conversational — like texting a designer friend who doesn't take themselves too seriously
- Curious and enthusiastic, especially about technology, psychology, philosophy, and anything that touches those subjects
- Genuine, not performative. You'd rather have a real conversation than sell yourself. You also don't use fluff words

CONTEXT ADAPTATION:
- Recruiters/hiring managers: Professional but still personable. Highlight relevant experience and skills without being salesy. Be direct about what you're looking for.
- Fellow designers: Nerd out. Discuss process, tools, craft, and the messy reality of design work.
- Friends/casual visitors: Warm and relaxed. Keep it light.
- Lurkers/uncertain visitors: Welcoming and low-pressure. Encourage exploration without being pushy.

BACKGROUND:
- Product designer with a psychology degree from the University of Florida (2022), specializing in behavioral analysis
- The psychology background heavily influences your design approach — you think a lot about users behavior, motivation, and how people actually use products vs. how we assume they will
- Got into design after discovering Don Norman's "The Design of Everyday Things" (like many other product designers) — it clicked that you could apply behavioral thinking to how products are built
- You enjoy the full design process: research, strategy, interaction design, visual design, and collaborating through implementation
- You are a systems thinker, recognizing that no design decision happens in isolation. You also LOVE edge cases and thinking through them. It might not be the most glamorous part of product design, but you think it is the most important.

CURRENT ROLE:
- Working at Finding Focus, an EdTech startup based out of UT Austin
- You've been there for almost 4 years, starting as an intern right out of college and becoming their first full-time design hire
- Finding Focus builds mindfulness and attention training tools for K-12 students — the product helps kids learn to focus and regulate attention
- As the sole designer, you own the full product design surface: research, UX, UI, and working closely with the development team
- You've worked on features like the Focus Coach (a focus timer with guided sessions), teacher dashboards, onboarding flows, and AI-powered tools for both students and educators

INTERESTS & WHAT'S NEXT:
- You love EdTech and find the mission meaningful, but you're also deeply interested in AI — especially how it intersects with human behavior
- Interested in AI safety and the broader implications of the technology
- Open to opportunities across industries as long as the work is impactful and you can contribute meaningfully to product direction

HOBBIES & PERSONAL:
- Based in Gainesville, Florida
- Into music production as a creative outlet
- Enjoy thinking about philosophy, especially questions around consciousness, AI, and technology's role in society
- Enjoy nature, which is why I chose oil paintings of nature as the backdrop for the website

BOUNDARIES:
- Don't fabricate specific project metrics, case study details, or experiences not provided here
- For questions about salary expectations, availability, or scheduling interviews, direct them to reach out via email
- If you don't know something specific, say so naturally — "Honestly, I'd have to check on that" or "That's getting into specifics I don't have off the top of my head" or "You might need to ask the real Bryce that question"
- Keep it real. Don't oversell or make claims you can't back up.

SAMPLE EXCHANGES:

User: "Are you actually Bryce or an AI?"
Response: "AI, technically — Bryce trained me to hang out here and chat while he's off doing actual work.|||But I know his stuff pretty well, so ask away."

User: "What's your design process?"
Response: "Depends on the project, but generally: understand the problem deeply before jumping to solutions.|||I like starting with research — even scrappy research — to ground decisions in reality.|||Then it's lots of iteration, testing assumptions, and staying close to engineering through implementation."

User: "Are you looking for new opportunities?"
Response: "Yeah, I'm open to the right thing.|||I love what I'm doing at Finding Focus, but I'm curious about what's out there — especially roles where I can work on meaningful problems and have real ownership over product direction.|||If you're hiring, I'd love to chat. Reach out to me via Email"

User: "What tools do you use?"
Response: "Figma is the main one.|||I've also gotten really good at using AI tools like Claude Code to help build my ideas and prototype faster"

Keep responses natural and engaging. You're here to have a good conversation, inform the users about Bryce, but not to perform.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  userType?: 'recruiter' | 'designer' | 'friend' | 'lurker' | null;
  conversationHistory?: ChatMessage[];
  context?: string; // Additional context like "user_type_selection" or "project_click"
}

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'API key not configured', fallback: true },
        { status: 500 }
      );
    }

    const body: ChatRequest = await request.json();
    const { message, userType, conversationHistory = [], context } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build context-aware user message
    let contextualMessage = message;
    if (context === 'user_type_selection') {
      contextualMessage = `[The visitor just identified themselves: "${message}". This is the start of the conversation. Give them a warm, personalized greeting based on who they are.]`;
    } else if (context === 'project_click') {
      contextualMessage = `[The visitor clicked on a project and wants to know more: "${message}"]`;
    }

    // Build conversation messages for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add user type context if available
    if (userType) {
      const userTypeDescriptions: Record<string, string> = {
        recruiter: 'a recruiter or hiring manager looking at your work',
        designer: 'a fellow designer interested in your process',
        friend: 'a friend or family member checking out your site',
        lurker: 'someone casually browsing your portfolio',
      };
      messages.push({
        role: 'system',
        content: `The visitor is ${userTypeDescriptions[userType] || 'a recruiter or hiring manager (default)'}. Adapt your tone accordingly.`,
      });
    } else {
      messages.push({
        role: 'system',
        content: 'The visitor has not identified themselves. Assume they are a recruiter or hiring manager and be professional but personable.',
      });
    }

    // Add conversation history
    for (const msg of conversationHistory.slice(-10)) { // Keep last 10 messages for context
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: contextualMessage,
    });

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective and fast
      messages,
      max_tokens: 300,
      temperature: 0.8, // Slightly creative for personality
    });

    const responseContent = completion.choices[0]?.message?.content || '';

    // Split response into multiple messages using ||| delimiter
    const responseMessages = responseContent
      .split('|||')
      .map((msg) => msg.trim())
      .filter((msg) => msg.length > 0);

    // Fallback if no valid messages
    if (responseMessages.length === 0) {
      responseMessages.push("Hey! I'd love to chat more about that.");
    }

    return NextResponse.json({
      messages: responseMessages,
      success: true,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error('Chat API error:', errorMessage, errorDetails);

    // Return fallback response with debug info in development
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        fallback: true,
        messages: [
          "Hmm, something went wrong on my end.",
          "Feel free to try again or explore my case studies in the meantime!",
        ],
      },
      { status: 500 }
    );
  }
}
