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
              Work I picked up on my own time, for no reason other than wanting the thing to exist.
              No brief, no stakeholders — just an idea worth chasing far enough to find out whether
              it held up.
            </FolderIntro>

            {/* ── Projects ── */}
            <div className="projects-grid folder-page-grid">
              {PERSONAL_PROJECTS.map(p => <ProjectCard key={p.title} {...p} />)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
