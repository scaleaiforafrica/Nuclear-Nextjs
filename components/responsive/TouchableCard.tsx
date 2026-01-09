'use client'

import React from 'react'
import Link from 'next/link'

interface TouchableCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  href?: string
}

/**
 * TouchableCard Component
 * Mobile-friendly card with proper touch targets and feedback
 * Minimum 44x44px touch target with proper spacing
 */
export function TouchableCard({ 
  children, 
  className = '', 
  onClick,
  href
}: TouchableCardProps) {
  // Helper function to generate card classes
  const getCardClasses = () => {
    const baseClasses = [
      'bg-white',
      'rounded-xl',
      'p-4 sm:p-6',
      'border border-gray-200',
      'transition-all duration-200',
      'active:scale-[0.98]',
      'touch-manipulation',
      'min-h-[44px]',
      'flex items-center'
    ]
    
    if (onClick || href) {
      baseClasses.push('cursor-pointer', 'hover:shadow-lg', 'hover:border-gray-300')
    }
    
    return baseClasses.join(' ')
  }
  
  const cardClasses = `${getCardClasses()} ${className}`
  
  if (href) {
    return (
      <Link 
        href={href}
        className={cardClasses}
        onClick={onClick}
      >
        {children}
      </Link>
    )
  }
  
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
