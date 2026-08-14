export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber/20 border-t-amber" />
        <span className="font-mono text-[10px] tracking-[0.3em] text-muted">DECRYPTING…</span>
      </div>
    </div>
  )
}