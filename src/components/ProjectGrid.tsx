import { motion, AnimatePresence } from 'framer-motion'
import type { Project, ProjectSortOption, ProjectStatusFilter } from '../types'
import { ProjectCard } from './ProjectCard'
import { EmptyState } from './EmptyState'
import { Search, LayoutGrid, List, ArrowUpDown } from 'lucide-react'
import { cn } from '../lib/cn'

interface ProjectGridProps {
  projects: Project[]
  showArchived: boolean
  onToggleArchived: () => void
  onSelectProject: (id: string) => void
  onAddProject: () => void
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  statusFilter: ProjectStatusFilter
  onStatusFilterChange: (filter: ProjectStatusFilter) => void
  sortBy: ProjectSortOption
  onSortByChange: (sort: ProjectSortOption) => void
}

export function ProjectGrid({
  projects,
  showArchived,
  onToggleArchived,
  onSelectProject,
  onAddProject,
  viewMode = 'grid',
  onViewModeChange,
  searchQuery = '',
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
}: ProjectGridProps) {
  const archiveScoped = showArchived
    ? projects
    : projects.filter(p => !p.archived)

  const statusScoped = statusFilter === 'all'
    ? archiveScoped
    : archiveScoped.filter(p => p.status === statusFilter)

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const searchScoped = statusScoped.filter(p =>
    p.title.toLowerCase().includes(normalizedQuery) ||
    p.description.toLowerCase().includes(normalizedQuery),
  )

  const toTimestamp = (date: string): number => {
    const parsed = Date.parse(date)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  const sorted = [...searchScoped].sort((a, b) => {
    let primary = 0
    if (sortBy === 'updated-desc') primary = toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt)
    if (sortBy === 'updated-asc') primary = toTimestamp(a.updatedAt) - toTimestamp(b.updatedAt)
    if (sortBy === 'title-asc') primary = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
    if (sortBy === 'title-desc') primary = b.title.localeCompare(a.title, undefined, { sensitivity: 'base' })
    if (sortBy === 'created-desc') primary = toTimestamp(b.createdAt) - toTimestamp(a.createdAt)

    if (primary !== 0) return primary

    const updatedFallback = toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt)
    if (updatedFallback !== 0) return updatedFallback
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  })

  const archived = projects.filter(p => p.archived).length
  const statusFilters: ProjectStatusFilter[] = ['all', 'started', 'pending']

  return (
    <>
      <div className="space-y-8">
        <section className="relative mx-auto w-full max-w-[1120px] overflow-hidden rounded-3xl border border-border/55 bg-bg-secondary/58 p-4 shadow-[0_16px_42px_rgba(4,9,20,0.45)] backdrop-blur-sm sm:p-5">
          <div className="pointer-events-none absolute -top-20 right-[-80px] h-36 w-36 rounded-full bg-accent-link/14 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-[-80px] h-40 w-40 rounded-full bg-accent-green/12 blur-3xl" />

          <div className="relative space-y-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h2 className="font-mono text-[1.95rem] font-semibold tracking-tight text-text-primary">
                  Project Workspace
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
                  Track active work, jump into details, and keep momentum without crowding the interface.
                </p>
              </div>
              <div className="inline-flex w-fit items-center rounded-full border border-border/60 bg-bg-primary/52 px-4 py-1.5 text-sm font-medium text-text-secondary">
                {sorted.length} visible
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="relative w-full lg:max-w-lg">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by project title or description..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full rounded-xl border border-border/70 bg-bg-primary/58 py-2.5 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted transition-all focus:border-border-hover focus:ring-2 focus:ring-accent-link/20 focus:outline-none"
                />
              </div>

              {onViewModeChange && (
                <div className="flex items-center rounded-xl border border-border/65 bg-bg-primary/58 p-1">
                  <button
                    type="button"
                    onClick={() => onViewModeChange('grid')}
                    className={cn(
                      'rounded-lg px-3 py-2 transition-all',
                      viewMode === 'grid'
                        ? 'bg-bg-tertiary/70 text-text-primary shadow-sm'
                        : 'text-text-muted hover:text-text-secondary',
                    )}
                    title="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewModeChange('list')}
                    className={cn(
                      'rounded-lg px-3 py-2 transition-all',
                      viewMode === 'list'
                        ? 'bg-bg-tertiary/70 text-text-primary shadow-sm'
                        : 'text-text-muted hover:text-text-secondary',
                    )}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {statusFilters.map(filter => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => onStatusFilterChange(filter)}
                    className={cn(
                      'rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all',
                      statusFilter === filter
                        ? 'border-accent-link/55 bg-accent-link/14 text-text-primary'
                        : 'border-border/65 bg-bg-primary/52 text-text-secondary hover:text-text-primary',
                    )}
                  >
                    {filter}
                  </button>
                ))}
                {archived > 0 && (
                  <button
                    type="button"
                    onClick={onToggleArchived}
                    className="rounded-full border border-border/65 bg-bg-primary/52 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {showArchived ? 'Hide archived' : `Show archived (${archived})`}
                  </button>
                )}
              </div>

              <label className="flex items-center gap-2 text-xs text-text-secondary">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="font-semibold uppercase tracking-[0.12em]">Sort</span>
                <select
                  value={sortBy}
                  onChange={e => onSortByChange(e.target.value as ProjectSortOption)}
                  className="rounded-lg border border-border/65 bg-bg-primary/58 px-3 py-1.5 text-xs font-medium text-text-primary focus:border-border-hover focus:outline-none"
                >
                  <option value="updated-desc">Recently updated</option>
                  <option value="updated-asc">Oldest updated</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                  <option value="created-desc">Newest created</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        {sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'
                : 'mx-auto flex w-full max-w-[1320px] flex-col gap-5',
            )}
          >
            <AnimatePresence mode="popLayout">
              {sorted.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.22, delay: i * 0.03 }}
                  layout
                >
                  <ProjectCard
                    project={project}
                    onClick={() => onSelectProject(project.id)}
                    mode={viewMode}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <motion.button
        type="button"
        onClick={onAddProject}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-green/40 bg-gradient-to-br from-accent-green to-accent-link text-3xl font-light text-bg-primary shadow-[0_16px_40px_rgba(75,211,190,0.35)] transition-all hover:shadow-[0_20px_46px_rgba(75,211,190,0.5)] sm:bottom-10 sm:right-10"
      >
        +
      </motion.button>
    </>
  )
}
