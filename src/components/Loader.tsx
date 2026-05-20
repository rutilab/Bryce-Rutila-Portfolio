'use client';

import { useEffect, useRef } from 'react';

interface LoaderProps {
  heroRef: React.RefObject<SVGSVGElement | null>;
  onComplete: () => void;
}

const CFG = {
  startDelay:            200,
  sliceDuration:         420,
  sliceEase:             'cubic-bezier(0.77, 0, 0.18, 1)',
  sliceStagger:          480,
  letterDropPx:          44,
  letterInDuration:      380,
  letterInEase:          'cubic-bezier(0.34, 1.56, 0.64, 1)',
  pauseBeforeCollapse:   320,
  collapseDuration:      700,
  collapseEase:          'cubic-bezier(0.77, 0, 0.18, 1)',
  letterFadeOutDuration: 100,   // fast crossfade — happens after full collapse
  wordFadeInDuration:    140,
  holdDuration:          900,
  flipDuration:          680,
  flipEase:              'cubic-bezier(0.34, 1.56, 0.64, 1)',
  sliceExitDuration:     420,
};


// Exact x-center of each letter derived from path bounds in Bryce.svg (viewBox 0 0 604 152)
const LETTER_CENTER_FRAC = {
  b:  89.759 / 604,
  r: 204.338 / 604,
  y: 312.607 / 604,
  c: 416.555 / 604,
  e: 514.197 / 604,
};

// Exact width of each letter in the combined BRYCE SVG
const LETTER_WIDTH_FRAC = {
  b: 176.182 / 604,
  r: 155.237 / 604,
  y: 153.697 / 604,
  c: 158.320 / 604,
  e: 174.947 / 604,
};

const LETTERS = ['b', 'r', 'y', 'c', 'e'] as const;
type Letter = typeof LETTERS[number];

const SLICE_COLORS: Record<Letter, string> = {
  b: '#FF9C12',
  r: '#12B4FF',
  y: '#FFF712',
  c: '#FF12F7',
  e: '#31E300',
};

// Initial clip-path states — matches prototype entry directions
const INITIAL_CLIPS: Record<Letter, string> = {
  b: 'inset(0% 0% 0% 0%)',      // starts fully visible
  r: 'inset(0% 0% 0% 100%)',    // enters from right
  y: 'inset(100% 0% 0% 0%)',    // enters from top
  c: 'inset(0% 0% 100% 0%)',    // enters from bottom
  e: 'inset(0% 0% 0% 100%)',    // enters from right
};

const ENTRY_DIRS: Record<Letter, 'top' | 'bottom' | 'right'> = {
  b: 'top',
  r: 'right',
  y: 'top',
  c: 'bottom',
  e: 'right',
};

export default function Loader({ heroRef, onComplete }: LoaderProps) {
  const loaderRef   = useRef<HTMLDivElement>(null);
  const wordWrapRef = useRef<HTMLDivElement>(null);
  const wordSvgRef  = useRef<SVGSVGElement>(null);

  const sliceRefs = useRef<Record<Letter, HTMLDivElement | null>>({ b: null, r: null, y: null, c: null, e: null });
  const wrapRefs  = useRef<Record<Letter, HTMLDivElement | null>>({ b: null, r: null, y: null, c: null, e: null });

  // Prefetch case study pages and key assets while the animation plays
  useEffect(() => {
    const assets = [
      '/case-studies/landing-page/header-and-hero.png',
      '/butterflies/updated-br-fly-1.svg',
      '/butterflies/updated-br-fly-2.svg',
      '/butterflies/updated-br-fly-3.svg',
    ];
    assets.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  useEffect(() => {
    const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

    function expandSlice(letter: Letter, colIndex: number) {
      const vw    = window.innerWidth;
      const slice = sliceRefs.current[letter];
      const wrap  = wrapRefs.current[letter];
      if (!slice || !wrap) return;

      const startPct = (colIndex / 5) * 100;
      const endPct   = ((colIndex + 1) / 5) * 100;
      const centerPx = ((colIndex + 0.5) / 5) * vw;

      slice.style.transition = `clip-path ${CFG.sliceDuration}ms ${CFG.sliceEase}`;
      const clipFinal = `inset(0% ${(100 - endPct).toFixed(4)}% 0% ${startPct.toFixed(4)}%)`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        slice.style.clipPath = clipFinal;
      }));

      const txPx = centerPx - vw / 2;
      wrap.style.setProperty('--tx', `${txPx}px`);

      const letterSvg = wrap.querySelector<HTMLElement>('.letter-svg');
      if (letterSvg) {
        const dir = ENTRY_DIRS[letter];
        const dropPx = dir === 'bottom' ? -CFG.letterDropPx : CFG.letterDropPx;
        letterSvg.style.transition = 'none';
        letterSvg.style.setProperty('--drop', `${dropPx}px`);

        setTimeout(() => {
          wrap.style.transition = `opacity ${CFG.letterInDuration}ms ease`;
          letterSvg.style.transition = `transform ${CFG.letterInDuration}ms ${CFG.letterInEase}`;
          wrap.style.opacity = '1';
          letterSvg.style.setProperty('--drop', '0px');
        }, CFG.sliceDuration * 0.28);
      }
    }

    async function runFinale() {
      const vw      = window.innerWidth;
      const wordPxW = Math.min(Math.max(280, vw * 0.80), 820, vw * 0.92);
      const wordLeft = (vw - wordPxW) / 2;

      // Collapse each letter to its exact position in the combined BRYCE block,
      // simultaneously resizing to match its proportional width in that block
      LETTERS.forEach(l => {
        const wrap      = wrapRefs.current[l];
        const letterSvg = wrap?.querySelector<HTMLElement>('.letter-svg');
        if (!wrap || !letterSvg) return;

        const finalX      = wordLeft + LETTER_CENTER_FRAC[l] * wordPxW;
        const txPx        = finalX - vw / 2;
        const targetWidth = LETTER_WIDTH_FRAC[l] * wordPxW;

        wrap.style.transition = `transform ${CFG.collapseDuration}ms ${CFG.collapseEase}`;
        wrap.style.setProperty('--tx', `${txPx}px`);

        letterSvg.style.transition = `width ${CFG.collapseDuration}ms ${CFG.collapseEase}`;
        letterSvg.style.width = `${targetWidth}px`;
      });

      // Wait for the full collapse to settle before crossfading
      await wait(CFG.collapseDuration + 60);

      // Fade out individual letters, fade in combined word SVG
      LETTERS.forEach(l => {
        const wrap = wrapRefs.current[l];
        if (wrap) {
          wrap.style.transition = `opacity ${CFG.letterFadeOutDuration}ms ease`;
          wrap.style.opacity = '0';
        }
      });

      const wordWrap = wordWrapRef.current;
      if (wordWrap) {
        wordWrap.style.transition = `opacity ${CFG.wordFadeInDuration}ms ease`;
        wordWrap.style.opacity = '1';
      }

      await wait(Math.max(CFG.letterFadeOutDuration, CFG.wordFadeInDuration));
      await wait(CFG.holdDuration);

      // FLIP: animate word SVG to hero position
      const wordSvg = wordSvgRef.current;
      const heroSvg = heroRef.current;
      const loader  = loaderRef.current;

      if (wordSvg && heroSvg && loader) {
        const wordRect = wordSvg.getBoundingClientRect();
        const heroRect = heroSvg.getBoundingClientRect();

        const scale = heroRect.width / wordRect.width;
        const dx    = heroRect.left - wordRect.left;
        const dy    = heroRect.top  - wordRect.top;

        // Exit slices simultaneously
        LETTERS.forEach(l => {
          const slice = sliceRefs.current[l];
          if (slice) {
            slice.style.transition = `opacity ${CFG.sliceExitDuration}ms ease`;
            slice.style.opacity = '0';
          }
        });

        // Spring the word SVG to hero position
        wordSvg.style.transformOrigin = 'top left';
        wordSvg.style.transition = `transform ${CFG.flipDuration}ms ${CFG.flipEase}`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          wordSvg.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
        }));

        await wait(CFG.flipDuration + 50);

        onComplete();
        await wait(30);
        loader.style.display = 'none';
      } else {
        // Fallback if refs aren't ready
        if (loader) {
          loader.style.transition = `opacity ${CFG.sliceExitDuration}ms ease`;
          loader.style.opacity = '0';
          await wait(CFG.sliceExitDuration);
          loader.style.display = 'none';
        }
        onComplete();
      }
    }

    async function runSequence() {
      const S = CFG.sliceStagger;
      await wait(CFG.startDelay);

      expandSlice('b', 0);
      await wait(S);
      expandSlice('r', 1);
      await wait(S);
      expandSlice('y', 2);
      await wait(S);
      expandSlice('c', 3);
      await wait(S);
      expandSlice('e', 4);

      await wait(CFG.sliceDuration + 120 + CFG.pauseBeforeCollapse);
      await runFinale();
    }

    runSequence();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-anchor letters on resize during the intro phase
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const vw = window.innerWidth;
        LETTERS.forEach((l, i) => {
          const wrap = wrapRefs.current[l];
          if (!wrap) return;
          if (parseFloat(getComputedStyle(wrap).opacity) > 0.1) {
            wrap.style.setProperty('--tx', `${((i + 0.5) / 5) * vw - vw / 2}px`);
          }
        });
      }, 80);
    };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(timer); };
  }, []);

  return (
    <>
      <style>{`
        .loader-letter-wrap {
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateX(var(--tx, 0px)) translateY(-50%);
          will-change: transform, opacity;
          opacity: 0;
        }
        .letter-svg {
          width: clamp(70px, 14vw, 190px);
          height: auto;
          display: block;
          transform: translateY(var(--drop, 0px));
          will-change: transform;
        }
      `}</style>

      <div
        ref={loaderRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          overflow: 'hidden',
          background: '#ffffff',
        }}
      >
        {/* Color slices */}
        {LETTERS.map(l => (
          <div
            key={l}
            ref={el => { sliceRefs.current[l] = el; }}
            style={{
              position: 'absolute',
              inset: 0,
              background: SLICE_COLORS[l],
              clipPath: INITIAL_CLIPS[l],
              willChange: 'clip-path',
            }}
          />
        ))}

        {/* Individual letter wraps */}

        {/* B — Orange — top layer */}
        <div className="loader-letter-wrap" style={{ zIndex: 5 }} ref={el => { wrapRefs.current['b'] = el; }}>
          <svg className="letter-svg" viewBox="0 0 289 234" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M255 105.5L287 173.5L271 231.5H86L1 67.5L32 1.5H204L238 77.5L208 94.5L255 105.5Z" fill="#FF9C12" stroke="black" strokeWidth="3"/>
            <path d="M1 67.5L24 18.5L32 3.5L113 175.5L85 230.5L1 67.5Z" fill="#FF9C12" stroke="black" strokeWidth="3"/>
            <path d="M271 231.5H86L114 175.5H286.505L271 231.5Z" fill="#FF9C12" stroke="black" strokeWidth="3"/>
            <path d="M157 28.5H106L108 39.5H160L157 28.5Z" fill="#FF9C12" stroke="black" strokeWidth="3"/>
            <path d="M196 127.5H149L155 138.5H203L196 127.5Z" fill="#FF9C12" stroke="black" strokeWidth="3"/>
          </svg>
        </div>

        {/* R — Blue */}
        <div className="loader-letter-wrap" style={{ zIndex: 4 }} ref={el => { wrapRefs.current['r'] = el; }}>
          <svg className="letter-svg" viewBox="0 0 290 236" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M114.682 172.372L32.6816 3.37207L1.68164 64.3721L86.6816 232.372L114.682 172.372Z" fill="#12B4FF" stroke="black" strokeWidth="3"/>
            <path d="M148.682 233.372H87.6816L114.682 172.372L170.682 174.372L148.682 233.372Z" fill="#12B4FF" stroke="black" strokeWidth="3"/>
            <path d="M263.682 230.372H205.682L229.682 175.372H287.682L263.682 230.372Z" fill="#12B4FF" stroke="black" strokeWidth="3"/>
            <path d="M170.682 175.372L113.682 172.372L32.6816 2.37207L206.682 4.37207L240.682 79.3721L208.682 95.3721L259.682 116.372L286.682 175.372H228.682L201.682 116.372H144.682L170.682 175.372Z" fill="#12B4FF" stroke="black" strokeWidth="3"/>
            <path d="M166.682 32.3721H115.682L117.682 43.3721H169.682L166.682 32.3721Z" fill="#12B4FF" stroke="black" strokeWidth="3"/>
            <path d="M190.682 207.372L205.682 229.372L229.682 174.372L200.682 116.372H179.682L205.682 170.372L190.682 207.372Z" fill="#12B4FF" stroke="black" strokeWidth="3"/>
          </svg>
        </div>

        {/* Y — Yellow */}
        <div className="loader-letter-wrap" style={{ zIndex: 3 }} ref={el => { wrapRefs.current['y'] = el; }}>
          <svg className="letter-svg" viewBox="0 0 288 237" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M118.516 167.804L86.1777 230.577L1.69824 59.6519L32.0146 6.59823L118.516 167.804Z" fill="#FFF712" stroke="black" strokeWidth="3"/>
            <path d="M85.1484 230.901L112.196 167.791L84.1467 109.689L56.0977 171.798L85.1484 230.901Z" fill="#FFF712" stroke="black" strokeWidth="3"/>
            <path d="M199.189 1.5L285.999 176.528L264.462 234.908L87 232.5L111.5 173L36.0625 6.50876L86.1501 5.50701L110.383 58.8368H168.256L141.315 1.5H199.189Z" fill="#FFF712"/>
            <path d="M111.5 173L87 232.5L264.462 234.908L285.999 176.528L199.189 1.5H141.315L168.256 58.8368H110.383L86.1501 5.50701L36.0625 6.50876L111.5 173ZM285.999 176.528L111.5 173" stroke="black" strokeWidth="3"/>
            <path d="M33.0586 5.507L85.1497 112.694H196.344" stroke="black" strokeWidth="3"/>
          </svg>
        </div>

        {/* C — Magenta */}
        <div className="loader-letter-wrap" style={{ zIndex: 2 }} ref={el => { wrapRefs.current['c'] = el; }}>
          <svg className="letter-svg" viewBox="0 0 290 234" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M204.39 3.42628H31.7869L1.68164 63.6368L86.9799 230.219H262.594L287.682 176.03L262.594 117.826H142.173L119.092 57.6158H226.468L204.39 3.42628Z" fill="#FF12F7" stroke="black" strokeWidth="3"/>
            <path d="M114.075 174.023L31.7873 3.42628L2.68555 62.6333L87.9838 230.219L114.075 174.023Z" fill="#FF12F7" stroke="black" strokeWidth="3"/>
            <path d="M115.078 174.023L284.671 171.012L261.591 116.823H142.173L119.092 59.6228L226.468 56.6123L203.387 3.42628H31.7871L115.078 174.023Z" fill="#FF12F7" stroke="black" strokeWidth="3"/>
          </svg>
        </div>

        {/* E — Green — bottom layer */}
        <div className="loader-letter-wrap" style={{ zIndex: 1 }} ref={el => { wrapRefs.current['e'] = el; }}>
          <svg className="letter-svg" viewBox="0 0 289 233" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M204.133 3.10355H32.9359L2.72461 54.4627L86.3091 230.695H260.527L287.718 172.287L269.591 144.089H160.83L146.732 116.899H227.295L211.182 87.6951H134.647L119.542 54.4627H227.295L204.133 3.10355Z" fill="#31E300" stroke="black" strokeWidth="3"/>
            <path d="M33.9421 3.10355L114.506 171.28H285.703L263.548 230.695H89.3295L1.7168 54.4627L33.9421 3.10355Z" fill="#31E300"/>
            <path d="M89.3295 230.695H263.548L285.703 171.28H114.506L33.9421 3.10355L1.7168 54.4627L89.3295 230.695ZM114.506 171.28L89.3295 230.695" stroke="black" strokeWidth="3"/>
          </svg>
        </div>

        {/* Combined BRYCE word SVG — fades in during finale then FLIPs to hero */}
        <div
          ref={wordWrapRef}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            willChange: 'opacity',
            pointerEvents: 'none',
          }}
        >
          <svg
            ref={wordSvgRef}
            viewBox="0 0 604 152"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: 'clamp(280px, 80vw, 820px)',
              maxWidth: '92vw',
              height: 'auto',
              display: 'block',
            }}
          >
            {/* E */}
            <path d="M549.923 1.5L443.967 1.5L427.334 38.4371L478.464 147.996H585.036L601.668 111.685L590.58 94.1557L524.05 94.1557L515.425 77.2523L564.707 77.2523L553.619 55.3405H507.417L498.793 35.3068H564.707L549.923 1.5Z" fill="#31E300" stroke="black" strokeWidth="3"/>
            <path d="M445.668 6L495.715 111.059L600.439 111.059L586.887 147.996H480.315L426.721 38.4365L445.668 6Z" fill="#31E300"/>
            <path d="M480.315 147.996H586.887L600.439 111.059L495.715 111.059L445.668 6L426.721 38.4365L480.315 147.996ZM495.715 111.059L480.315 147.996" stroke="black" strokeWidth="3"/>
            {/* C */}
            <path d="M445.204 6.50781L339.248 6.50781L320.768 44.071L374.98 147.369L480.933 147.996L495.104 112.31L479.704 77.2511L407.011 77.8778L392.842 40.3146L460.168 39L445.204 6.50781Z" fill="#FF12F7" stroke="black" strokeWidth="3"/>
            <path d="M390.374 112.937L495.717 111.059L479.7 77.2523L414.402 77.2523L397.153 39.6892L461.168 39L443.352 1.5L337.396 1.5L390.374 112.937Z" fill="#FF12F7" stroke="black" strokeWidth="3"/>
            {/* Y */}
            <path d="M265.941 144.867L282.573 105.425L265.325 69.1143L248.076 107.929L265.941 144.867Z" fill="#FFF712" stroke="black" strokeWidth="3"/>
            <path d="M336.07 1.5L389.454 110.885L376.209 147.37H268.405L283.913 109.628L235.756 4.63026L266.557 4.00421L281.459 37.333L317.048 37.333L300.481 1.5L336.07 1.5Z" fill="#FFF712"/>
            <path d="M283.913 109.628L268.405 147.37H376.209L389.454 110.885L336.07 1.5L300.481 1.5L317.048 37.333L281.459 37.333L266.557 4.00421L235.756 4.63026L283.913 109.628ZM389.454 110.885L283.913 109.628" stroke="black" strokeWidth="3"/>
            <path d="M233.91 4.00439L265.943 70.992H334.322" stroke="black" strokeWidth="3"/>
            {/* R */}
            <path d="M202.491 148.622H160.602L177.85 114.188L211.115 115.441L202.491 148.622Z" fill="#12B4FF"/>
            <path d="M160.602 148.622L159.26 147.95L158.173 150.122H160.602V148.622ZM202.491 148.622V150.122H203.651L203.943 148.999L202.491 148.622ZM211.115 115.441L212.567 115.818C212.682 115.378 212.59 114.91 212.319 114.545C212.048 114.181 211.626 113.959 211.172 113.942L211.115 115.441ZM177.85 114.188L177.907 112.69L176.942 112.653L176.509 113.517L177.85 114.188ZM160.602 148.622V150.122H202.491V148.622V147.122H160.602V148.622ZM202.491 148.622L203.943 148.999L212.567 115.818L211.115 115.441L209.664 115.063L201.039 148.245L202.491 148.622ZM211.115 115.441L211.172 113.942L177.907 112.69L177.85 114.188L177.794 115.687L211.059 116.94L211.115 115.441ZM177.85 114.188L176.509 113.517L159.26 147.95L160.602 148.622L161.943 149.294L179.191 114.86L177.85 114.188Z" fill="black"/>
            <path d="M270.253 147.37L234.523 146.744L248.076 112.312H283.805L270.253 147.37Z" fill="#12B4FF" stroke="black" strokeWidth="3"/>
            <path d="M211.114 114.189H177.233L126.719 4.00439L233.907 4.62984L254.851 52.2104L235.139 62.2273L266.556 75.3744L281.956 111.685L247.459 112.311L230.827 75.3744H195.713L211.114 114.189Z" fill="#12B4FF" stroke="black" strokeWidth="3"/>
            <path d="M209.267 22.7856H177.85L179.082 29.6722H211.115L209.267 22.7856Z" fill="none" stroke="black" strokeWidth="3"/>
            <path d="M224.054 132.345L233.294 146.744L248.078 111.686L230.214 75.3745H217.277L233.294 109.181L224.054 132.345Z" fill="#12B4FF"/>
            <path d="M233.294 146.744L232.032 147.554C232.332 148.023 232.868 148.286 233.422 148.238C233.977 148.191 234.46 147.84 234.676 147.327L233.294 146.744ZM224.054 132.345L222.66 131.789L222.374 132.506L222.791 133.155L224.054 132.345ZM233.294 109.181L234.687 109.737L234.929 109.13L234.649 108.539L233.294 109.181ZM217.277 75.3745V73.8745H214.907L215.922 76.0167L217.277 75.3745ZM230.214 75.3745L231.56 74.7123L231.148 73.8745H230.214V75.3745ZM248.078 111.686L249.461 112.268L249.727 111.638L249.424 111.023L248.078 111.686ZM233.294 146.744L234.556 145.934L225.316 131.535L224.054 132.345L222.791 133.155L232.032 147.554L233.294 146.744ZM224.054 132.345L225.447 132.901L234.687 109.737L233.294 109.181L231.901 108.626L222.66 131.789L224.054 132.345ZM233.294 109.181L234.649 108.539L218.633 74.7323L217.277 75.3745L215.922 76.0167L231.938 109.824L233.294 109.181ZM217.277 75.3745V76.8745H230.214V75.3745V73.8745H217.277V75.3745ZM230.214 75.3745L228.868 76.0367L246.733 112.348L248.078 111.686L249.424 111.023L231.56 74.7123L230.214 75.3745ZM248.078 111.686L246.696 111.103L231.912 146.161L233.294 146.744L234.676 147.327L249.461 112.268L248.078 111.686Z" fill="black"/>
            {/* B */}
            <path d="M158.138 70.3666L177.85 112.938L167.994 148.622L54.0299 149.249L1.66797 46.5766L21.3807 4.00439L125.489 4.00439L147.665 52.8371L129.185 63.48L158.138 70.3666Z" fill="#FF9C12" stroke="black" strokeWidth="3"/>
            <path d="M1.66797 46.5752L15.8365 15.8986L20.7647 6.50781L70.6625 114.189L53.4139 148.622L1.66797 46.5752Z" fill="#FF9C12" stroke="black" strokeWidth="3"/>
            <path d="M167.993 148.622L54.0293 150.5L71.2779 114.189H177.545L167.993 148.622Z" fill="#FF9C12" stroke="black" strokeWidth="3" strokeLinejoin="round"/>
            <path d="M97.7648 22.1597H66.3477L67.5797 29.0462H99.6129L97.7648 22.1597Z" fill="none" stroke="black" strokeWidth="3"/>
            <path d="M121.791 84.1382H92.8379L96.534 91.0248H126.103L121.791 84.1382Z" fill="none" stroke="black" strokeWidth="3"/>
          </svg>
        </div>
      </div>
    </>
  );
}
