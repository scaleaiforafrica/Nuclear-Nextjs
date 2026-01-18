'use client'

import { useState, useEffect } from 'react'
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
  ChevronLeft,
  LogOut,
  X
} from 'lucide-react'
import type { NavigationItem, DashboardPage } from '@/models'
import { useAuth, NotificationProvider } from '@/contexts'
import { ProtectedRoute } from '@/components/shared'
import { AnimatedLogo } from '@/components'
import { DemoBanner } from '@/components/demo/DemoBanner'
import { ProfileSwitcher } from '@/components/profile'
import { AccountSwitcher, AddAccountDialog } from '@/components/account'
import { isDemoAccount } from '@/lib/demo/utils'
import { DashboardTopNav, AboutModal } from '@/components/dashboard'
import { APP_CONFIG } from '@/lib/app-config'
import { useDemoNotifications } from '@/hooks/useDemoNotifications'

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

function DashboardContent({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { 
    user, 
    logout, 
    supabaseUser, 
    availableProfiles, 
    switchProfile,
    storedAccounts,
    switchAccount,
    addAccount,
    removeStoredAccount,
  } = useAuth()

  // Add demo notifications on mount
  useDemoNotifications()

  // Check if current user is demo account
  const isDemo = supabaseUser ? isDemoAccount(supabaseUser) : false

  // Mobile menu handlers
  const openMobileMenu = () => setMobileMenuOpen(true)
  const closeMobileMenu = () => setMobileMenuOpen(false)
  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed)
  
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        closeMobileMenu()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileMenuOpen])

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
  const userRole = user?.role || 'Hospital Administrator'

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Demo Banner - Only shown for demo accounts */}
      {isDemo && <DemoBanner />}
        
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`${
            sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[280px]'
          } w-[280px] max-w-[85vw] bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-out
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          safe-area-inset-top safe-area-inset-bottom safe-area-inset-left
          `}
          role="navigation"
          aria-label="Main navigation"
        >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 sm:px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <AnimatedLogo size="md" showIcon={true} showText={!sidebarCollapsed} />
          </div>
          {/* Close button for mobile - only visible when menu is open */}
          <button
            onClick={closeMobileMenu}
            className="lg:hidden p-2 hover:bg-sidebar-accent rounded-lg touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 sm:py-6 px-2 sm:px-3 overflow-y-auto touch-scroll">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all relative touch-manipulation min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'text-gray-300 hover:bg-sidebar-accent active:bg-sidebar-accent/50'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-400 rounded-r"></div>
                    )}
                    <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Settings & User Profile */}
        <div className="border-t border-sidebar-border mt-auto">
          <Link
            href="/dashboard/settings"
            onClick={closeMobileMenu}
            className={`w-full flex items-center gap-3 px-4 sm:px-6 py-4 transition-all touch-manipulation min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
              currentPage === 'settings'
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-gray-300 hover:bg-sidebar-accent active:bg-sidebar-accent/50'
            }`}
            aria-current={currentPage === 'settings' ? 'page' : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {!sidebarCollapsed && <span>Settings</span>}
          </Link>

          <div className={`${sidebarCollapsed ? 'p-2' : 'p-3 sm:p-4'} border-t border-sidebar-border safe-area-inset-bottom`}>
            {/* Account Switcher */}
            {user && (
              <div className="mb-3">
                <AccountSwitcher
                  currentUser={user}
                  accounts={storedAccounts}
                  onAccountSwitch={switchAccount}
                  onAddAccount={() => setIsAddAccountOpen(true)}
                  onRemoveAccount={removeStoredAccount}
                  collapsed={sidebarCollapsed}
                />
              </div>
            )}
            {/* Profile Switcher */}
            <div className="mb-3">
              <ProfileSwitcher
                currentProfile={{
                  name: userName,
                  role: userRole,
                  initials: userInitials
                }}
                availableProfiles={availableProfiles}
                onProfileSwitch={switchProfile}
                collapsed={sidebarCollapsed}
              />
            </div>
            {!sidebarCollapsed && (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:bg-sidebar-accent active:bg-sidebar-accent/50 rounded-lg transition-colors touch-manipulation min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapse Toggle - Hidden on mobile */}
        <button
          onClick={toggleSidebarCollapse}
          className="hidden lg:flex absolute top-20 -right-3 w-6 h-6 bg-sidebar border border-sidebar-border rounded-full items-center justify-center hover:bg-sidebar-accent transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={`w-4 h-4 text-gray-400 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navigation Bar */}
        <DashboardTopNav
          pageTitle={getPageTitle()}
          onMobileMenuToggle={openMobileMenu}
          mobileMenuOpen={mobileMenuOpen}
          searchPlaceholder="Search..."
          userName={userName}
          userInitials={userInitials}
          onAboutClick={() => setIsAboutModalOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-background touch-scroll">
          <div className="w-full p-3 sm:p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        appInfo={APP_CONFIG}
      />

      {/* Add Account Dialog */}
      <AddAccountDialog
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onAddAccount={addAccount}
      />
    </div>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <NotificationProvider>
        <DashboardContent>{children}</DashboardContent>
      </NotificationProvider>
    </ProtectedRoute>
  )
}
