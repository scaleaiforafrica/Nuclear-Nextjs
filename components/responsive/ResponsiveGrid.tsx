'use client'

import React from 'react'

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: string
}

/**
 * ResponsiveGrid Component
 * Auto-adjusting grid that changes column count based on screen size
 * 
 * Default behavior:
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 3 columns
 */
export function ResponsiveGrid({ 
  children, 
  className = '', 
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = '4'
}: ResponsiveGridProps) {
  const mobileClass = `grid-cols-${columns.mobile || 1}`
  const tabletClass = `md:grid-cols-${columns.tablet || 2}`
  const desktopClass = `lg:grid-cols-${columns.desktop || 3}`
  
  return (
    <div className={`grid ${mobileClass} ${tabletClass} ${desktopClass} gap-${gap} ${className}`}>
      {children}
    </div>
  )
}
