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
    <div className="rounded-2xl border border-border/70 bg-bg-secondary/60 p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a todo..."
          className="flex-1 rounded-xl border border-border/80 bg-bg-primary/65 px-4 py-3 text-base text-text-primary
            placeholder:text-text-muted transition-all focus:border-border-hover focus:outline-none focus:ring-2 focus:ring-accent-link/20"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-xl bg-gradient-to-r from-accent-emerald to-accent-link px-5 py-3 text-sm font-semibold text-bg-primary
            transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
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
              className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3.5 transition-all hover:border-border/70 hover:bg-bg-primary/50"
            >
              <button
                type="button"
                onClick={() => onToggle(todo.id)}
                className={cn(
                  'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-all',
                  todo.completed
                    ? 'border-accent-emerald bg-accent-emerald'
                    : 'border-text-muted hover:border-text-secondary',
                )}
              >
                {todo.completed && (
                  <svg className="h-3 w-3 text-bg-primary" viewBox="0 0 10 10" fill="none">
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
                className="rounded-lg p-1.5 text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-bg-primary/70 hover:text-accent-red"
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
