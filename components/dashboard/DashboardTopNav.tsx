/**
 * DashboardTopNav Component
 * Reusable top navigation bar for dashboard pages
 * Ensures visual and functional consistency across all dashboard pages
 */

'use client';

import { Search, Bell, HelpCircle, Menu } from 'lucide-react';

export interface DashboardTopNavProps {
  pageTitle: string;
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
  notificationCount?: number;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  userName: string;
  userInitials: string;
  onAboutClick?: () => void;
}

export function DashboardTopNav({
  pageTitle,
  onMobileMenuToggle,
  mobileMenuOpen,
  notificationCount = 0,
  onSearchChange,
  searchPlaceholder = 'Search...',
  userName,
  userInitials,
  onAboutClick,
}: DashboardTopNavProps) {
  return (
    <header className="bg-header-footer h-14 sm:h-16 border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 lg:px-8 flex-shrink-0">
      {/* Mobile Menu Button & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 lg:flex-initial">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-sidebar"
        >
          <Menu className="w-6 h-6" aria-hidden="true" />
        </button>
        <h1 className="text-base sm:text-lg lg:text-2xl font-semibold capitalize truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Search Bar - Hidden on mobile, shown on tablet+ */}
      <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent min-h-[44px]"
            aria-label="Search"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
        {/* Search button for mobile */}
        <button
          className="md:hidden p-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-gray-600" aria-hidden="true" />
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
        >
          <Bell className="w-5 h-5 text-gray-600" aria-hidden="true" />
          {notificationCount > 0 && (
            <span
              className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              {notificationCount}
            </span>
          )}
        </button>

        {/* Help/About button */}
        <button
          onClick={onAboutClick}
          className="hidden sm:flex p-2 bg-white hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Help and about"
        >
          <HelpCircle className="w-5 h-5 text-gray-600" aria-hidden="true" />
        </button>

        {/* User Avatar */}
        <button
          className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`User menu for ${userName}`}
        >
          {userInitials}
        </button>
      </div>
    </header>
  );
}
