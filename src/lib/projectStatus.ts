import type { ProjectStatus } from '../types'

export const PROJECT_STATUSES: ProjectStatus[] = ['not-started', 'in-progress', 'finished']

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  'not-started': 'not started',
  'in-progress': 'in progress',
  finished: 'finished',
}

const PROJECT_STATUS_STYLES: Record<ProjectStatus, { badge: string; dot: string }> = {
  'not-started': {
    badge: 'border-border bg-accent-amber/22 text-accent-amber',
    dot: 'bg-accent-amber',
  },
  'in-progress': {
    badge: 'border-border bg-accent-green/20 text-accent-green',
    dot: 'bg-accent-green',
  },
  finished: {
    badge: 'border-border bg-accent-sky/20 text-accent-link',
    dot: 'bg-accent-sky',
  },
}

export function isProjectStatus(value: unknown): value is ProjectStatus {
  return PROJECT_STATUSES.includes(value as ProjectStatus)
}

export function normalizeProjectStatus(value: unknown): ProjectStatus | null {
  if (isProjectStatus(value)) return value
  if (value === 'pending') return 'not-started'
  if (value === 'started') return 'in-progress'
  return null
}

export function getProjectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status]
}

export function getProjectStatusStyles(status: ProjectStatus) {
  return PROJECT_STATUS_STYLES[status]
}
