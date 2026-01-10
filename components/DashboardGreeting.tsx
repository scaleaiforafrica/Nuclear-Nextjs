'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts'
import { Plus, Search, FileText } from 'lucide-react'
import { TrackShipmentDialog } from '@/components/dashboard'

function getTimeOfDayGreeting(): string {
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl mb-2">
              {greeting}, {userName}
            </h2>
            <p className="text-white/80 text-sm sm:text-base">{currentDate}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button 
              onClick={handleNewProcurement}
              className="bg-white text-primary px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-white/90 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="whitespace-nowrap">New Procurement</span>
            </button>
            <button 
              onClick={handleTrackShipment}
              className="bg-white/10 backdrop-blur-sm text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base border border-white/20"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="whitespace-nowrap">Track Shipment</span>
            </button>
            <button 
              onClick={handleGenerateReport}
              className="bg-white/10 backdrop-blur-sm text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base border border-white/20"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="whitespace-nowrap">Generate Report</span>
            </button>
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
