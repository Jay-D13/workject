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
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all',
        status === 'started'
          ? 'border-accent-green/30 bg-accent-green/10 text-accent-green'
          : 'border-accent-amber/30 bg-accent-amber/10 text-accent-amber',
        onClick
          ? 'cursor-pointer hover:brightness-110'
          : 'cursor-default',
        className,
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'started' ? 'bg-accent-green' : 'bg-accent-amber',
        )}
      />
      {status}
    </button>
  )
}
