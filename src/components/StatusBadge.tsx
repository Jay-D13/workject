import { cn } from '../lib/cn'
import type { ProjectStatus } from '../types'

interface StatusBadgeProps {
  status: ProjectStatus
  onClick?: () => void
  className?: string
}

export function StatusBadge({ status, onClick, className }: StatusBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'font-display inline-flex items-center gap-2 rounded-md border-2 px-3 py-1.5 text-[10px] font-semibold uppercase transition-all',
        status === 'started'
          ? 'border-border bg-accent-green/20 text-accent-green'
          : 'border-border bg-accent-amber/22 text-accent-amber',
        onClick
          ? 'cursor-pointer hover:border-border-hover'
          : 'cursor-default',
        className,
      )}
    >
      <span
        className={cn(
          'h-2 w-2 rounded-sm',
          status === 'started' ? 'bg-accent-green' : 'bg-accent-amber',
        )}
      />
      {status}
    </button>
  )
}
