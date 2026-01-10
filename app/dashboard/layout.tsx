'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutGrid, 
  ShoppingCart, 
  Truck, 
  Shield, 
  Link2, 
  BarChart3, 
  Settings, 
  Search, 
  Bell, 
  HelpCircle, 
  ChevronLeft,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import type { NavigationItem, DashboardPage } from '@/models'
import { useAuth } from '@/contexts'
import { ProtectedRoute } from '@/components/shared'
import { AnimatedLogo } from '@/components'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
  { id: 'procurement', label: 'Procurement', icon: ShoppingCart, href: '/dashboard/procurement' },
  { id: 'shipments', label: 'Shipments', icon: Truck, href: '/dashboard/shipments' },
  { id: 'compliance', label: 'Compliance', icon: Shield, href: '/dashboard/compliance' },
  { id: 'traceability', label: 'Traceability', icon: Link2, href: '/dashboard/traceability' },
  { id: 'reports', label: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationCount] = useState(3)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  // Mobile menu handlers
  const openMobileMenu = () => setMobileMenuOpen(true)
  const closeMobileMenu = () => setMobileMenuOpen(false)
  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed)

  // Determine current page from pathname
  const getCurrentPage = (): DashboardPage => {
    if (pathname === '/dashboard') return 'dashboard'
    const segment = pathname.split('/').pop()
    if (segment && ['procurement', 'shipments', 'compliance', 'traceability', 'reports', 'settings'].includes(segment)) {
      return segment as DashboardPage
    }
    return 'dashboard'
  }

  const currentPage = getCurrentPage()

  const getPageTitle = (): string => {
    if (currentPage === 'dashboard') return 'Dashboard'
    return currentPage.charAt(0).toUpperCase() + currentPage.slice(1)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Get user display info
  const userInitials = user?.initials || 'U'
  const userName = user?.name || 'User'
  const userRole = user?.role || 'Guest'

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`${
            sidebarCollapsed ? 'w-[72px]' : 'w-[280px]'
          } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2 flex-1">
            {sidebarCollapsed ? (
              <div className="text-2xl" aria-label="Nuclear symbol">⚛</div>
            ) : (
              <AnimatedLogo size="sm" showIcon={true} />
            )}
          </div>
          {/* Close button for mobile */}
          <button
            onClick={closeMobileMenu}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all relative ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-600 rounded-r"></div>
                    )}
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Settings & User Profile */}
        <div className="border-t border-gray-200">
          <Link
            href="/dashboard/settings"
            onClick={closeMobileMenu}
            className={`w-full flex items-center gap-3 px-6 py-4 transition-all ${
              currentPage === 'settings'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Settings</span>}
          </Link>

          {!sidebarCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{userName}</div>
                  <div className="text-xs text-gray-500 truncate">{userRole}</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Collapse Toggle - Hidden on mobile */}
        <button
          onClick={toggleSidebarCollapse}
          className="hidden lg:flex absolute top-20 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors z-10"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
        </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile Menu Button & Page Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1 lg:flex-initial">
            <button
              onClick={openMobileMenu}
              className="lg:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl lg:text-2xl capitalize truncate">{getPageTitle()}</h1>
          </div>

          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Search button for mobile */}
            <button className="md:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            <button className="hidden sm:block p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm cursor-pointer">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      </div>
    </ProtectedRoute>
  )
}
