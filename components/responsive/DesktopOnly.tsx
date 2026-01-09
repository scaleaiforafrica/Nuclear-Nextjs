'use client'

import React from 'react'

interface DesktopOnlyProps {
  children: React.ReactNode
  className?: string
}

/**
 * DesktopOnly Component
 * Renders children only on desktop devices (>= 768px)
 * Uses CSS to hide/show for better performance than JS detection
 */
export function DesktopOnly({ children, className = '' }: DesktopOnlyProps) {
  return (
    <div className={`hidden md:block ${className}`}>
      {children}
    </div>
  )
}
