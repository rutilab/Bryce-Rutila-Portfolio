'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { useCursorIriGlow } from '@/hooks/useCursorIriGlow';
import { SlingshotDash } from '@/components/SlingshotDash';

type IridescentEyebrowProps = {
  label: string;
  /** Black (base) icon */
  icon: ReactNode;
  /** Same icon paths; fill is replaced with the BRYCE gradient */
  iconPathD: [string, string];
};

/**
 * Section eyebrow (star + label + dashed rule) with the same cursor-local
 * BRYCE wash used on the hero subheader. The dashed rule is a slingshot
 * easter egg — pull it down to launch a BR fly.
 */
export function IridescentEyebrow({ label, icon, iconPathD }: IridescentEyebrowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const gradId = useId().replace(/:/g, '');
  const [slinging, setSlinging] = useState(false);

  useCursorIriGlow(rootRef, fxRef);

  return (
    <div ref={rootRef} className={`iri-eyebrow${slinging ? ' is-slinging' : ''}`}>
      <div className="iri-eyebrow-base">
        <div className="iri-eyebrow-row">
          {icon}
          <span className="iri-eyebrow-label">{label}</span>
        </div>
        <SlingshotDash onActiveChange={setSlinging} />
      </div>

      <div ref={fxRef} className="iri-eyebrow-fx" aria-hidden>
        <div className="iri-eyebrow-fx-inner">
          <div className="iri-eyebrow-row">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="iri-eyebrow-icon-fx"
            >
              <defs>
                <linearGradient id={`iri-eyebrow-grad-${gradId}`} x1="0" y1="0" x2="16" y2="16" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FF9C12" />
                  <stop offset="25%" stopColor="#12B4FF" />
                  <stop offset="50%" stopColor="#FFF712" />
                  <stop offset="75%" stopColor="#FF12F7" />
                  <stop offset="100%" stopColor="#31E300" />
                </linearGradient>
              </defs>
              <path d={iconPathD[0]} fill={`url(#iri-eyebrow-grad-${gradId})`} />
              <path d={iconPathD[1]} fill="#FAF7F2" />
            </svg>
            <span className="iri-eyebrow-label-stack">
              <span className="iri-eyebrow-label-outline">{label}</span>
              <span className="iri-eyebrow-label-shine">{label}</span>
            </span>
          </div>
          <div className="iri-eyebrow-dash-shine" />
        </div>
      </div>
    </div>
  );
}
