import { useCallback, useEffect, useRef, useState } from 'react'
import type { Project, ProjectStatus, Todo } from '../types'
import {
  bootstrapProjects,
  connectColdStorage,
  getDisconnectedColdStorageStatus,
  getUnsupportedColdStorageStatus,
  isColdStorageCancelled,
  loadProjects,
  persistProjects,
  supportsColdStorage,
  type ColdStorageConnection,
  type ColdStorageStatus,
} from '../lib/storage'

type ProjectUpdater = Project[] | ((projects: Project[]) => Project[])

export function useProjects() {
  const [projects, setProjectsState] = useState<Project[]>(() => loadProjects())
  const [isReady, setIsReady] = useState(false)
  const [isColdStorageBusy, setIsColdStorageBusy] = useState(false)
  const [coldStorageStatus, setColdStorageStatus] = useState<ColdStorageStatus>(() =>
    supportsColdStorage()
      ? getDisconnectedColdStorageStatus()
      : getUnsupportedColdStorageStatus(),
  )

  const currentProjectsRef = useRef(projects)
  const coldStorageConnectionRef = useRef<ColdStorageConnection | null>(null)
  const persistQueueRef = useRef(Promise.resolve())
  const isReadyRef = useRef(false)

  useEffect(() => {
    currentProjectsRef.current = projects
  }, [projects])

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      setIsColdStorageBusy(true)

      try {
        const result = await bootstrapProjects()
        if (cancelled) return

        coldStorageConnectionRef.current = result.connection
        setProjectsState(result.projects)
        setColdStorageStatus(result.status)
      } catch {
        if (!cancelled) {
          coldStorageConnectionRef.current = null
          setProjectsState(loadProjects())
          setColdStorageStatus(
            supportsColdStorage()
              ? getDisconnectedColdStorageStatus()
              : getUnsupportedColdStorageStatus(),
          )
        }
      } finally {
        if (!cancelled) {
          isReadyRef.current = true
          setIsReady(true)
          setIsColdStorageBusy(false)
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const queuePersist = useCallback((nextProjects: Project[]) => {
    if (!isReadyRef.current) return

    persistQueueRef.current = persistQueueRef.current
      .then(async () => {
        const result = await persistProjects(nextProjects, coldStorageConnectionRef.current)
        coldStorageConnectionRef.current = result.connection
        setColdStorageStatus(result.status)
      })
      .catch(() => {
        coldStorageConnectionRef.current = null
        setColdStorageStatus(prev =>
          prev.mode === 'unsupported'
            ? prev
            : getDisconnectedColdStorageStatus(prev.repoName ?? undefined),
        )
      })
  }, [])

  const setProjects = useCallback((updater: ProjectUpdater) => {
    setProjectsState(prev => {
      const nextProjects = typeof updater === 'function'
        ? updater(prev)
        : updater

      queuePersist(nextProjects)
      return nextProjects
    })
  }, [queuePersist])

  const connectProjectColdStorage = useCallback(async () => {
    setIsColdStorageBusy(true)

    try {
      await persistQueueRef.current
      const result = await connectColdStorage(currentProjectsRef.current)
      coldStorageConnectionRef.current = result.connection
      setProjectsState(result.projects)
      setColdStorageStatus(result.status)
    } catch (error) {
      if (isColdStorageCancelled(error)) {
        return
      }

      setColdStorageStatus(prev =>
        prev.mode === 'unsupported'
          ? prev
          : getDisconnectedColdStorageStatus(prev.repoName ?? undefined),
      )
    } finally {
      setIsColdStorageBusy(false)
    }
  }, [])

  const addProject = useCallback((data: {
    title: string
    description?: string
    status?: ProjectStatus
    repoUrl?: string
  }) => {
    const now = new Date().toISOString()
    const project: Project = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description ?? '',
      plan: '',
      todos: [],
      status: data.status ?? 'not-started',
      repoUrl: data.repoUrl ?? '',
      archived: false,
      createdAt: now,
      updatedAt: now,
    }
    setProjects(prev => [project, ...prev])
    return project
  }, [setProjects])

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project,
      ),
    )
  }, [setProjects])

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id))
  }, [setProjects])

  const setProjectStatus = useCallback((id: string, status: ProjectStatus) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id
          ? {
              ...project,
              status,
              updatedAt: new Date().toISOString(),
            }
          : project,
      ),
    )
  }, [setProjects])

  const toggleArchive = useCallback((id: string) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id
          ? { ...project, archived: !project.archived, updatedAt: new Date().toISOString() }
          : project,
      ),
    )
  }, [setProjects])

  const addTodo = useCallback((projectId: string, text: string) => {
    const todo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
    }

    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? { ...project, todos: [...project.todos, todo], updatedAt: new Date().toISOString() }
          : project,
      ),
    )
  }, [setProjects])

  const toggleTodo = useCallback((projectId: string, todoId: string) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? {
              ...project,
              todos: project.todos.map(todo =>
                todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
              ),
              updatedAt: new Date().toISOString(),
            }
          : project,
      ),
    )
  }, [setProjects])

  const removeTodo = useCallback((projectId: string, todoId: string) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? {
              ...project,
              todos: project.todos.filter(todo => todo.id !== todoId),
              updatedAt: new Date().toISOString(),
            }
          : project,
      ),
    )
  }, [setProjects])

  const getProject = useCallback((id: string) => {
    return projects.find(project => project.id === id)
  }, [projects])

  return {
    projects,
    setProjects,
    addProject,
    updateProject,
    deleteProject,
    setProjectStatus,
    toggleArchive,
    addTodo,
    toggleTodo,
    removeTodo,
    getProject,
    isReady,
    coldStorageStatus,
    isColdStorageBusy,
    connectColdStorage: connectProjectColdStorage,
  }
}
