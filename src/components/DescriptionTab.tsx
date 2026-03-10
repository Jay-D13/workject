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
    <div className="retro-screen p-3 sm:p-4">
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="Describe your project..."
        className="retro-inset h-80 w-full resize-y px-4 py-4 text-base leading-relaxed text-text-primary
          placeholder:text-text-muted transition-all focus:border-border-hover focus:outline-none"
      />
    </div>
  )
}
