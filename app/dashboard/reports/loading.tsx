export default function ReportsLoading() {
  return (
    <div
      className="animate-pulse space-y-6"
      role="status"
      aria-live="polite"
      aria-label="Loading reports"
    >
      {/* Header Skeleton */}
      <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>

      {/* Content Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 h-96"></div>
    </div>
  )
}
