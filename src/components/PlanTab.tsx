import { useState, useEffect } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../lib/cn'

interface PlanTabProps {
  plan: string
  onSave: (plan: string) => void
}

export function PlanTab({ plan, onSave }: PlanTabProps) {
  const [editing, setEditing] = useState(!plan)
  const [value, setValue] = useState(plan)

  useEffect(() => {
    setValue(plan)
  }, [plan])

  const handleToggle = () => {
    if (editing && value !== plan) {
      onSave(value)
    }
    setEditing(!editing)
  }

  const handleBlur = () => {
    if (value !== plan) {
      onSave(value)
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-bg-secondary/60 p-3 sm:p-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center rounded-xl border border-border/80 bg-bg-primary/65 p-1">
          <button
            type="button"
            onClick={() => { if (!editing) return; handleToggle() }}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
              !editing
                ? 'bg-bg-tertiary text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary',
            )}
          >
            preview
          </button>
          <button
            type="button"
            onClick={() => { if (editing) return; handleToggle() }}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
              editing
                ? 'bg-bg-tertiary text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary',
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
          placeholder="Paste your LLM plan in markdown..."
          className="h-96 w-full resize-y rounded-xl border border-border/80 bg-bg-primary/65 px-4 py-4 text-base leading-relaxed text-text-primary
            placeholder:text-text-muted transition-all focus:border-border-hover focus:outline-none focus:ring-2 focus:ring-accent-link/20"
        />
      ) : (
        <div
          className={cn(
            'min-h-[24rem] rounded-xl border border-border/75 bg-bg-primary/65 px-5 py-5 sm:px-6',
            'prose prose-sm max-w-none',
          )}
        >
          {value ? (
            <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
          ) : (
            <p className="text-text-muted text-sm">No plan yet. Switch to edit to add one.</p>
          )}
        </div>
      )}
    </div>
  )
}
