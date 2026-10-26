import type { Metadata } from 'next';
import CircuitBackground from '@/components/CircuitBackground';
import ChipFooter from '@/components/ChipFooter';
import CaterpillarCard from '@/components/playground/CaterpillarCard';

export const metadata: Metadata = {
  title: 'Playground · Bryce Rutila',
};

/**
 * Side projects and experiments, each one playable right on its card — no
 * clicking through to a page first. Same frame, board and type as the home page.
 */
export default function PlaygroundPage() {
  return (
    <>
      <main className="page-framed playground-main">
        <CircuitBackground solid="[data-board-solid]" varied />
        <section className="playground-intro" data-board-solid>
          <p className="page-eyebrow">✦ Playground</p>
          <h1 className="page-title">Side projects and experiments</h1>
          <p className="page-lede">
            Things I build when I’m bored, curious, or just want to see what new tools can actually do. Everything
            here works right on the page, so go ahead and play.
          </p>
        </section>
        <div className="pg-list">
          <div data-board-solid>
            <CaterpillarCard />
          </div>
          {/* Stuck to the board after the last card, so it reads as "the next one goes here" */}
          <aside className="pg-sticky" data-board-solid>
            <span className="pg-sticky-tape" aria-hidden="true" />
            <p className="pg-sticky-title">More coming soon</p>
            <p className="pg-sticky-note">Next experiment is still on the workbench.</p>
          </aside>
        </div>
      </main>
      <ChipFooter />
    </>
  );
}
