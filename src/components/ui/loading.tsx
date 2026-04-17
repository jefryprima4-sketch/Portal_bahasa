export function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--outline-variant)] border-t-[var(--primary)]" />
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-[var(--surface-container)] rounded w-1/4" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-[var(--surface-container)] rounded-xl" />)}
      </div>
    </div>
  );
}
