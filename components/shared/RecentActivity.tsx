'use client'

import { useEffect, useState } from 'react'
import { Activity, Delivery } from '@/models'
import { formatRelativeTime } from '@/lib/dateUtils'

interface RecentActivityProps {
  initialActivities: Activity[]
  completedDeliveries?: Delivery[]
}

export default function RecentActivity({ 
  initialActivities,
  completedDeliveries = []
}: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities)
  // Counter to force re-renders for relative time updates
  const [, setUpdateTrigger] = useState(0)

  useEffect(() => {
    // Update every minute to refresh relative times display
    const interval = setInterval(() => {
      setUpdateTrigger(prev => prev + 1)
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Add completed deliveries to activities
    if (completedDeliveries.length > 0) {
      const newActivities = completedDeliveries.map((delivery) => {
        // Generate stable ID from delivery properties only (no index for stability).
        // Assumes the combination of scheduled_datetime (or date+time), isotope, and destination is unique.
        const baseTime = delivery.scheduled_datetime?.toISOString() || `${delivery.date}T${delivery.time}`
        const normalizedIsotope = delivery.isotope.replace(/[^A-Za-z0-9]+/g, '-')
        const normalizedDestination = delivery.destination.replace(/[^A-Za-z0-9]+/g, '-')
        const stableId = delivery.id || `delivery-${baseTime}-${normalizedIsotope}-${normalizedDestination}`
        
        return {
          id: stableId,
          time: delivery.scheduled_datetime?.toISOString() || new Date().toISOString(),
          event: `Delivery completed: ${delivery.isotope} to ${delivery.destination}`,
          type: 'delivery' as const
        }
      })
      
      setActivities(prev => {
        // Combine and sort by time (most recent first)
        const combined = [...newActivities, ...prev]
        return combined
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 5) // Keep only the 5 most recent
      })
    }
  }, [completedDeliveries])

  return (
    <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
      <h3 className="text-lg sm:text-xl mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => {
            const timeDisplay = formatRelativeTime(activity.time)
            
            return (
              <div key={activity.id} className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.event}</p>
                  <p className="text-xs text-gray-500 mt-1">{timeDisplay}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
