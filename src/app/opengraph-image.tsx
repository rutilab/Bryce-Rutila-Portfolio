import { ImageResponse } from 'next/og';

export const alt = "Bryce's Portfolio — home hero";
/** iMessage and other clients often reject very large OG PNGs; keep layout simple for a small file. */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Social preview: plain white + text only (no dot grid — that bloated PNG size and broke some previews). */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#141510',
            letterSpacing: '-0.02em',
            textAlign: 'center',
            padding: '0 48px',
          }}
        >
          {`Howdy I'm Bryce`}
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            color: '#555555',
            marginTop: 28,
            textAlign: 'center',
            maxWidth: 900,
            padding: '0 48px',
            lineHeight: 1.35,
          }}
        >
          a product designer who brings ideas to life
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
