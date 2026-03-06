export type ProjectStatus = 'started' | 'pending'
export type ProjectSortOption =
  | 'updated-desc'
  | 'updated-asc'
  | 'title-asc'
  | 'title-desc'
  | 'created-desc'
export type ProjectStatusFilter = 'all' | ProjectStatus

export interface Todo {
  id: string
  text: string
  completed: boolean
}

export interface Project {
  id: string
  title: string
  description: string
  plan: string
  todos: Todo[]
  status: ProjectStatus
  repoUrl: string
  archived: boolean
  createdAt: string
  updatedAt: string
}

export interface UiPreferences {
  viewMode: 'grid' | 'list'
  statusFilter: ProjectStatusFilter
  sortBy: ProjectSortOption
}
