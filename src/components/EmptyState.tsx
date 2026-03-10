export function EmptyState() {
  return (
    <div className="flex min-h-[44vh] items-center justify-center">
      <div className="retro-panel bg-[linear-gradient(180deg,rgba(231,166,161,0.09),rgba(255,247,222,0.98)_18%,rgba(247,236,203,0.98)_100%)] w-full max-w-xl px-6 py-12 text-center sm:px-10">
        <div className="retro-screen bg-[linear-gradient(180deg,rgba(184,167,219,0.14),rgba(159,199,217,0.1),rgba(244,236,207,0.98))] space-y-2 px-5 py-6 text-sm leading-relaxed text-text-secondary sm:text-base">
          <p>
            <span className="text-accent-green">$</span> ls projects/
          </p>
          <p className="font-display text-xs uppercase text-text-muted">(empty)</p>
          <p className="mt-5">
            <span className="text-accent-green">$</span> workject --new
            <span className="cursor-blink text-text-secondary ml-0.5">_</span>
          </p>
        </div>
        <p className="pt-6 text-sm text-text-secondary">
          Click <span className="font-display text-text-primary">+</span> to add your first project
        </p>
      </div>
    </div>
  )
}
