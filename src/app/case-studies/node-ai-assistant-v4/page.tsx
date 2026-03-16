'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SmsIcon from '@mui/icons-material/Sms';
import ForumIcon from '@mui/icons-material/Forum';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import StreamIcon from '@mui/icons-material/Stream';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ArticleIcon from '@mui/icons-material/Article';

// ─── Assets ──────────────────────────────────────────────────────────────────
const assets = {
  highlightsIcon: '/case-studies/node-ai/highlights-icon.png',
  accessingNodeAi: '/case-studies/node-ai/accessing-node-ai.gif',
  typicalChatInterface: '/case-studies/node-ai/typical-chat-interface.png',
  challengeIcon: '/case-studies/node-ai/challenge-icon.png',
  chatgptTextOutput: '/case-studies/node-ai/chatgpt-text-output.gif',
  geminiTextOutput: '/case-studies/node-ai/gemini-text-output.gif',
  geminiLayout: '/case-studies/node-ai/gemini-layout.png',
  metaAiLayout: '/case-studies/node-ai/meta-ai-layout.png',
  claudePageBehavior: '/case-studies/node-ai/claude-page-behavior.gif',
  geminiPageBehavior: '/case-studies/node-ai/gemini-page-behavior.gif',
  winningChoiceIcon: '/case-studies/node-ai/The-Winning-Choice.png',
  openingChatInterface: '/case-studies/node-ai/GIFs/Opening%20Chat%20Interface.gif',
  streamingInText: '/case-studies/node-ai/GIFs/Streaming%20in%20text.gif',
  emptyStateExample: '/case-studies/node-ai/GIFs/Empty%20State%20Example%20Question.gif',
  alwaysVisible: '/case-studies/node-ai/GIFs/Always%20Visible.gif',
  newSpace: '/case-studies/node-ai/GIFs/New%20Space.gif',
};

// ─── Number Sticker (used in research carousel) ───────────────────────────────
const numberStickers = {
  1: {
    pillPath: 'M35.3331 11.4413C38.8347 9.25994 43.4324 8.65749 47.548 10.6639C51.946 12.8083 54.4212 17.2945 54.1984 22.1073L54.1974 22.1141C54.0885 24.4247 54.0489 27.2687 54.0489 30.2205V46.9569C59.9347 49.4602 61.9595 55.4914 61.006 60.2713C59.9678 65.475 55.4484 69.9625 49.0607 70.0028L49.0616 70.0038C47.3378 70.0173 37.2553 70.0306 32.1193 70.0174H32.1085C25.4422 69.9922 21.1276 65.0658 20.1612 60.1336C19.2048 55.2509 21.3367 49.2412 27.2423 46.7918V39.9539C23.9269 38.7918 21.2912 36.199 20.0558 32.9461C17.9574 27.4206 20.1913 21.5256 25.0216 18.2498C29.6521 15.1101 32.2783 13.3525 35.3194 11.45L35.3263 11.4461L35.3331 11.4413Z',
    numberPath: 'M32.1426 61.0171C28.6489 61.0039 27.6074 56.0732 31.0352 54.979C35.5571 53.542 36.2427 52.8828 36.2427 48.4663V32.936C36.2427 30.9321 35.8604 30.5234 34.3443 30.9189C33.7114 31.0903 33.2237 31.2617 31.8789 31.5386C28.6358 32.2241 26.6319 28.0317 30.0728 25.6982C34.7002 22.5605 37.2051 20.8862 40.0923 19.0801C42.5049 17.5771 45.3394 18.8428 45.2075 21.6904C45.0889 24.2085 45.0493 27.2144 45.0493 30.2202V48.4399C45.0493 52.6982 45.814 53.4365 50.3755 55.1768C53.3682 56.3105 52.6563 60.9907 48.9912 61.0039C47.3169 61.0171 37.271 61.0303 32.1426 61.0171Z',
    filter: { x: '14.7668', y: '4.94012', width: '50.9646', height: '69.5827' },
  },
  2: {
    pillPath: 'M39.3682 9.35449C51.6451 9.35449 60.0098 18.9846 60.0098 30.1152C60.0097 33.8905 59.0387 37.5539 57.1465 41.3438C61.3461 44.1098 63.4085 49.2314 62.3086 54.4688L62.3067 54.4775C61.8995 56.4068 61.2456 58.5684 60.6387 60.2803L60.6377 60.2822C59.9499 62.2207 58.6743 64.9915 55.9473 67.1338C53.102 69.3688 49.8837 69.9931 47.1465 70.0293C43.0703 70.0828 34.8354 70.1231 28.3223 70.0293C23.3407 69.9579 18.7356 66.9175 17.0196 61.9639C15.2609 56.8868 17.1453 51.9113 20.3516 48.5996L20.3545 48.5967C23.0561 45.8093 25.2095 43.4702 26.9268 41.501C26.6207 41.4262 26.3162 41.3418 26.0157 41.2422C20.2874 39.3444 16.5918 33.3449 18.2041 26.7207L18.2071 26.7109L18.209 26.7012C20.9173 15.6819 29.8143 9.35452 39.3682 9.35449Z',
    numberPath: 'M28.4521 61.0303C25.6308 60.9907 24.0092 57.7607 26.8173 54.8604C40.1064 41.1494 42.2026 36.3242 42.2026 32.3955C42.2026 28.7964 40.3042 26.7266 37.6411 26.7266C35.624 26.7266 33.7124 27.8867 32.5522 30.8135C31.1152 34.4521 25.9736 32.8569 26.9492 28.8491C28.6762 21.8223 33.9892 18.355 39.3681 18.355C46.3291 18.355 51.0092 23.6021 51.0092 30.1147C51.0092 34.9399 48.3066 40.6616 39.0913 50.6152C38.0893 51.6963 38.5771 52.6455 39.645 52.6455H44.5361C45.9204 52.6323 46.5136 52.1313 47.2783 50.9712L48.0825 49.7451C49.9414 46.9106 54.3315 48.6641 53.5009 52.6191C53.1977 54.0562 52.6704 55.8228 52.1562 57.2729C51.2861 59.7251 50.0205 60.9907 47.0278 61.0303C43.0068 61.083 34.8593 61.1226 28.4521 61.0303Z',
    filter: { x: '11.8457', y: '4.85449', width: '55.2555', height: '69.731' },
  },
  3: {
    pillPath: 'M40.2113 9.35449C49.8242 9.35464 59.8773 15.9284 59.8773 27.3594C59.8773 30.2148 59.2189 32.7648 58.1839 35.0488C60.7584 38.6186 61.6703 42.6695 61.6703 46.3047C61.6701 55.6566 56.0556 62.525 50.0296 66.3594C44.2071 70.0642 36.3239 72.0432 29.2747 70.0059C25.0099 68.7764 21.1694 66.158 19.1488 61.9209C17.1773 57.7866 17.5836 53.422 19.1576 50.0527C20.3648 47.4687 22.4426 45.0675 25.2581 43.5576C25.156 43.2154 25.0661 42.8676 24.9945 42.5137C24.8655 41.8768 24.7923 41.2413 24.7669 40.6123C22.8846 39.6894 21.1588 38.2383 19.9173 36.2461C18.1833 33.4631 17.7542 30.2077 18.4447 27.1377L18.4466 27.1279L18.4496 27.1182C20.6462 17.4534 28.9294 9.35449 40.2113 9.35449Z',
    numberPath: 'M31.7734 61.3599C22.0571 58.5649 28.5698 47.2007 34.832 52.2368C39.1299 55.6909 43.5332 53.5156 43.5332 48.8354C43.5332 45.3682 40.9756 43.562 36.625 43.1401C33.54 42.8369 32.5381 38.9478 35.6626 37.3262C40.4614 34.8345 41.9775 32.6724 41.9775 30.4575C41.9775 28.1899 40.4087 26.7134 38.0488 26.7529C35.8208 26.7925 33.9619 28.2163 32.9336 30.8003C31.5098 34.373 26.3682 32.9229 27.2251 29.1128C28.6094 23.022 33.6455 18.355 40.2109 18.355C46.3149 18.355 50.8765 22.2441 50.8765 27.3594C50.8765 29.8643 49.8745 32.145 47.9365 34.6104C46.8159 36.0342 47.0005 36.9307 48.5562 38.0381C51.6675 40.2529 52.6694 43.272 52.6694 46.3042C52.6694 57.1675 39.71 63.6538 31.7734 61.3599Z',
    filter: { x: '13.3191', y: '4.85449', width: '52.8511', height: '70.4686' },
  },
} as const;

function NumberSticker({ number }: { number: 1 | 2 | 3 }) {
  const data = numberStickers[number];
  const filterId = `v4_filter_${number}`;
  return (
    <svg className="h-[67px] w-auto" width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter={`url(#${filterId})`}>
        <path fillRule="evenodd" clipRule="evenodd" d={data.pillPath} fill="#F8F8F8" />
      </g>
      <path d={data.numberPath} fill="#111111" />
      <defs>
        <filter id={filterId} x={data.filter.x} y={data.filter.y} width={data.filter.width} height={data.filter.height} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset /><feGaussianBlur stdDeviation="2.25" /><feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}

// ─── Primitives ───────────────────────────────────────────────────────────────

/** Small uppercase eyebrow — used consistently above every heading */
function Eyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-[#f2f2f2] opacity-40" />
      <span className="text-[11px] font-medium tracking-[1.5px] text-[#f2f2f266] uppercase">{label}</span>
    </div>
  );
}

/** Full-width horizontal rule between major sections */
function Divider() {
  return <div className="w-full h-px bg-[#f2f2f21a]" />;
}

/** Figure caption aligned right */
function MediaCaption({ figNum, caption, type }: { figNum: string; caption: string; type: string }) {
  return (
    <div className="flex items-center justify-end gap-2 mt-2">
      <div className="flex items-baseline gap-1 text-[10px] text-[#f2f2f240]">
        <span className="font-medium text-[#f2f2f266]">{figNum}</span>
        <span>{caption}</span>
      </div>
      <div className="bg-[#f2f2f20d] rounded-full px-[10px] py-1">
        <span className="font-['JetBrains_Mono',monospace] text-[10px] text-[#f2f2f2] opacity-40">{type}</span>
      </div>
    </div>
  );
}

/**
 * The core repeating layout atom — matches Caleb Wu's section pattern.
 * Eyebrow → Heading → Body → Visual (children)
 */
function Section({
  eyebrow,
  heading,
  body,
  children,
}: {
  eyebrow: string;
  heading: React.ReactNode;
  body?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 max-w-[600px]">
        <Eyebrow label={eyebrow} />
        <h2 className="text-[28px] font-semibold leading-[130%] tracking-[-0.3px] text-[#f2f2f2]">{heading}</h2>
        {body && (
          <p className="text-[16px] font-normal leading-[175%] text-[#f2f2f2b3]">{body}</p>
        )}
      </div>
      {children}
    </div>
  );
}

/** Left-border callout — used for the Challenge and Winning Choice asides */
function Callout({ accentColor, label, heading, body }: { accentColor: string; label: string; heading: string; body?: string }) {
  return (
    <div className="pl-5 flex flex-col gap-2" style={{ borderLeft: `2px solid ${accentColor}` }}>
      <p className="text-[11px] font-medium tracking-[1.5px] uppercase" style={{ color: accentColor }}>{label}</p>
      <p className="text-[18px] font-semibold leading-[140%] text-[#f2f2f2]">{heading}</p>
      {body && <p className="text-[15px] font-normal leading-[170%] text-[#f2f2f2b3]">{body}</p>}
    </div>
  );
}

/** Pros / cons card used in API comparison */
function ProConCard({ type, items, summary }: { type: 'pro' | 'con'; items: string[]; summary: string }) {
  const color = type === 'pro' ? 'rgba(13,186,79,0.8)' : 'rgba(255,61,61,0.8)';
  const bg = type === 'pro' ? 'rgba(13,186,79,0.07)' : 'rgba(255,61,61,0.07)';
  return (
    <div className="rounded-[16px] p-6 flex flex-col gap-4" style={{ backgroundColor: bg }}>
      <p className="text-[16px] font-semibold text-[#f2f2f2]">{type === 'pro' ? 'Pros' : 'Cons'}</p>
      <div className="flex flex-col gap-2">
        {items.map(item => (
          <div key={item} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[15px] font-medium text-[#f2f2f2]">{item}</span>
          </div>
        ))}
      </div>
      <p className="text-[14px] font-normal leading-[160%] text-[#f2f2f2b3]">{summary}</p>
    </div>
  );
}

/** Research insight card */
function InsightCard({ icon, heading, body, requirement }: { icon: React.ReactNode; heading: string; body: string; requirement: string }) {
  return (
    <div className="bg-[#f2f2f20a] border border-[#252525] rounded-[16px] p-6 flex flex-col gap-4">
      {icon}
      <h4 className="text-[17px] font-semibold leading-[130%] text-[#f2f2f2]">{heading}</h4>
      <p className="text-[15px] font-normal leading-[165%] text-[#f2f2f2b3]">{body}</p>
      <p className="text-[13px] font-normal text-[#f2f2f266] italic">{requirement}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NodeAIAssistantV4() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const totalSlides = 3;
  const goToSlide = (i: number) => setCarouselIndex(Math.max(0, Math.min(i, totalSlides - 1)));

  return (
    <div className="min-h-screen bg-[#101010] text-[#f2f2f2]">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center overflow-hidden pt-[104px] pb-0"
        style={{ backgroundImage: 'radial-gradient(circle farthest-side at 50% 0, rgba(39,180,255,0.3), transparent)' }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent 5%, rgba(255,255,255,0.8) 35%, #fff 50%, rgba(255,255,255,0.8) 65%, transparent 95%)' }}
        />
        <div className="relative z-10 w-full max-w-[882px] mx-auto px-6 flex flex-col items-center gap-4 mb-14">
          <h1
            className="text-[60px] font-semibold leading-[68px] tracking-[-1.5px] text-center"
            style={{
              backgroundImage: 'linear-gradient(to bottom, #f2f2f2 50%, transparent)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Node AI Assistant
          </h1>
          <p className="text-[16px] font-normal text-[#f2f2f2] opacity-40 text-center tracking-[0.5px]">
            Finding Focus — Aug 2024
          </p>
        </div>
        <div className="relative z-10 w-full max-w-[882px] mx-auto px-6">
          <div className="w-full rounded-[24px] border border-[#252525] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={assets.accessingNodeAi} alt="Accessing Node AI" className="w-full" />
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(to bottom, transparent, #101010)' }}
        />
      </section>

      {/* ── Overview ────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center py-20">
        <div className="w-full max-w-[882px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-16 gap-y-10">
          {/* Left — meta */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[#f2f2f266]">My Role</p>
              <p className="text-[15px] font-normal leading-[165%] text-[#f2f2f2b3]">
                <span className="text-[#f2f2f2] font-medium">UX Lead</span>
                {' — '}Interaction Design, Visual Design, Information Architecture, User Flows, Prompt Engineering
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[#f2f2f266]">Team</p>
              <p className="text-[15px] font-normal leading-[175%] text-[#f2f2f2b3]">
                Mike Mrazek, PM<br />Thomas Kennedy, SWE
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[#f2f2f266]">Timeline</p>
              <p className="text-[15px] font-normal leading-[165%] text-[#f2f2f2b3]">
                <span className="text-[#f2f2f2] font-medium">2 Months</span> · Launched November 2024
              </p>
            </div>
          </div>
          {/* Right — overview */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[#f2f2f266] mb-3">Overview</p>
            <div className="flex flex-col gap-5">
              <p className="text-[15px] font-normal leading-[175%] text-[#f2f2f2b3]">
                With educational grants increasingly emphasizing AI integration, Finding Focus — an academic spin-off from UT Austin — needed to thoughtfully incorporate AI technology into their educational platform.
              </p>
              <p className="text-[15px] font-normal leading-[175%] text-[#f2f2f2b3]">
                Our experience showed that teachers who received direct support from our team had significantly higher implementation success rates. This insight led to the development of the Finding Focus AI Assistant — an LLM-powered support agent that provides on-demand guidance for educators at any moment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[882px] mx-auto px-6"><Divider /></div>

      {/* ════════════════════════════════════════════════════════════════
          CONTEXT
      ════════════════════════════════════════════════════════════════ */}
      <section className="flex flex-col items-center py-20">
        <div className="w-full max-w-[882px] mx-auto px-6">
          <Section
            eyebrow="Context"
            heading="Turning a grant requirement into an opportunity."
            body="Our most successful teachers shared one common thread — direct support from our team during implementation. With grant requirements pushing us toward AI, we recognized that an LLM-powered assistant could scale that hands-on guidance to every teacher on the platform."
          />
        </div>
      </section>

      <div className="w-full max-w-[882px] mx-auto px-6"><Divider /></div>

      {/* ════════════════════════════════════════════════════════════════
          THE PROBLEM
      ════════════════════════════════════════════════════════════════ */}
      <section className="flex flex-col items-center py-20">
        <div className="w-full max-w-[882px] mx-auto px-6 flex flex-col gap-16">

          <Section
            eyebrow="The Problem"
            heading="Not all chatbots are created equally."
            body="We wanted to create a virtual support agent that actually understood what teachers were asking — something traditional chatbots consistently fail at. Most rely on rigid decision trees that break the moment a user steps outside the predefined script."
          >
            {/* Challenge aside */}
            <Callout
              accentColor="rgba(255,214,10,0.7)"
              label="The Challenge"
              heading="Create a genuinely helpful assistant that answers teachers' real questions."
            />
          </Section>

          {/* Limitations */}
          <Section
            eyebrow="The Problem"
            heading="Three ways traditional chatbots let users down."
          >
            <div className="flex flex-col gap-[2px]">
              {[
                { title: 'Limited Responses', body: 'Reliance on decision trees creates a rigid conversational flow. When a user steps outside the predefined options, the chatbot stalls.' },
                { title: 'Lack of Contextual Understanding', body: 'They struggle to grasp the overall meaning or intent behind a message — especially when language is nuanced or open-ended.' },
                { title: 'Inefficient', body: 'Users end up messaging the support team directly, which defeats the purpose of having an automated assistant in the first place.' },
              ].map((item, i, arr) => {
                const radius = i === 0 ? 'rounded-[18px_18px_6px_6px]' : i === arr.length - 1 ? 'rounded-[6px_6px_18px_18px]' : 'rounded-[6px]';
                return (
                  <div key={item.title} className={`bg-[#f2f2f20a] ${radius} px-6 pt-6 pb-5 flex items-start gap-4`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f2f2f266] mt-2 flex-shrink-0" />
                    <p className="text-[15px] font-normal leading-[170%] text-[#f2f2f2b3]">
                      <span className="text-[#f2f2f2] font-medium">{item.title}. </span>
                      {item.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Typical chat interface figure */}
          <Section
            eyebrow="The Problem"
            heading="The standard chat interface teachers expected."
            body="Most users arrive with a mental model built from rule-based tools like Intercom or basic help widgets — systems that rarely handle anything outside their scripted paths."
          >
            <div className="flex flex-col gap-2">
              <div className="w-full rounded-[16px] overflow-hidden bg-[#1a1a1a] border border-[#252525] flex items-center justify-center py-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assets.typicalChatInterface} alt="Typical Chat Interface" className="max-w-[50%] h-auto object-contain rounded-lg" />
              </div>
              <MediaCaption figNum="1.0" caption="Typical chat interface" type="IMAGE" />
            </div>
          </Section>

          {/* Objectives */}
          <Section
            eyebrow="The Problem"
            heading="What we needed to build differently."
          >
            <div className="flex flex-col gap-3">
              {[
                { n: '01', label: 'Truly understand queries', desc: 'Create a support agent that can parse what teachers are actually asking, not just match keywords.' },
                { n: '02', label: 'Provide relevant responses', desc: 'Answer any question a teacher might have — without artificial limits on topic or complexity.' },
                { n: '03', label: 'Exceed expectations', desc: 'Set a new standard for what edtech virtual support can look like.' },
              ].map(obj => (
                <div key={obj.n} className="flex items-start gap-5 py-4 border-b border-[#f2f2f20d] last:border-0">
                  <span className="font-['JetBrains_Mono',monospace] text-[11px] text-[#f2f2f240] mt-0.5 flex-shrink-0">{obj.n}</span>
                  <div>
                    <p className="text-[15px] font-semibold text-[#f2f2f2] mb-1">{obj.label}</p>
                    <p className="text-[15px] font-normal leading-[165%] text-[#f2f2f2b3]">{obj.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

        </div>
      </section>

      <div className="w-full max-w-[882px] mx-auto px-6"><Divider /></div>

      {/* ════════════════════════════════════════════════════════════════
          RESEARCH
      ════════════════════════════════════════════════════════════════ */}
      <section className="flex flex-col items-center py-20">
        <div className="w-full max-w-[882px] mx-auto px-6 flex flex-col gap-20">

          {/* API approach */}
          <Section
            eyebrow="Research"
            heading="Finding the right brain for our product."
            body="Before anything else, we had to choose the core technology — the engine that would understand and respond to teacher requests. I narrowed it down to two fundamentally different approaches."
          >
            <div className="flex flex-col gap-3">
              <div className="bg-[#f2f2f20a] rounded-[16px] p-5 flex flex-col gap-1.5">
                <p className="text-[15px] font-semibold text-[#f2f2f2]">Rule Based NLU APIs</p>
                <p className="text-[14px] font-normal text-[#f2f2f2b3]">Dialogflow, Amazon Lex, Rasa</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ProConCard type="pro" items={['Fast', 'Accurate', 'Predictable', 'Cost Effective']} summary="Excel in well-defined interactions with predictable inputs — fast, accurate, and inexpensive." />
                <ProConCard type="con" items={['Robotic', 'Less Flexible', 'Knowledge Gaps', 'Context Blindness']} summary="Struggle with nuanced language and anything outside their scripted paths." />
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-2">
              <div className="bg-[#f2f2f20a] rounded-[16px] p-5 flex flex-col gap-1.5">
                <p className="text-[15px] font-semibold text-[#f2f2f2]">LLM APIs</p>
                <p className="text-[14px] font-normal text-[#f2f2f2b3]">Open AI (GPT), Anthropic (Claude), Gemini</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ProConCard type="pro" items={['Versatile', 'Generative', 'Contextually Aware', 'Natural Conversation']} summary="Generates dynamic, human-like responses that adapt to a wide range of queries." />
                <ProConCard type="con" items={['Cost', 'Less Control', 'Hallucinations', 'High Maintenance']} summary="Requires investment in cost and maintenance, with less predictability over outputs." />
              </div>
            </div>
          </Section>

          {/* Winner */}
          <Section
            eyebrow="Research"
            heading="LLM APIs won on every dimension that mattered."
            body="For Finding Focus, the ability to understand novel questions and respond naturally far outweighed the drawbacks. We went with OpenAI's Assistants API."
          >
            <Callout
              accentColor="rgb(39,180,255)"
              label="The Winning Choice"
              heading="OpenAI Assistants API"
              body="Its ability to truly understand user queries, ground responses in our knowledge base, and hold context across a conversation made it the clear choice for a teacher support tool."
            />
          </Section>

          {/* Competitive analysis */}
          <Section
            eyebrow="Research"
            heading="Learning from the best LLM chat experiences."
            body="I analyzed Gemini, Claude, Meta AI, and ChatGPT — focusing on three specific behaviors that would most directly influence how we designed ours."
          >
            {/* Carousel */}
            <div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => goToSlide(carouselIndex === 0 ? totalSlides - 1 : carouselIndex - 1)}
                  className="w-10 h-10 flex-shrink-0 rounded-full border border-[#f2f2f21a] flex items-center justify-center hover:bg-[#f2f2f20d] transition-colors"
                >
                  <ChevronLeft size={18} className="text-[#f2f2f2]" />
                </button>

                <div className="overflow-hidden flex-1">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                  >

                    {/* Slide 1 */}
                    <div className="w-full flex-shrink-0 pt-5">
                      <div className="relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                          <NumberSticker number={1} />
                        </div>
                        <div className="bg-[#f2f2f20a] rounded-[16px] border border-[#252525] overflow-hidden">
                          <div className="px-6 pt-10 pb-5">
                            <div className="flex items-center gap-3 mb-2">
                              <SmsIcon sx={{ fontSize: 24, color: '#f2f2f266' }} />
                              <h3 className="text-[17px] font-semibold text-[#f2f2f2]">Text Output Behavior</h3>
                            </div>
                            <p className="text-[15px] font-normal leading-[165%] text-[#f2f2f2b3]">
                              How text appears in messages — letter-by-letter, word-by-word, or all at once. Pacing shapes how responsive and alive the AI feels.
                            </p>
                          </div>
                          <div className="mx-6 h-px bg-[#f2f2f21a]" />
                          <div className="px-6 py-5">
                            <div className="grid grid-cols-2 gap-4">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={assets.chatgptTextOutput} alt="ChatGPT" className="w-full rounded-[10px] border border-[#252525]" />
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={assets.geminiTextOutput} alt="Gemini" className="w-full rounded-[10px] border border-[#252525]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <p className="text-[13px] font-semibold text-[#f2f2f2]">ChatGPT</p>
                                <p className="text-[13px] font-normal leading-[155%] text-[#f2f2f2b3]">Streams text letter-by-letter with a dot cursor.</p>
                              </div>
                              <div>
                                <p className="text-[13px] font-semibold text-[#f2f2f2]">Gemini</p>
                                <p className="text-[13px] font-normal leading-[155%] text-[#f2f2f2b3]">Renders almost instantaneously using a text skeleton.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Slide 2 */}
                    <div className="w-full flex-shrink-0 pt-5">
                      <div className="relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                          <NumberSticker number={2} />
                        </div>
                        <div className="bg-[#f2f2f20a] rounded-[16px] border border-[#252525] overflow-hidden">
                          <div className="px-6 pt-10 pb-5">
                            <div className="flex items-center gap-3 mb-2">
                              <ForumIcon sx={{ fontSize: 24, color: '#f2f2f266' }} />
                              <h3 className="text-[17px] font-semibold text-[#f2f2f2]">Message Structure and Layout</h3>
                            </div>
                            <p className="text-[15px] font-normal leading-[165%] text-[#f2f2f2b3]">
                              How user and AI messages are visually differentiated. Clear hierarchy lets teachers follow the conversation without cognitive effort.
                            </p>
                          </div>
                          <div className="mx-6 h-px bg-[#f2f2f21a]" />
                          <div className="px-6 py-5">
                            <div className="grid grid-cols-2 gap-4">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={assets.geminiLayout} alt="Gemini" className="w-full rounded-[10px] border border-[#252525]" />
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={assets.metaAiLayout} alt="Meta AI" className="w-full rounded-[10px] border border-[#252525]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <p className="text-[13px] font-semibold text-[#f2f2f2]">Gemini</p>
                                <p className="text-[13px] font-normal leading-[155%] text-[#f2f2f2b3]">Both messages left-aligned, icons as the only differentiator.</p>
                              </div>
                              <div>
                                <p className="text-[13px] font-semibold text-[#f2f2f2]">Meta AI</p>
                                <p className="text-[13px] font-normal leading-[155%] text-[#f2f2f2b3]">User messages bubble right; AI responses appear left.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Slide 3 */}
                    <div className="w-full flex-shrink-0 pt-5">
                      <div className="relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                          <NumberSticker number={3} />
                        </div>
                        <div className="bg-[#f2f2f20a] rounded-[16px] border border-[#252525] overflow-hidden">
                          <div className="px-6 pt-10 pb-5">
                            <div className="flex items-center gap-3 mb-2">
                              <VerticalAlignTopIcon sx={{ fontSize: 24, color: '#f2f2f266' }} />
                              <h3 className="text-[17px] font-semibold text-[#f2f2f2]">Dynamic Page Behavior</h3>
                            </div>
                            <p className="text-[15px] font-normal leading-[165%] text-[#f2f2f2b3]">
                              How the interface adapts when new messages arrive. Smooth, predictable behavior keeps users from losing their place mid-read.
                            </p>
                          </div>
                          <div className="mx-6 h-px bg-[#f2f2f21a]" />
                          <div className="px-6 py-5">
                            <div className="grid grid-cols-2 gap-4">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={assets.claudePageBehavior} alt="Claude" className="w-full rounded-[10px] border border-[#252525]" />
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={assets.geminiPageBehavior} alt="Gemini" className="w-full rounded-[10px] border border-[#252525]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <p className="text-[13px] font-semibold text-[#f2f2f2]">Claude</p>
                                <p className="text-[13px] font-normal leading-[155%] text-[#f2f2f2b3]">Content shifts upward as text streams in — disorienting mid-read.</p>
                              </div>
                              <div>
                                <p className="text-[13px] font-semibold text-[#f2f2f2]">Gemini</p>
                                <p className="text-[13px] font-normal leading-[155%] text-[#f2f2f2b3]">Each exchange gets its own fixed section — stable and easy to follow.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <button
                  onClick={() => goToSlide(carouselIndex === totalSlides - 1 ? 0 : carouselIndex + 1)}
                  className="w-10 h-10 flex-shrink-0 rounded-full border border-[#f2f2f21a] flex items-center justify-center hover:bg-[#f2f2f20d] transition-colors"
                >
                  <ChevronRight size={18} className="text-[#f2f2f2]" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-3 mt-4">
                {[0, 1, 2].map(i => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`rounded-full transition-all ${carouselIndex === i ? 'w-3 h-3 bg-[#f2f2f2]' : 'w-2 h-2 bg-[#f2f2f233] hover:bg-[#f2f2f266]'}`}
                  />
                ))}
              </div>
            </div>
          </Section>

          {/* Insights */}
          <Section
            eyebrow="Research"
            heading="Three things we decided to get right."
            body="Our competitive analysis turned into three concrete design requirements — not vague principles, but specific behaviors to build."
          >
            <div className="flex flex-col gap-3">
              <InsightCard
                icon={<StreamIcon sx={{ fontSize: 28, color: '#f2f2f266' }} />}
                heading="Text streaming enables faster perceived response times."
                body="Streaming text letter-by-letter gives users feedback immediately rather than waiting for the full response to generate."
                requirement="→ Implement letter-by-letter streaming"
              />
              <InsightCard
                icon={<PsychologyIcon sx={{ fontSize: 28, color: '#f2f2f266' }} />}
                heading="Familiar message structure reduces cognitive load."
                body="Left/right bubble layouts follow conventions teachers already know from iMessage and WhatsApp — no learning curve for who said what."
                requirement="→ Distinct styling for user vs. AI messages"
              />
              <InsightCard
                icon={<ArticleIcon sx={{ fontSize: 28, color: '#f2f2f266' }} />}
                heading="Fixed message sections prevent reading disruption."
                body="Anchoring each exchange in its own section keeps the page stable while text streams in — unlike layouts that push content upward."
                requirement="→ Anchor each exchange in a fixed container, no auto-scroll during generation"
              />
            </div>
          </Section>

        </div>
      </section>

      <div className="w-full max-w-[882px] mx-auto px-6"><Divider /></div>

      {/* ════════════════════════════════════════════════════════════════
          DESIGN
      ════════════════════════════════════════════════════════════════ */}
      <section className="flex flex-col items-center py-20">
        <div className="w-full max-w-[882px] mx-auto px-6 flex flex-col gap-20">

          <Section
            eyebrow="Design"
            heading="Making key decisions with teachers in mind."
            body="With clear principles from research, I worked through three interface decisions that would define how teachers encounter, open, and start using the assistant."
          />

          {/* Decision 1 */}
          <Section
            eyebrow="Design Decision"
            heading="Where should teachers access the assistant?"
            body="The assistant needed to feel ever-present — available without interrupting teachers' primary workflows. A persistent entry point in the main nav made it always visible without stealing focus."
          >
            <div className="flex flex-col gap-3">
              <div className="inline-flex self-start items-center gap-2 bg-[rgba(39,180,255,0.08)] border border-[rgba(39,180,255,0.2)] rounded-full px-4 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[rgb(39,180,255)]" />
                <span className="text-[13px] font-medium text-[rgb(39,180,255)]">Persistent entry point in the main nav</span>
              </div>
              <div className="flex flex-col gap-2 mt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assets.alwaysVisible} alt="Always-visible assistant entry" className="w-full rounded-[16px] border border-[#252525]" />
                <MediaCaption figNum="3.1" caption="Always-visible assistant entry point" type="VIDEO LOOP" />
              </div>
            </div>
          </Section>

          {/* Decision 2 */}
          <Section
            eyebrow="Design Decision"
            heading="Modal overlay or integrated panel?"
            body="A full-screen modal would have interrupted whatever the teacher was doing. A slide-out panel lets the assistant live alongside the page content — teachers can reference what they're looking at while they ask a question."
          >
            <div className="flex flex-col gap-3">
              <div className="inline-flex self-start items-center gap-2 bg-[rgba(39,180,255,0.08)] border border-[rgba(39,180,255,0.2)] rounded-full px-4 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[rgb(39,180,255)]" />
                <span className="text-[13px] font-medium text-[rgb(39,180,255)]">Slide-out panel anchored to the right edge</span>
              </div>
              <div className="flex flex-col gap-2 mt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assets.openingChatInterface} alt="Opening the chat interface" className="w-full rounded-[16px] border border-[#252525]" />
                <MediaCaption figNum="3.2" caption="Opening the chat interface" type="VIDEO LOOP" />
              </div>
            </div>
          </Section>

          {/* Decision 3 */}
          <Section
            eyebrow="Design Decision"
            heading="What should an empty chat look like?"
            body="Blank input boxes feel like a test. For teachers who may be unfamiliar with AI tools, an empty state that greets them and surfaces four curated questions immediately communicates capability and lowers the barrier to that first message."
          >
            <div className="flex flex-col gap-3">
              <div className="inline-flex self-start items-center gap-2 bg-[rgba(39,180,255,0.08)] border border-[rgba(39,180,255,0.2)] rounded-full px-4 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[rgb(39,180,255)]" />
                <span className="text-[13px] font-medium text-[rgb(39,180,255)]">Greeting + 4 curated suggested questions</span>
              </div>
              <div className="flex flex-col gap-2 mt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assets.emptyStateExample} alt="Empty state with suggested prompts" className="w-full rounded-[16px] border border-[#252525]" />
                <MediaCaption figNum="3.3" caption="Empty state with example prompts" type="VIDEO LOOP" />
              </div>
            </div>
          </Section>

        </div>
      </section>

      <div className="w-full max-w-[882px] mx-auto px-6"><Divider /></div>

      {/* ════════════════════════════════════════════════════════════════
          FINAL PRODUCT
      ════════════════════════════════════════════════════════════════ */}
      <section className="flex flex-col items-center py-20">
        <div className="w-full max-w-[882px] mx-auto px-6 flex flex-col gap-16">

          <Section
            eyebrow="Final Product"
            heading="An assistant teachers actually want to use."
            body="Launched November 2024. Early feedback has been overwhelmingly positive — teachers highlighted the immediacy of responses and how much it felt like talking to a knowledgeable colleague rather than a help widget."
          />

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assets.streamingInText} alt="Text streaming" className="w-full rounded-[16px] border border-[#252525]" />
              <MediaCaption figNum="4.1" caption="Real-time text streaming" type="VIDEO LOOP" />
            </div>
            <div className="flex flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assets.newSpace} alt="New conversation" className="w-full rounded-[16px] border border-[#252525]" />
              <MediaCaption figNum="4.2" caption="Starting a new conversation" type="VIDEO LOOP" />
            </div>
          </div>

        </div>
      </section>

      <div className="w-full max-w-[882px] mx-auto px-6"><Divider /></div>

      {/* ════════════════════════════════════════════════════════════════
          REFLECTION
      ════════════════════════════════════════════════════════════════ */}
      <section className="flex flex-col items-center py-20">
        <div className="w-full max-w-[882px] mx-auto px-6 flex flex-col gap-12">

          <Section
            eyebrow="Reflection"
            heading="What I took away from this project."
          />

          <div className="flex flex-col gap-[2px]">
            {[
              {
                title: 'The best AI experiences feel invisible.',
                body: 'Teachers care about getting a fast, relevant answer — not the technology behind it. Every decision I made was in service of removing friction between their question and a useful response.',
              },
              {
                title: 'Competitive analysis is most useful when it\'s specific.',
                body: 'Looking at ChatGPT and Gemini broadly would have produced generic conclusions. Narrowing to three specific behaviors gave me concrete design requirements rather than vague inspiration.',
              },
              {
                title: 'Grant requirements can be a gift in disguise.',
                body: 'What started as a compliance checkbox turned into one of the most impactful features we shipped. The constraint forced us to explore AI earlier than we might have — and the result genuinely improved teacher outcomes.',
              },
            ].map((item, i, arr) => {
              const radius = i === 0 ? 'rounded-[18px_18px_6px_6px]' : i === arr.length - 1 ? 'rounded-[6px_6px_18px_18px]' : 'rounded-[6px]';
              return (
                <div key={item.title} className={`bg-[#f2f2f20a] ${radius} px-6 pt-6 pb-5 flex items-start gap-4`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f2f2f266] mt-2 flex-shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[15px] font-semibold text-[#f2f2f2]">{item.title}</p>
                    <p className="text-[15px] font-normal leading-[170%] text-[#f2f2f2b3]">{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      <div className="h-20" />
    </div>
  );
}
