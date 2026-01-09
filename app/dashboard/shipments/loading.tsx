export default function ShipmentsLoading() {
  return (
    <div
      className="animate-pulse"
      role="status"
      aria-live="polite"
      aria-label="Loading shipments"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Filters Bar Skeleton */}
      <div className="bg-white rounded-lg p-3 sm:p-4 mb-6 border border-gray-200 h-20"></div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
