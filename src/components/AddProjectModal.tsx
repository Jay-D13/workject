import { useState } from 'react'
import { X } from 'lucide-react'
import type { ProjectStatus } from '../types'

interface AddProjectModalProps {
  onAdd: (data: {
    title: string
    description?: string
    status?: ProjectStatus
    repoUrl?: string
  }) => void
  onClose: () => void
}

export function AddProjectModal({ onAdd, onClose }: AddProjectModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('pending')
  const [repoUrl, setRepoUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      repoUrl: repoUrl.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        onKeyDown={e => e.key === 'Escape' && onClose()}
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-3xl space-y-7 rounded-3xl border border-border/75 bg-gradient-to-b from-bg-secondary to-bg-primary p-6 shadow-[0_28px_90px_rgba(2,6,15,0.8)] sm:p-9"
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-mono text-2xl font-semibold tracking-tight text-text-primary">
            <span className="mr-2 text-accent-green">$</span>
            new project
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border/70 bg-bg-primary/60 p-2 text-text-muted transition-colors hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="my-awesome-project"
            autoFocus
            className="w-full rounded-xl border border-border/80 bg-bg-primary/65 px-4 py-3.5 text-base text-text-primary
              placeholder:text-text-muted transition-all focus:border-border-hover focus:outline-none focus:ring-2 focus:ring-accent-link/20"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What is this project about?"
            rows={4}
            className="w-full resize-none rounded-xl border border-border/80 bg-bg-primary/65 px-4 py-3.5 text-base text-text-primary
              placeholder:text-text-muted transition-all focus:border-border-hover focus:outline-none focus:ring-2 focus:ring-accent-link/20"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Status</label>
          <div className="flex gap-3">
            {(['pending', 'started'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold capitalize transition-all ${
                  status === s
                    ? s === 'started'
                      ? 'border-accent-green/40 bg-accent-green/12 text-accent-green'
                      : 'border-accent-amber/40 bg-accent-amber/12 text-accent-amber'
                    : 'border-border/80 bg-bg-primary/65 text-text-muted hover:text-text-primary'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${status === s
                  ? s === 'started'
                    ? 'bg-accent-green'
                    : 'bg-accent-amber'
                  : 'bg-text-muted'
                }`} />
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Repository URL</label>
          <input
            type="url"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="w-full rounded-xl border border-border/80 bg-bg-primary/65 px-4 py-3.5 text-base text-text-primary
              placeholder:text-text-muted transition-all focus:border-border-hover focus:outline-none focus:ring-2 focus:ring-accent-link/20"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-accent-emerald to-accent-link py-3.5 text-base font-semibold text-bg-primary
              transition-all hover:brightness-105 hover:shadow-[0_10px_28px_rgba(89,243,188,0.35)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            create project
          </button>
        </div>
      </form>
    </div>
  )
}
