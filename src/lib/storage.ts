import type { Project, UiPreferences } from '../types'

const STORAGE_KEY = 'projstral_projects'
const UI_PREFS_KEY = 'projstral_ui_prefs'
const DEFAULT_UI_PREFS: UiPreferences = {
  viewMode: 'grid',
  statusFilter: 'all',
  sortBy: 'updated-desc',
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function exportData(): string {
  return JSON.stringify(loadProjects(), null, 2)
}

export function importData(json: string): Project[] {
  const parsed = JSON.parse(json) as Project[]
  saveProjects(parsed)
  return parsed
}

export function loadUiPreferences(): UiPreferences {
  try {
    const raw = localStorage.getItem(UI_PREFS_KEY)
    if (!raw) return DEFAULT_UI_PREFS
    const parsed = JSON.parse(raw) as Partial<UiPreferences>
    return {
      viewMode: parsed.viewMode === 'list' ? 'list' : 'grid',
      statusFilter: parsed.statusFilter === 'started' || parsed.statusFilter === 'pending'
        ? parsed.statusFilter
        : 'all',
      sortBy: parsed.sortBy === 'updated-asc' ||
        parsed.sortBy === 'title-asc' ||
        parsed.sortBy === 'title-desc' ||
        parsed.sortBy === 'created-desc'
        ? parsed.sortBy
        : 'updated-desc',
    }
  } catch {
    return DEFAULT_UI_PREFS
  }
}

export function saveUiPreferences(preferences: UiPreferences): void {
  localStorage.setItem(UI_PREFS_KEY, JSON.stringify(preferences))
}
