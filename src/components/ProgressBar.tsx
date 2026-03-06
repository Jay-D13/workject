import { cn } from '../lib/cn'

interface ProgressBarProps {
  completed: number
  total: number
  className?: string
}

export function ProgressBar({ completed, total, className }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-bg-tertiary/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-emerald/90 to-accent-link/90 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="font-mono text-xs whitespace-nowrap tabular-nums text-text-muted">
        {total === 0 ? '—' : `${completed}/${total}`}
      </span>
    </div>
  )
}
