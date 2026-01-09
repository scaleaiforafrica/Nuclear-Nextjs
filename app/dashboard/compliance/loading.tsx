export default function ComplianceLoading() {
  return (
    <div
      className="animate-pulse space-y-6"
      role="status"
      aria-live="polite"
      aria-label="Loading compliance"
    >
      {/* Header Skeleton */}
      <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 h-64"></div>
        ))}
      </div>
    </div>
  )
}
