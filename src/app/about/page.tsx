import HalftoneCanvas from '@/components/HalftoneCanvas';
import CaterpillarFooter from '@/components/CaterpillarFooter';
import { FitBox } from '@/components/about/FitBox';
import { CdCard } from '@/components/about/CdCard';
import { FoldedLetter } from '@/components/about/FoldedLetter';
import { PhotoStack, type StackPhoto, type StackSlot } from '@/components/about/PhotoStack';
import { CaseStudyMedia, ScrollCue } from '@/components/case-study';

export const metadata = {
  title: 'About Me',
  description:
    'A little bit about Bryce Rutila — curiosity, behavior analysis, and what he does with the rest of the week.',
};

/**
 * Deck geometry — offsets are from the stage centre, deepest slot first.
 * The pile stays gathered directly behind the front print: the rotation is what
 * shows each corner, not a wide horizontal spread. Alternating sign, tightening
 * toward a front print that sits dead centre and straight.
 */
const PORTRAIT_SLOTS: StackSlot[] = [
  { dx: -12, dy: 6, rot: -6 },
  { dx: 10, dy: -4, rot: 6 },
  { dx: -5, dy: 4, rot: -3 },
  { dx: 0, dy: 0, rot: 0 },
];

/**
 * Back of the pile first, so this list reads bottom-up: the LAST entry is the
 * print you see on top. Swapping what the viewer calls first and third means
 * swapping the last and second-to-last entries here.
 */
const PORTRAITS: StackPhoto[] = [
  { src: '/about/portrait-1.jpg', alt: 'Bryce on a black-sand beach in a rash guard' },
  { src: '/about/portrait-4.jpg', alt: 'Bryce throwing a shaka on the beach' },
  { src: '/about/portrait-3.jpg', alt: 'Bryce outdoors' },
  { src: '/about/portrait-2.jpg', alt: 'Bryce out on a hike' },
];

/** Same gathered fan as the portraits — one deck reads the same as the other. */
const SUNSET_SLOTS: StackSlot[] = [
  { dx: -12, dy: 6, rot: -6 },
  { dx: 10, dy: -4, rot: 6 },
  { dx: -5, dy: 4, rot: -3 },
  { dx: 0, dy: 0, rot: 0 },
];

const SUNSETS: StackPhoto[] = [
  { src: '/about/sunset-1.jpg', alt: 'Sunset over a treeline' },
  { src: '/about/sunset-2.jpg', alt: 'Sunset across open sky' },
  { src: '/about/sunset-3.jpg', alt: 'Evening light through the trees' },
  { src: '/about/sunset-4.jpg', alt: 'Bryce watching a pink and purple sunset' },
];

/** Copy that replaced the three per-card captions. */
const FREE_TIME_INTRO =
  'When I\u2019m not working I enjoy exploring nature & taking sunset pictures, creating music & collecting Vinyls/CDs, and making digital art.';

export default function AboutPage() {
  return (
    <>
      <HalftoneCanvas />

      <main className="about-main">
        {/* ── The deck of prints ─────────────────────────────────────────── */}
        <div className="about-section">
          <div className="mx-auto w-[344px] max-w-full">
            <FitBox designWidth={344} designHeight={344}>
              <PhotoStack
                photos={PORTRAITS}
                slots={PORTRAIT_SLOTS}
                width={344}
                height={344}
                // Shorter throw than the default: this deck sits near the top of
                // the page, and a full-height arc would leave the viewport.
                liftPx={150}
                label="Photos of Bryce — click to bring the next one to the front"
              />
            </FitBox>
          </div>
        </div>

        <FoldedLetter />

        {/* ── Life outside work ──────────────────────────────────────────── */}
        <div className="about-section mt-[160px]">
          <div className="display-heading-wrap">
            <h2 className="display-heading">Life outside work.</h2>
          </div>

          <p
            className="max-w-[35em] text-[clamp(18px,1.7vw,24px)] leading-[1.667] text-[#141510]"
            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
          >
            {FREE_TIME_INTRO}
          </p>

          <div className="mt-10 grid grid-cols-1 gap-y-16 md:grid-cols-3 md:gap-y-0">
            {/* Chasing sunsets */}
            <div className="flex flex-col items-center">
              <FitBox designWidth={427} designHeight={344} className="w-full max-w-[427px]">
                <PhotoStack
                  photos={SUNSETS}
                  slots={SUNSET_SLOTS}
                  width={427}
                  height={344}
                  // Scaled up to the CD card's height; same 0.71 aspect as before.
                  printWidth={245}
                  printHeight={344}
                  label="Sunset photos — click to bring the next one to the front"
                />
              </FitBox>
            </div>

            {/* Records and discs. The sleeves are laid out ready for the expandable
                version Bryce has planned — for now the card just sits there. */}
            <div className="flex flex-col items-center">
              <FitBox designWidth={427} designHeight={344} className="w-full max-w-[427px]">
                <CdCard />
              </FitBox>
            </div>

            {/* Framed digital art. The site's own lightbox rather than a new one:
                it already carries the zoom cursor, the Escape key and the
                click-anywhere dismiss that the rest of the portfolio uses. */}
            <div className="flex flex-col items-center">
              <FitBox designWidth={427} designHeight={344} className="w-full max-w-[427px]">
                <div className="flex h-[344px] w-[427px] items-center justify-center">
                  <CaseStudyMedia
                    src="/about/digital-art.png"
                    // The card is the piece hung on a wall; full screen is the
                    // painting itself, so the frame doesn't eat the viewport.
                    lightboxSrc="/about/digital-art-full.jpg"
                    alt="A digital painting of two horses at sunset, captioned “Really, Only You Can Tell Yourself To Giddyup”"
                    maxWidth={344}
                    rounded=""
                  />
                </div>
              </FitBox>
            </div>
          </div>
        </div>
      </main>

      {/* The letter arrives folded and gives no edge to grab, so the page has to
          say that the rest of it is a scroll away. */}
      <ScrollCue gateId={null} />

      <CaterpillarFooter />
    </>
  );
}
