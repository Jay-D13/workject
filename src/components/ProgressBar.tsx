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
      <div className="retro-inset h-4 flex-1 overflow-hidden p-0.5">
        <div
          className="h-full rounded-[4px] border border-border/60 transition-all duration-500 ease-out"
          style={{
            width: `${percent}%`,
            background: 'repeating-linear-gradient(90deg, rgba(79,152,136,0.95) 0 12px, rgba(159,199,217,0.92) 12px 18px)',
          }}
        />
      </div>
      <span className="font-display text-[10px] whitespace-nowrap tabular-nums text-text-muted">
        {total === 0 ? '—' : `${completed}/${total}`}
      </span>
    </div>
  )
}
