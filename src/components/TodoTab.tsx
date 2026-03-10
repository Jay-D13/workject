import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/cn'
import type { Todo } from '../types'

interface TodoTabProps {
  todos: Todo[]
  onAdd: (text: string) => void
  onToggle: (todoId: string) => void
  onRemove: (todoId: string) => void
}

export function TodoTab({ todos, onAdd, onToggle, onRemove }: TodoTabProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onAdd(input.trim())
    setInput('')
  }

  return (
    <div className="retro-screen p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a todo..."
          className="retro-inset flex-1 px-4 py-3 text-base text-text-primary
            placeholder:text-text-muted transition-all focus:border-border-hover focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="retro-button retro-button-primary px-5 py-3 text-sm font-semibold uppercase
            transition-all disabled:cursor-not-allowed disabled:opacity-40"
        >
          add
        </button>
      </form>

      {todos.length === 0 ? (
        <p className="py-10 text-center text-sm text-text-muted">
          No todos yet. Add one above.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {todos.map(todo => (
            <li
              key={todo.id}
              className="group flex items-center gap-3 rounded-lg border-2 border-transparent px-3 py-3.5 transition-all hover:border-[rgba(184,167,219,0.7)] hover:bg-[rgba(159,199,217,0.12)]"
            >
              <button
                type="button"
                onClick={() => onToggle(todo.id)}
                className={cn(
                  'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border-2 transition-all',
                  todo.completed
                    ? 'border-border bg-accent-emerald text-bg-elevated'
                    : 'border-border/70 bg-bg-elevated hover:border-border-hover',
                )}
              >
                {todo.completed && (
                  <svg className="h-3 w-3 text-bg-elevated" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4.5 7.5L8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span
                className={cn(
                  'flex-1 text-base transition-all',
                  todo.completed
                    ? 'text-text-muted line-through opacity-60'
                    : 'text-text-primary',
                )}
              >
                {todo.text}
              </span>
              <button
                type="button"
                onClick={() => onRemove(todo.id)}
                className="retro-button rounded-md p-1.5 text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:text-accent-blush"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
