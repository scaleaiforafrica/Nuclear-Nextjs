'use client'

import React from 'react'

interface MobileTableCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

/**
 * MobileTableCard Component
 * Alternative to table rows on mobile - displays data in card format
 * Better for readability on small screens
 */
export function MobileTableCard({ 
  children, 
  className = '',
  onClick
}: MobileTableCardProps) {
  // Helper function to generate card classes
  const getCardClasses = () => {
    const baseClasses = [
      'bg-white',
      'rounded-lg',
      'p-4',
      'border border-gray-200',
      'space-y-3',
      'transition-all',
      'touch-manipulation'
    ]
    
    if (onClick) {
      baseClasses.push(
        'cursor-pointer',
        'hover:border-gray-300',
        'hover:shadow-md',
        'active:scale-[0.99]'
      )
    }
    
    return baseClasses.join(' ')
  }
  
  const cardClasses = `${getCardClasses()} ${className}`
  
  if (onClick) {
    return (
      <button 
        type="button"
        onClick={onClick}
        className={`${cardClasses} w-full text-left`}
      >
        {children}
      </button>
    )
  }
  
  return (
    <div className={cardClasses}>
      {children}
    </div>
  )
}

/**
 * MobileTableCardRow Component
 * Row within a mobile table card (label: value pairs)
 */
interface MobileTableCardRowProps {
  label: string
  value: React.ReactNode
  className?: string
}

export function MobileTableCardRow({ label, value, className = '' }: MobileTableCardRowProps) {
  return (
    <div className={`flex justify-between items-start gap-3 ${className}`}>
      <span className="text-xs text-gray-500 uppercase tracking-wider min-w-[80px]">{label}</span>
      <span className="text-sm text-gray-900 font-medium text-right flex-1">{value}</span>
    </div>
  )
}
