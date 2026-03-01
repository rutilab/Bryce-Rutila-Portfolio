'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SmsIcon from '@mui/icons-material/Sms';
import ForumIcon from '@mui/icons-material/Forum';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import StreamIcon from '@mui/icons-material/Stream';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ArticleIcon from '@mui/icons-material/Article';
import PlaceIcon from '@mui/icons-material/Place';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import InboxIcon from '@mui/icons-material/Inbox';

// ─── Assets ──────────────────────────────────────────────────────────────────
const assets = {
  highlightsIcon: '/case-studies/node-ai/highlights-icon.png',
  accessingNodeAi: '/case-studies/node-ai/accessing-node-ai.gif',
  uiComponents: '/case-studies/node-ai/ui-components.png',
  typicalChatInterface: '/case-studies/node-ai/typical-chat-interface.png',
  challengeIcon: '/case-studies/node-ai/challenge-icon.png',
  chatgptTextOutput: '/case-studies/node-ai/chatgpt-text-output.gif',
  geminiTextOutput: '/case-studies/node-ai/gemini-text-output.gif',
  geminiLayout: '/case-studies/node-ai/gemini-layout.png',
  metaAiLayout: '/case-studies/node-ai/meta-ai-layout.png',
  claudePageBehavior: '/case-studies/node-ai/claude-page-behavior.gif',
  geminiPageBehavior: '/case-studies/node-ai/gemini-page-behavior.gif',
  winningChoiceIcon: '/case-studies/node-ai/The-Winning-Choice.png',
};

// ─── Number Sticker ───────────────────────────────────────────────────────────
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
  const filterId = `v2_filter_${number}`;
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

// ─── Shared Primitives ────────────────────────────────────────────────────────

function SectionOverline({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-[#f2f2f2] opacity-40" />
      <span className="font-inter text-[11px] font-medium tracking-[1.5px] text-[#f2f2f266] uppercase">{label}</span>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center justify-center py-0">
      <div className="w-full h-px bg-[#f2f2f233]" />
    </div>
  );
}

/** A top-edge glare line inside a callout card */
function GlareTop({ color }: { color: string }) {
  return (
    <div
      className="absolute top-0 left-0 right-0 h-px pointer-events-none"
      style={{ background: `linear-gradient(to right, transparent 10%, ${color} 50%, transparent 90%)` }}
    />
  );
}

function MediaCaption({
  figNum,
  caption,
  type,
}: {
  figNum: string;
  caption: string;
  type: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2 mt-2 pl-4">
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

function ConstraintItem({
  children,
  position,
}: {
  children: React.ReactNode;
  position: 'top' | 'middle' | 'bottom';
}) {
  const radius =
    position === 'top'
      ? 'rounded-[24px_24px_6px_6px]'
      : position === 'bottom'
      ? 'rounded-[6px_6px_24px_24px]'
      : 'rounded-[6px]';
  return (
    <div className={`bg-[#f2f2f20a] ${radius} px-6 pt-[26px] pb-6 flex items-start gap-4`}>
      <div className="w-1.5 h-1.5 rounded-full bg-[#f2f2f266] mt-2 flex-shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  );
}

function CalloutCard({
  gradient,
  glareColor,
  overline,
  iconSrc,
  heading,
  children,
}: {
  gradient: string;
  glareColor: string;
  overline: string;
  iconSrc?: string;
  heading: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="relative rounded-[24px] flex flex-col items-center text-center px-8 pt-9 pb-8 gap-4 overflow-hidden"
      style={{
        backgroundColor: '#f2f2f20a',
        backgroundImage: `radial-gradient(circle at 50% 0, ${gradient}, transparent 60%)`,
      }}
    >
      <GlareTop color={glareColor} />
      {iconSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={iconSrc} alt="" className="w-16 h-16 rounded-full object-cover" />
      )}
      <span className="text-[11px] font-medium tracking-[1.5px] text-[#f2f2f266] uppercase">{overline}</span>
      <h2 className="text-[24px] font-medium leading-[140%] tracking-[0.2px] text-[#f2f2f2] max-w-[740px]">{heading}</h2>
      {children}
    </div>
  );
}

function InlineCard({ icon, heading, children }: { icon: React.ReactNode; heading: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#101010] border border-[#252525] rounded-[16px] p-6 flex flex-col gap-5 shadow-[0_15px_40px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-3">
        {icon}
        <h4 className="text-[20px] font-medium leading-[125%] text-[#f2f2f2]">{heading}</h4>
      </div>
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NodeAIAssistantV2() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const totalSlides = 3;
  const goToSlide = (i: number) => setCarouselIndex(Math.max(0, Math.min(i, totalSlides - 1)));

  const [designCarouselIndex, setDesignCarouselIndex] = useState(0);
  const totalDesignSlides = 3;
  const goToDesignSlide = (i: number) => setDesignCarouselIndex(Math.max(0, Math.min(i, totalDesignSlides - 1)));

  return (
    <div className="min-h-screen bg-[#101010] text-[#f2f2f2]">

      {/* ── Banner ─────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center overflow-hidden pt-[104px] pb-0"
        style={{ backgroundImage: 'radial-gradient(circle farthest-side at 50% 0, rgba(39,180,255,0.35), transparent)' }}
      >
        {/* Top glare */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent 5%, rgba(255,255,255,0.8) 35%, #fff 50%, rgba(255,255,255,0.8) 65%, transparent 95%)' }}
        />
        <div className="relative z-10 w-full max-w-[882px] mx-auto px-6 flex flex-col items-center gap-4 mb-16">
          <h1
            className="text-[64px] font-medium leading-[72px] tracking-[-1px] text-center"
            style={{
              backgroundImage: 'linear-gradient(to bottom, #f2f2f2 50%, transparent)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
            }}
          >
            Node AI Assistant
          </h1>
          <p className="text-[18px] font-normal text-[#f2f2f2] opacity-50 text-center">
            Finding Focus — Aug 2024
          </p>
        </div>
        {/* Hero image */}
        <div className="relative z-10 w-full max-w-[882px] mx-auto px-6">
          <div className="w-full aspect-[882/588] bg-[#1a1a1a] rounded-[24px] border border-[#252525]" />
        </div>
        {/* Fade out gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-60 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(to bottom, transparent, #101010)' }}
        />
      </section>

      {/* ── Overview ────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center py-[104px]">
        <div className="w-full max-w-[882px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {/* Left */}
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-medium tracking-[0.2px] text-[#f2f2f2] opacity-60">My Role</p>
              <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                <span className="text-[#f2f2f2e6] font-normal">UX Lead</span>
                {' — '}Interaction Design, Visual Design, Information Architecture, User Flows, Prompt Engineering, Knowledge Base Management
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-medium tracking-[0.2px] text-[#f2f2f2] opacity-60">Team</p>
              <p className="text-[16px] font-light leading-[180%] tracking-[0.4px] text-[#f2f2f299]">
                Mike Mrazek, PM<br />
                Thomas Kennedy, SWE
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-medium tracking-[0.2px] text-[#f2f2f2] opacity-60">Timeline &amp; Status</p>
              <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                <span className="text-[#f2f2f2e6] font-normal">2 Months,</span>{' '}
                <span className="text-[#f2f2f2e6] font-normal">Launched November 2024</span>
              </p>
            </div>
          </div>
          {/* Right */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium tracking-[0.2px] text-[#f2f2f2] opacity-60">Overview</p>
            <div className="flex flex-col gap-6 mt-2">
              <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                With educational grants increasingly emphasizing AI integration, Finding Focus — an academic spin-off from UT Austin — needed to thoughtfully incorporate AI technology into their educational platform.
              </p>
              <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                Our experience showed that teachers who received direct support from our team had significantly higher implementation success rates. This insight led to the development of the Finding Focus AI Assistant, an LLM-powered support agent that provides on-demand support for educators.
              </p>
              <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                Early feedback from our teacher community has been overwhelmingly positive, with users highlighting the assistant&apos;s ability to provide immediate, personalized support — effectively scaling our team&apos;s hands-on approach to implementation guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Highlights ──────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center pb-[120px]">
        <div className="w-full max-w-[882px] mx-auto px-6">
          <div
            className="relative rounded-[24px] flex flex-col items-center py-12 px-6 gap-12 shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden"
            style={{
              backgroundColor: 'rgba(242,242,242,0.04)',
              backgroundImage: 'radial-gradient(circle closest-corner at 50% 0, rgba(100,210,255,0.05), transparent)',
            }}
          >
            <GlareTop color="rgba(100,210,255,0.5)" />

            {/* Header */}
            <div className="flex flex-col items-center gap-6 text-center px-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assets.highlightsIcon} alt="" className="w-16 h-16 rounded-full object-cover" />
              <span className="text-[11px] font-medium tracking-[1.5px] text-[#f2f2f266] uppercase">Highlights</span>
              <p className="text-[24px] font-medium leading-[140%] tracking-[0.2px] text-[#f2f2f2] max-w-[680px]">
                A quick, accessible way for teachers to ask questions, troubleshoot, or just have a conversation about anything related to Finding Focus.
              </p>
            </div>

            {/* Media */}
            <div className="flex flex-col gap-8 w-full">
              {/* 0.1 */}
              <div className="flex flex-col gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assets.accessingNodeAi} alt="Accessing Node AI" className="w-full rounded-[16px] border border-[#252525]" />
                <MediaCaption figNum="0.1" caption="Accessing Node AI" type="VIDEO LOOP" />
              </div>
              {/* 0.2 */}
              <div className="flex flex-col gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assets.uiComponents} alt="UI Components" className="w-full rounded-[16px] border border-[#252525]" />
                <MediaCaption figNum="0.2" caption="Sample UI components" type="IMAGE" />
              </div>
              {/* 0.3 */}
              <div className="flex flex-col gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assets.uiComponents} alt="Mobile Designs" className="w-full rounded-[16px] border border-[#252525]" />
                <MediaCaption figNum="0.3" caption="Mobile designs" type="IMAGE" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[882px] mx-auto px-6">
        <Divider />
      </div>

      {/* ── Context ─────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center py-[120px]">
        <div className="w-full max-w-[882px] mx-auto px-6 flex flex-col gap-20">
          {/* Section start */}
          <div className="flex flex-col gap-20">
            <div className="flex flex-col gap-10">
              <SectionOverline label="Context" />
              <h1 className="text-[40px] font-medium leading-[125%] tracking-[-0.1px] text-[#f2f2f2]">
                Turning a grant requirement into an opportunity to provide personalized support.
              </h1>
            </div>

            {/* Double column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 items-baseline">
              <h3 className="text-[24px] font-medium leading-[125%] tracking-[0.1px] text-[#f2f2f2] pr-6">
                Helping our teachers was the main priority
              </h3>
              <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                Our most successful teachers shared one common thread — direct support from our team during implementation. With grant requirements pushing us toward AI integration, we recognized that an LLM-powered assistant could be a great way to provide hands-on support for every teacher.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[882px] mx-auto px-6">
        <Divider />
      </div>

      {/* ── The Problem ─────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center py-[120px]">
        <div className="w-full max-w-[882px] mx-auto px-6 flex flex-col gap-20">

          {/* Section start */}
          <div className="flex flex-col gap-10">
            <SectionOverline label="The Problem" />
            <h1 className="text-[40px] font-medium leading-[125%] tracking-[-0.1px] text-[#f2f2f2]">
              Not all chatbots are created equally.
            </h1>
          </div>

          {/* Double column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 items-baseline">
            <h3 className="text-[24px] font-medium leading-[125%] tracking-[0.1px] text-[#f2f2f2] pr-6">
              Most users have a negative connotation of &ldquo;chatbots&rdquo;
            </h3>
            <div className="flex flex-col gap-6">
              <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                We wanted to create a virtual support agent that was actually helpful and answered users&apos; novel questions, something that traditional chatbots don&apos;t typically succeed at.
              </p>
              <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                Traditional chatbots often fail at providing adequate support because they have rudimentary NLP and rely heavily on decision trees. When users send a message outside the chatbot&apos;s repertoire, the conversation stalls. Traditional chatbots lack the ability to &ldquo;understand&rdquo; user requests.
              </p>
            </div>
          </div>

          {/* Constraint list */}
          <div className="flex flex-col gap-2">
            <p className="text-[16px] font-medium text-[#f2f2f2] opacity-60 mb-4">Limitations of traditional chatbots:</p>
            <div className="flex flex-col gap-[2px]">
              <ConstraintItem position="top">
                <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                  <span className="text-[#f2f2f2e6] font-normal">Limited Responses.</span>{' '}
                  Reliance on decision trees creates a rigid conversational flow. If a user&apos;s input doesn&apos;t fit the pre-defined options, the chatbot often gets stuck or provides unhelpful responses.
                </p>
              </ConstraintItem>
              <ConstraintItem position="middle">
                <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                  <span className="text-[#f2f2f2e6] font-normal">Lack of Contextual Understanding.</span>{' '}
                  They struggle to grasp the overall meaning or intent behind a user&apos;s message, especially when the language is complex or not straightforward.
                </p>
              </ConstraintItem>
              <ConstraintItem position="bottom">
                <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                  <span className="text-[#f2f2f2e6] font-normal">Inefficient.</span>{' '}
                  Users may end up resorting to other options, like messaging the support team directly, which can be time-consuming for users and companies alike.
                </p>
              </ConstraintItem>
            </div>
          </div>

          {/* Figure 2.0 */}
          <div className="flex flex-col gap-2">
            <div className="w-full rounded-[16px] overflow-hidden bg-[#1a1a1a] border border-[#252525] flex items-center justify-center py-20 aspect-[125/93]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assets.typicalChatInterface} alt="Typical Chat Interface" className="max-w-[50%] h-auto object-contain rounded-lg" />
            </div>
            <MediaCaption figNum="2.0" caption="Typical Chat Interface" type="IMAGE" />
          </div>

          {/* Challenge callout */}
          <CalloutCard
            gradient="rgba(255,214,10,0.05)"
            glareColor="rgba(255,214,10,0.6)"
            iconSrc={assets.challengeIcon}
            overline="The Challenge"
            heading="Create a genuinely helpful assistant that provides relevant answers to teachers' questions."
          />

          {/* Objectives */}
          <div className="flex flex-col gap-6">
            <p className="text-[16px] font-medium text-[#f2f2f2] opacity-60">Project Objectives:</p>
            <div className="flex flex-col gap-4">
              <InlineCard
                icon={<span className="text-2xl">✦</span>}
                heading="Truly Understand Queries"
              >
                <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                  Create a virtual support agent that is able to understand what users are asking.
                </p>
              </InlineCard>
              <InlineCard
                icon={<span className="text-2xl">◎</span>}
                heading="Provide Relevant Responses"
              >
                <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                  Provide teachers with answers to any question they might have — without limiting the responses.
                </p>
              </InlineCard>
              <InlineCard
                icon={<span className="text-2xl">◈</span>}
                heading="Exceed Teacher Expectations"
              >
                <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                  Create an experience that sets the standard for Edtech virtual support agents.
                </p>
              </InlineCard>
            </div>
          </div>

          {/* Figure 2.1 */}
          <div className="flex flex-col gap-2">
            <div className="w-full aspect-[125/93] rounded-[16px] bg-[#1a1a1a] border border-[#252525]" />
            <MediaCaption figNum="2.1" caption="Project Timeline" type="IMAGE" />
          </div>

        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[882px] mx-auto px-6">
        <Divider />
      </div>

      {/* ── Research Phase ──────────────────────────────────────────────── */}
      <section className="flex flex-col items-center py-[120px]">
        <div className="w-full max-w-[882px] mx-auto px-6 flex flex-col gap-20">

          {/* Section start */}
          <div className="flex flex-col gap-10">
            <SectionOverline label="Research Phase" />
            <h1 className="text-[40px] font-medium leading-[125%] tracking-[-0.1px] text-[#f2f2f2]">
              Understanding the landscape.
            </h1>
          </div>

          {/* Double column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 items-baseline">
            <h3 className="text-[24px] font-medium leading-[125%] tracking-[0.1px] text-[#f2f2f2] pr-6">
              Doing a deep dive into our API options
            </h3>
            <div className="flex flex-col gap-6">
              <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                Before anything else, Finding Focus had to decide on the &lsquo;brain&rsquo; of our chat interface — the core technology that would enable it to understand and respond to user requests.
              </p>
              <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                After researching the topic, I found two main approaches:
              </p>
              <div className="flex flex-col gap-4 pl-4 border-l border-[#f2f2f21a]">
                <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                  <span className="text-[#f2f2f2e6] font-normal">1. Rule-based system with basic NLU techniques:</span>{' '}
                  Uses predefined rules, keywords, and decision trees to process and respond to user input.
                </p>
                <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                  <span className="text-[#f2f2f2e6] font-normal">2. Large Language Model (LLM):</span>{' '}
                  Leverages advanced AI models trained on vast amounts of text data to understand context, generate human-like responses, and handle a wide range of queries without predefined rules.
                </p>
              </div>
            </div>
          </div>

          {/* API Comparison — Rule-based NLU */}
          <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="bg-[#f2f2f20a] rounded-[16px] p-6 flex flex-col gap-3">
              <p className="text-[20px] font-medium leading-[125%] text-[#f2f2f2]">Rule Based NLU APIs</p>
              <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                <span className="text-[#f2f2f2e6] font-normal">Popular Options:</span>{' '}Dialogflow, Amazon Lex, Rasa
              </p>
            </div>
            {/* Pros / Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-[16px] p-6 flex flex-col gap-4" style={{ backgroundColor: 'rgba(13,186,79,0.07)' }}>
                <p className="text-[20px] font-medium text-[#f2f2f2]">Pros</p>
                <div className="flex flex-col gap-2">
                  {['Fast', 'Accurate', 'Predictable', 'Cost Effective'].map(label => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgba(13,186,79,0.8)]" />
                      <span className="text-[16px] font-medium text-[#f2f2f2]">{label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[14px] font-light leading-[150%] text-[#f2f2f299]">
                  Excel in situations with well-defined interactions and predictable user inputs, offering a fast, accurate, and cost-effective solution.
                </p>
              </div>
              <div className="rounded-[16px] p-6 flex flex-col gap-4" style={{ backgroundColor: 'rgba(255,61,61,0.07)' }}>
                <p className="text-[20px] font-medium text-[#f2f2f2]">Cons</p>
                <div className="flex flex-col gap-2">
                  {['Robotic', 'Less Flexible', 'Knowledge Gaps', 'Context Blindness'].map(label => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgba(255,61,61,0.8)]" />
                      <span className="text-[16px] font-medium text-[#f2f2f2]">{label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[14px] font-light leading-[150%] text-[#f2f2f299]">
                  Struggles with understanding nuanced language, adapting to unexpected situations, and handling complex or open-ended interactions.
                </p>
              </div>
            </div>
          </div>

          {/* API Comparison — LLM */}
          <div className="flex flex-col gap-3">
            <div className="bg-[#f2f2f20a] rounded-[16px] p-6 flex flex-col gap-3">
              <p className="text-[20px] font-medium leading-[125%] text-[#f2f2f2]">LLM APIs</p>
              <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                <span className="text-[#f2f2f2e6] font-normal">Popular Options:</span>{' '}Open AI (GPT), Anthropic (Claude), Gemini
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-[16px] p-6 flex flex-col gap-4" style={{ backgroundColor: 'rgba(13,186,79,0.07)' }}>
                <p className="text-[20px] font-medium text-[#f2f2f2]">Pros</p>
                <div className="flex flex-col gap-2">
                  {['Versatile', 'Generative', 'Contextually Aware', 'Natural Conversation'].map(label => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgba(13,186,79,0.8)]" />
                      <span className="text-[16px] font-medium text-[#f2f2f2]">{label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[14px] font-light leading-[150%] text-[#f2f2f299]">
                  Provides dynamic, human-like interactions by generating contextually aware responses that can adapt to a wide range of user queries.
                </p>
              </div>
              <div className="rounded-[16px] p-6 flex flex-col gap-4" style={{ backgroundColor: 'rgba(255,61,61,0.07)' }}>
                <p className="text-[20px] font-medium text-[#f2f2f2]">Cons</p>
                <div className="flex flex-col gap-2">
                  {['Cost', 'Less Control', 'Hallucinations', 'High Maintenance'].map(label => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgba(255,61,61,0.8)]" />
                      <span className="text-[16px] font-medium text-[#f2f2f2]">{label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[14px] font-light leading-[150%] text-[#f2f2f299]">
                  Require investment in both cost and maintenance, while offering less direct control over responses and potentially generating inaccurate information.
                </p>
              </div>
            </div>
          </div>

          {/* Winning choice */}
          <CalloutCard
            gradient="rgba(39,180,255,0.06)"
            glareColor="rgba(39,180,255,0.5)"
            iconSrc={assets.winningChoiceIcon}
            overline="The Winning Choice"
            heading="LLM Powered API"
          >
            <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299] max-w-[640px]">
              For our team, an LLM-powered API was exactly what we were looking for due to its ability to truly understand user queries and respond naturally with relevant information. We decided to use the Assistant&apos;s API from Open AI.
            </p>
          </CalloutCard>

          {/* Learning from existing experiences */}
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 items-baseline">
              <h3 className="text-[24px] font-medium leading-[125%] tracking-[0.1px] text-[#f2f2f2] pr-6">
                Learning from existing experiences
              </h3>
              <div className="flex flex-col gap-6">
                <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                  I conducted a comprehensive comparative analysis of leading LLM chat interfaces:{' '}
                  <span className="text-[#f2f2f2e6] font-normal">Gemini, Claude, Meta AI, and ChatGPT.</span>
                </p>
                <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                  I focused on <span className="text-[#f2f2f2e6] font-normal">three key areas</span> to inform our design:
                </p>
              </div>
            </div>

            {/* Competitive analysis carousel */}
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
                    {/* Slide 1: Text Output */}
                    <div className="w-full flex-shrink-0 pt-5">
                      <div className="relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                          <NumberSticker number={1} />
                        </div>
                        <div className="bg-[#f2f2f20a] rounded-[16px] border border-[#252525] overflow-hidden">
                          <div className="px-6 pt-10 pb-5">
                            <div className="flex items-center gap-3 mb-3">
                              <SmsIcon sx={{ fontSize: 28, color: '#f2f2f266' }} />
                              <h3 className="text-[20px] font-medium leading-[125%] text-[#f2f2f2]">Text Output Behavior</h3>
                            </div>
                            <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                              How text is displayed in messages (e.g., letter-by-letter, word-by-word, or all at once).
                            </p>
                          </div>
                          <div className="mx-6 h-px bg-[#f2f2f21a]" />
                          <div className="px-6 py-5">
                            <p className="text-[12px] font-medium tracking-[0.2px] text-[#f2f2f266] mb-3 uppercase">Why it matters</p>
                            <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                              Pacing and visual feedback impacts the perceived responsiveness and speed of the AI.
                            </p>
                          </div>
                          <div className="mx-6 h-px bg-[#f2f2f21a]" />
                          <div className="px-6 py-5">
                            <div className="grid grid-cols-2 gap-4">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={assets.chatgptTextOutput} alt="ChatGPT" className="w-full aspect-[4/3] object-cover rounded-[12px] border border-[#252525]" />
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={assets.geminiTextOutput} alt="Gemini" className="w-full aspect-[4/3] object-cover rounded-[12px] border border-[#252525]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <p className="text-[14px] font-medium text-[#f2f2f2]">ChatGPT</p>
                                <p className="text-[13px] font-light leading-[150%] text-[#f2f2f299]">Streams text letter-by-letter, with a dot as a visual reference.</p>
                              </div>
                              <div>
                                <p className="text-[14px] font-medium text-[#f2f2f2]">Gemini</p>
                                <p className="text-[13px] font-light leading-[150%] text-[#f2f2f299]">Displays the entire message almost instantaneously with a text skeleton.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Slide 2: Message Structure */}
                    <div className="w-full flex-shrink-0 pt-5">
                      <div className="relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                          <NumberSticker number={2} />
                        </div>
                        <div className="bg-[#f2f2f20a] rounded-[16px] border border-[#252525] overflow-hidden">
                          <div className="px-6 pt-10 pb-5">
                            <div className="flex items-center gap-3 mb-3">
                              <ForumIcon sx={{ fontSize: 28, color: '#f2f2f266' }} />
                              <h3 className="text-[20px] font-medium leading-[125%] text-[#f2f2f2]">Message Structure and Layout</h3>
                            </div>
                            <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                              The organization and visual differentiation of user and AI messages.
                            </p>
                          </div>
                          <div className="mx-6 h-px bg-[#f2f2f21a]" />
                          <div className="px-6 py-5">
                            <p className="text-[12px] font-medium tracking-[0.2px] text-[#f2f2f266] mb-3 uppercase">Why it matters</p>
                            <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                              Clear visual hierarchy helps ensure users can easily follow the conversation and distinguish between their messages and the AI&apos;s responses.
                            </p>
                          </div>
                          <div className="mx-6 h-px bg-[#f2f2f21a]" />
                          <div className="px-6 py-5">
                            <div className="grid grid-cols-2 gap-4">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={assets.geminiLayout} alt="Gemini" className="w-full aspect-[4/3] object-cover rounded-[12px] border border-[#252525]" />
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={assets.metaAiLayout} alt="Meta AI" className="w-full aspect-[4/3] object-cover rounded-[12px] border border-[#252525]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <p className="text-[14px] font-medium text-[#f2f2f2]">Gemini</p>
                                <p className="text-[13px] font-light leading-[150%] text-[#f2f2f299]">User and LLM messages both appear on the left, with icons indicating each source.</p>
                              </div>
                              <div>
                                <p className="text-[14px] font-medium text-[#f2f2f2]">Meta AI</p>
                                <p className="text-[13px] font-light leading-[150%] text-[#f2f2f299]">User messages appear on the right; LLM responses on the left, in a text bubble.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Slide 3: Dynamic Page Behavior */}
                    <div className="w-full flex-shrink-0 pt-5">
                      <div className="relative">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                          <NumberSticker number={3} />
                        </div>
                        <div className="bg-[#f2f2f20a] rounded-[16px] border border-[#252525] overflow-hidden">
                          <div className="px-6 pt-10 pb-5">
                            <div className="flex items-center gap-3 mb-3">
                              <VerticalAlignTopIcon sx={{ fontSize: 28, color: '#f2f2f266' }} />
                              <h3 className="text-[20px] font-medium leading-[125%] text-[#f2f2f2]">Dynamic Page Behavior</h3>
                            </div>
                            <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                              How the interface adapts to new messages, including scrolling and focus management.
                            </p>
                          </div>
                          <div className="mx-6 h-px bg-[#f2f2f21a]" />
                          <div className="px-6 py-5">
                            <p className="text-[12px] font-medium tracking-[0.2px] text-[#f2f2f266] mb-3 uppercase">Why it matters</p>
                            <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                              Smooth and intuitive page behavior ensures users can follow the conversation without losing their place or having to manually scroll.
                            </p>
                          </div>
                          <div className="mx-6 h-px bg-[#f2f2f21a]" />
                          <div className="px-6 py-5">
                            <div className="grid grid-cols-2 gap-4">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={assets.claudePageBehavior} alt="Claude" className="w-full aspect-[4/3] object-cover rounded-[12px] border border-[#252525]" />
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={assets.geminiPageBehavior} alt="Gemini" className="w-full aspect-[4/3] object-cover rounded-[12px] border border-[#252525]" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <p className="text-[14px] font-medium text-[#f2f2f2]">Claude</p>
                                <p className="text-[13px] font-light leading-[150%] text-[#f2f2f299]">Responses push content upward as text streams in, making it hard to read as it loads.</p>
                              </div>
                              <div>
                                <p className="text-[14px] font-medium text-[#f2f2f2]">Gemini</p>
                                <p className="text-[13px] font-light leading-[150%] text-[#f2f2f299]">Each new message appears in a separate section, keeping the page steady and easy to read.</p>
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

              {/* Dots */}
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
          </div>

          {/* Design Insights */}
          <div className="flex flex-col gap-6">
            <p className="text-[16px] font-medium text-[#f2f2f2] opacity-60">Three Ingredients for a Great LLM Chat Experience:</p>
            <div className="flex flex-col gap-4">
              <div className="bg-[#f2f2f20a] border border-[#252525] rounded-[16px] p-6 flex flex-col gap-4">
                <StreamIcon sx={{ fontSize: 32, color: '#f2f2f266' }} />
                <h4 className="text-[20px] font-medium leading-[125%] text-[#f2f2f2]">Text Streaming Enables Faster Response Times</h4>
                <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                  Streaming text as it generates provides quicker feedback to users rather than waiting for complete message generation, especially when using APIs.
                </p>
                <p className="text-[13px] font-light text-[#f2f2f266] italic">Design Requirement: Implement letter-by-letter streaming</p>
              </div>
              <div className="bg-[#f2f2f20a] border border-[#252525] rounded-[16px] p-6 flex flex-col gap-4">
                <PsychologyIcon sx={{ fontSize: 32, color: '#f2f2f266' }} />
                <h4 className="text-[20px] font-medium leading-[125%] text-[#f2f2f2]">Familiar Message Structure Reduces Cognitive Load</h4>
                <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                  Left/right message structure with text bubbles encasing user messages and an icon next to the Assistant&apos;s responses follows familiar conventions, allowing teachers to instantly distinguish between messages.
                </p>
                <p className="text-[13px] font-light text-[#f2f2f266] italic">Design Requirement: Use distinctive styling for user vs. AI messages</p>
              </div>
              <div className="bg-[#f2f2f20a] border border-[#252525] rounded-[16px] p-6 flex flex-col gap-4">
                <ArticleIcon sx={{ fontSize: 32, color: '#f2f2f266' }} />
                <h4 className="text-[20px] font-medium leading-[125%] text-[#f2f2f2]">Dedicated Message Sections Prevent Reading Disruption</h4>
                <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                  Creating a fresh section for each new exchange keeps the conversation stable and readable, unlike layouts that push content upward and disrupt users mid-reading.
                </p>
                <p className="text-[13px] font-light text-[#f2f2f266] italic">Design Requirement: Anchor each message in fixed containers without auto-scrolling during generation</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[882px] mx-auto px-6">
        <Divider />
      </div>

      {/* ── Design Phase ────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center py-[120px]">
        <div className="w-full max-w-[882px] mx-auto px-6 flex flex-col gap-20">

          {/* Section start */}
          <div className="flex flex-col gap-10">
            <SectionOverline label="Design Phase" />
            <h1 className="text-[40px] font-medium leading-[125%] tracking-[-0.1px] text-[#f2f2f2]">
              Crafting the user experience.
            </h1>
          </div>

          {/* Double column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 items-baseline">
            <h3 className="text-[24px] font-medium leading-[125%] tracking-[0.1px] text-[#f2f2f2] pr-6">
              Translating insights into interface decisions
            </h3>
            <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
              Armed with clear design principles from our competitive analysis, I began designing our AI assistant. My approach focused on systematic exploration of key interface decisions — from how users would access the assistant to how conversations would flow — all while ensuring the experience felt native to the Finding Focus platform.
            </p>
          </div>

          {/* Design decisions carousel */}
          <div className="flex flex-col gap-6">
            <p className="text-[16px] font-medium text-[#f2f2f2] opacity-60">Key Design Decisions:</p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => goToDesignSlide(designCarouselIndex === 0 ? totalDesignSlides - 1 : designCarouselIndex - 1)}
                className="w-10 h-10 flex-shrink-0 rounded-full border border-[#f2f2f21a] flex items-center justify-center hover:bg-[#f2f2f20d] transition-colors"
              >
                <ChevronLeft size={18} className="text-[#f2f2f2]" />
              </button>

              <div className="overflow-hidden flex-1">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${designCarouselIndex * 100}%)` }}
                >
                  {/* Slide 1: Access Point */}
                  <div className="w-full flex-shrink-0 pt-5">
                    <div className="relative">
                      <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                        <NumberSticker number={1} />
                      </div>
                      <div className="bg-[#f2f2f20a] rounded-[16px] border border-[#252525] overflow-hidden">
                        <div className="px-6 pt-10 pb-5">
                          <div className="flex items-center gap-3 mb-3">
                            <PlaceIcon sx={{ fontSize: 28, color: '#f2f2f266' }} />
                            <h3 className="text-[20px] font-medium leading-[125%] text-[#f2f2f2]">Assistant Access Point</h3>
                          </div>
                          <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                            Where in our interface should users access the assistant from?
                          </p>
                        </div>
                        <div className="mx-6 h-px bg-[#f2f2f21a]" />
                        <div className="px-6 py-5">
                          <p className="text-[12px] font-medium tracking-[0.2px] text-[#f2f2f266] mb-3 uppercase">Why it matters</p>
                          <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                            The assistant needed to feel ever-present and accessible from anywhere in the platform, while remaining unobtrusive enough that teachers could choose when to engage with it.
                          </p>
                        </div>
                        <div className="mx-6 h-px bg-[#f2f2f21a]" />
                        <div className="px-6 py-5">
                          <p className="text-[12px] font-medium tracking-[0.2px] text-[#f2f2f266] mb-3 uppercase">Explorations</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="w-full aspect-[4/3] rounded-[12px] bg-[#1a1a1a] border border-[#252525]" />
                            <div className="w-full aspect-[4/3] rounded-[12px] bg-[#1a1a1a] border border-[#252525]" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-[14px] font-medium text-[#f2f2f2]">Exploration 1</p>
                              <p className="text-[13px] font-light leading-[150%] text-[#f2f2f299]">Add caption for first exploration image.</p>
                            </div>
                            <div>
                              <p className="text-[14px] font-medium text-[#f2f2f2]">Exploration 2</p>
                              <p className="text-[13px] font-light leading-[150%] text-[#f2f2f299]">Add caption for second exploration image.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slide 2: Modal vs Inline */}
                  <div className="w-full flex-shrink-0 pt-5">
                    <div className="relative">
                      <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                        <NumberSticker number={2} />
                      </div>
                      <div className="bg-[#f2f2f20a] rounded-[16px] border border-[#252525] overflow-hidden">
                        <div className="px-6 pt-10 pb-5">
                          <div className="flex items-center gap-3 mb-3">
                            <ViewModuleIcon sx={{ fontSize: 28, color: '#f2f2f266' }} />
                            <h3 className="text-[20px] font-medium leading-[125%] text-[#f2f2f2]">Modal vs. Inline Experience</h3>
                          </div>
                          <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                            How should the assistant appear — as an overlay (modal) or embedded within the page layout (inline)?
                          </p>
                        </div>
                        <div className="mx-6 h-px bg-[#f2f2f21a]" />
                        <div className="px-6 py-5">
                          <p className="text-[12px] font-medium tracking-[0.2px] text-[#f2f2f266] mb-3 uppercase">Why it matters</p>
                          <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                            The presentation affects discoverability, context, and whether users feel the assistant is part of the flow or a separate tool.
                          </p>
                        </div>
                        <div className="mx-6 h-px bg-[#f2f2f21a]" />
                        <div className="px-6 py-5">
                          <p className="text-[12px] font-medium tracking-[0.2px] text-[#f2f2f266] mb-3 uppercase">Explorations</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="w-full aspect-[4/3] rounded-[12px] bg-[#1a1a1a] border border-[#252525]" />
                            <div className="w-full aspect-[4/3] rounded-[12px] bg-[#1a1a1a] border border-[#252525]" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-[14px] font-medium text-[#f2f2f2]">Exploration 1</p>
                              <p className="text-[13px] font-light leading-[150%] text-[#f2f2f299]">Add caption for first exploration image.</p>
                            </div>
                            <div>
                              <p className="text-[14px] font-medium text-[#f2f2f2]">Exploration 2</p>
                              <p className="text-[13px] font-light leading-[150%] text-[#f2f2f299]">Add caption for second exploration image.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slide 3: Empty State */}
                  <div className="w-full flex-shrink-0 pt-5">
                    <div className="relative">
                      <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                        <NumberSticker number={3} />
                      </div>
                      <div className="bg-[#f2f2f20a] rounded-[16px] border border-[#252525] overflow-hidden">
                        <div className="px-6 pt-10 pb-5">
                          <div className="flex items-center gap-3 mb-3">
                            <InboxIcon sx={{ fontSize: 28, color: '#f2f2f266' }} />
                            <h3 className="text-[20px] font-medium leading-[125%] text-[#f2f2f2]">Empty State Design</h3>
                          </div>
                          <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                            How should the assistant&apos;s empty state clue users in to its functionality — without adding friction?
                          </p>
                        </div>
                        <div className="mx-6 h-px bg-[#f2f2f21a]" />
                        <div className="px-6 py-5">
                          <p className="text-[12px] font-medium tracking-[0.2px] text-[#f2f2f266] mb-3 uppercase">Why it matters</p>
                          <p className="text-[16px] font-light leading-[150%] tracking-[0.4px] text-[#f2f2f299]">
                            A clear empty state sets expectations and invites interaction without overwhelming teachers who may be exploring for the first time.
                          </p>
                        </div>
                        <div className="mx-6 h-px bg-[#f2f2f21a]" />
                        <div className="px-6 py-5">
                          <p className="text-[12px] font-medium tracking-[0.2px] text-[#f2f2f266] mb-3 uppercase">Explorations</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="w-full aspect-[4/3] rounded-[12px] bg-[#1a1a1a] border border-[#252525]" />
                            <div className="w-full aspect-[4/3] rounded-[12px] bg-[#1a1a1a] border border-[#252525]" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-[14px] font-medium text-[#f2f2f2]">Exploration 1</p>
                              <p className="text-[13px] font-light leading-[150%] text-[#f2f2f299]">Add caption for first exploration image.</p>
                            </div>
                            <div>
                              <p className="text-[14px] font-medium text-[#f2f2f2]">Exploration 2</p>
                              <p className="text-[13px] font-light leading-[150%] text-[#f2f2f299]">Add caption for second exploration image.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => goToDesignSlide(designCarouselIndex === totalDesignSlides - 1 ? 0 : designCarouselIndex + 1)}
                className="w-10 h-10 flex-shrink-0 rounded-full border border-[#f2f2f21a] flex items-center justify-center hover:bg-[#f2f2f20d] transition-colors"
              >
                <ChevronRight size={18} className="text-[#f2f2f2]" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-3 mt-4">
              {[0, 1, 2].map(i => (
                <button
                  key={i}
                  onClick={() => goToDesignSlide(i)}
                  className={`rounded-full transition-all ${designCarouselIndex === i ? 'w-3 h-3 bg-[#f2f2f2]' : 'w-2 h-2 bg-[#f2f2f233] hover:bg-[#f2f2f266]'}`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Footer padding */}
      <div className="h-24" />
    </div>
  );
}
