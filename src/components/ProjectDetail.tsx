import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import { cn } from '../lib/cn'
import { getProjectStatusLabel, PROJECT_STATUSES } from '../lib/projectStatus'
import type { Project, ProjectStatus } from '../types'
import { StatusBadge } from './StatusBadge'
import { ProgressBar } from './ProgressBar'
import { DescriptionTab } from './DescriptionTab'
import { PlanTab } from './PlanTab'
import { TodoTab } from './TodoTab'
import { ConfirmDialog } from './ConfirmDialog'

type Tab = 'description' | 'plan' | 'todos'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
  onUpdate: (updates: Partial<Project>) => void
  onStatusChange: (status: ProjectStatus) => void
  onToggleArchive: () => void
  onDelete: () => void
  onAddTodo: (text: string) => void
  onToggleTodo: (todoId: string) => void
  onRemoveTodo: (todoId: string) => void
}

export function ProjectDetail({
  project,
  onBack,
  onUpdate,
  onStatusChange,
  onToggleArchive,
  onDelete,
  onAddTodo,
  onToggleTodo,
  onRemoveTodo,
}: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('description')
  const [confirmAction, setConfirmAction] = useState<'delete' | 'archive' | null>(null)

  const completed = project.todos.filter(t => t.completed).length
  const total = project.todos.length

  const tabs: { key: Tab; label: string }[] = [
    { key: 'description', label: 'Description' },
    { key: 'plan', label: 'Plan' },
    { key: 'todos', label: `Todos${total > 0 ? ` (${completed}/${total})` : ''}` },
  ]

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      <div className="retro-panel mx-auto w-full max-w-6xl p-5 sm:p-8 lg:p-10">
        <div className="mb-7 flex flex-wrap items-start gap-3 sm:flex-nowrap sm:gap-4">
          <button
            type="button"
            onClick={onBack}
            className="retro-button mt-1 p-2.5 text-text-muted transition-all hover:border-border-hover hover:text-text-primary"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="font-project-title text-2xl leading-tight text-text-primary break-words sm:text-3xl lg:text-4xl">
              {project.title}
            </h2>
            <p className="text-sm text-text-muted sm:text-base">
              Created {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center gap-3 sm:w-auto sm:flex-nowrap">
            <StatusBadge status={project.status} />
            <select
              value={project.status}
              onChange={e => onStatusChange(e.target.value as ProjectStatus)}
              aria-label="Project status"
              className="retro-inset min-w-[11rem] px-3 py-2 text-xs font-semibold uppercase text-text-primary focus:border-border-hover focus:outline-none"
            >
              {PROJECT_STATUSES.map(status => (
                <option key={status} value={status}>
                  {getProjectStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ProgressBar completed={completed} total={total} className="mb-8" />

        <div className="retro-inset mb-8 flex flex-wrap items-center gap-3 bg-[linear-gradient(180deg,rgba(159,199,217,0.12),rgba(249,240,210,0.95))] p-3 sm:p-4">
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="retro-button inline-flex items-center gap-2 bg-[linear-gradient(180deg,rgba(159,199,217,0.26),rgba(232,214,171,1))] px-3 py-2 text-sm font-medium text-accent-link transition-colors hover:border-border-hover"
            >
              <ExternalLink className="h-4 w-4" />
              Open repository
            </a>
          )}
          <span className="text-sm text-text-muted">
            Last updated {new Date(project.updatedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setConfirmAction('archive')}
            className="retro-button inline-flex items-center gap-2 px-3 py-2 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-accent-amber"
          >
            {project.archived ? (
              <><ArchiveRestore className="h-4 w-4" /> unarchive</>
            ) : (
              <><Archive className="h-4 w-4" /> archive</>
            )}
          </button>
          <button
            type="button"
            onClick={() => setConfirmAction('delete')}
            className="retro-button inline-flex items-center gap-2 px-3 py-2 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-accent-red"
          >
            <Trash2 className="h-4 w-4" />
            delete
          </button>
        </div>

        <div className="mb-7 overflow-x-auto">
          <div className="retro-inset inline-flex min-w-full gap-2 p-1.5">
            {tabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'rounded-md border-2 px-4 py-2.5 text-sm font-semibold transition-all sm:px-6',
                  activeTab === tab.key
                    ? tab.key === 'description'
                      ? 'border-border bg-[rgba(159,199,217,0.45)] text-text-primary shadow-[2px_2px_0_rgba(75,57,40,0.85)]'
                      : tab.key === 'plan'
                        ? 'border-border bg-[rgba(184,167,219,0.4)] text-text-primary shadow-[2px_2px_0_rgba(75,57,40,0.85)]'
                        : 'border-border bg-[rgba(231,166,161,0.34)] text-text-primary shadow-[2px_2px_0_rgba(75,57,40,0.85)]'
                    : 'border-transparent text-text-muted hover:text-text-secondary',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          {activeTab === 'description' && (
            <DescriptionTab
              description={project.description}
              onSave={description => onUpdate({ description })}
            />
          )}
          {activeTab === 'plan' && (
            <PlanTab
              plan={project.plan}
              onSave={plan => onUpdate({ plan })}
            />
          )}
          {activeTab === 'todos' && (
            <TodoTab
              todos={project.todos}
              onAdd={onAddTodo}
              onToggle={onToggleTodo}
              onRemove={onRemoveTodo}
            />
          )}
        </div>
      </div>

      {confirmAction === 'delete' && (
        <ConfirmDialog
          title="Delete project"
          message={`Are you sure you want to permanently delete "${project.title}"? This cannot be undone.`}
          confirmLabel="delete"
          confirmVariant="danger"
          onConfirm={() => { onDelete(); setConfirmAction(null) }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      {confirmAction === 'archive' && (
        <ConfirmDialog
          title={project.archived ? 'Unarchive project' : 'Archive project'}
          message={project.archived
            ? `Restore "${project.title}" to the active grid?`
            : `Archive "${project.title}"? It will be hidden from the grid.`
          }
          confirmLabel={project.archived ? 'unarchive' : 'archive'}
          onConfirm={() => { onToggleArchive(); setConfirmAction(null) }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </motion.div>
  )
}
