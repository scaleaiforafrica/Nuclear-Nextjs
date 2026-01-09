'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { Delivery } from '@/models'
import { formatDeliveryDateTime, isDeliveryPast } from '@/lib/dateUtils'

interface UpcomingDeliveriesProps {
  initialDeliveries: Delivery[]
  /** 
   * Optional callback when a delivery is completed.
   * Note: Parent should memoize this callback with useCallback to prevent unnecessary effect re-runs.
   */
  onDeliveryCompleted?: (delivery: Delivery) => void
}

export default function UpcomingDeliveries({ 
  initialDeliveries,
  onDeliveryCompleted 
}: UpcomingDeliveriesProps) {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries)

  useEffect(() => {
    // Update time every minute (60000ms) to check for completed deliveries
    const interval = setInterval(() => {
      // Check for completed deliveries
      setDeliveries(prevDeliveries => {
        const stillUpcoming: Delivery[] = []
        const completed: Delivery[] = []
        
        prevDeliveries.forEach(delivery => {
          if (isDeliveryPast(delivery.date, delivery.time)) {
            completed.push(delivery)
          } else {
            stillUpcoming.push(delivery)
          }
        })
        
        // Notify parent component of completed deliveries
        if (completed.length > 0 && onDeliveryCompleted) {
          completed.forEach(delivery => onDeliveryCompleted(delivery))
        }
        
        return stillUpcoming
      })
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [onDeliveryCompleted])

  if (deliveries.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg sm:text-xl mb-4">Upcoming Deliveries</h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <Clock className="w-12 h-12 mb-2" />
          <p className="text-sm">No upcoming deliveries scheduled</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
      <h3 className="text-lg sm:text-xl mb-4">Upcoming Deliveries</h3>
      <div className="space-y-3">
        {deliveries.map((delivery) => {
          const formattedDateTime = formatDeliveryDateTime(delivery.date, delivery.time)
          // Generate a stable key from delivery properties with sanitized strings
          const deliveryKey =
            delivery.id ||
            `${delivery.date}-${delivery.time}-${delivery.isotope.replace(/\s+/g, '-')}-${delivery.destination.replace(/[^a-zA-Z0-9]/g, '-')}`
          
          return (
            <div 
              key={deliveryKey} 
              className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="text-center flex-shrink-0 min-w-[100px]">
                <div className="text-sm font-medium text-gray-900">{formattedDateTime}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{delivery.isotope}</div>
                <div className="text-xs text-gray-500 truncate">{delivery.destination}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
