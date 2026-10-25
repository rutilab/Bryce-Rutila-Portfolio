'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Project } from '@/components/ProjectCard';
import { QuickView } from '@/components/home/QuickView';

/** Same rotation as the old cards, so a hover still lands on a BRYCE colour */
const HOVER_COLORS = ['#FF9C12', '#12B4FF', '#FFF712', '#FF12F7', '#31E300'] as const;
let lastHoverIdx = -1;
const nextHoverColor = () => HOVER_COLORS[(lastHoverIdx = (lastHoverIdx + 1) % HOVER_COLORS.length)];

/** 'UX DESIGN' → 'UX design'. Two-letter words are acronyms here (UX, AI) and keep their caps. */
const toTitle = (tag: string) =>
  tag !== tag.toUpperCase()
    ? tag
    : tag
        .split(' ')
        .map((w, i) => (w.length <= 2 ? w : i === 0 ? w.charAt(0) + w.slice(1).toLowerCase() : w.toLowerCase()))
        .join(' ');

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="work-tags">
      {tags.map((t) => (
        <li key={t} className="work-tag">
          {toTitle(t)}
        </li>
      ))}
    </ul>
  );
}

/**
 * A case study card, after the layout of helenxli.com: the artwork in a framed
 * well, then tags, eyebrow, headline, one-line pitch, a fact line, and the two
 * ways in — straight to the case study, or a quick look first.
 *
 * `wide` spans the whole column and gives the artwork a 16:9 well; the others
 * sit two-up with a squarer one.
 */
export function WorkCard({ project, wide = false }: { project: Project; wide?: boolean }) {
  const { title, eyebrow, description, tags, readTime, href, thumbnailContent, comingSoon } = project;
  const [hoverColor, setHoverColor] = useState<string>(HOVER_COLORS[0]);
  const [quickOpen, setQuickOpen] = useState(false);
  const live = !comingSoon && !!href;

  return (
    <article
      className={`work-card${wide ? ' work-card--wide' : ''}${live ? ' is-live' : ''}`}
      style={{ '--hover': hoverColor } as React.CSSProperties}
      onMouseEnter={() => live && setHoverColor(nextHoverColor())}
    >
      <div className="work-thumb">
        <div className="work-thumb-screen">{thumbnailContent}</div>
      </div>

      <div className="work-body">
        <Tags tags={tags} />
        {eyebrow && <p className="work-eyebrow">{eyebrow}</p>}
        <h3 className="work-title">
          {live ? (
            // Stretched over the whole card, so anywhere on it opens the study
            <Link href={href as string} className="work-title-link">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        <p className="work-desc">{description}</p>
        {/* Just the read time here; the role is in Quick view */}
        <p className="work-facts">
          <span>{comingSoon ? 'Case study coming soon' : readTime.toLowerCase()}</span>
        </p>

        {live && (
          <div className="work-actions">
            <span className="work-cta" aria-hidden="true">
              View case study <span className="work-cta-arrow">→</span>
            </span>
            {project.quickView && (
              <button type="button" className="work-quick" onClick={() => setQuickOpen(true)}>
                Quick view
              </button>
            )}
          </div>
        )}
      </div>

      {quickOpen && <QuickView project={project} onClose={() => setQuickOpen(false)} />}
    </article>
  );
}
