import { useRef } from 'react'
import type { ReactNode } from 'react'
import type { Project } from '../types'
import { getProjectStatusLabel } from '../lib/projectStatus'
import { Download, HardDrive, RefreshCw, Upload } from 'lucide-react'
import { cn } from '../lib/cn'
import { exportData, importData, type ColdStorageStatus } from '../lib/storage'

interface LayoutProps {
  children: ReactNode
  projects: Project[]
  onImport: (projects: Project[]) => void
  coldStorageStatus: ColdStorageStatus
  coldStorageBusy: boolean
  onConnectColdStorage: () => void
  onNavigateHome: () => void
}

export function Layout({
  children,
  projects,
  onImport,
  coldStorageStatus,
  coldStorageBusy,
  onConnectColdStorage,
  onNavigateHome,
}: LayoutProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const active = projects.filter(p => !p.archived)
  const notStarted = active.filter(p => p.status === 'not-started').length
  const inProgress = active.filter(p => p.status === 'in-progress').length
  const finished = active.filter(p => p.status === 'finished').length

  const handleExport = () => {
    const data = exportData(projects)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workject-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = importData(reader.result as string)
        onImport(imported)
      } catch {
        // invalid JSON
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const coldStorageTone = coldStorageStatus.mode === 'connected'
    ? 'text-accent-green'
    : coldStorageStatus.mode === 'unsupported'
      ? 'text-text-muted'
      : 'text-accent-amber'

  const coldStorageLabel = coldStorageStatus.mode === 'connected'
    ? 'connected'
    : coldStorageStatus.mode === 'unsupported'
      ? 'unsupported'
      : 'disconnected'

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b-[3px] border-border bg-bg-secondary/90">
        <div className="mx-auto flex min-h-20 w-full max-w-[1520px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-3 text-left sm:gap-4"
            title="Go to main page"
          >
            <span className="retro-panel inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold text-accent-green shadow-none">
              $
            </span>
            <div className="space-y-0.5">
              <h1 className="font-display text-base font-semibold uppercase text-text-primary sm:text-lg">
                workject
              </h1>
              <p className="hidden text-[11px] uppercase tracking-[0.18em] text-text-muted sm:block">
                Project cockpit
              </p>
            </div>
          </button>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-3 sm:gap-5">
            {active.length > 0 && (
              <div className="retro-panel-soft hidden items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary lg:flex">
                <span className="font-display text-[10px] uppercase text-text-muted">Bank</span>
                <span>{active.length} project{active.length !== 1 ? 's' : ''}</span>
                <span className="text-accent-lavender">•</span>
                <span className="retro-inset px-2 py-1 text-[10px] font-semibold uppercase text-accent-amber">
                  {notStarted} {getProjectStatusLabel('not-started')}
                </span>
                <span className="text-accent-sky">•</span>
                <span className="retro-inset px-2 py-1 text-[10px] font-semibold uppercase text-accent-green">
                  {inProgress} {getProjectStatusLabel('in-progress')}
                </span>
                <span className="text-accent-link">•</span>
                <span className="retro-inset px-2 py-1 text-[10px] font-semibold uppercase text-accent-link">
                  {finished} {getProjectStatusLabel('finished')}
                </span>
              </div>
            )}

            <div className="retro-panel-soft flex min-w-[15rem] items-center gap-3 px-3 py-2.5 text-sm text-text-secondary">
              <span className="retro-inset flex h-9 w-9 items-center justify-center">
                <HardDrive className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[10px] uppercase tracking-[0.16em] text-text-muted">
                  Cold storage
                </p>
                <p className="truncate text-xs text-text-muted">
                  {coldStorageStatus.detail}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'font-display text-[10px] uppercase tracking-[0.16em]',
                    coldStorageTone,
                  )}
                >
                  {coldStorageLabel}
                </span>
                {coldStorageStatus.mode !== 'unsupported' && (
                  <button
                    type="button"
                    onClick={onConnectColdStorage}
                    disabled={coldStorageBusy}
                    className="retro-button inline-flex items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary transition-all hover:border-border-hover disabled:cursor-wait disabled:opacity-70"
                  >
                    <RefreshCw className={cn('h-3.5 w-3.5', coldStorageBusy && 'animate-spin')} />
                    {coldStorageStatus.mode === 'connected' ? 'reconnect' : 'connect'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                title="Export data"
                className="retro-button group p-2.5 text-text-secondary transition-all hover:border-border-hover hover:text-accent-sky sm:p-3"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Import data"
                className="retro-button group p-2.5 text-text-secondary transition-all hover:border-border-hover hover:text-accent-lavender sm:p-3"
              >
                <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1520px] px-4 pb-16 pt-8 sm:px-8 sm:pt-10 lg:px-12 lg:pt-12">
        {children}
      </main>
    </div>
  )
}
