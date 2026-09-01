'use client';

import HalftoneCanvas from '@/components/HalftoneCanvas';
import { FolderIntro } from '@/components/FolderIntro';
import { ProjectCard } from '@/components/ProjectCard';
import { LASTINGER_PROJECTS } from '@/data/projects';

/**
 * The Lastinger Center folder — same shape as the other two, so a folder always
 * opens onto the same thing: what the work was, then the work.
 */
export default function LastingerCenterPage() {
  return (
    <>
      <HalftoneCanvas />

      <div style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
        <div style={{ minHeight: '100dvh', boxSizing: 'border-box', paddingTop: '120px', paddingBottom: '120px' }}>
          <div className="folder-page">
            {/* ── Info card ── */}
            <FolderIntro
              facts={[
                { label: 'Company', value: 'Lastinger Center for Learning' },
                { label: 'My Role', value: 'Associate UX Designer' },
                { label: 'Timeline', value: '2020 – 2022' },
              ]}
            >
              The Lastinger Center for Learning is an Edtech initiative from the University of
              Florida that aims to provide K-12 teachers with research-backed professional
              development designed to help improve student learning and achievement. I worked as an
              associate UX Designer, helping modernize their legacy user-flow and reduce design debt.
            </FolderIntro>

            {/* ── Projects ── */}
            <div className="projects-grid folder-page-grid">
              {LASTINGER_PROJECTS.map(project => (
                <ProjectCard key={project.title} {...project} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
