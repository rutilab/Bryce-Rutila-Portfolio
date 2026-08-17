'use client';

import { useState, type ReactNode } from 'react';
import { SlingshotDash } from '@/components/SlingshotDash';

type IridescentEyebrowProps = {
  label: string;
  /** Black (base) icon */
  icon: ReactNode;
  /** Kept for the call sites; the gradient overlay it fed has been removed */
  iconPathD?: [string, string];
};

/**
 * Section eyebrow (star + label + dashed rule). The cursor-local BRYCE wash was
 * removed so the drawn cursor's inversion reads cleanly here. The dashed rule is
 * still a slingshot easter egg — pull it down to launch a BR fly.
 */
export function IridescentEyebrow({ label, icon }: IridescentEyebrowProps) {
  const [slinging, setSlinging] = useState(false);

  return (
    <div className={`iri-eyebrow${slinging ? ' is-slinging' : ''}`}>
      <div className="iri-eyebrow-base">
        <div className="iri-eyebrow-row">
          {icon}
          <span className="iri-eyebrow-label">{label}</span>
        </div>
        <SlingshotDash onActiveChange={setSlinging} />
      </div>
    </div>
  );
}
