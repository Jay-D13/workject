import { useEffect, useState } from 'react'
import { cn } from '../lib/cn'
import { MarkdownContent } from './MarkdownContent'

interface DescriptionTabProps {
  description: string
  onSave: (description: string) => void
}

export function DescriptionTab({ description, onSave }: DescriptionTabProps) {
  const [editing, setEditing] = useState(!description)
  const [value, setValue] = useState(description)

  useEffect(() => {
    setValue(description)
  }, [description])

  const handleToggle = () => {
    if (editing && value !== description) {
      onSave(value)
    }
    setEditing(!editing)
  }

  const handleBlur = () => {
    if (value !== description) {
      onSave(value)
    }
  }

  return (
    <div className="retro-screen space-y-4 p-3 sm:p-4">
      <div className="flex items-center justify-end">
        <div className="retro-inset flex items-center gap-1 p-1">
          <button
            type="button"
            onClick={() => { if (!editing) return; handleToggle() }}
            className={cn(
              'rounded-md border-2 px-3 py-1.5 text-xs font-semibold uppercase transition-all',
              !editing
                ? 'border-border bg-bg-tertiary text-text-primary shadow-[2px_2px_0_rgba(75,57,40,0.85)]'
                : 'border-transparent text-text-muted hover:text-text-secondary',
            )}
          >
            preview
          </button>
          <button
            type="button"
            onClick={() => { if (editing) return; handleToggle() }}
            className={cn(
              'rounded-md border-2 px-3 py-1.5 text-xs font-semibold uppercase transition-all',
              editing
                ? 'border-border bg-bg-tertiary text-text-primary shadow-[2px_2px_0_rgba(75,57,40,0.85)]'
                : 'border-transparent text-text-muted hover:text-text-secondary',
            )}
          >
            edit
          </button>
        </div>
      </div>

      {editing ? (
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={handleBlur}
          placeholder="Write your project description in markdown..."
          className="retro-inset h-80 w-full resize-y px-4 py-4 text-base leading-relaxed text-text-primary
            placeholder:text-text-muted transition-all focus:border-border-hover focus:outline-none"
        />
      ) : (
        <div
          className={cn(
            'retro-screen min-h-[20rem] px-5 py-5 sm:px-6',
            'prose prose-sm max-w-none',
          )}
        >
          {value ? (
            <MarkdownContent value={value} />
          ) : (
            <p className="text-sm text-text-muted">No description yet. Switch to edit to add one.</p>
          )}
        </div>
      )}
    </div>
  )
}
