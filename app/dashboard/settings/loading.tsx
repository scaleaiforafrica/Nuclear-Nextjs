export default function SettingsLoading() {
  return (
    <div
      className="animate-pulse space-y-6"
      role="status"
      aria-live="polite"
      aria-label="Loading settings"
    >
      {/* Header Skeleton */}
      <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>

      {/* Content Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded"></div>
        ))}
      </div>
    </div>
  )
}
