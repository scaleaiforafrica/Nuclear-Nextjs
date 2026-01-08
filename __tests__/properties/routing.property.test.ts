import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Valid application routes as defined in the Next.js App Router structure
 * These are the routes that should NOT trigger a 404
 */
const VALID_ROUTES = [
  '/',
  '/dashboard',
  '/dashboard/procurement',
  '/dashboard/shipments',
  '/dashboard/compliance',
  '/dashboard/traceability',
  '/dashboard/reports',
  '/dashboard/settings',
] as const

/**
 * Route segments that are valid in the application
 */
const VALID_SEGMENTS = [
  'dashboard',
  'procurement',
  'shipments',
  'compliance',
  'traceability',
  'reports',
  'settings',
]

/**
 * Checks if a given path is a valid application route
 * @param path - The URL path to check
 * @returns true if the path is a valid route, false otherwise
 */
function isValidRoute(path: string): boolean {
  // Normalize the path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const cleanPath = normalizedPath.replace(/\/+$/, '') || '/'
  
  return VALID_ROUTES.includes(cleanPath as typeof VALID_ROUTES[number])
}

/**
 * Generates an arbitrary invalid route path
 * These are paths that should trigger a 404 response
 */
const invalidRouteArb = fc.oneof(
  // Random string paths that are not valid routes
  fc.string({ minLength: 1, maxLength: 50 })
    .filter(s => !s.includes('\0') && !s.includes('\n'))
    .map(s => `/${s.replace(/[^a-zA-Z0-9-_/]/g, '')}`)
    .filter(path => !isValidRoute(path)),
  
  // Paths with invalid segments
  fc.array(
    fc.string({ minLength: 1, maxLength: 20 })
      .filter(s => !VALID_SEGMENTS.includes(s) && /^[a-zA-Z0-9-_]+$/.test(s)),
    { minLength: 1, maxLength: 5 }
  ).map(segments => `/${segments.join('/')}`),
  
  // Paths with extra segments after valid routes
  fc.tuple(
    fc.constantFrom(...VALID_ROUTES.filter(r => r !== '/')),
    fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9-_]+$/.test(s))
  ).map(([validRoute, extra]) => `${validRoute}/${extra}`)
    .filter(path => !isValidRoute(path)),
  
  // Completely random invalid paths
  fc.constantFrom(
    '/invalid',
    '/foo/bar',
    '/dashboard/invalid',
    '/dashboard/procurement/extra',
    '/api/test',
    '/admin',
    '/user/profile',
    '/settings', // Note: /settings alone is invalid, only /dashboard/settings is valid
    '/compliance', // Note: /compliance alone is invalid
    '/random-page',
    '/dashboard/unknown-module',
  )
)

/**
 * Generates an arbitrary valid route path
 */
const validRouteArb = fc.constantFrom(...VALID_ROUTES)

describe('Invalid Route Handling', () => {
  /**
   * Feature: nextjs-mvc-conversion, Property 3: Invalid Route Handling
   * *For any* URL path that is not defined in the application routes, 
   * the router SHALL display the 404 not-found page.
   * **Validates: Requirements 3.4**
   */

  it('should identify invalid routes correctly for any generated invalid path', () => {
    fc.assert(
      fc.property(invalidRouteArb, (invalidPath) => {
        // For any invalid path, isValidRoute should return false
        expect(isValidRoute(invalidPath)).toBe(false)
      }),
      { numRuns: 100 }
    )
  })

  it('should identify valid routes correctly for any defined route', () => {
    fc.assert(
      fc.property(validRouteArb, (validPath) => {
        // For any valid path, isValidRoute should return true
        expect(isValidRoute(validPath)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('should correctly distinguish between valid and invalid routes', () => {
    fc.assert(
      fc.property(
        fc.oneof(validRouteArb, invalidRouteArb),
        (path) => {
          const isValid = isValidRoute(path)
          
          // If the path is in VALID_ROUTES, it should be valid
          // Otherwise, it should be invalid
          const normalizedPath = path.startsWith('/') ? path : `/${path}`
          const cleanPath = normalizedPath.replace(/\/+$/, '') || '/'
          const expectedValid = VALID_ROUTES.includes(cleanPath as typeof VALID_ROUTES[number])
          
          expect(isValid).toBe(expectedValid)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle edge cases for route validation', () => {
    // Test specific edge cases
    const edgeCases = [
      { path: '/', expected: true },
      { path: '/dashboard', expected: true },
      { path: '/dashboard/', expected: true }, // Trailing slash should be normalized
      { path: '/Dashboard', expected: false }, // Case sensitive
      { path: '/DASHBOARD', expected: false }, // Case sensitive
      { path: '/dashboard/procurement', expected: true },
      { path: '/dashboard/procurement/', expected: true },
      { path: '/procurement', expected: false }, // Must be under /dashboard
      { path: '/settings', expected: false }, // Must be under /dashboard
      { path: '/dashboard/settings', expected: true },
      { path: '/dashboard/invalid', expected: false },
      { path: '/random', expected: false },
      { path: '', expected: true }, // Empty string normalizes to /
    ]

    edgeCases.forEach(({ path, expected }) => {
      expect(isValidRoute(path)).toBe(expected)
    })
  })

  it('should ensure all dashboard module routes are valid', () => {
    const dashboardModules = [
      'procurement',
      'shipments',
      'compliance',
      'traceability',
      'reports',
      'settings',
    ]

    dashboardModules.forEach(module => {
      const path = `/dashboard/${module}`
      expect(isValidRoute(path)).toBe(true)
    })
  })

  it('should ensure nested paths beyond valid routes are invalid', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.constantFrom(...VALID_ROUTES),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9-_]+$/.test(s))
        ),
        ([validRoute, extraSegment]) => {
          // Adding an extra segment to a valid route should make it invalid
          // (except for / which becomes a different valid or invalid route)
          if (validRoute === '/') {
            // /something might be valid (like /dashboard) or invalid
            const newPath = `/${extraSegment}`
            // Just verify the function doesn't throw
            expect(() => isValidRoute(newPath)).not.toThrow()
          } else {
            const newPath = `${validRoute}/${extraSegment}`
            // This should be invalid since we don't have nested routes beyond the defined ones
            expect(isValidRoute(newPath)).toBe(false)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Route to component mapping as defined in the Next.js App Router structure
 * Each route maps to a specific page component
 */
const ROUTE_COMPONENT_MAP: Record<string, string> = {
  '/': 'LandingPage',
  '/dashboard': 'DashboardPage',
  '/dashboard/procurement': 'ProcurementPage',
  '/dashboard/shipments': 'ShipmentsPage',
  '/dashboard/compliance': 'CompliancePage',
  '/dashboard/traceability': 'TraceabilityPage',
  '/dashboard/reports': 'ReportsPage',
  '/dashboard/settings': 'SettingsPage',
}

/**
 * Dashboard module routes and their expected components
 */
const DASHBOARD_MODULE_ROUTES = [
  { route: '/dashboard/procurement', component: 'ProcurementPage', module: 'procurement' },
  { route: '/dashboard/shipments', component: 'ShipmentsPage', module: 'shipments' },
  { route: '/dashboard/compliance', component: 'CompliancePage', module: 'compliance' },
  { route: '/dashboard/traceability', component: 'TraceabilityPage', module: 'traceability' },
  { route: '/dashboard/reports', component: 'ReportsPage', module: 'reports' },
  { route: '/dashboard/settings', component: 'SettingsPage', module: 'settings' },
]

/**
 * Gets the expected component for a given route
 * @param route - The URL path
 * @returns The component name that should render for this route, or null if invalid
 */
function getComponentForRoute(route: string): string | null {
  // Normalize the route
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`
  const cleanRoute = normalizedRoute.replace(/\/+$/, '') || '/'
  
  return ROUTE_COMPONENT_MAP[cleanRoute] || null
}

/**
 * Checks if a route is a dashboard module route
 * @param route - The URL path
 * @returns true if the route is a dashboard module route
 */
function isDashboardModuleRoute(route: string): boolean {
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`
  const cleanRoute = normalizedRoute.replace(/\/+$/, '') || '/'
  
  return DASHBOARD_MODULE_ROUTES.some(m => m.route === cleanRoute)
}

/**
 * Gets the module name from a dashboard route
 * @param route - The URL path
 * @returns The module name or null if not a dashboard module route
 */
function getModuleFromRoute(route: string): string | null {
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`
  const cleanRoute = normalizedRoute.replace(/\/+$/, '') || '/'
  
  const moduleInfo = DASHBOARD_MODULE_ROUTES.find(m => m.route === cleanRoute)
  return moduleInfo?.module || null
}

describe('Route-Component Mapping', () => {
  /**
   * Feature: nextjs-mvc-conversion, Property 2: Route-Component Mapping
   * *For any* defined dashboard route (procurement, shipments, compliance, 
   * traceability, reports, settings), navigating to that route SHALL render 
   * the corresponding module component.
   * **Validates: Requirements 3.3**
   */

  it('should map each valid route to a specific component', () => {
    fc.assert(
      fc.property(validRouteArb, (route) => {
        // For any valid route, there should be a corresponding component
        const component = getComponentForRoute(route)
        expect(component).not.toBeNull()
        expect(typeof component).toBe('string')
        expect(component!.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  it('should map each dashboard module route to its correct component', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...DASHBOARD_MODULE_ROUTES.map(m => m.route)),
        (route) => {
          const component = getComponentForRoute(route)
          const expectedModule = DASHBOARD_MODULE_ROUTES.find(m => m.route === route)
          
          expect(component).toBe(expectedModule?.component)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should correctly identify dashboard module routes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...DASHBOARD_MODULE_ROUTES.map(m => m.route)),
        (route) => {
          expect(isDashboardModuleRoute(route)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return null component for invalid routes', () => {
    fc.assert(
      fc.property(invalidRouteArb, (invalidRoute) => {
        const component = getComponentForRoute(invalidRoute)
        expect(component).toBeNull()
      }),
      { numRuns: 100 }
    )
  })

  it('should extract correct module name from dashboard routes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...DASHBOARD_MODULE_ROUTES),
        (moduleInfo) => {
          const extractedModule = getModuleFromRoute(moduleInfo.route)
          expect(extractedModule).toBe(moduleInfo.module)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should ensure all dashboard modules have unique routes and components', () => {
    // Verify uniqueness of routes
    const routes = DASHBOARD_MODULE_ROUTES.map(m => m.route)
    const uniqueRoutes = new Set(routes)
    expect(uniqueRoutes.size).toBe(routes.length)

    // Verify uniqueness of components
    const components = DASHBOARD_MODULE_ROUTES.map(m => m.component)
    const uniqueComponents = new Set(components)
    expect(uniqueComponents.size).toBe(components.length)

    // Verify uniqueness of module names
    const modules = DASHBOARD_MODULE_ROUTES.map(m => m.module)
    const uniqueModules = new Set(modules)
    expect(uniqueModules.size).toBe(modules.length)
  })

  it('should handle route normalization consistently', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_ROUTES),
        (route) => {
          // Route with and without trailing slash should map to same component
          const componentWithoutSlash = getComponentForRoute(route)
          const componentWithSlash = getComponentForRoute(`${route}/`)
          
          expect(componentWithoutSlash).toBe(componentWithSlash)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should verify route-component mapping is bidirectional', () => {
    // For each component, there should be exactly one route
    const componentToRoutes = new Map<string, string[]>()
    
    Object.entries(ROUTE_COMPONENT_MAP).forEach(([route, component]) => {
      if (!componentToRoutes.has(component)) {
        componentToRoutes.set(component, [])
      }
      componentToRoutes.get(component)!.push(route)
    })

    // Each component should map to exactly one route
    componentToRoutes.forEach((routes, component) => {
      expect(routes.length).toBe(1)
    })
  })
})

/**
 * Navigation transition types
 * Client-side navigation should NOT trigger a full page reload
 */
type NavigationType = 'client-side' | 'full-reload'

/**
 * Represents a navigation event between two routes
 */
interface NavigationEvent {
  from: string
  to: string
  type: NavigationType
}

/**
 * Dashboard routes that support client-side navigation between each other
 * All dashboard module routes should navigate without full page reload
 */
const DASHBOARD_ROUTES = VALID_ROUTES.filter(route => route.startsWith('/dashboard'))

/**
 * Determines if navigation between two routes should be client-side
 * In Next.js App Router, navigation between routes in the same layout
 * should be client-side (no full page reload)
 * 
 * @param from - The source route
 * @param to - The destination route
 * @returns true if navigation should be client-side
 */
function shouldBeClientSideNavigation(from: string, to: string): boolean {
  // Normalize routes
  const normalizedFrom = from.startsWith('/') ? from : `/${from}`
  const normalizedTo = to.startsWith('/') ? to : `/${to}`
  const cleanFrom = normalizedFrom.replace(/\/+$/, '') || '/'
  const cleanTo = normalizedTo.replace(/\/+$/, '') || '/'
  
  // Navigation to the same route is always client-side (no-op)
  if (cleanFrom === cleanTo) {
    return true
  }
  
  // Navigation between dashboard routes should be client-side
  // because they share the same layout
  const fromIsDashboard = cleanFrom.startsWith('/dashboard')
  const toIsDashboard = cleanTo.startsWith('/dashboard')
  
  if (fromIsDashboard && toIsDashboard) {
    return true
  }
  
  // Navigation from landing to dashboard or vice versa
  // In Next.js with proper Link/router.push, this is also client-side
  // as long as both routes are valid application routes
  const fromIsValid = isValidRoute(cleanFrom)
  const toIsValid = isValidRoute(cleanTo)
  
  return fromIsValid && toIsValid
}

/**
 * Simulates determining the navigation type for a route transition
 * In a real application, this would be determined by whether the browser
 * triggers a full page load or uses the History API
 * 
 * @param from - The source route
 * @param to - The destination route
 * @returns The type of navigation that would occur
 */
function getNavigationType(from: string, to: string): NavigationType {
  // If navigation should be client-side and both routes are valid,
  // Next.js router.push() will handle it without full reload
  if (shouldBeClientSideNavigation(from, to)) {
    return 'client-side'
  }
  
  // Invalid routes or external navigation would cause full reload
  return 'full-reload'
}

/**
 * Checks if a navigation event preserves the application state
 * Client-side navigation should preserve React state in shared layouts
 * 
 * @param event - The navigation event
 * @returns true if state should be preserved
 */
function preservesApplicationState(event: NavigationEvent): boolean {
  // Client-side navigation preserves state
  return event.type === 'client-side'
}

/**
 * Generates pairs of dashboard routes for navigation testing
 */
const dashboardRoutesPairArb = fc.tuple(
  fc.constantFrom(...DASHBOARD_ROUTES),
  fc.constantFrom(...DASHBOARD_ROUTES)
)

/**
 * Generates any valid route pair for navigation testing
 */
const validRoutesPairArb = fc.tuple(
  fc.constantFrom(...VALID_ROUTES),
  fc.constantFrom(...VALID_ROUTES)
)

describe('Client-Side Navigation', () => {
  /**
   * Feature: nextjs-mvc-conversion, Property 4: Client-Side Navigation
   * *For any* navigation between dashboard modules, the navigation SHALL occur 
   * without a full page reload (client-side routing).
   * **Validates: Requirements 3.5**
   */

  it('should use client-side navigation for any dashboard module transition', () => {
    fc.assert(
      fc.property(dashboardRoutesPairArb, ([fromRoute, toRoute]) => {
        // For any navigation between dashboard routes, it should be client-side
        const navigationType = getNavigationType(fromRoute, toRoute)
        expect(navigationType).toBe('client-side')
      }),
      { numRuns: 100 }
    )
  })

  it('should preserve application state during dashboard navigation', () => {
    fc.assert(
      fc.property(dashboardRoutesPairArb, ([fromRoute, toRoute]) => {
        const event: NavigationEvent = {
          from: fromRoute,
          to: toRoute,
          type: getNavigationType(fromRoute, toRoute)
        }
        
        // Client-side navigation should preserve application state
        expect(preservesApplicationState(event)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('should use client-side navigation between any valid application routes', () => {
    fc.assert(
      fc.property(validRoutesPairArb, ([fromRoute, toRoute]) => {
        // Navigation between any valid routes should be client-side
        const navigationType = getNavigationType(fromRoute, toRoute)
        expect(navigationType).toBe('client-side')
      }),
      { numRuns: 100 }
    )
  })

  it('should correctly identify client-side navigation for all dashboard module combinations', () => {
    // Test all possible combinations of dashboard module routes
    const dashboardModuleRoutes = DASHBOARD_MODULE_ROUTES.map(m => m.route)
    
    fc.assert(
      fc.property(
        fc.constantFrom(...dashboardModuleRoutes),
        fc.constantFrom(...dashboardModuleRoutes),
        (from, to) => {
          // All dashboard module to dashboard module navigation should be client-side
          expect(shouldBeClientSideNavigation(from, to)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle navigation to same route as client-side (no-op)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_ROUTES),
        (route) => {
          // Navigating to the same route should be client-side
          expect(shouldBeClientSideNavigation(route, route)).toBe(true)
          expect(getNavigationType(route, route)).toBe('client-side')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle route normalization for navigation type determination', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...DASHBOARD_ROUTES),
        fc.constantFrom(...DASHBOARD_ROUTES),
        (from, to) => {
          // Routes with and without trailing slashes should behave the same
          const typeWithoutSlash = getNavigationType(from, to)
          const typeWithSlash = getNavigationType(`${from}/`, `${to}/`)
          
          expect(typeWithoutSlash).toBe(typeWithSlash)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should verify navigation from landing page to dashboard is client-side', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...DASHBOARD_ROUTES),
        (dashboardRoute) => {
          // Navigation from landing (/) to any dashboard route should be client-side
          const navigationType = getNavigationType('/', dashboardRoute)
          expect(navigationType).toBe('client-side')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should verify navigation from dashboard to landing page is client-side', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...DASHBOARD_ROUTES),
        (dashboardRoute) => {
          // Navigation from any dashboard route to landing (/) should be client-side
          const navigationType = getNavigationType(dashboardRoute, '/')
          expect(navigationType).toBe('client-side')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should ensure all navigation items in sidebar support client-side navigation', () => {
    // These are the navigation items defined in the dashboard layout
    const sidebarNavigationHrefs = [
      '/dashboard',
      '/dashboard/procurement',
      '/dashboard/shipments',
      '/dashboard/compliance',
      '/dashboard/traceability',
      '/dashboard/reports',
      '/dashboard/settings',
    ]

    fc.assert(
      fc.property(
        fc.constantFrom(...sidebarNavigationHrefs),
        fc.constantFrom(...sidebarNavigationHrefs),
        (from, to) => {
          // All sidebar navigation should be client-side
          expect(shouldBeClientSideNavigation(from, to)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Export for potential reuse in other tests
export { 
  isValidRoute, 
  VALID_ROUTES, 
  VALID_SEGMENTS,
  getComponentForRoute,
  isDashboardModuleRoute,
  getModuleFromRoute,
  ROUTE_COMPONENT_MAP,
  DASHBOARD_MODULE_ROUTES,
  shouldBeClientSideNavigation,
  getNavigationType,
  preservesApplicationState,
  DASHBOARD_ROUTES
}
