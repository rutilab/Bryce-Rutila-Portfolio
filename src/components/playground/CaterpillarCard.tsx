'use client';

import { useState } from 'react';
import CaterpillarPlayground from '@/components/playground/CaterpillarPlayground';

/**
 * The caterpillar scene as a playground card, played right where it sits:
 * mounted like a pinned specimen, with a tally of what's hatched and been
 * netted across the top and a collection label in the corner.
 */
export default function CaterpillarCard() {
  const [hatched, setHatched] = useState(0);
  const [netted, setNetted] = useState(0);

  return (
    <article className="pg-card">
      <div className="specimen">
        <span className="specimen-pin" aria-hidden="true" />
        <span className="specimen-pin" aria-hidden="true" />
        <span className="specimen-pin" aria-hidden="true" />
        <span className="specimen-pin" aria-hidden="true" />
        <div className="specimen-bar" aria-live="polite">
          <span>Specimen 01</span>
          <span className="specimen-tally">
            Hatched <b>{hatched}</b> · Netted <b>{netted}</b>
          </span>
        </div>
        <CaterpillarPlayground onHatch={() => setHatched((n) => n + 1)} onCatch={() => setNetted((n) => n + 1)} />
        <p className="specimen-label" aria-hidden="true">
          <i>Lepidoptera bryceus</i>
          <br />
          Coll. B. Rutila, 2026
        </p>
      </div>
      <p className="pg-caption">
        Click a caterpillar to spin its cocoon, click the cocoon to hatch it, then catch the butterfly with your net
      </p>
      <p className="pg-credit">Pixel art drawn on canvas · this site&rsquo;s original footer</p>
    </article>
  );
}
