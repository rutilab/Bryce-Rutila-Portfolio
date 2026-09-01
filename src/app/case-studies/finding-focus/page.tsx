'use client';

import { useState } from 'react';
import HalftoneCanvas from '@/components/HalftoneCanvas';
import { FolderIntro } from '@/components/FolderIntro';
import { ProjectCard } from '@/components/ProjectCard';
import { FINDING_FOCUS_PROJECTS } from '@/data/projects';

export default function FindingFocus() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <HalftoneCanvas />
      {/* ── Finding Focus page ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'transparent',
          transition: 'opacity 0.45s ease, visibility 0.45s ease',
          opacity: chatOpen ? 0 : 1,
          visibility: chatOpen ? 'hidden' : 'visible',
        }}
      >

        {/* ── Fills the viewport, but in flow — the document scrolls, so the
               footer sits below this rather than under a fixed layer.
               Bottom padding accounts for the chat bar. ── */}
        <div
          style={{
            minHeight: '100dvh',
            boxSizing: 'border-box',
            paddingTop: '120px',
            paddingBottom: '120px',
          }}
        >

          {/* ── Centered content column ── */}
          <div className="folder-page">

            {/* ── Info card ── */}
            <FolderIntro
              facts={[
                { label: 'Company', value: 'Finding Focus' },
                { label: 'My Role', value: 'Lead UX Designer & Researcher' },
                { label: 'Timeline', value: '2022 – 2026' },
              ]}
            >
              Finding Focus is a UT Austin-backed EdTech non-profit delivering attention-training
              software to K-12 classrooms. Over the last four years, I’ve led end-to-end design and
              research across our web and mobile ecosystem; taking features from initial classroom
              discovery to shipped product.
            </FolderIntro>

            {/* ── Case study cards — the home page's own, from one shared list ── */}
            <div className="projects-grid folder-page-grid">
              {FINDING_FOCUS_PROJECTS.map(project => (
                <ProjectCard key={project.title} {...project} />
              ))}
            </div>

          </div>
        </div>

        {/* ── BAR 9000 chat bar — pinned near bottom, centered ── */}
        {/* <button
          onClick={() => setChatOpen(true)}
          aria-label="Open chat with BAR 9000"
          style={{
            position: 'absolute',
            bottom: '9.4%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'clamp(280px, 38.9vw, 560px)',
            height: '48px',
            background: '#0f0f0e',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'text',
            display: 'flex',
            alignItems: 'center',
            padding: '0 22px',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <span
            style={{
              color: 'rgba(255, 255, 255, 0.42)',
              fontSize: '15px',
              fontFamily: 'var(--font-sf-pro)',
              letterSpacing: '-0.15px',
              userSelect: 'none',
            }}
          >
            Ask BAR 9000 about my work...
          </span>
        </button> */}

      </div>

      {/* ── Chat overlay — mounts when chat bar is clicked ── */}
      {/* {chatOpen && (
        <ChatContainer
          disclaimerVisible={false}
          disclaimerHeight={0}
        />
      )} */}
    </>
  );
}
