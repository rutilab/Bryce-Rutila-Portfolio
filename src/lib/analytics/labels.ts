/**
 * Canonical pathnames for analytics (no query string, no trailing slash except root).
 */
export function normalizePathname(pathname: string): string {
  let p = pathname.split('?')[0].split('#')[0] || '/';
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

const KNOWN: Record<string, string> = {
  '/': 'Home',
  '/about': 'About',
  '/case-studies': 'Case studies',
  '/case-studies/finding-focus': 'Finding Focus',
  '/case-studies/finding-focus-ai-assistant': 'Finding Focus · AI assistant',
  '/case-studies/finding-focus-landing-page': 'Finding Focus · Landing page',
  '/case-studies/personal-projects': 'Personal projects',
};

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(w => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

/** Human-readable label for a canonical pathname (portfolio routes). */
export function labelForPath(pathname: string): string {
  const p = normalizePathname(pathname);
  if (KNOWN[p]) return KNOWN[p];
  if (p.startsWith('/case-studies/')) {
    const slug = p.slice('/case-studies/'.length);
    if (slug && !slug.includes('/')) return slugToTitle(slug);
  }
  return p;
}
