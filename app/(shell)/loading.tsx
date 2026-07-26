export default function ShellLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-[var(--bg-surface-2)]" />
        <div className="space-y-1.5">
          <div className="h-4 w-36 bg-[var(--bg-surface-2)] rounded-full" />
          <div className="h-3 w-56 bg-[var(--bg-surface-2)] rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-[var(--radius-xl)] bg-[var(--bg-surface-1)] border border-[var(--border-default)] overflow-hidden">
            <div className="h-[120px] bg-[var(--bg-surface-2)]" />
            <div className="p-4 space-y-2">
              <div className="h-3.5 w-3/4 bg-[var(--bg-surface-2)] rounded-full" />
              <div className="h-3 w-1/2 bg-[var(--bg-surface-2)] rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Row skeleton */}
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[60px] rounded-[var(--radius-xl)] bg-[var(--bg-surface-1)] border border-[var(--border-default)]" />
        ))}
      </div>
    </div>
  );
}
