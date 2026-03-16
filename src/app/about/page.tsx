export default function AboutPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-20 pb-8">
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '56px 48px',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 20 }}>🚧</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 12, letterSpacing: '-0.3px' }}>
          Under Construction
        </h1>
        <p style={{ fontSize: 15, lineHeight: '170%', color: 'rgba(255,255,255,0.65)', marginBottom: 0 }}>
          I&apos;m working on creating a fun and personalized page to help you get to know the man behind the designs. Check back soon.
        </p>
      </div>
    </main>
  );
}
