import { cn } from '../lib/cn'
import { getProjectStatusLabel, getProjectStatusStyles } from '../lib/projectStatus'
import type { ProjectStatus } from '../types'

interface StatusBadgeProps {
  status: ProjectStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = getProjectStatusStyles(status)

  return (
    <span
      className={cn(
        'font-display inline-flex items-center gap-2 rounded-md border-2 px-3 py-1.5 text-[10px] font-semibold uppercase transition-all',
        styles.badge,
        className,
      )}
    >
      <span
        className={cn(
          'h-2 w-2 rounded-sm',
          styles.dot,
        )}
      />
      {getProjectStatusLabel(status)}
    </span>
  )
}
