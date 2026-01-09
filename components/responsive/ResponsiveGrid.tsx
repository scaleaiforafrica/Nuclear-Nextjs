'use client'

import React from 'react'

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  columns?: {
    mobile?: 1 | 2 | 3 | 4
    tablet?: 1 | 2 | 3 | 4
    desktop?: 1 | 2 | 3 | 4
  }
  gap?: '2' | '3' | '4' | '6' | '8'
}

/**
 * ResponsiveGrid Component
 * Auto-adjusting grid that changes column count based on screen size
 * 
 * Default behavior:
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 3 columns
 * 
 * Note: Uses predefined Tailwind classes to avoid purging issues
 */
export function ResponsiveGrid({ 
  children, 
  className = '', 
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = '4'
}: ResponsiveGridProps) {
  // Predefined class mappings to avoid Tailwind purging issues
  const mobileClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }
  
  const tabletClasses: Record<number, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }
  
  const desktopClasses: Record<number, string> = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  }
  
  const gapClasses: Record<string, string> = {
    '2': 'gap-2',
    '3': 'gap-3',
    '4': 'gap-4',
    '6': 'gap-6',
    '8': 'gap-8',
  }
  
  const mobileClass = mobileClasses[columns.mobile || 1]
  const tabletClass = tabletClasses[columns.tablet || 2]
  const desktopClass = desktopClasses[columns.desktop || 3]
  const gapClass = gapClasses[gap]
  
  return (
    <div className={`grid ${mobileClass} ${tabletClass} ${desktopClass} ${gapClass} ${className}`}>
      {children}
    </div>
  )
}
