import { ExternalLink } from 'lucide-react'
import { cn } from '../lib/cn'
import type { Project } from '../types'
import { StatusBadge } from './StatusBadge'
import { ProgressBar } from './ProgressBar'

interface ProjectCardProps {
  project: Project
  onClick: () => void
  mode?: 'grid' | 'list'
}

export function ProjectCard({ project, onClick, mode = 'grid' }: ProjectCardProps) {
  const completed = project.todos.filter(t => t.completed).length
  const total = project.todos.length

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex h-full w-full flex-col rounded-3xl border border-border/55 bg-gradient-to-b from-bg-secondary/70 to-bg-primary/78 p-6 text-left shadow-[0_12px_28px_rgba(5,10,24,0.46)] transition-all duration-300',
        'hover:-translate-y-1 hover:border-border-hover/85 hover:shadow-[0_16px_36px_rgba(5,10,24,0.58)]',
        mode === 'list' && 'sm:px-7 sm:py-6',
        project.archived && 'opacity-60 saturate-50',
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <h3 className="font-mono text-xl font-semibold leading-tight text-text-primary line-clamp-2">
          {project.title}
        </h3>
        <StatusBadge status={project.status} />
      </div>

      <div className="mb-7 flex-1">
        {project.description && (
          <p className={cn(
            'text-sm leading-relaxed text-text-secondary sm:text-[15px]',
            mode === 'list'
              ? 'line-clamp-3 max-w-[86ch]'
              : 'line-clamp-5',
          )}>
            {project.description}
          </p>
        )}
      </div>

      <div className="mt-auto">
        <ProgressBar completed={completed} total={total} className="mb-5" />

        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <span className="text-xs font-medium text-text-muted">
            {new Date(project.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {project.repoUrl && (
            <span className="rounded-lg border border-border/70 bg-bg-secondary/70 p-1.5 text-text-muted transition-colors group-hover:border-border-hover group-hover:text-text-primary">
              <ExternalLink className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
