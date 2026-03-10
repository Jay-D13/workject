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
        <section className="retro-panel relative mx-auto w-full max-w-[1120px] overflow-hidden p-4 sm:p-5">
          <div className="absolute inset-x-4 top-4 h-2 rounded-full bg-[repeating-linear-gradient(90deg,rgba(159,199,217,0.65)_0_12px,rgba(184,167,219,0.65)_12px_24px,rgba(231,166,161,0.6)_24px_36px,transparent_36px_46px)] opacity-80" />

          <div className="relative space-y-5 pt-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold uppercase text-text-primary sm:text-3xl">
                  Project Workspace
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
                  Track active work, jump into details, and keep momentum without crowding the interface.
                </p>
              </div>
              <div className="retro-inset inline-flex w-fit items-center bg-[linear-gradient(180deg,rgba(159,199,217,0.18),rgba(249,240,210,0.95))] px-4 py-2 text-sm font-medium uppercase text-text-secondary">
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
                  className="retro-inset w-full py-2.5 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted transition-all focus:border-border-hover focus:outline-none"
                />
              </div>

              {onViewModeChange && (
                <div className="retro-inset bg-[linear-gradient(180deg,rgba(184,167,219,0.12),rgba(249,240,210,0.95))] flex items-center gap-1 p-1.5">
                  <button
                    type="button"
                    onClick={() => onViewModeChange('grid')}
                    className={cn(
                      'rounded-md border-2 px-3 py-2 transition-all',
                      viewMode === 'grid'
                        ? 'border-border bg-[rgba(159,199,217,0.45)] text-text-primary shadow-[2px_2px_0_rgba(75,57,40,0.85)]'
                        : 'border-transparent text-text-muted hover:text-text-secondary',
                    )}
                    title="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewModeChange('list')}
                    className={cn(
                      'rounded-md border-2 px-3 py-2 transition-all',
                      viewMode === 'list'
                        ? 'border-border bg-[rgba(184,167,219,0.38)] text-text-primary shadow-[2px_2px_0_rgba(75,57,40,0.85)]'
                        : 'border-transparent text-text-muted hover:text-text-secondary',
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
                      'rounded-md border-2 px-3.5 py-2 text-[11px] font-semibold uppercase transition-all',
                      statusFilter === filter
                        ? filter === 'all'
                          ? 'border-border bg-[rgba(159,199,217,0.45)] text-text-primary shadow-[2px_2px_0_rgba(75,57,40,0.85)]'
                          : filter === 'started'
                            ? 'border-border bg-accent-green/20 text-accent-green shadow-[2px_2px_0_rgba(75,57,40,0.85)]'
                            : 'border-border bg-accent-amber/20 text-accent-amber shadow-[2px_2px_0_rgba(75,57,40,0.85)]'
                        : 'bg-bg-secondary/80 text-text-secondary hover:border-border-hover hover:text-text-primary',
                    )}
                  >
                    {filter}
                  </button>
                ))}
                {archived > 0 && (
                  <button
                    type="button"
                    onClick={onToggleArchived}
                    className="rounded-md border-2 border-border bg-bg-secondary/80 px-3.5 py-2 text-[11px] font-semibold uppercase text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
                  >
                    {showArchived ? 'Hide archived' : `Show archived (${archived})`}
                  </button>
                )}
              </div>

              <label className="flex items-center gap-2 text-xs text-text-secondary">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="font-display text-[10px] font-semibold uppercase">Sort</span>
                <select
                  value={sortBy}
                  onChange={e => onSortByChange(e.target.value as ProjectSortOption)}
                  className="retro-inset appearance-none bg-[linear-gradient(180deg,rgba(159,199,217,0.14),rgba(249,240,210,0.95))] px-3 py-2 text-xs font-medium text-text-primary focus:border-border-hover focus:outline-none"
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
        className="retro-button retro-button-primary font-display fixed bottom-8 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-xl border-border text-3xl text-bg-elevated transition-all sm:bottom-10 sm:right-10"
      >
        +
      </motion.button>
    </>
  )
}
