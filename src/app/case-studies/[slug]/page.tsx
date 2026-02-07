import { GlassCard } from '@/components/layout';
import Link from 'next/link';

interface CaseStudyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;

  // Placeholder - will be replaced with actual data fetching
  const caseStudy = {
    id: slug,
    title: `Project ${slug}`,
    description: 'Detailed description of this project will go here.',
    role: 'Lead Designer',
    duration: '3 months',
    outcomes: [
      'Outcome 1: Description of impact',
      'Outcome 2: Another key result',
      'Outcome 3: Additional achievement',
    ],
    technologies: ['Figma', 'React', 'TypeScript'],
  };

  return (
    <main className="min-h-screen px-4 pt-28 pb-8">
      <div className="max-w-4xl mx-auto">
        <GlassCard padding="lg">
          {/* Back link */}
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white/90 mb-6 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Back to Case Studies
          </Link>

          {/* Header */}
          <h1 className="text-3xl font-bold text-white mb-2">
            {caseStudy.title}
          </h1>
          <p className="text-white/70 mb-6">{caseStudy.description}</p>

          {/* Meta info */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div>
              <p className="text-white/50 text-sm">Role</p>
              <p className="text-white">{caseStudy.role}</p>
            </div>
            <div>
              <p className="text-white/50 text-sm">Duration</p>
              <p className="text-white">{caseStudy.duration}</p>
            </div>
          </div>

          {/* Technologies */}
          <div className="mb-8">
            <p className="text-white/50 text-sm mb-2">Technologies</p>
            <div className="flex flex-wrap gap-2">
              {caseStudy.technologies.map((tech) => (
                <span key={tech} className="chip">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Outcomes */}
          <div className="mb-8">
            <p className="text-white/50 text-sm mb-2">Key Outcomes</p>
            <ul className="space-y-2">
              {caseStudy.outcomes.map((outcome, index) => (
                <li key={index} className="text-white/90 flex items-start gap-2">
                  <span className="text-white/40 mt-1">•</span>
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          {/* Placeholder for content */}
          <GlassCard padding="md" className="bg-white/5">
            <p className="text-white/60 text-center py-8">
              Full case study content will be added here.
            </p>
          </GlassCard>
        </GlassCard>
      </div>
    </main>
  );
}
