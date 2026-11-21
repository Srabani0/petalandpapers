/** Admin page skeleton (the sidebar stays in place from the layout). */
export default function Loading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-7 w-48 rounded-full bg-paper" />
      <div className="mt-2 h-4 w-72 max-w-full rounded-full bg-paper/80" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 rounded-xl bg-paper" />
        ))}
      </div>
      <div className="mt-6 space-y-3 rounded-xl bg-paper p-5">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-4 rounded-full bg-cream-dark" />
        ))}
      </div>
    </div>
  );
}
