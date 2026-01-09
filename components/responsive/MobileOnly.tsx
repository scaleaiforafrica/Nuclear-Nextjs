'use client'

import React from 'react'

interface MobileOnlyProps {
  children: React.ReactNode
  className?: string
}

/**
 * MobileOnly Component
 * Renders children only on mobile devices (< 768px)
 * Uses CSS to hide/show for better performance than JS detection
 */
export function MobileOnly({ children, className = '' }: MobileOnlyProps) {
  return (
    <div className={`block md:hidden ${className}`}>
      {children}
    </div>
  )
}
