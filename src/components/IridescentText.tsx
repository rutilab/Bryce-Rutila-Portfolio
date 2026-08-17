'use client';

type IridescentTextProps = {
  text: string;
  className?: string;
};

/**
 * Hero copy. Previously carried a cursor-local BRYCE-colored wash; that was
 * removed so the drawn cursor's inversion reads cleanly over the text instead of
 * competing with a second hover effect.
 */
export function IridescentText({ text, className }: IridescentTextProps) {
  return (
    <span className={['subheader-iri', className].filter(Boolean).join(' ')}>
      <span className="subheader-iri-base">{text}</span>
    </span>
  );
}
