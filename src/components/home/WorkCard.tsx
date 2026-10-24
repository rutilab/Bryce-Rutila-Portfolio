'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import type { Project } from '@/components/ProjectCard';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

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
  const { title, eyebrow, description, tags, readTime, href, thumbnailContent, comingSoon, role } = project;
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
        <p className="work-facts">
          {role && <span className="work-fact-strong">{role}</span>}
          {role && <span aria-hidden="true"> · </span>}
          <span>{comingSoon ? 'Case study coming soon' : readTime.toLowerCase()}</span>
        </p>

        {live && (
          <div className="work-actions">
            <span className="work-cta" aria-hidden="true">
              View case study <span className="work-cta-arrow">→</span>
            </span>
            <button type="button" className="work-quick" onClick={() => setQuickOpen(true)}>
              Quick view
            </button>
          </div>
        )}
      </div>

      {quickOpen && <QuickView project={project} onClose={() => setQuickOpen(false)} />}
    </article>
  );
}

/** A modal summary of one case study: what it is, the artwork, and the facts. */
function QuickView({ project, onClose }: { project: Project; onClose: () => void }) {
  const { title, description, tags, href, thumbnailContent, role, team, timeline, eyebrow } = project;
  const closeRef = useRef<HTMLButtonElement>(null);
  useBodyScrollLock(true);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [onClose]);

  const facts = [
    { label: 'Timeline', value: timeline },
    { label: 'Role', value: role },
    { label: 'Team', value: team?.join(', ') },
  ].filter((f) => f.value);

  return createPortal(
    <div className="quick-backdrop" onClick={onClose}>
      <div
        className="quick-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} type="button" className="quick-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <Tags tags={tags} />
        {eyebrow && <p className="work-eyebrow">{eyebrow}</p>}
        <h2 className="quick-title">{title}</h2>
        <p className="quick-desc">{description}</p>

        <div className="quick-thumb">
          <div className="work-thumb-screen">{thumbnailContent}</div>
        </div>

        <div className="quick-footer">
          <dl className="quick-facts">
            {facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
          {href && (
            <Link href={href} className="quick-cta">
              See full case study <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
