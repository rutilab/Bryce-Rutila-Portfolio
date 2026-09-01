'use client';

import { useCallback, useRef, useState } from 'react';
import { CdSleeve } from './CdSleeve';
import { DiscCloseUp, type SourceRect } from '@/components/disc/DiscCloseUp';

/**
 * Grid positions of the four sleeves inside the 427×344 fabric card, and the
 * record each one is. `artistImage` is the artist's own picture on Spotify,
 * served from Spotify's image CDN.
 */
const CDS = [
  {
    src: '/about/cds/disc-1.jpg',
    alt: 'The New Abnormal by The Strokes',
    left: 40,
    top: 24,
    release: {
      album: 'The New Abnormal',
      albumUrl: 'https://open.spotify.com/album/2xkZV2Hl1Omi8rk2D7t5lN',
      artist: 'The Strokes',
      artistUrl: 'https://open.spotify.com/artist/0epOFNiUfyON9EYx7Tpr6V',
      artistImage: 'https://i.scdn.co/image/ab6761610000517498856eea770468af6dd999d9',
    },
  },
  {
    src: '/about/cds/disc-2.jpg',
    alt: 'Two Star & The Dream Police by Mk.gee',
    left: 223,
    top: 24,
    release: {
      album: 'Two Star & The Dream Police',
      albumUrl: 'https://open.spotify.com/album/6DlLdXBGCsSDPOV8R2pCl7',
      artist: 'Mk.gee',
      artistUrl: 'https://open.spotify.com/artist/7tr9pbgNEKtG0GQTKe08Tz',
      artistImage: 'https://i.scdn.co/image/ab676161000051742dc02311bf9829215cedd18d',
    },
  },
  {
    src: '/about/cds/disc-3.jpg',
    alt: 'Absolutely by Dijon',
    left: 40,
    top: 212,
    release: {
      album: 'Absolutely',
      albumUrl: 'https://open.spotify.com/album/4E691gbRgo2Zb6ToII2DWO',
      artist: 'Dijon',
      artistUrl: 'https://open.spotify.com/artist/0knGpCTbmG4ctl1wzYRZs4',
      artistImage: 'https://i.scdn.co/image/ab6761610000517473479e6db034c4a43d4aee04',
    },
  },
  {
    src: '/about/cds/disc-4.jpg',
    alt: 'The Road to Hell is Paved With Good Intentions by Vegyn',
    left: 223,
    top: 212,
    release: {
      album: 'The Road to Hell is Paved With Good Intentions',
      albumUrl: 'https://open.spotify.com/album/6geXPbIGVA3lSoA9CrQGhR',
      artist: 'Vegyn',
      artistUrl: 'https://open.spotify.com/artist/5iUnvXddCpOrbWKm7QMr6o',
      artistImage: 'https://i.scdn.co/image/ab676161000051749e782711ee76bb0df5ad15c3',
    },
  },
];

/**
 * The fabric card of CDs, and the close-up a click opens. Owns that state so the
 * About page itself can stay a server component.
 */
export function CdCard() {
  const [open, setOpen] = useState<{ index: number; from: SourceRect } | null>(null);
  const [closing, setClosing] = useState(false);
  const tiles = useRef<(HTMLDivElement | null)[]>([]);

  const openAt = useCallback((index: number) => {
    // Measure `.cd-tile` itself: it is absolutely positioned, so the wrapper
    // holding the ref shrink-wraps to nothing.
    const el = tiles.current[index]?.querySelector<HTMLElement>('.cd-tile');
    if (!el) return;
    const r = el.getBoundingClientRect();
    // The tile is scaled by its FitBox, so take the rendered size, not 164.
    setOpen({ index, from: { x: r.left, y: r.top, size: r.width } });
    setClosing(false);
  }, []);

  const finish = useCallback(() => {
    setOpen(null);
    setClosing(false);
  }, []);

  return (
    <>
      <div
        className="relative h-[344px] w-[427px] overflow-hidden rounded-[16px]"
        style={{
          backgroundImage: 'url(/about/cd-fabric.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {CDS.map((cd, i) => (
          <div
            key={cd.src}
            ref={(el) => { tiles.current[i] = el; }}
            style={{ position: 'absolute', left: cd.left, top: cd.top }}
          >
            <CdSleeve
              src={cd.src}
              alt={cd.alt}
              onOpen={() => openAt(i)}
              discHidden={open?.index === i}
            />
          </div>
        ))}
      </div>

      {open && (
        <DiscCloseUp
          src={CDS[open.index].src}
          alt={CDS[open.index].alt}
          from={open.from}
          release={CDS[open.index].release}
          closing={closing}
          onClose={() => setClosing(true)}
          onClosed={finish}
        />
      )}
    </>
  );
}
