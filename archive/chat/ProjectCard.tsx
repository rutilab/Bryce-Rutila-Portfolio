'use client';

import { cn } from '@/lib/utils';
import type { CaseStudy } from '@/types';

interface ProjectCardProps {
  project: CaseStudy;
  onClick?: () => void;
  className?: string;
}

export function ProjectCard({ project, onClick, className }: ProjectCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-48 h-32 bg-black/40 backdrop-blur-sm rounded-xl',
        'hover:bg-black/50 transition-colors cursor-pointer',
        'flex flex-col justify-end p-3 text-left',
        'border border-white/10',
        className
      )}
    >
      {project.thumbnail && (
        <div
          className="absolute inset-0 rounded-xl bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${project.thumbnail})` }}
        />
      )}
      <div className="relative z-10">
        <span className="text-white/90 text-sm font-medium line-clamp-2">
          {project.title}
        </span>
        {project.role && (
          <span className="text-white/50 text-xs mt-1 block">
            {project.role}
          </span>
        )}
      </div>
    </button>
  );
}

// Component for rendering multiple project cards in a row
interface ProjectCardsProps {
  projects: CaseStudy[];
  onProjectClick?: (projectId: string) => void;
  className?: string;
}

export function ProjectCards({
  projects,
  onProjectClick,
  className,
}: ProjectCardsProps) {
  return (
    <div className={cn('flex gap-3 overflow-x-auto pb-2', className)}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={() => onProjectClick?.(project.id)}
          className="flex-shrink-0"
        />
      ))}
    </div>
  );
}
