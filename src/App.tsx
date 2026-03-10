import { useState, useCallback, useEffect } from 'react'
import type { Project, ProjectSortOption, ProjectStatusFilter } from './types'
import { useProjects } from './hooks/useProjects'
import { Layout } from './components/Layout'
import { ProjectGrid } from './components/ProjectGrid'
import { ProjectDetail } from './components/ProjectDetail'
import { AddProjectModal } from './components/AddProjectModal'
import { loadUiPreferences, saveUiPreferences } from './lib/storage'

type View = { type: 'grid' } | { type: 'detail'; projectId: string }

function App() {
  const [initialUiPreferences] = useState(loadUiPreferences)

  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    setProjectStatus,
    toggleArchive,
    addTodo,
    toggleTodo,
    removeTodo,
    getProject,
    setProjects,
    isReady,
    coldStorageStatus,
    isColdStorageBusy,
    connectColdStorage,
  } = useProjects()

  const [view, setView] = useState<View>({ type: 'grid' })
  const [showModal, setShowModal] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialUiPreferences.viewMode)
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>(initialUiPreferences.statusFilter)
  const [sortBy, setSortBy] = useState<ProjectSortOption>(initialUiPreferences.sortBy)

  useEffect(() => {
    saveUiPreferences({ viewMode, statusFilter, sortBy })
  }, [viewMode, statusFilter, sortBy])

  const handleAddProject = useCallback((data: Parameters<typeof addProject>[0]) => {
    addProject(data)
    setShowModal(false)
  }, [addProject])

  const handleDelete = useCallback((id: string) => {
    deleteProject(id)
    setView({ type: 'grid' })
  }, [deleteProject])

  const currentProject = view.type === 'detail' ? getProject(view.projectId) : null

  return (
    <Layout
      projects={projects}
      onImport={(imported: Project[]) => setProjects(imported)}
      coldStorageStatus={coldStorageStatus}
      coldStorageBusy={isColdStorageBusy}
      onConnectColdStorage={connectColdStorage}
    >
      {!isReady ? (
        <div className="retro-panel mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="font-display text-sm uppercase tracking-[0.16em] text-text-muted">
            Loading project bank
          </p>
        </div>
      ) : view.type === 'grid' ? (
        <ProjectGrid
          projects={projects}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived(prev => !prev)}
          onSelectProject={id => setView({ type: 'detail', projectId: id })}
          onAddProject={() => setShowModal(true)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      ) : currentProject ? (
        <ProjectDetail
          project={currentProject}
          onBack={() => setView({ type: 'grid' })}
          onUpdate={updates => updateProject(currentProject.id, updates)}
          onStatusChange={status => setProjectStatus(currentProject.id, status)}
          onToggleArchive={() => toggleArchive(currentProject.id)}
          onDelete={() => handleDelete(currentProject.id)}
          onAddTodo={text => addTodo(currentProject.id, text)}
          onToggleTodo={todoId => toggleTodo(currentProject.id, todoId)}
          onRemoveTodo={todoId => removeTodo(currentProject.id, todoId)}
        />
      ) : (
        <div className="text-center py-12 text-text-secondary text-sm">
          Project not found.{' '}
          <button
            type="button"
            onClick={() => setView({ type: 'grid' })}
            className="text-accent-link hover:underline cursor-pointer"
          >
            Back to grid
          </button>
        </div>
      )}

      {showModal && (
        <AddProjectModal
          onAdd={handleAddProject}
          onClose={() => setShowModal(false)}
        />
      )}
    </Layout>
  )
}

export default App
