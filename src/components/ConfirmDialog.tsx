interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  confirmVariant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmVariant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onCancel}
        onKeyDown={e => e.key === 'Escape' && onCancel()}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border/75 bg-gradient-to-b from-bg-secondary to-bg-primary p-7 shadow-[0_22px_80px_rgba(2,6,15,0.8)]">
        <h3 className="mb-2 font-mono text-lg font-semibold text-text-primary">{title}</h3>
        <p className="mb-7 text-sm leading-relaxed text-text-secondary">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border/80 bg-bg-primary/65 px-4 py-2 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
          >
            cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-bg-primary transition-all hover:brightness-105 ${
              confirmVariant === 'danger'
                ? 'bg-accent-red'
                : 'bg-accent-emerald'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
