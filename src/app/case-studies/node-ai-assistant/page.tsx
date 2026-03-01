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
import PlaceIcon from '@mui/icons-material/Place';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import InboxIcon from '@mui/icons-material/Inbox';

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
  winningChoiceIcon: '/case-studies/node-ai/The-Winning-Choice.png',
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
        <span className="cs-caption">{caption}</span>
        <span className="cs-pill">
          <span className="cs-pill-text">{pillText}</span>
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
          <p className="cs-body">{description}</p>
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
        <h4 className="cs-subheading mb-2">{title}</h4>
        <p className="cs-body">{description}</p>
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

// Number Sticker SVG - each number has its own pill shape and path from the reference SVGs
const numberStickers = {
  1: {
    pillPath:
      'M35.3331 11.4413C38.8347 9.25994 43.4324 8.65749 47.548 10.6639C51.946 12.8083 54.4212 17.2945 54.1984 22.1073L54.1974 22.1141C54.0885 24.4247 54.0489 27.2687 54.0489 30.2205V46.9569C59.9347 49.4602 61.9595 55.4914 61.006 60.2713C59.9678 65.475 55.4484 69.9625 49.0607 70.0028L49.0616 70.0038C47.3378 70.0173 37.2553 70.0306 32.1193 70.0174H32.1085C25.4422 69.9922 21.1276 65.0658 20.1612 60.1336C19.2048 55.2509 21.3367 49.2412 27.2423 46.7918V39.9539C23.9269 38.7918 21.2912 36.199 20.0558 32.9461C17.9574 27.4206 20.1913 21.5256 25.0216 18.2498C29.6521 15.1101 32.2783 13.3525 35.3194 11.45L35.3263 11.4461L35.3331 11.4413ZM51.673 56.1346C51.7238 56.2025 51.7716 56.2721 51.8155 56.3436C51.7276 56.2004 51.6257 56.0639 51.5099 55.9364L51.673 56.1346ZM47.6193 53.9891C47.7084 54.0367 47.8004 54.0842 47.8956 54.1317L47.8946 54.1307C47.7995 54.0833 47.7074 54.0357 47.6183 53.9881L47.6193 53.9891ZM36.2384 32.5789C36.2352 32.4658 36.2295 32.3588 36.2228 32.2577C36.2362 32.4599 36.2423 32.6857 36.2423 32.9364L36.2384 32.5789ZM30.0724 25.6981C29.8573 25.8439 29.6639 25.9974 29.4903 26.1561C29.23 26.3942 29.0146 26.6444 28.8419 26.9022C28.7268 27.074 28.6306 27.2491 28.5519 27.4256C28.8275 26.8079 29.3198 26.2085 30.0724 25.6981ZM39.0226 19.7538C38.6686 19.9786 38.3158 20.2044 37.9591 20.4344L39.0226 19.7538C39.3764 19.529 39.731 19.3057 40.0919 19.0799L39.0226 19.7538ZM42.5919 18.4637C42.6543 18.4708 42.7162 18.4796 42.7775 18.4901C42.6456 18.4675 42.511 18.4527 42.3741 18.4461L42.5919 18.4637Z',
    numberPath:
      'M32.1426 61.0171C28.6489 61.0039 27.6074 56.0732 31.0352 54.979C35.5571 53.542 36.2427 52.8828 36.2427 48.4663V32.936C36.2427 30.9321 35.8604 30.5234 34.3443 30.9189C33.7114 31.0903 33.2237 31.2617 31.8789 31.5386C28.6358 32.2241 26.6319 28.0317 30.0728 25.6982C34.7002 22.5605 37.2051 20.8862 40.0923 19.0801C42.5049 17.5771 45.3394 18.8428 45.2075 21.6904C45.0889 24.2085 45.0493 27.2144 45.0493 30.2202V48.4399C45.0493 52.6982 45.814 53.4365 50.3755 55.1768C53.3682 56.3105 52.6563 60.9907 48.9912 61.0039C47.3169 61.0171 37.271 61.0303 32.1426 61.0171Z',
    filter: { x: '14.7668', y: '4.94012', width: '50.9646', height: '69.5827' },
  },
  2: {
    pillPath:
      'M39.3682 9.35449C51.6451 9.35449 60.0098 18.9846 60.0098 30.1152C60.0097 33.8905 59.0387 37.5539 57.1465 41.3438C61.3461 44.1098 63.4085 49.2314 62.3086 54.4688L62.3067 54.4775C61.8995 56.4068 61.2456 58.5684 60.6387 60.2803L60.6377 60.2822C59.9499 62.2207 58.6743 64.9915 55.9473 67.1338C53.102 69.3688 49.8837 69.9931 47.1465 70.0293C43.0703 70.0828 34.8354 70.1231 28.3223 70.0293C23.3407 69.9579 18.7356 66.9175 17.0196 61.9639C15.2609 56.8868 17.1453 51.9113 20.3516 48.5996L20.3545 48.5967C23.0561 45.8093 25.2095 43.4702 26.9268 41.501C26.6207 41.4262 26.3162 41.3418 26.0157 41.2422C20.2874 39.3444 16.5918 33.3449 18.2041 26.7207L18.2071 26.7109L18.209 26.7012C20.9173 15.6819 29.8143 9.35452 39.3682 9.35449ZM47.0274 61.0303C46.0222 61.0435 44.7592 61.0557 43.3301 61.0654L47.0274 61.0303C47.1208 61.029 47.2136 61.0271 47.3037 61.0234L47.0274 61.0303ZM38.5918 52.0361C38.657 52.2224 38.7873 52.3746 38.9678 52.4805C38.8777 52.4275 38.8005 52.3627 38.7373 52.2881C38.6742 52.2135 38.6244 52.1292 38.5918 52.0361ZM39.0908 50.6152C39.3788 50.3042 39.6612 49.9972 39.9366 49.6943L39.0908 50.6152ZM47.3535 40.3555C46.4999 41.6804 45.4721 43.107 44.2442 44.6562L44.8418 43.8916C45.81 42.6346 46.6423 41.4594 47.3535 40.3555ZM48.835 37.835C48.7297 38.0348 48.621 38.2376 48.5069 38.4424C48.7353 38.0327 48.9453 37.6327 49.1387 37.2422L48.835 37.835ZM50.6992 32.9453C50.6275 33.2753 50.5428 33.6114 50.4434 33.9541L50.5821 33.4453C50.6247 33.2775 50.6634 33.1101 50.6992 32.9453ZM50.8096 27.833C50.8381 27.9941 50.8653 28.156 50.8877 28.3193C50.968 28.9045 51.0088 29.5045 51.0088 30.1152C51.0088 29.5047 50.969 28.9053 50.8887 28.3203C50.8662 28.1566 50.8381 27.9944 50.8096 27.833ZM32.5528 30.8135C32.5891 30.7219 32.6263 30.6321 32.6641 30.5439C32.7395 30.3679 32.8175 30.1987 32.8985 30.0361C32.9794 29.8737 33.0623 29.7176 33.1485 29.5684C32.9329 29.9418 32.7341 30.3561 32.5528 30.8135ZM33.8399 28.5684C33.6931 28.7446 33.5517 28.9352 33.4151 29.1396L33.5537 28.9404C33.694 28.7452 33.8391 28.5638 33.9893 28.3965L33.8399 28.5684ZM40.9209 28.2119C40.9501 28.2468 40.9776 28.2832 41.0059 28.3193C40.9286 28.2206 40.8494 28.1251 40.7657 28.0352L40.9209 28.2119ZM36.8907 26.7822C36.0244 26.9133 35.1941 27.2809 34.4532 27.9355C35.0884 27.3742 35.7895 27.0237 36.5225 26.8525C36.6447 26.824 36.7669 26.8009 36.8907 26.7822ZM50.1699 25.5303C50.3752 26.058 50.5442 26.6057 50.6758 27.1699L50.5323 26.6113C50.4278 26.2428 50.3068 25.8821 50.1699 25.5303ZM47.4463 21.4434C48.2343 22.193 48.9074 23.0561 49.4483 24.0098C49.1732 23.5249 48.8643 23.0632 48.5235 22.6279C48.4098 22.4827 48.2926 22.3404 48.1719 22.2012C47.9427 21.9369 47.7001 21.6847 47.4463 21.4434Z',
    numberPath:
      'M28.4521 61.0303C25.6308 60.9907 24.0092 57.7607 26.8173 54.8604C40.1064 41.1494 42.2026 36.3242 42.2026 32.3955C42.2026 28.7964 40.3042 26.7266 37.6411 26.7266C35.624 26.7266 33.7124 27.8867 32.5522 30.8135C31.1152 34.4521 25.9736 32.8569 26.9492 28.8491C28.6762 21.8223 33.9892 18.355 39.3681 18.355C46.3291 18.355 51.0092 23.6021 51.0092 30.1147C51.0092 34.9399 48.3066 40.6616 39.0913 50.6152C38.0893 51.6963 38.5771 52.6455 39.645 52.6455H44.5361C45.9204 52.6323 46.5136 52.1313 47.2783 50.9712L48.0825 49.7451C49.9414 46.9106 54.3315 48.6641 53.5009 52.6191C53.1977 54.0562 52.6704 55.8228 52.1562 57.2729C51.2861 59.7251 50.0205 60.9907 47.0278 61.0303C43.0068 61.083 34.8593 61.1226 28.4521 61.0303Z',
    filter: { x: '11.8457', y: '4.85449', width: '55.2555', height: '69.731' },
  },
  3: {
    pillPath:
      'M40.2113 9.35449C49.8242 9.35464 59.8773 15.9284 59.8773 27.3594C59.8773 30.2148 59.2189 32.7648 58.1839 35.0488C60.7584 38.6186 61.6703 42.6695 61.6703 46.3047C61.6701 55.6566 56.0556 62.525 50.0296 66.3594C44.2071 70.0642 36.3239 72.0432 29.2747 70.0059C25.0099 68.7764 21.1694 66.158 19.1488 61.9209C17.1773 57.7866 17.5836 53.422 19.1576 50.0527C20.3648 47.4687 22.4426 45.0675 25.2581 43.5576C25.156 43.2154 25.0661 42.8676 24.9945 42.5137C24.8655 41.8768 24.7923 41.2413 24.7669 40.6123C22.8846 39.6894 21.1588 38.2383 19.9173 36.2461C18.1833 33.4631 17.7542 30.2077 18.4447 27.1377L18.4466 27.1279L18.4496 27.1182C20.6462 17.4534 28.9294 9.35449 40.2113 9.35449ZM32.3294 61.5029C32.2691 61.4889 32.2086 61.4759 32.1488 61.4609L32.1429 61.46C32.2047 61.4754 32.2671 61.4885 32.3294 61.5029ZM31.3294 61.2227C30.8979 61.0795 30.5012 60.9187 30.138 60.7422C30.3802 60.8599 30.6372 60.9709 30.9095 61.0742C31.0457 61.1258 31.1856 61.1749 31.3294 61.2227ZM26.8206 55.917C26.8163 56.0955 26.8214 56.2748 26.8372 56.4541L26.8216 56.1855C26.8188 56.0959 26.8185 56.0064 26.8206 55.917ZM43.4984 49.5068C43.5059 49.4275 43.516 49.3476 43.5208 49.2666V49.2539C43.5159 49.3393 43.5063 49.4234 43.4984 49.5068ZM52.6693 46.3047C52.6693 46.644 52.6569 46.979 52.6322 47.3096C52.6445 47.1443 52.6542 46.978 52.6605 46.8105L52.6693 46.3047C52.6693 46.1151 52.6657 45.9256 52.6576 45.7363L52.6693 46.3047ZM38.1712 43.3633C37.928 43.315 37.6771 43.2736 37.4193 43.2363C37.8057 43.2922 38.1761 43.3597 38.5296 43.4404L38.1712 43.3633ZM34.4056 41.9844C34.5541 42.1694 34.7265 42.339 34.9212 42.4883C34.9862 42.5381 35.0535 42.5858 35.1234 42.6309L35.1224 42.6299C34.8437 42.4497 34.6034 42.2307 34.4056 41.9844ZM51.5208 41.3408C51.5982 41.4857 51.671 41.632 51.7396 41.7793C51.6301 41.5442 51.5103 41.3118 51.3783 41.083L51.5208 41.3408ZM32.8646 30.9639C32.8369 31.0253 32.8066 31.0843 32.7767 31.1426C32.8069 31.0837 32.8376 31.0241 32.8656 30.9619L32.8646 30.9639ZM50.8763 27.3594C50.8763 27.6675 50.8606 27.9723 50.8304 28.2744C50.8453 28.1257 50.857 27.9763 50.8646 27.8262L50.8763 27.3594ZM43.9632 18.8857C44.1285 18.935 44.2916 18.9874 44.4525 19.043L43.9632 18.8857C43.798 18.8365 43.6316 18.7907 43.4622 18.748L43.9632 18.8857Z',
    numberPath:
      'M31.7734 61.3599C22.0571 58.5649 28.5698 47.2007 34.832 52.2368C39.1299 55.6909 43.5332 53.5156 43.5332 48.8354C43.5332 45.3682 40.9756 43.562 36.625 43.1401C33.54 42.8369 32.5381 38.9478 35.6626 37.3262C40.4614 34.8345 41.9775 32.6724 41.9775 30.4575C41.9775 28.1899 40.4087 26.7134 38.0488 26.7529C35.8208 26.7925 33.9619 28.2163 32.9336 30.8003C31.5098 34.373 26.3682 32.9229 27.2251 29.1128C28.6094 23.022 33.6455 18.355 40.2109 18.355C46.3149 18.355 50.8765 22.2441 50.8765 27.3594C50.8765 29.8643 49.8745 32.145 47.9365 34.6104C46.8159 36.0342 47.0005 36.9307 48.5562 38.0381C51.6675 40.2529 52.6694 43.272 52.6694 46.3042C52.6694 57.1675 39.71 63.6538 31.7734 61.3599Z',
    filter: { x: '13.3191', y: '4.85449', width: '52.8511', height: '70.4686' },
  },
} as const;

function NumberSticker({ number }: { number: 1 | 2 | 3 }) {
  const data = numberStickers[number];
  const filterId = `filter0_d_380_34375_${number}`;

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
          <feOffset />
          <feGaussianBlur stdDeviation="2.25" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}


export default function NodeAIAssistantCaseStudy() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const totalSlides = 3;

  const goToSlide = (index: number) => {
    setCarouselIndex(Math.max(0, Math.min(index, totalSlides - 1)));
  };

  const [designCarouselIndex, setDesignCarouselIndex] = useState(0);
  const totalDesignSlides = 3;

  const goToDesignSlide = (index: number) => {
    setDesignCarouselIndex(Math.max(0, Math.min(index, totalDesignSlides - 1)));
  };

  return (
    <div className="min-h-screen bg-[#262626] text-white/80">
      {/* Header Section */}
      <header className="relative bg-gradient-to-b from-[rgba(38,179,255,0.5)] to-[#262626] to-[87%]">
        <div className="max-w-[1200px] mx-auto px-6 pt-[120px] pb-[120px]">
          {/* Text */}
          <div className="text-center text-white mb-14">
            <h1 className="cs-hero">
              Node AI Assistant
            </h1>
            <p className="cs-subheading mt-4">
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
              <h4 className="cs-subheading mb-4">My Role</h4>
              <p className="cs-body">
                <span className="cs-body-bold">UX Lead</span>
                <span className="cs-body"> — </span>
                <span className="cs-body">Interaction Design, Visual Design, Information Architecture, User Flows, Prompt Engineering, Knowledge Base Management</span>
              </p>
            </div>
            {/* Team */}
            <div>
              <h4 className="cs-subheading mb-4">Team</h4>
              <p className="cs-body">
                Mike Mrazek, PM<br />
                Thomas Kennedy, SWE
              </p>
            </div>
            {/* Timeline & Status */}
            <div>
              <h4 className="cs-subheading mb-4">Timeline &amp; Status</h4>
              <p className="cs-body">
                <span className="cs-body-bold">2 Months,</span> <span className="cs-body-bold">Launched November 2024</span>
              </p>
            </div>
          </div>

          {/* Right Column - Overview */}
          <div className="flex-1 flex flex-col">
            <h4 className="cs-subheading mb-4">Overview</h4>
            <div className="flex flex-col gap-6">
              <p className="cs-body">
                With educational grants increasingly emphasizing AI integration, Finding Focus - an academic spin-off from UT Austin - needed to thoughtfully incorporate AI technology into their educational platform.
              </p>
              <p className="cs-body">
                Our experience showed that teachers who received direct support from our team had significantly higher implementation success rates. This insight led to the development of the Finding Focus AI Assistant, an LLM-powered support agent that provides on-demand support for educators.
              </p>
              <p className="cs-body">
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
                <h2 className="cs-callout max-w-[850px] mt-6">
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
              <h3 className="cs-subheading">
                Helping our teachers was the main priority
              </h3>
            </div>
            <div className="flex-[3] min-w-[325px]">
              <p className="cs-body">
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
            </div>
          </div>

          {/* Subheader + Problem Cards - centered, max 880px */}
          <div className="flex flex-col items-center w-full">
            <h3 className="text-[20px] font-medium leading-[26px] tracking-[-0.3px] text-white/80 w-full max-w-[1040px] mb-10">
              Limitations of traditional chatbots:
            </h3>
            <div className="flex flex-col gap-6 w-full max-w-[1040px]">
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
            <h2 className="relative cs-callout max-w-[870px]">
              Create a genuinely helpful assistant that provides relevant answers to teachers&apos; questions.
            </h2>
          </div>
        </div>

        {/* Objectives Section */}
        <div className="flex flex-col justify-center items-start px-20 pt-20 pb-10">
          {/* Title - left aligned with containers */}
          <div className="w-full max-w-[1040px] mb-10">
            <h3 className="text-[20px] font-medium leading-[26px] tracking-[-0.3px] text-white/80">
              Project Objectives:
            </h3>
          </div>

          {/* Objective Cards */}
          <div className="flex flex-col gap-6 w-full max-w-[1040px]">
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
              <h3 className="cs-subheading">
                Doing a deep dive into our API options
              </h3>
            </div>
            <div className="flex-[3] min-w-[325px] flex flex-col gap-4">
              <p className="cs-body">
                Before anything else, Finding Focus had to decide on the &lsquo;brain&rsquo; of our chat interface – the core technology that would enable it to understand and respond to user requests.
              </p>
              <p className="cs-body">
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

          {/* The Winning Choice Card */}
          <div className="mt-16">
            <div className="relative rounded-[32px] overflow-hidden bg-[#303030] flex flex-col justify-center items-center text-center px-20 pt-14 pb-10">
              {/* Yellow/gold radial gradient */}
              <div
                className="absolute top-0 left-0 right-0 h-[200px] pointer-events-none"
                style={{
                  background: 'radial-gradient(100% 100% at 50% 0%, rgba(38, 179, 255, 0.25) 0%, transparent 70%)',
                }}
              />
              {/* Icon in rounded pill */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assets.winningChoiceIcon} alt="" className="w-full h-full object-cover" />
              </div>

              {/* Label */}
              <span className="relative text-xl tracking-[2px] text-white/50 mb-6">THE WINNING CHOICE</span>

              {/* Heading */}
              <h2 className="relative cs-callout max-w-[870px] mb-6">
                LLM Powered API
              </h2>

              {/* Copy */}
              <p className="relative cs-body max-w-[870px]">
                For our team, an LLM powered API was exactly what we were looking for due to its ability to truly understand users queries and respond naturally with relevant information. We decided to use the Assistant&apos;s API from Open AI
              </p>
            </div>
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
                          <NumberSticker number={1} />
                        </div>
                        <div className="bg-[#262626] rounded-[24px] border-2 border-[#4d4d4d] overflow-hidden">
                          {/* Header */}
                          <div className="px-6 pt-8 pb-5">
                            <div className="flex items-center gap-4 mb-4">
                              <SmsIcon sx={{ fontSize: 32, color: '#27b4ff' }} />
                              <h3 className="cs-subheading">
                                Text Output Behavior
                              </h3>
                            </div>
                            <p className="cs-body">
                              How text is displayed in messages (e.g., letter-by-letter, word-by-word, or all at once).
                            </p>
                          </div>
                          {/* Divider */}
                          <div className="mx-6 h-1 bg-[#303030]" />
                          {/* Why it matters */}
                          <div className="px-6 pt-5 pb-6">
                            <h4 className="cs-subheading mb-6">Why it matters</h4>
                            <p className="cs-body">
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
                          <NumberSticker number={2} />
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
                          <NumberSticker number={3} />
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
          <div className="mt-4 w-full">
            {/* Header - left aligned with containers */}
            <div className="flex flex-col items-start w-full mb-10">
              <div className="w-full max-w-[1040px]">
                <h3 className="text-[20px] font-medium leading-[26px] tracking-[-0.3px] text-white/80">
                  Three Ingredients for a Great LLM Chat Experience:
                </h3>
              </div>
            </div>

            {/* Insight Cards */}
            <div className="flex flex-col gap-6 w-full max-w-[1040px]">
              {/* Card 1: Text Streaming */}
              <div className="bg-[#262626] rounded-[24px] border-2 border-[#4d4d4d] p-6">
                <StreamIcon sx={{ fontSize: 40, color: '#27b4ff', marginBottom: '16px' }} />
                <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-4">
                  Text Streaming Enables Faster Response Times
                </h4>
                <p className="text-base text-white/80 leading-6 mb-4">
                  Our analysis revealed that streaming text as it generates (ChatGPT&apos;s approach) provides quicker feedback to users rather than waiting for complete message generation (Gemini&apos;s approach), especially when using APIs.
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

          <div className="flex flex-row flex-wrap gap-x-16 gap-y-6 w-full">
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

          {/* Key Design Decisions - carousel matching Learning from existing experiences */}
          <div className="w-full mt-10">
            <div className="flex flex-col items-start w-full mb-10">
              <div className="w-full max-w-[1040px]">
                <h3 className="text-[20px] font-medium leading-[26px] tracking-[-0.3px] text-white/80">
                  Key Design Decisions:
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => goToDesignSlide(designCarouselIndex === 0 ? totalDesignSlides - 1 : designCarouselIndex - 1)}
                className="w-10 h-10 flex-shrink-0 rounded-full border border-[#4d4d4d] flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>

              <div className="overflow-hidden flex-1">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${designCarouselIndex * 100}%)` }}
                >
                  {/* Slide 1: Assistant Access Point */}
                  <div className="w-full flex-shrink-0 pt-5">
                    <div className="relative">
                      <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                        <NumberSticker number={1} />
                      </div>
                      <div className="bg-[#262626] rounded-[24px] border-2 border-[#4d4d4d] overflow-hidden">
                        <div className="px-6 pt-8 pb-5">
                          <div className="flex items-center gap-4 mb-4">
                            <PlaceIcon sx={{ fontSize: 32, color: '#27b4ff' }} />
                            <h3 className="text-2xl font-semibold leading-8 tracking-[-0.5px] text-white">
                              Assistant Access Point
                            </h3>
                          </div>
                          <p className="text-base text-white/80 leading-6">
                            Where in our interface should users access the assistant from?
                          </p>
                        </div>
                        <div className="mx-6 h-1 bg-[#303030]" />
                        <div className="px-6 pt-5 pb-6">
                          <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-6">Why it matters</h4>
                          <p className="text-base text-white/80 leading-6">
                            The assistant needed to feel ever-present and accessible from anywhere in the platform, while remaining unobtrusive enough that teachers could choose when to engage with it.
                          </p>
                        </div>
                        <div className="mx-6 h-1 bg-[#303030]" />
                        <div className="px-6 pt-5 pb-6">
                          <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-6">Explorations</h4>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="rounded-lg overflow-hidden bg-[#303030] aspect-[484/500]" />
                            <div className="rounded-lg overflow-hidden bg-[#303030] aspect-[484/500]" />
                          </div>
                          <div className="grid grid-cols-2 gap-6 mt-3">
                            <div>
                              <p className="text-base font-bold text-white/80 leading-6">Exploration 1</p>
                              <p className="text-base text-white/80 leading-6">Add caption for first exploration image.</p>
                            </div>
                            <div>
                              <p className="text-base font-bold text-white/80 leading-6">Exploration 2</p>
                              <p className="text-base text-white/80 leading-6">Add caption for second exploration image.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slide 2: Modal vs. Inline Experience */}
                  <div className="w-full flex-shrink-0 pt-5">
                    <div className="relative">
                      <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                        <NumberSticker number={2} />
                      </div>
                      <div className="bg-[#262626] rounded-[24px] border-2 border-[#4d4d4d] overflow-hidden">
                        <div className="px-6 pt-8 pb-5">
                          <div className="flex items-center gap-4 mb-4">
                            <ViewModuleIcon sx={{ fontSize: 32, color: '#27b4ff' }} />
                            <h3 className="text-2xl font-semibold leading-8 tracking-[-0.5px] text-white">
                              Modal vs. Inline Experience
                            </h3>
                          </div>
                          <p className="text-base text-white/80 leading-6">
                            How should the assistant appear in the interface — as an overlay (modal) or embedded within the page layout (inline)?
                          </p>
                        </div>
                        <div className="mx-6 h-1 bg-[#303030]" />
                        <div className="px-6 pt-5 pb-6">
                          <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-6">Why it matters</h4>
                          <p className="text-base text-white/80 leading-6">
                            The presentation affects discoverability, context, and whether users feel the assistant is part of the flow or a separate tool.
                          </p>
                        </div>
                        <div className="mx-6 h-1 bg-[#303030]" />
                        <div className="px-6 pt-5 pb-6">
                          <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-6">Explorations</h4>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="rounded-lg overflow-hidden bg-[#303030] aspect-[484/500]" />
                            <div className="rounded-lg overflow-hidden bg-[#303030] aspect-[484/500]" />
                          </div>
                          <div className="grid grid-cols-2 gap-6 mt-3">
                            <div>
                              <p className="text-base font-bold text-white/80 leading-6">Exploration 1</p>
                              <p className="text-base text-white/80 leading-6">Add caption for first exploration image.</p>
                            </div>
                            <div>
                              <p className="text-base font-bold text-white/80 leading-6">Exploration 2</p>
                              <p className="text-base text-white/80 leading-6">Add caption for second exploration image.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slide 3: Empty State Design */}
                  <div className="w-full flex-shrink-0 pt-5">
                    <div className="relative">
                      <div className="absolute left-1/2 -translate-x-1/2 -top-4 z-10">
                        <NumberSticker number={3} />
                      </div>
                      <div className="bg-[#262626] rounded-[24px] border-2 border-[#4d4d4d] overflow-hidden">
                        <div className="px-6 pt-8 pb-5">
                          <div className="flex items-center gap-4 mb-4">
                            <InboxIcon sx={{ fontSize: 32, color: '#27b4ff' }} />
                            <h3 className="text-2xl font-semibold leading-8 tracking-[-0.5px] text-white">
                              Empty State Design
                            </h3>
                          </div>
                          <p className="text-base text-white/80 leading-6">
                            How should the assistant&apos;s empty state clue users in to its functionality — without adding friction?
                          </p>
                        </div>
                        <div className="mx-6 h-1 bg-[#303030]" />
                        <div className="px-6 pt-5 pb-6">
                          <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-6">Why it matters</h4>
                          <p className="text-base text-white/80 leading-6">
                            A clear empty state sets expectations and invites interaction without overwhelming teachers who may be exploring for the first time.
                          </p>
                        </div>
                        <div className="mx-6 h-1 bg-[#303030]" />
                        <div className="px-6 pt-5 pb-6">
                          <h4 className="text-[20px] font-semibold text-white tracking-[-0.3px] leading-[26px] mb-6">Explorations</h4>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="rounded-lg overflow-hidden bg-[#303030] aspect-[484/500]" />
                            <div className="rounded-lg overflow-hidden bg-[#303030] aspect-[484/500]" />
                          </div>
                          <div className="grid grid-cols-2 gap-6 mt-3">
                            <div>
                              <p className="text-base font-bold text-white/80 leading-6">Exploration 1</p>
                              <p className="text-base text-white/80 leading-6">Add caption for first exploration image.</p>
                            </div>
                            <div>
                              <p className="text-base font-bold text-white/80 leading-6">Exploration 2</p>
                              <p className="text-base text-white/80 leading-6">Add caption for second exploration image.</p>
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
                className="w-10 h-10 flex-shrink-0 rounded-full border border-[#4d4d4d] flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ChevronRight size={20} className="text-white" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 mt-4">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => goToDesignSlide(i)}
                  className={`rounded-full transition-all ${
                    designCarouselIndex === i
                      ? 'w-3 h-3 bg-white'
                      : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Padding */}
      <div className="h-20" />
    </div>
  );
}
