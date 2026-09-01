'use client';

import HalftoneCanvas from '@/components/HalftoneCanvas';
import { FolderIntro } from '@/components/FolderIntro';
import { ProjectCard } from '@/components/ProjectCard';
import { PERSONAL_PROJECTS } from '@/data/projects';

/**
 * The Personal Projects folder. The cards are the home page's own — same
 * component, same list — so a project reads identically wherever you meet it.
 */
export default function PersonalProjectsPage() {
  return (
    <>
      <HalftoneCanvas />

      <div style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
        <div style={{ minHeight: '100dvh', boxSizing: 'border-box', paddingTop: '120px', paddingBottom: '120px' }}>
          <div className="folder-page">
            {/* ── Info card ── */}
            <FolderIntro eyebrow="Personal Projects">
              These are side projects I built from scratch to bring my own ideas to life. I use
              them to fix everyday annoyances and experiment with what new AI tools can actually do
              in practice.
            </FolderIntro>

            {/* ── Projects ── */}
            <div className="projects-grid folder-page-grid">
              {PERSONAL_PROJECTS.map(p => <ProjectCard key={p.title} {...p} />)}

              {/* Says the shelf isn't finished, rather than leaving the row to
                  trail off after the last real card. */}
              <div className="project-empty-slot" aria-hidden>
                <span className="project-empty-slot-text">More coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
