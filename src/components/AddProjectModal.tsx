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
        className="absolute inset-0 bg-[#4a3927]/45"
        onClick={onClose}
        onKeyDown={e => e.key === 'Escape' && onClose()}
      />
      <form
        onSubmit={handleSubmit}
        className="retro-panel relative w-full max-w-3xl space-y-7 p-6 sm:p-9"
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold uppercase text-text-primary sm:text-2xl">
            <span className="mr-2 text-accent-lavender">$</span>
            new project
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="retro-button p-2 text-text-muted transition-colors hover:text-accent-lavender"
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
            className="retro-inset w-full px-4 py-3.5 text-base text-text-primary
              placeholder:text-text-muted transition-all focus:border-border-hover focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What is this project about?"
            rows={4}
            className="retro-inset w-full resize-none px-4 py-3.5 text-base text-text-primary
              placeholder:text-text-muted transition-all focus:border-border-hover focus:outline-none"
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
                className={`flex items-center gap-2 rounded-md border-2 px-5 py-2.5 text-sm font-semibold uppercase transition-all ${
                  status === s
                    ? s === 'started'
                      ? 'border-border bg-accent-green/20 text-accent-green shadow-[2px_2px_0_rgba(75,57,40,0.85)]'
                      : 'border-border bg-accent-amber/20 text-accent-amber shadow-[2px_2px_0_rgba(75,57,40,0.85)]'
                    : 'border-border bg-bg-secondary/80 text-text-muted hover:border-border-hover hover:text-text-primary'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-sm ${status === s
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
            className="retro-inset w-full px-4 py-3.5 text-base text-text-primary
              placeholder:text-text-muted transition-all focus:border-border-hover focus:outline-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!title.trim()}
            className="retro-button retro-button-primary w-full py-3.5 text-base font-semibold uppercase
              transition-all disabled:cursor-not-allowed disabled:opacity-40"
          >
            create project
          </button>
        </div>
      </form>
    </div>
  )
}
