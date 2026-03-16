export default function CaseStudiesPage() {
  const caseStudies = [
    {
      id: 'node-ai-assistant',
      title: 'Finding Focus AI Assistant',
      description: 'An LLM-powered support agent that provides on-demand support for educators.',
      role: 'UX Lead — Finding Focus',
      image: '/case-studies/node-ai/GIFs/final-designs-hero.gif',
    },
    {
      id: 'finding-focus-landing-page',
      title: 'Finding Focus Landing Page Redesign',
      description: 'End-to-end redesign of a marketing landing page — shifting from student-centered to teacher-first.',
      role: 'UX Lead — Finding Focus',
      image: '/case-studies/landing-page/header-and-hero.png',
    },
  ];

  return (
    <main className="min-h-screen px-4 pt-28 pb-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Case Studies</h1>
          <p className="text-white/70">A collection of my recent work and the stories behind them.</p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {caseStudies.map((study) => (
            <a
              key={study.id}
              href={`/case-studies/${study.id}`}
              className="group block"
              style={{ borderRadius: '1.25rem', overflow: 'hidden' }}
            >
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'transform 0.25s ease, background 0.25s ease',
                }}
                className="group-hover:scale-[1.02]"
              >
                {/* Image preview — contained with padding */}
                <div style={{ padding: '14px 14px 0' }}>
                  <div style={{
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.06)',
                    height: 180,
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={study.image}
                      alt={study.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top',
                        display: 'block',
                        transition: 'transform 0.35s ease',
                      }}
                      className="group-hover:scale-[1.04]"
                    />
                  </div>
                </div>

                {/* Text content */}
                <div className="p-5">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h2 className="text-[17px] font-semibold text-white leading-[130%] mb-1.5">
                        {study.title}
                      </h2>
                      <p className="text-white/60 text-[13px] leading-[160%] mb-2">{study.description}</p>
                      <p className="text-white/40 text-[12px]">{study.role}</p>
                    </div>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all shrink-0 mt-0.5"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </main>
  );
}
