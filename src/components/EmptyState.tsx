export function EmptyState() {
  return (
    <div className="flex min-h-[44vh] items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-border/70 bg-bg-secondary/75 px-6 py-12 text-center shadow-[0_20px_60px_rgba(6,10,22,0.55)] sm:px-10">
        <div className="space-y-2 text-sm leading-relaxed text-text-secondary sm:text-base font-mono">
          <p>
            <span className="text-accent-green">$</span> ls projects/
          </p>
          <p className="text-text-muted italic">(empty)</p>
          <p className="mt-5">
            <span className="text-accent-green">$</span> projstral --new
            <span className="cursor-blink text-text-secondary ml-0.5">_</span>
          </p>
        </div>
        <p className="pt-6 text-sm text-text-muted">
          Click <span className="text-text-secondary font-semibold">+</span> to add your first project
        </p>
      </div>
    </div>
  )
}
