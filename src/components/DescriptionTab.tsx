import { useState, useEffect } from 'react'

interface DescriptionTabProps {
  description: string
  onSave: (description: string) => void
}

export function DescriptionTab({ description, onSave }: DescriptionTabProps) {
  const [value, setValue] = useState(description)

  useEffect(() => {
    setValue(description)
  }, [description])

  const handleBlur = () => {
    if (value !== description) {
      onSave(value)
    }
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-bg-secondary/60 p-3 sm:p-4">
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="Describe your project..."
        className="h-80 w-full resize-y rounded-xl border border-border/80 bg-bg-primary/65 px-4 py-4 text-base leading-relaxed text-text-primary
          placeholder:text-text-muted transition-all focus:border-border-hover focus:outline-none focus:ring-2 focus:ring-accent-link/20"
      />
    </div>
  )
}
