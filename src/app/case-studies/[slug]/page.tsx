// Old glassmorphic catch-all archived at: /src/app/case-studies/[slug]/page.tsx.bak
import ComingSoon from '@/components/ComingSoon';

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;

  // Convert slug to a readable label e.g. "my-project" → "My Project"
  const label = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return <ComingSoon label={label} />;
}
