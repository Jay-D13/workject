import { useState, useEffect, useCallback } from 'react'
import type { Project, ProjectStatus, Todo } from '../types'
import { loadProjects, saveProjects } from '../lib/storage'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects())

  useEffect(() => {
    saveProjects(projects)
  }, [projects])

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
      status: data.status ?? 'pending',
      repoUrl: data.repoUrl ?? '',
      archived: false,
      createdAt: now,
      updatedAt: now,
    }
    setProjects(prev => [project, ...prev])
    return project
  }, [])

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    )
  }, [])

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id))
  }, [])

  const toggleStatus = useCallback((id: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              status: (p.status === 'started' ? 'pending' : 'started') as ProjectStatus,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    )
  }, [])

  const toggleArchive = useCallback((id: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, archived: !p.archived, updatedAt: new Date().toISOString() }
          : p
      )
    )
  }, [])

  const addTodo = useCallback((projectId: string, text: string) => {
    const todo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
    }
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, todos: [...p.todos, todo], updatedAt: new Date().toISOString() }
          : p
      )
    )
  }, [])

  const toggleTodo = useCallback((projectId: string, todoId: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              todos: p.todos.map(t =>
                t.id === todoId ? { ...t, completed: !t.completed } : t
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    )
  }, [])

  const removeTodo = useCallback((projectId: string, todoId: string) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              todos: p.todos.filter(t => t.id !== todoId),
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    )
  }, [])

  const getProject = useCallback((id: string) => {
    return projects.find(p => p.id === id)
  }, [projects])

  return {
    projects,
    setProjects,
    addProject,
    updateProject,
    deleteProject,
    toggleStatus,
    toggleArchive,
    addTodo,
    toggleTodo,
    removeTodo,
    getProject,
  }
}
