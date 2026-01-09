'use client'

import React from 'react'

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
  const baseClasses = `
    bg-white rounded-xl p-4 sm:p-6 border border-gray-200
    transition-all duration-200
    active:scale-[0.98] touch-manipulation
    ${onClick || href ? 'cursor-pointer hover:shadow-lg hover:border-gray-300' : ''}
    min-h-[44px] flex items-center
  `
  
  if (href) {
    return (
      <a 
        href={href}
        className={`${baseClasses} ${className}`}
        onClick={onClick}
      >
        {children}
      </a>
    )
  }
  
  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={`${baseClasses} ${className} w-full text-left`}
      >
        {children}
      </button>
    )
  }
  
  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  )
}
