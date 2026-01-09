export default function DashboardLoading() {
  return (
    <div
      className="space-y-6 lg:space-y-8 animate-pulse"
      role="status"
      aria-live="polite"
      aria-label="Loading dashboard"
    >
      {/* Welcome Banner Skeleton */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 sm:p-6 lg:p-8 h-32 sm:h-40"></div>

      {/* Key Metrics Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 h-32">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 h-64 sm:h-80 lg:h-96"></div>
        <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6 border border-gray-200 h-64 sm:h-80 lg:h-96"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 h-64"></div>
    </div>
  )
}
