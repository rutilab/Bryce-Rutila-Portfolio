import { GlassCard } from '@/components/layout';

export default function AboutPage() {
  return (
    <main className="min-h-screen px-4 pt-28 pb-8">
      <div className="max-w-3xl mx-auto">
        <GlassCard padding="lg">
          <h1 className="text-3xl font-bold text-white mb-2">About Me</h1>
          <p className="text-white/70 mb-8">
            Get to know the person behind the designs.
          </p>

          {/* Bio Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">
              Hi, I&apos;m Bryce
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                I&apos;m a product designer who loves turning ideas into reality.
                My approach combines user-centered design thinking with a deep
                appreciation for beautiful, functional interfaces.
              </p>
              <p>
                When I&apos;m not designing, you can find me exploring nature,
                which is probably why I chose oil paintings of landscapes for
                this portfolio&apos;s background.
              </p>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">
              What I Do
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <GlassCard padding="sm" className="bg-white/5">
                <h3 className="text-white font-medium mb-2">Design</h3>
                <p className="text-white/60 text-sm">
                  UI Design, UX Research, Prototyping, Design Systems
                </p>
              </GlassCard>
              <GlassCard padding="sm" className="bg-white/5">
                <h3 className="text-white font-medium mb-2">Tools</h3>
                <p className="text-white/60 text-sm">
                  Figma, Framer, Adobe CC, Principle
                </p>
              </GlassCard>
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              Get in Touch
            </h2>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:bryce@example.com"
                className="glass-button text-white text-sm"
              >
                Email
              </a>
              <a
                href="https://linkedin.com/in/bryce"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button text-white text-sm"
              >
                LinkedIn
              </a>
              <a
                href="https://twitter.com/bryce"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button text-white text-sm"
              >
                Twitter
              </a>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
