'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SmsIcon from '@mui/icons-material/Sms';
import ForumIcon from '@mui/icons-material/Forum';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import StreamIcon from '@mui/icons-material/Stream';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ArticleIcon from '@mui/icons-material/Article';

// Local asset paths
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
};

// Section Indicator Component
function SectionIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-white shadow-[0px_1px_8px_1px_rgba(255,255,255,0.5)]" />
      <span className="text-sm text-white/50 tracking-wide">{label}</span>
    </div>
  );
}

// Image Card Component
function ImageCard({
  src,
  alt,
  caption,
  pillText,
}: {
  src: string;
  alt: string;
  caption: string;
  pillText: string;
}) {
  return (
    <div>
      {/* Gradient Card */}
      <div className="rounded-[32px] bg-gradient-to-b from-[rgba(38,179,255,0.35)] to-[#181d1f] overflow-hidden">
        <div className="p-[85px_80px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="w-full h-auto rounded-[12px]"
          />
        </div>
      </div>
      {/* Caption */}
      <div className="flex items-center justify-end gap-4 mt-2">
        <span className="text-[14px] text-white/50 leading-[20px]">{caption}</span>
        <span className="px-2 py-1 rounded-[100px] bg-[rgba(242,242,242,0.1)] text-[10px] font-mono text-[#f2f2f2]/80">
          {pillText}
        </span>
      </div>
    </div>
  );
}

// Problem Card Component
function ProblemCard({
  icon,
  title,
  description,
  position,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  position: 'top' | 'middle' | 'bottom';
}) {
  const roundedClass = position === 'top'
    ? 'rounded-t-3xl'
    : position === 'bottom'
    ? 'rounded-b-3xl'
    : '';

  return (
    <div className={`bg-[#303030] p-6 ${roundedClass}`}>
      <div className="flex gap-4">
        <div className="w-6 h-6 flex-shrink-0">{icon}</div>
        <div>
          <h4 className="text-base font-semibold text-[#ff3d3d] mb-2">{title}</h4>
          <p className="text-base text-white/80 leading-6">{description}</p>
        </div>
      </div>
    </div>
  );
}

// Objective Card Component - Matches Figma design with border, icon at top
function ObjectiveCard({
  iconSrc,
  title,
  description,
}: {
  iconSrc: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#262626] rounded-[24px] border-2 border-[#4d4d4d] p-6">
      <div className="flex flex-col">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} alt="" className="w-10 h-10 mb-4" />
        <h4 className="text-[20px] font-semibold text-white mb-2 tracking-[-0.3px] leading-[26px]">{title}</h4>
        <p className="text-base text-white/80 leading-6">{description}</p>
      </div>
    </div>
  );
}

// Pros/Cons Tag Component
function Tag({ children, type }: { children: React.ReactNode; type: 'pro' | 'con' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
      type === 'pro' ? 'bg-[#27b4ff]/20 text-[#27b4ff]' : 'bg-[#ff3d3d]/20 text-[#ff3d3d]'
    }`}>
      {type === 'pro' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
        </svg>
      )}
      {children}
    </span>
  );
}

// API Card Component
function ApiCard({
  title,
  subtitle,
  pros,
  cons,
  prosSummary,
  consSummary,
}: {
  title: string;
  subtitle: string;
  pros: string[];
  cons: string[];
  prosSummary: string;
  consSummary: string;
}) {
  return (
    <div className="bg-[#303030] rounded-3xl p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#27b4ff]/20 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#27b4ff" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </div>
        <div>
          <h4 className="text-xl font-semibold text-white">{title}</h4>
          <p className="text-sm text-white/50">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h5 className="text-lg font-semibold text-white">Pros</h5>
          <div className="flex flex-wrap gap-2">
            {pros.map((pro, i) => (
              <Tag key={i} type="pro">{pro}</Tag>
            ))}
          </div>
          <p className="text-sm text-white/80">{prosSummary}</p>
        </div>
        <div className="space-y-4">
          <h5 className="text-lg font-semibold text-white">Cons</h5>
          <div className="flex flex-wrap gap-2">
            {cons.map((con, i) => (
              <Tag key={i} type="con">{con}</Tag>
            ))}
          </div>
          <p className="text-sm text-white/80">{consSummary}</p>
        </div>
      </div>
    </div>
  );
}

// Competitive Analysis Card Component
function CompetitiveAnalysisCard({
  title,
  description,
  whyItMatters,
  leftImage,
  leftCaption,
  rightImage,
  rightCaption,
  isGif = false,
}: {
  title: string;
  description: string;
  whyItMatters: string;
  leftImage: string;
  leftCaption: string;
  rightImage: string;
  rightCaption: string;
  isGif?: boolean;
}) {
  return (
    <div className="bg-[#303030] rounded-3xl p-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#27b4ff]/20 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#27b4ff" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <h4 className="text-xl font-semibold text-white">{title}</h4>
          <p className="text-sm text-white/50">{description}</p>
        </div>
      </div>
      <p className="text-base text-white/80 mb-6">
        <strong className="text-white">Why it matters:</strong> {whyItMatters}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl overflow-hidden bg-[#262626]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={leftImage} alt={leftCaption} className="w-full aspect-[4/3] object-cover" />
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm text-white/50">{leftCaption}</span>
            <span className="px-2 py-1 rounded-full bg-white/10 text-[10px] font-mono text-white/80">
              {isGif ? 'GIF' : 'IMAGE'}
            </span>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden bg-[#262626]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={rightImage} alt={rightCaption} className="w-full aspect-[4/3] object-cover" />
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm text-white/50">{rightCaption}</span>
            <span className="px-2 py-1 rounded-full bg-white/10 text-[10px] font-mono text-white/80">
              {isGif ? 'GIF' : 'IMAGE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Design Insight Card Component
function DesignInsightCard({
  icon,
  title,
  description,
  requirement,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  requirement: string;
}) {
  return (
    <div className="bg-[#303030] rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#27b4ff]/20 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
          <p className="text-base text-white/80 mb-2">{description}</p>
          <p className="text-sm text-white/50">Design Requirement: {requirement}</p>
        </div>
      </div>
    </div>
  );
}

// Key Decision Card Component
function KeyDecisionCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#303030] rounded-2xl p-6">
      <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
      <p className="text-base text-white/80">{description}</p>
    </div>
  );
}

export default function NodeAIAssistantCaseStudy() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const totalSlides = 3;

  const goToSlide = (index: number) => {
    setCarouselIndex(Math.max(0, Math.min(index, totalSlides - 1)));
  };

  return (
    <div className="min-h-screen bg-[#262626] text-white/80">
      {/* Header Section */}
      <header className="relative bg-gradient-to-b from-[rgba(38,179,255,0.5)] to-[#262626] to-[87%]">
        <div className="max-w-[1200px] mx-auto px-6 pt-[120px] pb-[120px]">
          {/* Text */}
          <div className="text-center text-white mb-14">
            <h1 className="text-[56px] font-bold leading-[64px] tracking-[-1px]">
              Node AI Assistant
            </h1>
            <p className="text-[20px] font-semibold leading-[26px] tracking-[-0.3px] mt-4">
              Finding Focus — Aug 2024
            </p>
          </div>

          {/* Hero Image Placeholder */}
          <div className="w-full max-w-[1200px] h-[850px] flex-shrink-0 aspect-[24/17] bg-[#38f] rounded-3xl" />
        </div>
      </header>

      {/* Role and Overview Section */}
      <section className="bg-[#262626]">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row justify-center items-start gap-16 p-20 flex-shrink-0">
          {/* Left Column - Roles */}
          <div className="flex-1 flex flex-col gap-8">
            {/* My Role */}
            <div>
              <h4 className="text-[20px] font-semibold text-white leading-[26px] tracking-[-0.3px] mb-4">My Role</h4>
              <p className="text-[16px] leading-[24px]">
                <span className="font-bold text-white">UX Lead</span>
                <span className="text-white/80"> — </span>
                <span className="text-white/80">Interaction Design, Visual Design, Information Architecture, User Flows, Prompt Engineering, Knowledge Base Management</span>
              </p>
            </div>
            {/* Team */}
            <div>
              <h4 className="text-[20px] font-semibold text-white leading-[26px] tracking-[-0.3px] mb-4">Team</h4>
              <p className="text-[16px] text-white/80 leading-[24px]">
                Mike Mrazek, PM<br />
                Thomas Kennedy, SWE
              </p>
            </div>
            {/* Timeline & Status */}
            <div>
              <h4 className="text-[20px] font-semibold text-white leading-[26px] tracking-[-0.3px] mb-4">Timeline &amp; Status</h4>
              <p className="text-[16px] text-white/80 leading-[24px]">
                <span className="font-semibold">2 Months,</span> <span className="text-white">Launched November 2024</span>
              </p>
            </div>
          </div>

          {/* Right Column - Overview */}
          <div className="flex-1 flex flex-col">
            <h4 className="text-[20px] font-semibold text-white leading-[26px] tracking-[-0.3px] mb-4">Overview</h4>
            <div className="flex flex-col gap-6 text-[16px] text-white/80 leading-[24px]">
              <p>
                With educational grants increasingly emphasizing AI integration, Finding Focus - an academic spin-off from UT Austin - needed to thoughtfully incorporate AI technology into their educational platform.
              </p>
              <p>
                Our experience showed that teachers who received direct support from our team had significantly higher implementation success rates. This insight led to the development of the Finding Focus AI Assistant, an LLM-powered support agent that provides on-demand support for educators.
              </p>
              <p>
                Early feedback from our teacher community has been overwhelmingly positive, with users highlighting the assistant&apos;s ability to provide immediate, personalized support - effectively scaling our team&apos;s hands-on approach to implementation guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="bg-[#262626] pt-[120px]">
        <div className="max-w-[1200px] mx-auto px-20">
          <div className="relative bg-[#303030] rounded-[32px] overflow-hidden">
            {/* Radial gradient background at top */}
            <div
              className="absolute top-0 left-0 right-0 h-[200px] pointer-events-none"
              style={{
                background: 'radial-gradient(100% 100% at 50% 0%, rgba(38, 179, 255, 0.25) 0%, transparent 70%)',
              }}
            />

            {/* Content Container */}
            <div className="relative flex flex-col justify-center items-start gap-10 p-6">
              {/* Header */}
              <div className="flex flex-col items-center text-center w-full pt-4 px-14">
                {/* Icon */}
                <div className="w-16 h-16 rounded-[100px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/case-studies/highlights-icon.png"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Label */}
                <span className="text-[20px] tracking-[2px] text-white/50 leading-[24px] mt-4">HIGHLIGHTS</span>

                {/* Heading */}
                <h2 className="text-[32px] font-bold leading-[38px] tracking-[-0.8px] text-white max-w-[850px] mt-6">
                  A quick, accessible way for teachers to ask questions, troubleshoot, or just have a conversation about anything related to Finding Focus.
                </h2>
              </div>

              {/* Image Cards - gap-10 = 40px */}
              <ImageCard
                src={assets.accessingNodeAi}
                alt="Accessing Node AI"
                caption="0.1 Accessing Node AI"
                pillText="VIDEO LOOP"
              />
              <ImageCard
                src={assets.uiComponents}
                alt="UI Components"
                caption="0.2 UI Components"
                pillText="IMAGE"
              />
              <ImageCard
                src={assets.uiComponents}
                alt="Mobile Designs"
                caption="0.3 Mobile Designs"
                pillText="IMAGE"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Context Section */}
      <section className="max-w-[1200px] mx-auto">
        <div className="flex flex-col justify-center items-start gap-16 p-20">
          <SectionIndicator label="CONTEXT" />

          <h1 className="text-[56px] font-bold leading-[64px] tracking-[-1px] text-white">
            Turning a grant requirement into an opportunity to provide personalized support.
          </h1>

          <div className="flex flex-row flex-wrap gap-x-16 gap-y-6 w-full">
            <div className="flex-[2] min-w-[250px]">
              <h3 className="text-[24px] font-semibold leading-[32px] tracking-[-0.5px] text-white">
                Helping our teachers was the main priority
              </h3>
            </div>
            <div className="flex-[3] min-w-[325px]">
              <p className="text-base text-white/80 leading-6">
                Our most successful teachers shared one common thread - direct support from our team during implementation. With grant requirements pushing us toward AI integration, we recognized that an LLM powered assistant could be a great way to provide hands-on support for every teacher.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto flex justify-center items-center h-[84px] px-10">
        <div className="w-full h-1 bg-[#303030]" />
      </div>

      {/* Problem Section - Intro */}
      <section className="max-w-[1200px] mx-auto">
        <div className="flex flex-col justify-center items-start gap-16 p-20">
          <SectionIndicator label="THE PROBLEM" />

          <h1 className="text-[56px] font-bold leading-[64px] tracking-[-1px] text-white">
            Not all Chatbots are created equally.
          </h1>

          {/* Secondary title + Explanatory text side by side */}
          <div className="flex flex-row flex-wrap gap-x-16 gap-y-6 w-full">
            <div className="flex-[2] min-w-[250px]">
              <h3 className="text-[24px] font-semibold leading-[32px] tracking-[-0.5px] text-white">
                Most users have a negative connotation of &ldquo;chatbots&rdquo;
              </h3>
            </div>
            <div className="flex-[3] min-w-[325px] flex flex-col gap-6">
              <p className="text-base text-white/80 leading-6">
                We wanted to create a virtual support agent that was actually helpful and answered user&apos;s novel questions, something that traditional chatbots don&apos;t typically succeed at.
              </p>
              <p className="text-base text-white/80 leading-6">
                Traditional chatbots, as seen in figure 2.0, often fail at providing adequate support to users because they have rudimentary NLP (natural language processing) and rely heavily upon decision trees, and when users send a message that is not a part of the chatbot&apos;s repertoire, the conversation stalls. Traditional chatbots lack the ability to &ldquo;understand&rdquo; user&apos;s requests, and are very restricted in their ability to respond.
              </p>
              <p className="text-base text-white/80 leading-6">
                The limitations of traditional chatbots have created a negative connotation regarding chatbots that we wanted to avoid:
              </p>
            </div>
          </div>

          {/* Problem Cards */}
          <div className="flex flex-col gap-6 w-full">
            {/* Limited Responses */}
            <div className="bg-[#303030] rounded-[24px] p-6">
              <div className="flex gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/case-studies/image.svg" alt="" className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="text-base font-semibold text-[#ff3d3d] mb-2">Limited Responses</h4>
                  <p className="text-base text-white/80 leading-6">
                    Reliance on decision trees creates a rigid conversational flow. If a user&apos;s input doesn&apos;t fit the pre-defined options, the chatbot often gets stuck or provides unhelpful responses.
                  </p>
                </div>
              </div>
            </div>

            {/* Lack of Contextual Understanding */}
            <div className="bg-[#303030] rounded-[24px] p-6">
              <div className="flex gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/case-studies/svg11884258658.svg" alt="" className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="text-base font-semibold text-[#ff3d3d] mb-2">Lack of Contextual Understanding</h4>
                  <p className="text-base text-white/80 leading-6">
                    They struggle to grasp the overall meaning or intent behind a user&apos;s message, especially when the language is more complex or not straightforward.
                  </p>
                </div>
              </div>
            </div>

            {/* Inefficient */}
            <div className="bg-[#303030] rounded-[24px] p-6">
              <div className="flex gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/case-studies/svg11845331731.svg" alt="" className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="text-base font-semibold text-[#ff3d3d] mb-2">Inefficient</h4>
                  <p className="text-base text-white/80 leading-6">
                    Users may end up resorting to other options, like messaging the support team directly to resolve their issues, which can be time-consuming for users and companies alike.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Image 2.0 - Typical Chat Interface */}
          <div className="w-full">
            <div className="rounded-[32px] overflow-hidden bg-[#303030] flex items-center justify-center py-20 aspect-[125/93]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assets.typicalChatInterface}
                alt="Typical Chat Interface"
                className="max-w-[50%] h-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-end gap-4 mt-2">
              <span className="text-sm text-white/50">2.0 Typical Chat Interface</span>
              <span className="px-2 py-1 rounded-full bg-white/10 text-[10px] font-mono text-white/80">
                Image
              </span>
            </div>
          </div>
        </div>

        {/* The Challenge Card */}
        <div className="px-20">
          <div className="relative rounded-[32px] overflow-hidden bg-[#303030] flex flex-col justify-center items-center text-center px-20 pt-14 pb-10">
            {/* Orange radial gradient */}
            <div
              className="absolute top-0 left-0 right-0 h-[200px] pointer-events-none"
              style={{
                background: 'radial-gradient(100% 100% at 50% 0%, rgba(255, 136, 38, 0.25) 0%, transparent 70%)',
              }}
            />
            {/* Icon in rounded pill */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assets.challengeIcon} alt="" className="w-full h-full object-cover" />
            </div>

            {/* Label */}
            <span className="relative text-xl tracking-[2px] text-white/50 mb-6">THE CHALLENGE</span>

            {/* Heading */}
            <h2 className="relative text-[32px] font-bold leading-[38px] tracking-[-0.8px] text-white max-w-[870px]">
              Create a genuinely helpful assistant that provides relevant answers to teachers&apos; questions.
            </h2>
          </div>
        </div>

        {/* Objectives Section */}
        <div className="flex flex-col justify-center items-start gap-10 px-20 pt-20 pb-10">
          <div className="flex flex-row flex-wrap gap-16 w-full">
            {/* Left column - Title */}
            <div className="flex-shrink-0">
              <h3 className="text-[24px] font-semibold leading-[32px] tracking-[-0.5px] text-white">
                Project Objectives:
              </h3>
            </div>

            {/* Right column - Objective Cards */}
            <div className="flex-1 min-w-[325px] flex flex-col gap-6 max-w-[800px]">
              <ObjectiveCard
                iconSrc="/images/case-studies/sparkles.svg"
                title="Truly Understand Queries"
                description="Create a virtual support agent that is able to understand what users are asking."
              />
              <ObjectiveCard
                iconSrc="/images/case-studies/target-arrow.svg"
                title="Provide Relevant Responses"
                description="Provide teachers with answers to any question they might have - without limiting the responses."
              />
              <ObjectiveCard
                iconSrc="/images/case-studies/mood-smile.svg"
                title="Exceed Teacher Expectations"
                description="Create an experience that sets the standard for Edtech virtual support agents."
              />
            </div>
          </div>
        </div>

        {/* Image 2.1 - Project Timeline */}
        <div className="px-20 py-6">
          <div className="w-full aspect-[125/93] rounded-[32px] bg-[#303030]" />
          <div className="flex items-center justify-end gap-4 mt-2">
            <span className="text-sm text-white/50">2.1 Project Timeline</span>
            <span className="px-2 py-1 rounded-full bg-white/10 text-[10px] font-mono text-white/80">
              Image
            </span>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto flex justify-center items-center h-[84px] px-10">
        <div className="w-full h-1 bg-[#303030]" />
      </div>

      {/* Research Phase Section */}
      <section className="max-w-[1200px] mx-auto">
        <div className="flex flex-col justify-center items-start gap-16 p-20">
          <SectionIndicator label="RESEARCH PHASE" />

          <h1 className="text-[56px] font-bold leading-[64px] tracking-[-1px] text-white">
            Understanding the landscape.
          </h1>

          <div className="flex flex-row flex-wrap gap-x-16 gap-y-6 w-full">
            <div className="flex-[2] min-w-[250px]">
              <h3 className="text-2xl font-semibold leading-8 tracking-[-0.5px] text-white">
                Doing a deep dive into our API options
              </h3>
            </div>
            <div className="flex-[3] min-w-[325px] flex flex-col gap-4">
              <p className="text-base text-white/80 leading-6">
                Before anything else, Finding Focus had to decide on the &lsquo;brain&rsquo; of our chat interface – the core technology that would enable it to understand and respond to user requests.
              </p>
              <p className="text-base text-white/80 leading-6">
                After researching the topic, I found that there were two main approaches we could take to implement the chatbot:
              </p>
              <div className="flex flex-col gap-3 pl-4">
                <p className="text-base text-white/80 leading-6">
                  <span className="font-semibold text-white">1. Rule-based system with basic NLU techniques:</span> Uses predefined rules, keywords, and decision trees to process and respond to user input. These systems follow a structured approach where specific inputs trigger specific outputs.
                </p>
                <p className="text-base text-white/80 leading-6">
                  <span className="font-semibold text-white">2. Large Language Model (LLM):</span> Leverages advanced AI models trained on vast amounts of text data to understand context, generate human-like responses, and handle a wide range of queries without predefined rules.
                </p>
              </div>
              <p className="text-base text-white/80 leading-6">
                I synthesized my findings and shared them with my team to help us make an informed decision:
              </p>
            </div>
          </div>

          {/* API Cards */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#303030] rounded-[24px] p-6 flex flex-col justify-center">
              <img src="/images/case-studies/NLU.svg" alt="" className="w-10 h-10 mb-4" />
              <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-2">
                Rule Based NLU APIs
              </h4>
              <p className="text-base leading-6">
                <span className="font-bold text-white">Popular Options:</span>
                <span className="text-white/80"> Diagflow, Amazon Lex, Rasa</span>
              </p>
            </div>
            {/* Pros and Cons side by side */}
            <div className="flex flex-row flex-wrap gap-6">
              {/* Pros */}
              <div className="flex-1 min-w-[300px] bg-[rgba(13,186,79,0.1)] rounded-[24px] p-6 flex flex-col">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/case-studies/thumbsup.svg" alt="" className="w-10 h-10 mb-4" />
                <h4 className="text-2xl font-semibold text-white tracking-[-0.5px] leading-8 mb-4">Pros</h4>
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/fast.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">Fast</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/accurate.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">Accurate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/predictable.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">Predictable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/cost-effective.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">Cost Effective</span>
                  </div>
                </div>
                <p className="text-sm text-white leading-5">
                  Excel in situations with well-defined interactions and predictable user inputs, offering a fast, accurate, and cost-effective solution.
                </p>
              </div>

              {/* Cons */}
              <div className="flex-1 min-w-[300px] bg-[rgba(186,13,13,0.1)] rounded-[24px] p-6 flex flex-col">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/case-studies/thumbsdown.svg" alt="" className="w-10 h-10 mb-4" />
                <h4 className="text-2xl font-semibold text-white tracking-[-0.5px] leading-8 mb-4">Cons</h4>
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/robotic.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">Robotic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/lessflexible.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">Less Flexible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/knowledgegaps.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">Knowledge Gaps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/contextblindness.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">Context Blindness</span>
                  </div>
                </div>
                <p className="text-sm text-white leading-5">
                  Struggles with understanding nuanced language, adapting to unexpected situations, and handling complex or open-ended interactions.
                </p>
              </div>
            </div>
          </div>

          {/* LLM APIs */}
          <div className="flex flex-col gap-6 mt-4">
            <div className="bg-[#303030] rounded-[24px] p-6 flex flex-col justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/case-studies/openai.svg" alt="" className="w-10 h-10 mb-4" />
              <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-2">
                LLM APIs
              </h4>
              <p className="text-base leading-6">
                <span className="font-bold text-white">Popular Options:</span>
                <span className="text-white/80"> Open AI (GPT), Anthropic (Claude), Gemini</span>
              </p>
            </div>
            {/* LLM Pros and Cons side by side */}
            <div className="flex flex-row flex-wrap gap-6">
              {/* Pros */}
              <div className="flex-1 min-w-[300px] bg-[rgba(13,186,79,0.1)] rounded-[24px] p-6 flex flex-col">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/case-studies/thumbsup.svg" alt="" className="w-10 h-10 mb-4" />
                <h4 className="text-2xl font-semibold text-white tracking-[-0.5px] leading-8 mb-4">Pros</h4>
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/versatile.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">Versatile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/generative.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">Generative</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/contextually-aware.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">Contextually Aware</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/natural-conversation.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">Natural Conversation</span>
                  </div>
                </div>
                <p className="text-sm text-white leading-5">
                  Provides dynamic, human-like interactions by generating contextually aware responses that can adapt to a wide range of user queries.
                </p>
              </div>

              {/* Cons */}
              <div className="flex-1 min-w-[300px] bg-[rgba(186,13,13,0.1)] rounded-[24px] p-6 flex flex-col">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/case-studies/thumbsdown.svg" alt="" className="w-10 h-10 mb-4" />
                <h4 className="text-2xl font-semibold text-white tracking-[-0.5px] leading-8 mb-4">Cons</h4>
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/cost.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">Cost</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/less-control.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">Less Control</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/hallucinations.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">Hallucinations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/case-studies/high-maintenance.svg" alt="" className="w-6 h-6" />
                    <span className="text-base font-bold text-white leading-6">High Maintenance</span>
                  </div>
                </div>
                <p className="text-sm text-white leading-5">
                  Require investment in both cost and maintenance, while offering less direct control over responses and potentially generating inaccurate information.
                </p>
              </div>
            </div>
          </div>

          {/* The Winning Choice */}
          <div className="grid grid-cols-2 gap-6 items-center mt-4 w-full">
            <h3 className="text-2xl font-semibold leading-8 tracking-[-0.5px] text-white">
              The winning choice…
            </h3>
            <div className="bg-[#262626] rounded-[24px] border-2 border-[#4d4d4d] p-6 flex flex-col justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/case-studies/openai.svg" alt="" className="w-10 h-10 mb-4" />
              <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-2">
                LLM Powered APIs
              </h4>
              <p className="text-base font-bold text-white leading-6">
                Assistants API (Open AI)
              </p>
            </div>
          </div>

          {/* Winning Choice Explanatory Text */}
          <div className="flex flex-col gap-4">
            <p className="text-base text-white/80 leading-6">
              For our team, an LLM powered API was exactly what we were looking for due to its ability to <strong className="font-bold text-white/80">truly understand users queries and respond naturally</strong> with relevant information.
            </p>
            <p className="text-base text-white/80 leading-6">
              After researching the topic, I found that there were two main approaches we could take to the chatbot:
            </p>
            <div className="flex flex-col gap-3 pl-5">
              <p className="text-base text-white/80 leading-6">
                <span className="font-bold text-white">Assistants API (Open AI):</span>{' '}
                Designed for complex conversations, this API allows for access to external knowledge bases, maintains conversation history, and offers advanced features but is more complex to set up and generally more expensive.
              </p>
              <p className="text-base text-white/80 leading-6">
                <span className="font-bold text-white">Chat Completions API (Open AI):</span>{' '}
                This API excels at general text generation, offering easier setup and lower costs, but requires more specific prompts and lacks direct access to external knowledge beyond its training data.
              </p>
            </div>
            <p className="text-base text-white/80 leading-6">
              <strong className="font-bold text-white/80">Assistants API was the right choice for us</strong> given its ability to draw from an external knowledge base - we wanted to train our Assistant on our Zendesk articles so that it can help answer any setup or troubleshooting questions our users might have.
            </p>
          </div>

          {/* Learning from Existing Experiences */}
          <div className="w-full">
            <div className="flex flex-row flex-wrap gap-x-16 gap-y-6 w-full">
              <div className="flex-[2] min-w-[250px]">
                <h3 className="text-2xl font-semibold leading-8 tracking-[-0.5px] text-white">
                  Learning from existing experiences
                </h3>
              </div>
              <div className="flex-[3] min-w-[325px] flex flex-col gap-6">
                <p className="text-base text-white/80 leading-6">
                  In order to inform our design direction, I conducted a comprehensive comparative analysis of leading LLM chat interfaces: <strong className="font-bold text-white/80">Gemini, Claude, Meta AI, and ChatGPT.</strong>
                </p>
                <p className="text-base text-white/80 leading-6">
                  I focused on <strong className="font-bold text-white">three key areas</strong> to inform our design:
                </p>
              </div>
            </div>

            {/* Carousel */}
            <div className="mt-10">
              {/* Carousel with side arrows */}
              <div className="flex items-center gap-4">
                {/* Left arrow */}
                <button
                  onClick={() => goToSlide(carouselIndex === 0 ? totalSlides - 1 : carouselIndex - 1)}
                  className="w-10 h-10 flex-shrink-0 rounded-full border border-[#4d4d4d] flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft size={20} className="text-white" />
                </button>

                {/* Carousel viewport */}
                <div className="overflow-hidden flex-1">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                  >
                    {/* Slide 1: Text Output Behavior */}
                    <div className="w-full flex-shrink-0 pt-5">
                      <div className="relative">
                        {/* Number sticker */}
                        <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                          <span className="text-[40px] font-semibold tracking-[-0.5px] leading-[32px]" style={{ color: '#000', WebkitTextStrokeWidth: '2px', WebkitTextStrokeColor: '#FFF', paintOrder: 'stroke fill' }}>1</span>
                        </div>
                        <div className="bg-[#262626] rounded-[24px] border-2 border-[#4d4d4d] overflow-hidden">
                          {/* Header */}
                          <div className="px-6 pt-8 pb-5">
                            <div className="flex items-center gap-4 mb-4">
                              <SmsIcon sx={{ fontSize: 32, color: '#27b4ff' }} />
                              <h3 className="text-2xl font-semibold leading-8 tracking-[-0.5px] text-white">
                                Text Output Behavior
                              </h3>
                            </div>
                            <p className="text-base text-white/80 leading-6">
                              How text is displayed in messages (e.g., letter-by-letter, word-by-word, or all at once).
                            </p>
                          </div>
                          {/* Divider */}
                          <div className="mx-6 h-1 bg-[#303030]" />
                          {/* Why it matters */}
                          <div className="px-6 pt-5 pb-6">
                            <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-6">Why it matters</h4>
                            <p className="text-base text-white/80 leading-6">
                              Pacing and visual feedback impacts the perceived responsiveness and speed of the AI.
                            </p>
                          </div>
                          {/* Images */}
                          <div className="px-6 pb-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="rounded-lg overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={assets.chatgptTextOutput} alt="ChatGPT text output" className="w-full aspect-[484/500] object-cover" />
                              </div>
                              <div className="rounded-lg overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={assets.geminiTextOutput} alt="Gemini text output" className="w-full aspect-[484/500] object-cover" />
                              </div>
                            </div>
                            {/* Captions */}
                            <div className="grid grid-cols-2 gap-6 mt-3">
                              <div>
                                <p className="text-base font-bold text-white/80 leading-6">ChatGPT</p>
                                <p className="text-base text-white/80 leading-6">Streams text letter-by-letter, with a dot as a visual reference</p>
                              </div>
                              <div>
                                <p className="text-base font-bold text-white/80 leading-6">Gemini</p>
                                <p className="text-base text-white/80 leading-6">Displays the entire message almost instantaneously with a text skeleton in its loading state.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Slide 2: Message Structure and Layout */}
                    <div className="w-full flex-shrink-0 pt-5">
                      <div className="relative">
                        {/* Number sticker */}
                        <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                          <span className="text-[40px] font-semibold tracking-[-0.5px] leading-[32px]" style={{ color: '#000', WebkitTextStrokeWidth: '2px', WebkitTextStrokeColor: '#FFF', paintOrder: 'stroke fill' }}>2</span>
                        </div>
                        <div className="bg-[#262626] rounded-[24px] border-2 border-[#4d4d4d] overflow-hidden">
                          {/* Header */}
                          <div className="px-6 pt-8 pb-5">
                            <div className="flex items-center gap-4 mb-4">
                              <ForumIcon sx={{ fontSize: 32, color: '#27b4ff' }} />
                              <h3 className="text-2xl font-semibold leading-8 tracking-[-0.5px] text-white">
                                Message Structure and Layout
                              </h3>
                            </div>
                            <p className="text-base text-white/80 leading-6">
                              The organization and visual differentiation of user and AI messages.
                            </p>
                          </div>
                          {/* Divider */}
                          <div className="mx-6 h-1 bg-[#303030]" />
                          {/* Why it matters */}
                          <div className="px-6 pt-5 pb-6">
                            <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-6">Why it matters</h4>
                            <p className="text-base text-white/80 leading-6">
                              Clear visual hierarchy and structure helps ensure users can easily follow the conversation and distinguish between their messages and the AI&apos;s responses.
                            </p>
                          </div>
                          {/* Images */}
                          <div className="px-6 pb-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="rounded-lg overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={assets.geminiLayout} alt="Gemini layout" className="w-full aspect-[484/500] object-cover" />
                              </div>
                              <div className="rounded-lg overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={assets.metaAiLayout} alt="Meta AI layout" className="w-full aspect-[484/500] object-cover" />
                              </div>
                            </div>
                            {/* Captions */}
                            <div className="grid grid-cols-2 gap-6 mt-3">
                              <div>
                                <p className="text-base font-bold text-white/80 leading-6">Gemini</p>
                                <p className="text-base text-white/80 leading-6">User messages and LLM responses both appear on the left, with icons indicating each source.</p>
                              </div>
                              <div>
                                <p className="text-base font-bold text-white/80 leading-6">Meta AI</p>
                                <p className="text-base text-white/80 leading-6">User messages appear on the right; LLM responses on the left, with user messages appearing in a text bubble.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Slide 3: Dynamic Page Behavior */}
                    <div className="w-full flex-shrink-0 pt-5">
                      <div className="relative">
                        {/* Number sticker */}
                        <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                          <span className="text-[40px] font-semibold tracking-[-0.5px] leading-[32px]" style={{ color: '#000', WebkitTextStrokeWidth: '2px', WebkitTextStrokeColor: '#FFF', paintOrder: 'stroke fill' }}>3</span>
                        </div>
                        <div className="bg-[#262626] rounded-[24px] border-2 border-[#4d4d4d] overflow-hidden">
                          {/* Header */}
                          <div className="px-6 pt-8 pb-5">
                            <div className="flex items-center gap-4 mb-4">
                              <VerticalAlignTopIcon sx={{ fontSize: 32, color: '#27b4ff' }} />
                              <h3 className="text-2xl font-semibold leading-8 tracking-[-0.5px] text-white">
                                Dynamic Page Behavior
                              </h3>
                            </div>
                            <p className="text-base text-white/80 leading-6">
                              How the interface adapts to new messages, including scrolling and focus management.
                            </p>
                          </div>
                          {/* Divider */}
                          <div className="mx-6 h-1 bg-[#303030]" />
                          {/* Why it matters */}
                          <div className="px-6 pt-5 pb-6">
                            <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-6">Why it matters</h4>
                            <p className="text-base text-white/80 leading-6">
                              Smooth and intuitive page behavior ensures users can follow the conversation without losing their place or having to manually scroll.
                            </p>
                          </div>
                          {/* Images */}
                          <div className="px-6 pb-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="rounded-lg overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={assets.claudePageBehavior} alt="Claude page behavior" className="w-full aspect-[484/500] object-cover" />
                              </div>
                              <div className="rounded-lg overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={assets.geminiPageBehavior} alt="Gemini page behavior" className="w-full aspect-[484/500] object-cover" />
                              </div>
                            </div>
                            {/* Captions */}
                            <div className="grid grid-cols-2 gap-6 mt-3">
                              <div>
                                <p className="text-base font-bold text-white/80 leading-6">Claude</p>
                                <p className="text-base text-white/80 leading-6">Responses push content upward as text streams in, making it hard to read the response as it loads.</p>
                              </div>
                              <div>
                                <p className="text-base font-bold text-white/80 leading-6">Gemini</p>
                                <p className="text-base text-white/80 leading-6">Each new message appears in a separate section, keeping the page steady and easy to read.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right arrow */}
                <button
                  onClick={() => goToSlide(carouselIndex === totalSlides - 1 ? 0 : carouselIndex + 1)}
                  className="w-10 h-10 flex-shrink-0 rounded-full border border-[#4d4d4d] flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <ChevronRight size={20} className="text-white" />
                </button>
              </div>

              {/* Pagination dots */}
              <div className="flex items-center justify-center gap-3 mt-4">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`rounded-full transition-all ${
                      carouselIndex === i
                        ? 'w-3 h-3 bg-white'
                        : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Design Insights */}
          <div className="mt-16 w-full">
            {/* Header - 2 column layout */}
            <div className="flex flex-row flex-wrap gap-x-16 gap-y-6 w-full mb-10">
              <div className="flex-[2] min-w-[250px]">
                <h3 className="text-2xl font-semibold leading-8 tracking-[-0.5px] text-white">
                  How do these insights translate into design decisions?
                </h3>
              </div>
              <div className="flex-[3] min-w-[325px]">
                <p className="text-base text-white/80 leading-6">
                  Based on the comparative analyses above, three critical insights emerged that would directly inform our design approach:
                </p>
              </div>
            </div>

            {/* Insight Cards */}
            <div className="flex flex-col gap-6 px-20">
              {/* Card 1: Text Streaming */}
              <div className="bg-[#262626] rounded-[24px] border-2 border-[#4d4d4d] p-6">
                <StreamIcon sx={{ fontSize: 40, color: '#27b4ff', marginBottom: '16px' }} />
                <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-4">
                  Text Streaming Enables Faster Response Times
                </h4>
                <p className="text-base text-white/80 leading-6 mb-4">
                  Our analysis revealed that <strong className="font-bold">streaming text as it generates (ChatGPT&apos;s approach) provides quicker feedback</strong> to users rather than waiting for complete message generation (Gemini&apos;s approach), especially when using APIs.
                </p>
                <p className="text-sm text-white/50 italic">
                  Design Requirement: Implement letter-by-letter streaming
                </p>
              </div>

              {/* Card 2: Familiar Message Structure */}
              <div className="bg-[#262626] rounded-[24px] border-2 border-[#4d4d4d] p-6">
                <PsychologyIcon sx={{ fontSize: 40, color: '#27b4ff', marginBottom: '16px' }} />
                <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-4">
                  Familiar Message Structure Reduces Cognitive Load
                </h4>
                <p className="text-base text-white/80 leading-6 mb-4">
                  Left/right message structure with text &quot;bubbles&quot; encasing the user&apos;s messages and an icon next to the Assistant&apos;s responses follows familiar conventions, allowing teachers to instantly distinguish between their messages and the Assistant&apos;s responses without learning new interface patterns.
                </p>
                <p className="text-sm text-white/50 italic">
                  Design Requirement: Use distinctive styling for user vs. AI messages
                </p>
              </div>

              {/* Card 3: Dedicated Message Sections */}
              <div className="bg-[#262626] rounded-[24px] border-2 border-[#4d4d4d] p-6">
                <ArticleIcon sx={{ fontSize: 40, color: '#27b4ff', marginBottom: '16px' }} />
                <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-4">
                  Dedicated Message Sections Prevent Reading Disruption
                </h4>
                <p className="text-base text-white/80 leading-6 mb-4">
                  Creating a fresh section for each new exchange (Gemini&apos;s approach) keeps the conversation stable and readable, unlike Claude&apos;s upward-pushing layout that disrupts users mid-reading.
                </p>
                <p className="text-sm text-white/50 italic">
                  Design Requirement: Anchor each message in fixed containers without auto-scrolling during generation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto flex justify-center items-center h-[84px] px-10">
        <div className="w-full h-1 bg-[#303030]" />
      </div>

      {/* Design Phase Section */}
      <section className="max-w-[1200px] mx-auto">
        <div className="flex flex-col justify-center items-start gap-16 p-20">
          <SectionIndicator label="DESIGN PHASE" />

          <h1 className="text-[56px] font-bold leading-[64px] tracking-[-1px] text-white">
            Crafting the user experience.
          </h1>

          <div className="flex flex-row flex-wrap gap-x-16 gap-y-6 mb-12">
            <div className="flex-[2] min-w-[250px]">
              <h3 className="text-2xl font-semibold leading-8 tracking-[-0.5px] text-white">
                Translating insights into interface decisions
              </h3>
            </div>
            <div className="flex-[3] min-w-[325px]">
              <p className="text-base text-white/80 leading-6">
                Armed with clear design principles from our competitive analysis, I began designing our AI assistant. My approach focused on systematic exploration of key interface decisions — from how users would access the assistant to how conversations would flow — all while ensuring the experience felt native to the Finding Focus platform that teachers already knew and trusted.
              </p>
            </div>
          </div>

          {/* Key Design Decisions */}
          <div className="mt-12">
            <h3 className="text-2xl font-semibold leading-8 tracking-[-0.5px] text-white mb-8">
              Key Design Decisions:
            </h3>

            <div className="flex flex-col gap-4">
              <KeyDecisionCard
                title="Assistant Access Point"
                description="Where in our interface should users access the assistant from?"
              />
              <KeyDecisionCard
                title="Modal vs. Inline Experience"
                description="How should the assistant appear in the interface — as an overlay (modal) or embedded within the page layout (inline)?"
              />
              <KeyDecisionCard
                title="Empty State Design"
                description="How should the assistant's empty state design clue users in to its functionality — without adding friction?"
              />
            </div>
          </div>

          {/* Assistant Access Point Detail */}
          <div className="mt-16 flex flex-row flex-wrap gap-x-16 gap-y-6">
            <div className="flex-[2] min-w-[250px]">
              <h3 className="text-2xl font-semibold leading-8 tracking-[-0.5px] text-white">
                Assistant Access Point
              </h3>
            </div>
            <div className="flex-[3] min-w-[325px]">
              <h4 className="text-lg font-semibold text-white mb-2">Why it matters</h4>
              <p className="text-base text-white/80 leading-6">
                The assistant needed to feel ever-present and accessible from anywhere in the platform, while remaining unobtrusive enough that teachers could choose when to engage with it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Padding */}
      <div className="h-20" />
    </div>
  );
}
