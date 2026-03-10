import type { Project, UiPreferences } from '../types'
import { isProjectStatus, normalizeProjectStatus } from './projectStatus'

declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      id?: string
      mode?: 'read' | 'readwrite'
    }) => Promise<FileSystemDirectoryHandle>
  }
}

const STORAGE_KEY = 'projstral_projects'
const STORAGE_STATE_KEY = 'projstral_projects_state'
const UI_PREFS_KEY = 'projstral_ui_prefs'
const COLD_STORAGE_DB = 'projstral_cold_storage'
const COLD_STORAGE_STORE = 'handles'
const COLD_STORAGE_KEY = 'repo-root'
const COLD_STORAGE_FOLDER = '.projects'
const COLD_STORAGE_LEGACY_FILE = 'projects.json'
const COLD_STORAGE_STATE_FILE = '.state.json'
const COLD_STORAGE_FORMAT_VERSION = 2
const DEFAULT_UI_PREFS: UiPreferences = {
  viewMode: 'grid',
  statusFilter: 'all',
  sortBy: 'updated-desc',
}

export type ColdStorageMode = 'unsupported' | 'disconnected' | 'connected'

export interface ColdStorageStatus {
  mode: ColdStorageMode
  repoName: string | null
  detail: string
}

export interface ProjectsBootstrap {
  projects: Project[]
  status: ColdStorageStatus
  connection: ColdStorageConnection | null
}

export interface PersistProjectsResult {
  status: ColdStorageStatus
  connection: ColdStorageConnection | null
}

export interface ColdStorageConnection {
  repoHandle: FileSystemDirectoryHandle
  repoName: string
}

type PermissionMode = 'read' | 'readwrite'
type PermissionState = 'denied' | 'granted' | 'prompt'
type PermissionAwareHandle = FileSystemHandle & {
  queryPermission: (descriptor?: { mode?: PermissionMode }) => Promise<PermissionState>
  requestPermission: (descriptor?: { mode?: PermissionMode }) => Promise<PermissionState>
}
type DirectoryHandleWithEntries = FileSystemDirectoryHandle & {
  entries: () => AsyncIterableIterator<[string, FileSystemHandle]>
}
type StoredProjectRecord = Omit<Project, 'status'> & {
  status: unknown
}
type DatasetSource = 'empty' | 'legacy' | 'per-project'

interface ProjectsStateMetadata {
  lastChangedAt: string
}

interface FilesystemProjectsState extends ProjectsStateMetadata {
  formatVersion: typeof COLD_STORAGE_FORMAT_VERSION
  migratedFromLegacy?: boolean
}

interface ProjectDataset {
  projects: Project[]
  state: ProjectsStateMetadata
  source: DatasetSource
}

interface WriteFilesystemOptions {
  migratedFromLegacy?: boolean
  removeLegacyFile?: boolean
}

const COLD_STORAGE_CANCELLED = 'AbortError'

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? parseProjectsJson(raw) : []
  } catch {
    return []
  }
}

export function saveProjects(projects: Project[], state = getFallbackProjectsState(projects)): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  saveProjectsState(state)
}

export async function bootstrapProjects(): Promise<ProjectsBootstrap> {
  const localDataset = loadLocalDataset()

  if (!supportsColdStorage()) {
    return {
      projects: localDataset.projects,
      status: getUnsupportedColdStorageStatus(),
      connection: null,
    }
  }

  const repoHandle = await loadPersistedRepoHandle()
  if (!repoHandle) {
    return {
      projects: localDataset.projects,
      status: getDisconnectedColdStorageStatus(),
      connection: null,
    }
  }

  const connection: ColdStorageConnection = {
    repoHandle,
    repoName: repoHandle.name,
  }

  const hasPermission = await ensurePermission(repoHandle, 'readwrite', false)
  if (!hasPermission) {
    return {
      projects: localDataset.projects,
      status: getDisconnectedColdStorageStatus(connection.repoName),
      connection: null,
    }
  }

  try {
    const filesystemDataset = await readFilesystemDataset(connection)
    const resolvedDataset = resolveProjectDatasets(localDataset, filesystemDataset)

    await writeFilesystemDataset(connection, resolvedDataset, {
      migratedFromLegacy: filesystemDataset.source === 'legacy',
      removeLegacyFile: filesystemDataset.source === 'legacy',
    })
    saveProjects(resolvedDataset.projects, resolvedDataset.state)

    return {
      projects: resolvedDataset.projects,
      status: getConnectedColdStorageStatus(connection.repoName),
      connection,
    }
  } catch {
    await clearPersistedRepoHandle()
    return {
      projects: localDataset.projects,
      status: getDisconnectedColdStorageStatus(connection.repoName),
      connection: null,
    }
  }
}

export async function connectColdStorage(currentProjects: Project[]): Promise<ProjectsBootstrap> {
  if (!supportsColdStorage() || !window.showDirectoryPicker) {
    return {
      projects: currentProjects,
      status: getUnsupportedColdStorageStatus(),
      connection: null,
    }
  }

  const repoHandle = await window.showDirectoryPicker({
    id: 'projstral-cold-storage',
    mode: 'readwrite',
  })

  const hasPermission = await ensurePermission(repoHandle, 'readwrite', true)
  if (!hasPermission) {
    return {
      projects: currentProjects,
      status: getDisconnectedColdStorageStatus(repoHandle.name),
      connection: null,
    }
  }

  const projectsDirExists = await directoryExists(repoHandle, COLD_STORAGE_FOLDER)
  if (!projectsDirExists) {
    const createDirectory = window.confirm(
      `Create ${COLD_STORAGE_FOLDER}/<project-id>.json files in ${repoHandle.name}?`,
    )
    if (!createDirectory) {
      throw new DOMException('Cold storage setup cancelled', COLD_STORAGE_CANCELLED)
    }
  }

  const connection: ColdStorageConnection = {
    repoHandle,
    repoName: repoHandle.name,
  }

  const localDataset: ProjectDataset = {
    projects: currentProjects,
    state: loadProjectsState(currentProjects),
    source: 'per-project',
  }
  const filesystemDataset = await readFilesystemDataset(connection)
  const resolvedDataset = resolveProjectDatasets(localDataset, filesystemDataset)

  await writeFilesystemDataset(connection, resolvedDataset, {
    migratedFromLegacy: filesystemDataset.source === 'legacy',
    removeLegacyFile: filesystemDataset.source === 'legacy',
  })
  saveProjects(resolvedDataset.projects, resolvedDataset.state)
  await persistRepoHandle(repoHandle)

  return {
    projects: resolvedDataset.projects,
    status: getConnectedColdStorageStatus(connection.repoName),
    connection,
  }
}

export async function persistProjects(
  projects: Project[],
  connection: ColdStorageConnection | null,
): Promise<PersistProjectsResult> {
  const nextState = createProjectsState()

  if (!connection) {
    saveProjects(projects, nextState)
    return {
      status: supportsColdStorage()
        ? getDisconnectedColdStorageStatus()
        : getUnsupportedColdStorageStatus(),
      connection: null,
    }
  }

  try {
    const hasPermission = await ensurePermission(connection.repoHandle, 'readwrite', false)
    if (!hasPermission) {
      saveProjects(projects, nextState)
      return {
        status: getDisconnectedColdStorageStatus(connection.repoName),
        connection: null,
      }
    }

    await writeFilesystemDataset(connection, {
      projects,
      state: nextState,
      source: 'per-project',
    })
    saveProjects(projects, nextState)

    return {
      status: getConnectedColdStorageStatus(connection.repoName),
      connection,
    }
  } catch {
    await clearPersistedRepoHandle()
    saveProjects(projects, nextState)
    return {
      status: getDisconnectedColdStorageStatus(connection.repoName),
      connection: null,
    }
  }
}

export function exportData(projects: Project[]): string {
  return JSON.stringify(projects, null, 2)
}

export function importData(json: string): Project[] {
  return parseProjectsJson(json)
}

export function loadUiPreferences(): UiPreferences {
  try {
    const raw = localStorage.getItem(UI_PREFS_KEY)
    if (!raw) return DEFAULT_UI_PREFS
    const parsed = JSON.parse(raw) as Partial<UiPreferences>
    return {
      viewMode: parsed.viewMode === 'list' ? 'list' : 'grid',
      statusFilter: parsed.statusFilter === 'all' || isProjectStatus(parsed.statusFilter)
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

export function supportsColdStorage(): boolean {
  return typeof window !== 'undefined' &&
    typeof window.showDirectoryPicker === 'function' &&
    typeof indexedDB !== 'undefined'
}

export function getUnsupportedColdStorageStatus(): ColdStorageStatus {
  return {
    mode: 'unsupported',
    repoName: null,
    detail: 'Browser-only mode',
  }
}

export function getDisconnectedColdStorageStatus(repoName?: string): ColdStorageStatus {
  return {
    mode: 'disconnected',
    repoName: repoName ?? null,
    detail: repoName ? `${repoName}/.projects` : 'Not connected',
  }
}

export function getConnectedColdStorageStatus(repoName: string): ColdStorageStatus {
  return {
    mode: 'connected',
    repoName,
    detail: `${repoName}/${COLD_STORAGE_FOLDER}/*.json`,
  }
}

export function isColdStorageCancelled(error: unknown): boolean {
  return error instanceof DOMException && error.name === COLD_STORAGE_CANCELLED
}

function loadLocalDataset(): ProjectDataset {
  const projects = loadProjects()

  return {
    projects,
    state: loadProjectsState(projects),
    source: 'per-project',
  }
}

function loadProjectsState(projects: Project[]): ProjectsStateMetadata {
  try {
    const raw = localStorage.getItem(STORAGE_STATE_KEY)
    if (!raw) return getFallbackProjectsState(projects)
    return normalizeProjectsState(JSON.parse(raw), projects)
  } catch {
    return getFallbackProjectsState(projects)
  }
}

function saveProjectsState(state: ProjectsStateMetadata): void {
  localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify({
    lastChangedAt: state.lastChangedAt,
  }))
}

function createProjectsState(lastChangedAt = new Date().toISOString()): ProjectsStateMetadata {
  return { lastChangedAt }
}

function getFallbackProjectsState(projects: Project[]): ProjectsStateMetadata {
  return createProjectsState(getDatasetTimestampIso(projects))
}

function normalizeProjectsState(value: unknown, projects: Project[]): ProjectsStateMetadata {
  if (typeof value !== 'object' || value === null) {
    return getFallbackProjectsState(projects)
  }

  const state = value as Partial<ProjectsStateMetadata>
  return {
    lastChangedAt: typeof state.lastChangedAt === 'string'
      ? state.lastChangedAt
      : getDatasetTimestampIso(projects),
  }
}

function parseProjectsJson(json: string): Project[] {
  const parsed = JSON.parse(json) as unknown
  return normalizeProjects(parsed)
}

function parseProjectJson(json: string): Project {
  const parsed = JSON.parse(json) as unknown
  const project = normalizeProject(parsed)

  if (!project) {
    throw new Error('Project payload must be an object')
  }

  return project
}

function parseFilesystemProjectsState(json: string): FilesystemProjectsState | null {
  const parsed = JSON.parse(json) as unknown
  if (typeof parsed !== 'object' || parsed === null) return null

  const state = parsed as Partial<FilesystemProjectsState>
  if (state.formatVersion !== COLD_STORAGE_FORMAT_VERSION) return null
  if (typeof state.lastChangedAt !== 'string') return null
  if (
    typeof state.migratedFromLegacy !== 'undefined' &&
    typeof state.migratedFromLegacy !== 'boolean'
  ) {
    return null
  }

  return {
    formatVersion: COLD_STORAGE_FORMAT_VERSION,
    lastChangedAt: state.lastChangedAt,
    ...(state.migratedFromLegacy ? { migratedFromLegacy: true } : {}),
  }
}

function normalizeProjects(parsed: unknown): Project[] {
  if (!Array.isArray(parsed)) {
    throw new Error('Projects payload must be an array')
  }

  return parsed.flatMap(item => {
    const project = normalizeProject(item)
    return project ? [project] : []
  })
}

function normalizeProject(value: unknown): Project | null {
  if (!isProjectRecord(value)) return null

  const status = normalizeProjectStatus(value.status)
  if (!status) return null

  return {
    id: value.id,
    title: value.title,
    description: value.description,
    plan: value.plan,
    todos: Array.isArray(value.todos)
      ? value.todos.flatMap(todo => isTodoRecord(todo) ? [todo] : [])
      : [],
    status,
    repoUrl: value.repoUrl,
    archived: value.archived,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  }
}

function isProjectRecord(value: unknown): value is StoredProjectRecord {
  if (typeof value !== 'object' || value === null) return false

  const project = value as Partial<Project> & { status?: unknown }

  return typeof project.id === 'string' &&
    typeof project.title === 'string' &&
    typeof project.description === 'string' &&
    typeof project.plan === 'string' &&
    Array.isArray(project.todos) &&
    typeof project.status === 'string' &&
    typeof project.repoUrl === 'string' &&
    typeof project.archived === 'boolean' &&
    typeof project.createdAt === 'string' &&
    typeof project.updatedAt === 'string'
}

function isTodoRecord(value: unknown): value is Project['todos'][number] {
  if (typeof value !== 'object' || value === null) return false

  const todo = value as Partial<Project['todos'][number]>

  return typeof todo.id === 'string' &&
    typeof todo.text === 'string' &&
    typeof todo.completed === 'boolean'
}

function resolveProjectDatasets(
  localDataset: ProjectDataset,
  filesystemDataset: ProjectDataset,
): ProjectDataset {
  const localStamp = getProjectsStateTimestamp(localDataset.state, localDataset.projects)
  const filesystemStamp = getProjectsStateTimestamp(filesystemDataset.state, filesystemDataset.projects)

  if (filesystemStamp >= localStamp) {
    return filesystemDataset
  }

  return localDataset
}

function getProjectsStateTimestamp(
  state: ProjectsStateMetadata,
  projects: Project[],
): number {
  const metadataTimestamp = Date.parse(state.lastChangedAt)
  if (!Number.isNaN(metadataTimestamp)) return metadataTimestamp
  return getDatasetTimestamp(projects)
}

function getDatasetTimestamp(projects: Project[]): number {
  return projects.reduce((latest, project) => {
    const updatedAt = Date.parse(project.updatedAt)
    if (!Number.isNaN(updatedAt)) return Math.max(latest, updatedAt)

    const createdAt = Date.parse(project.createdAt)
    return Number.isNaN(createdAt) ? latest : Math.max(latest, createdAt)
  }, Number.NEGATIVE_INFINITY)
}

function getDatasetTimestampIso(projects: Project[]): string {
  const timestamp = getDatasetTimestamp(projects)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : ''
}

async function readFilesystemDataset(connection: ColdStorageConnection): Promise<ProjectDataset> {
  const projectsDirectory = await getProjectsDirectoryHandle(connection.repoHandle, false)
  if (!projectsDirectory) {
    return {
      projects: [],
      state: createProjectsState(''),
      source: 'empty',
    }
  }

  const state = await readFilesystemState(projectsDirectory)
  const projects: Project[] = []
  let legacyFileHandle: FileSystemFileHandle | null = null

  for await (const [name, handle] of getDirectoryEntries(projectsDirectory)) {
    if (handle.kind !== 'file') continue
    const fileHandle = handle as FileSystemFileHandle

    if (name === COLD_STORAGE_LEGACY_FILE) {
      legacyFileHandle = fileHandle
      continue
    }

    if (!isProjectDataFile(name)) {
      continue
    }

    try {
      const file = await fileHandle.getFile()
      const text = await file.text()
      projects.push(parseProjectJson(text))
    } catch {
      continue
    }
  }

  if (projects.length > 0) {
    return {
      projects,
      state: normalizeProjectsState(state, projects),
      source: 'per-project',
    }
  }

  if (legacyFileHandle) {
    const file = await legacyFileHandle.getFile()
    const text = await file.text()
    const legacyProjects = text.trim() ? parseProjectsJson(text) : []

    return {
      projects: legacyProjects,
      state: normalizeProjectsState(state, legacyProjects),
      source: 'legacy',
    }
  }

  return {
    projects: [],
    state: normalizeProjectsState(state, []),
    source: 'empty',
  }
}

async function readFilesystemState(
  projectsDirectory: FileSystemDirectoryHandle,
): Promise<FilesystemProjectsState | null> {
  try {
    const fileHandle = await projectsDirectory.getFileHandle(COLD_STORAGE_STATE_FILE)
    const file = await fileHandle.getFile()
    const text = await file.text()
    return text.trim() ? parseFilesystemProjectsState(text) : null
  } catch (error) {
    if (isNotFoundError(error)) return null
    throw error
  }
}

async function writeFilesystemDataset(
  connection: ColdStorageConnection,
  dataset: ProjectDataset,
  options: WriteFilesystemOptions = {},
): Promise<void> {
  const projectsDirectory = await getProjectsDirectoryHandle(connection.repoHandle, true)
  if (!projectsDirectory) {
    throw new Error('Unable to open cold storage directory for writing')
  }

  const expectedProjectFiles = new Set(dataset.projects.map(project => getProjectFilename(project.id)))

  for (const project of dataset.projects) {
    const fileHandle = await projectsDirectory.getFileHandle(getProjectFilename(project.id), { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(JSON.stringify(project, null, 2))
    await writable.close()
  }

  for await (const [name, handle] of getDirectoryEntries(projectsDirectory)) {
    if (handle.kind !== 'file') continue

    if (name === COLD_STORAGE_STATE_FILE) continue

    if (name === COLD_STORAGE_LEGACY_FILE) {
      if (options.removeLegacyFile) {
        await projectsDirectory.removeEntry(name)
      }
      continue
    }

    if (!isProjectDataFile(name)) continue

    if (!expectedProjectFiles.has(name)) {
      await projectsDirectory.removeEntry(name)
    }
  }

  const stateHandle = await projectsDirectory.getFileHandle(COLD_STORAGE_STATE_FILE, { create: true })
  const writable = await stateHandle.createWritable()
  const filesystemState: FilesystemProjectsState = {
    formatVersion: COLD_STORAGE_FORMAT_VERSION,
    lastChangedAt: dataset.state.lastChangedAt,
    ...(options.migratedFromLegacy ? { migratedFromLegacy: true } : {}),
  }
  await writable.write(JSON.stringify(filesystemState, null, 2))
  await writable.close()
}

async function getProjectsDirectoryHandle(
  repoHandle: FileSystemDirectoryHandle,
  create: boolean,
): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await repoHandle.getDirectoryHandle(COLD_STORAGE_FOLDER, { create })
  } catch (error) {
    if (!create && isNotFoundError(error)) return null
    throw error
  }
}

function getDirectoryEntries(
  directoryHandle: FileSystemDirectoryHandle,
): AsyncIterableIterator<[string, FileSystemHandle]> {
  return (directoryHandle as DirectoryHandleWithEntries).entries()
}

function getProjectFilename(projectId: string): string {
  return `${projectId}.json`
}

function isProjectDataFile(name: string): boolean {
  return name.endsWith('.json') &&
    !name.startsWith('.') &&
    name !== COLD_STORAGE_LEGACY_FILE
}

async function directoryExists(
  directory: FileSystemDirectoryHandle,
  name: string,
): Promise<boolean> {
  try {
    await directory.getDirectoryHandle(name)
    return true
  } catch (error) {
    if (isNotFoundError(error)) return false
    throw error
  }
}

async function ensurePermission(
  handle: FileSystemHandle,
  mode: PermissionMode,
  request: boolean,
): Promise<boolean> {
  const permissionHandle = handle as PermissionAwareHandle

  if (typeof permissionHandle.queryPermission !== 'function') {
    return false
  }

  const descriptor = { mode }
  const current = await permissionHandle.queryPermission(descriptor)

  if (current === 'granted') return true
  if (!request || current === 'denied') return false

  return (await permissionHandle.requestPermission(descriptor)) === 'granted'
}

async function loadPersistedRepoHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (!supportsColdStorage()) return null

  const db = await openColdStorageDb()

  try {
    const result = await runRequest<FileSystemDirectoryHandle | undefined>(
      db.transaction(COLD_STORAGE_STORE, 'readonly')
        .objectStore(COLD_STORAGE_STORE)
        .get(COLD_STORAGE_KEY),
    )

    return result ?? null
  } finally {
    db.close()
  }
}

async function persistRepoHandle(repoHandle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openColdStorageDb()

  try {
    await runRequest(
      db.transaction(COLD_STORAGE_STORE, 'readwrite')
        .objectStore(COLD_STORAGE_STORE)
        .put(repoHandle, COLD_STORAGE_KEY),
    )
  } finally {
    db.close()
  }
}

async function clearPersistedRepoHandle(): Promise<void> {
  if (!supportsColdStorage()) return

  const db = await openColdStorageDb()

  try {
    await runRequest(
      db.transaction(COLD_STORAGE_STORE, 'readwrite')
        .objectStore(COLD_STORAGE_STORE)
        .delete(COLD_STORAGE_KEY),
    )
  } finally {
    db.close()
  }
}

function openColdStorageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(COLD_STORAGE_DB, 1)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(COLD_STORAGE_STORE)) {
        db.createObjectStore(COLD_STORAGE_STORE)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Failed to open cold storage database'))
  })
}

function runRequest<T = void>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'NotFoundError'
}
