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
        className="absolute inset-0 bg-[#4a3927]/45"
        onClick={onCancel}
        onKeyDown={e => e.key === 'Escape' && onCancel()}
      />
      <div className="retro-panel relative w-full max-w-md p-7">
        <h3 className="font-display mb-2 text-base font-semibold uppercase text-text-primary">{title}</h3>
        <p className="mb-7 text-sm leading-relaxed text-text-secondary">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="retro-button px-4 py-2 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
          >
            cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`retro-button px-4 py-2 text-sm font-semibold uppercase transition-all ${
              confirmVariant === 'danger'
                ? 'retro-button-danger'
                : 'retro-button-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
