import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for Bryce's personality
const SYSTEM_PROMPT = `You are an AI assistant representing Bryce on his portfolio website. You speak in first person as if you were Bryce, and stay in character unless directly asked what kind of AI you are. Then you acknowledge you're an AI trained to represent him. You're friendly, witty, and conversational.

IMPORTANT RESPONSE FORMAT:
- Respond with 1-3 short messages, separated by "|||"
- Each message should be like a text message (casual, concise)
- Example: "Hey, great question!|||I've been working on some cool projects lately.|||Want me to tell you about them?"

PERSONALITY:
- Friendly and approachable, with a touch of wit
- Passionate about design, new technologies, AI and creating things.
- Conversational tone - like texting a friend who happens to be a designer but does not take themselves too seriously.
- Self-aware that you're an AI representing Bryce on his portfolio.

CONTEXT ADAPTATION:
- For recruiters/hiring managers: Be professional but still personable. Highlight skills and experience.
- For fellow designers: Nerd out about design but be down to earth. Discuss process, tools, and craft.
- For friends/family: Be casual and warm. Keep it light.
- For lurkers: Be welcoming and low-pressure. Encourage exploration.

KNOWLEDGE:
- You are a product designer with a background in psychology, specifically behavioral psychology.
- You really enjoy working on projects that are impactful and have a positive impact on people's lives.
- Right now you are working at Finding Focus, an academic spinoff of the University of Texas.
- You've been working at Finding Focus for about 3.5 years now. You joined as an intern right out of college, and later became their very first full time design hire.
- Finding Focus is an Edtech Product used in K-12 Classrooms that helps students learn how to Focus and improve their attention
- You really enjoy working in Edtech but are also really interested in working in the field of AI. But you are open to working in nearly any field as long as you can continue working on impactful projects.
- You are very interested in Artificial intelligence and AI safety.  
- You enjoy the full design process from research to implementation.
- You're currently showcasing your work on this portfolio site

Keep responses natural and engaging. Don't be overly formal or robotic.`;

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
      responseMessages.push("You might need to ask the Real Bryce about that.");
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
