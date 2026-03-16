/**
 * Case study typography tokens: id, description, and CSS class name.
 * Use for documentation, style guides, or tooling. Components use the class names from CSS.
 */

export interface CaseStudyTypographyToken {
  id: string;
  description: string;
  className: string;
}

export const caseStudyTypographyTokens: CaseStudyTypographyToken[] = [
  { id: 'hero', description: 'Hero title, single line', className: 'cs-hero' },
  {
    id: 'sectionHeading',
    description: 'Main section title (e.g. Context & Problem)',
    className: 'cs-section-heading',
  },
  { id: 'heading', description: 'Large heading (40px)', className: 'cs-heading' },
  {
    id: 'subheading',
    description: 'Card/section subhead (e.g. My Role)',
    className: 'cs-subheading',
  },
  { id: 'body', description: 'Body paragraph', className: 'cs-body' },
  {
    id: 'bodyBold',
    description: 'Emphasized body',
    className: 'cs-body-bold',
  },
  {
    id: 'bodyRed',
    description: 'Body-sized red variant (e.g. problem card titles)',
    className: 'cs-body-red',
  },
  {
    id: 'calloutHeader',
    description: 'Callout header (pullquote / challenge statement)',
    className: 'cs-callout-header',
  },
  {
    id: 'calloutLabel',
    description: 'Callout label above callout content (e.g. HIGHLIGHTS, THE CHALLENGE)',
    className: 'cs-callout-label',
  },
  {
    id: 'sectionLabel',
    description: 'Section label (e.g. CONTEXT, THE PROBLEM, RESEARCH PHASE)',
    className: 'cs-section-label',
  },
  { id: 'overline', description: 'Uppercase overline', className: 'cs-overline' },
  { id: 'caption', description: 'Image/small caption', className: 'cs-caption' },
  {
    id: 'pillText',
    description: 'Pill/chip label',
    className: 'cs-pill-text',
  },
  { id: 'meta', description: 'Metadata/code', className: 'cs-meta' },
  {
    id: 'figureNumber',
    description: 'Figure number',
    className: 'cs-figure-number',
  },
  {
    id: 'cardTitle',
    description: 'Card header title',
    className: 'cs-card-title',
  },
];
