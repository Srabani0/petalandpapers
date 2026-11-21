/** Shown instantly while a customer page loads — a soft skeleton instead of a frozen screen. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading">
      <div className="mx-auto h-3 w-24 rounded-full bg-cream-dark" />
      <div className="mx-auto mt-4 h-8 w-2/3 max-w-md rounded-full bg-cream-dark" />
      <div className="mx-auto mt-3 h-4 w-1/2 max-w-sm rounded-full bg-cream-dark/80" />
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-paper">
            <div className="aspect-square bg-cream-dark" />
            <div className="space-y-2 p-3 sm:p-4">
              <div className="h-2.5 w-1/3 rounded-full bg-cream-dark" />
              <div className="h-3.5 w-4/5 rounded-full bg-cream-dark" />
              <div className="h-3 w-1/4 rounded-full bg-cream-dark" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
