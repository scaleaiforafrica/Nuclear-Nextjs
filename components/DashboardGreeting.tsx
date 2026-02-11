'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts'
import { Plus, Search, FileText } from 'lucide-react'
import { TrackShipmentDialog, QuickActionCard } from '@/components/dashboard'

/**
 * Returns a time-appropriate greeting message
 * Falls back to "Hello" if time cannot be determined
 */
function getTimeOfDayGreeting(): string {
  try {
    const hour = new Date().getHours()
    
    if (hour >= 5 && hour < 12) {
      return 'Good morning'
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon'
    } else if (hour >= 17 && hour < 24) {
      return 'Good evening'
    } else {
      return 'Good night'
    }
  } catch (error) {
    // Fallback to universal greeting if time determination fails
    return 'Hello'
  }
}

export default function DashboardGreeting() {
  const { user } = useAuth()
  const router = useRouter()
  const [greeting, setGreeting] = useState(getTimeOfDayGreeting())
  const [currentDate, setCurrentDate] = useState('')
  const [isTrackDialogOpen, setIsTrackDialogOpen] = useState(false)

  useEffect(() => {
    // Initialize date
    const updateDateTime = () => {
      setGreeting(getTimeOfDayGreeting())
      setCurrentDate(
        new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      )
    }

    // Update immediately
    updateDateTime()

    // Update every minute to keep greeting current
    const interval = setInterval(updateDateTime, 60000)

    return () => clearInterval(interval)
  }, [])

  // Use authenticated user's name or fallback to default
  const userName = user?.name || 'Dr. Sarah Johnson'

  const handleNewProcurement = () => {
    router.push('/dashboard/procurement?view=form')
  }

  const handleTrackShipment = () => {
    setIsTrackDialogOpen(true)
  }

  const handleGenerateReport = () => {
    router.push('/dashboard/reports')
  }

  return (
    <>
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col gap-6">
          {/* Greeting Section */}
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl mb-2">
              {greeting}, {userName}
            </h2>
            <p className="text-white/80 text-sm sm:text-base">{currentDate}</p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <QuickActionCard
              icon={Plus}
              title="New Procurement"
              description="Create new order"
              onClick={handleNewProcurement}
              variant="primary"
            />
            <QuickActionCard
              icon={Search}
              title="Check Shipment"
              description="Track delivery status"
              onClick={handleTrackShipment}
              variant="secondary"
            />
            <QuickActionCard
              icon={FileText}
              title="Generate Reports"
              description="View analytics"
              onClick={handleGenerateReport}
              variant="secondary"
            />
          </div>
        </div>
      </div>

      <TrackShipmentDialog 
        isOpen={isTrackDialogOpen}
        onClose={() => setIsTrackDialogOpen(false)}
      />
    </>
  )
}
