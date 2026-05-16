export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="skeleton h-48 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="flex gap-2 pt-2">
          <div className="skeleton h-8 w-20 rounded-full" />
          <div className="skeleton h-8 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center p-4 bg-white rounded-xl">
          <div className="skeleton h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-1/3 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-3">
      <div className="skeleton h-4 w-1/2 rounded" />
      <div className="skeleton h-8 w-1/3 rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
    </div>
  )
}
