import { useRef } from 'react'
import type { ReactNode } from 'react'
import type { Project } from '../types'
import { Download, Upload } from 'lucide-react'
import { exportData, importData } from '../lib/storage'

interface LayoutProps {
  children: ReactNode
  projects: Project[]
  onImport: (projects: Project[]) => void
}

export function Layout({ children, projects, onImport }: LayoutProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const active = projects.filter(p => !p.archived)
  const started = active.filter(p => p.status === 'started').length
  const pending = active.filter(p => p.status === 'pending').length

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projstral-backup-${new Date().toISOString().split('T')[0]}.json`
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

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b-[3px] border-border bg-bg-secondary/90">
        <div className="mx-auto flex h-20 w-full max-w-[1520px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="retro-panel inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold text-accent-green shadow-none">
              $
            </span>
            <div className="space-y-0.5">
              <h1 className="font-display text-base font-semibold uppercase text-text-primary sm:text-lg">
                Projstral
              </h1>
              <p className="hidden text-[11px] uppercase tracking-[0.18em] text-text-muted sm:block">
                Project cockpit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            {active.length > 0 && (
              <div className="retro-panel-soft hidden items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary lg:flex">
                <span className="font-display text-[10px] uppercase text-text-muted">Bank</span>
                <span>{active.length} project{active.length !== 1 ? 's' : ''}</span>
                <span className="text-accent-lavender">•</span>
                <span className="retro-inset px-2 py-1 text-[10px] font-semibold uppercase text-accent-green">
                  {started} started
                </span>
                <span className="text-accent-sky">•</span>
                <span className="retro-inset px-2 py-1 text-[10px] font-semibold uppercase text-accent-amber">
                  {pending} pending
                </span>
              </div>
            )}

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
