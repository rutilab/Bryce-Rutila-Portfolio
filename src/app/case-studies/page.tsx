import { GlassCard } from '@/components/layout';

export default function CaseStudiesPage() {
  const caseStudies = [
    {
      id: 'node-ai-assistant',
      title: 'Node AI Assistant',
      description: 'An LLM-powered support agent that provides on-demand support for educators.',
      role: 'UX Lead — Finding Focus',
    },
    {
      id: '2',
      title: 'Project Two',
      description: 'Another project showcase with key outcomes.',
      role: 'Product Designer',
    },
    {
      id: '3',
      title: 'Project Three',
      description: 'Third project with design challenges and solutions.',
      role: 'UX Designer',
    },
  ];

  return (
    <main className="min-h-screen px-4 pt-28 pb-8">
      <div className="max-w-4xl mx-auto">
        <GlassCard padding="lg">
          <h1 className="text-3xl font-bold text-white mb-2">Case Studies</h1>
          <p className="text-white/70 mb-8">
            A collection of my recent work and the stories behind them.
          </p>

          <div className="grid gap-6">
            {caseStudies.map((study) => (
              <a
                key={study.id}
                href={`/case-studies/${study.id}`}
                className="block group"
              >
                <GlassCard
                  padding="md"
                  className="transition-all duration-300 hover:bg-white/15 hover:scale-[1.02]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-white group-hover:text-white/90">
                        {study.title}
                      </h2>
                      <p className="text-white/70 mt-1">{study.description}</p>
                      <p className="text-white/50 text-sm mt-2">{study.role}</p>
                    </div>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white/40 group-hover:text-white/70 group-hover:translate-x-1 transition-all"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </GlassCard>
              </a>
            ))}
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
