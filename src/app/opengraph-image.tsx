import { ImageResponse } from 'next/og';

export const alt = "Bryce's Portfolio — home hero";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Social preview image styled like the home page (dots + hero copy). */
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
          backgroundImage: 'radial-gradient(circle, #F0F0F0 1px, transparent 1px)',
          backgroundSize: '8px 8px',
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
