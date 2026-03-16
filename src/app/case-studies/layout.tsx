import '@/styles/case-study.css';

export default function CaseStudiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="case-study">{children}</div>;
}
