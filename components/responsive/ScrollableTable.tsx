'use client'

import React from 'react'

interface ScrollableTableProps {
  children: React.ReactNode
  className?: string
  minWidth?: string
}

/**
 * ScrollableTable Component
 * Wraps tables to make them horizontally scrollable on mobile
 * Provides visual indicators for scrollability
 */
export function ScrollableTable({ 
  children, 
  className = '',
  minWidth = '640px'
}: ScrollableTableProps) {
  return (
    <div className="relative">
      {/* Scroll indicator shadows */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div style={{ minWidth }} className={className}>
          {children}
        </div>
      </div>
      {/* Mobile hint */}
      <div className="md:hidden text-xs text-gray-500 text-center mt-2">
        Swipe to see more →
      </div>
    </div>
  )
}
