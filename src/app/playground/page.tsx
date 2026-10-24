import type { Metadata } from 'next';
import Link from 'next/link';
import CircuitBackground from '@/components/CircuitBackground';
import CaterpillarFooter from '@/components/CaterpillarFooter';

export const metadata: Metadata = {
  title: 'Playground · Bryce Rutila',
};

/**
 * Where side projects and experiments will live. For now it says so, in the
 * home page's dress: the same frame, board and type.
 */
export default function PlaygroundPage() {
  return (
    <>
      <main className="page-framed playground-main">
        <CircuitBackground solid="[data-board-solid]" varied />
        <section className="playground-intro" data-board-solid>
          <p className="page-eyebrow">✦ Playground</p>
          <h1 className="page-title">Coming soon</h1>
          <p className="page-lede">
            A home for side projects and experiments — things I build to fix everyday annoyances and
            to try out what new tools can actually do. It’s still being wired up.
          </p>
          <Link href="/#work" className="home-about-cta">
            See my work <span className="home-about-cta-arrow" aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
      <CaterpillarFooter />
    </>
  );
}
