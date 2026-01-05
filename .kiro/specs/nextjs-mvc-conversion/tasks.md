# Implementation Plan: Next.js MVC Conversion

## Overview

This implementation plan converts the NuClear React/Vite application to Next.js with MVC architecture using Bun runtime. Tasks are organized to build incrementally, ensuring each step produces working code before proceeding.

## Tasks

- [x] 1. Initialize Next.js project with Bun
  - [x] 1.1 Create new Next.js project structure with App Router
    - Initialize Next.js 14+ project with TypeScript
    - Configure Bun as package manager (bun.lockb)
    - Set up basic directory structure
    - _Requirements: 1.1, 10.5, 10.8_
  - [x] 1.2 Configure Tailwind CSS and global styles
    - Copy and adapt tailwind.config.ts from original project
    - Migrate globals.css and index.css styles
    - Configure PostCSS for Tailwind
    - _Requirements: 1.3, 10.3_
  - [x] 1.3 Set up TypeScript and ESLint configuration
    - Configure tsconfig.json for Next.js
    - Set up ESLint with Next.js rules
    - _Requirements: 1.4, 10.2, 10.4_
  - [x] 1.4 Install and configure dependencies
    - Install all Radix UI dependencies
    - Install utility libraries (clsx, tailwind-merge, class-variance-authority)
    - Install lucide-react, recharts, and other UI dependencies
    - _Requirements: 1.2_

- [x] 2. Create MVC directory structure and Model layer
  - [x] 2.1 Set up MVC directories
    - Create models/, controllers/, services/, components/, lib/ directories
    - Create index.ts barrel exports for each directory
    - _Requirements: 2.1, 2.2, 2.4, 2.5_
  - [x] 2.2 Implement data models
    - Create shipment.model.ts with Shipment interfaces
    - Create user.model.ts with User and Auth interfaces
    - Create activity.model.ts with Activity interfaces
    - Create compliance.model.ts with Compliance interfaces
    - Create dashboard.model.ts with Dashboard stat interfaces
    - Create navigation.model.ts with Navigation interfaces
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x] 2.3 Write property test for data model validation
    - **Property 5: Controller Data Transformation**
    - Test that model interfaces correctly type data
    - **Validates: Requirements 5.1, 5.4**

- [x] 3. Implement Controller layer
  - [x] 3.1 Create auth controller
    - Implement login/logout functions
    - Implement getAuthState and isAuthenticated
    - Use Result type for error handling
    - _Requirements: 5.2_
  - [x] 3.2 Write property test for auth state management
    - **Property 6: Auth State Management**
    - Test auth state updates correctly for all actions
    - **Validates: Requirements 5.2**
  - [x] 3.3 Create shipment controller
    - Implement getActiveShipments, getShipmentById
    - Implement filterShipments and sortShipments
    - Implement getShipmentStats
    - _Requirements: 5.1, 5.3_
  - [x] 3.4 Write property test for data filtering
    - **Property 7: Data Filtering Correctness**
    - Test filtered results match filter criteria
    - **Validates: Requirements 5.3**
  - [x] 3.5 Create dashboard controller
    - Implement getDashboardStats
    - Implement getRecentActivity
    - Implement getUpcomingDeliveries
    - _Requirements: 5.4_
  - [x] 3.6 Create compliance controller
    - Implement getComplianceStatus
    - Implement getExpiringPermits
    - Implement getPendingDocuments
    - _Requirements: 5.1_
  - [x] 3.7 Write property test for validation error handling
    - **Property 8: Validation Error Handling**
    - Test invalid inputs return error results
    - **Validates: Requirements 5.6**

- [x] 4. Checkpoint - Verify model and controller layers
  - Ensure all tests pass, ask the user if questions arise.
  - Run `bun run build` to verify no TypeScript errors

- [x] 5. Migrate UI component library
  - [x] 5.1 Copy and adapt base UI components
    - Migrate all components from src/components/ui/
    - Update imports for Next.js compatibility
    - Add 'use client' directive where needed
    - _Requirements: 9.1, 9.3, 9.5_
  - [x] 5.2 Create lib/utils.ts
    - Implement cn() utility function
    - Copy any other utility functions
    - _Requirements: 9.2_
  - [x] 5.3 Write property test for UI component equivalence
    - **Property 12: UI Component Equivalence**
    - Test components render with same props
    - **Validates: Requirements 9.2, 9.4**

- [x] 6. Implement landing page components (View layer)
  - [x] 6.1 Create Hero component
    - Migrate Hero.tsx to components/landing/
    - Add 'use client' for onClick handlers
    - _Requirements: 6.1_
  - [x] 6.2 Create remaining landing components
    - Migrate Features.tsx, Analytics.tsx
    - Migrate ChainOfCustody.tsx, QualityCompliance.tsx
    - Migrate FinalCTA.tsx, Footer.tsx
    - _Requirements: 6.2_
  - [x] 6.3 Create LoginModal component
    - Migrate LoginModal.tsx to components/shared/
    - Add 'use client' directive
    - _Requirements: 6.6, 8.2_

- [x] 7. Implement App Router pages
  - [x] 7.1 Create root layout and landing page
    - Create app/layout.tsx with providers
    - Create app/page.tsx for landing page
    - Wire up landing components
    - _Requirements: 3.1_
  - [x] 7.2 Create 404 not-found page
    - Create app/not-found.tsx
    - Style consistent with application design
    - _Requirements: 3.4_
  - [x] 7.3 Write property test for invalid route handling
    - **Property 3: Invalid Route Handling**
    - Test undefined routes show 404
    - **Validates: Requirements 3.4**

- [x] 8. Implement dashboard layout and navigation
  - [x] 8.1 Create dashboard layout
    - Create app/dashboard/layout.tsx
    - Implement sidebar navigation
    - Implement header with search and notifications
    - _Requirements: 6.3, 3.5_
  - [x] 8.2 Create dashboard home page
    - Create app/dashboard/page.tsx
    - Migrate DashboardHome component
    - Wire up with dashboard controller
    - _Requirements: 3.2, 6.4_
  - [x] 8.3 Write property test for route-component mapping
    - **Property 2: Route-Component Mapping**
    - Test each route renders correct component
    - **Validates: Requirements 3.3**

- [x] 9. Implement dashboard module pages
  - [x] 9.1 Create procurement module page
    - Create app/dashboard/procurement/page.tsx
    - Migrate ProcurementModule component
    - _Requirements: 3.3, 6.4_
  - [x] 9.2 Create shipments module page
    - Create app/dashboard/shipments/page.tsx
    - Migrate ShipmentsModule component
    - _Requirements: 3.3, 6.4_
  - [x] 9.3 Create compliance module page
    - Create app/dashboard/compliance/page.tsx
    - Migrate ComplianceModule component
    - _Requirements: 3.3, 6.4_
  - [x] 9.4 Create traceability module page
    - Create app/dashboard/traceability/page.tsx
    - Migrate TraceabilityModule component
    - _Requirements: 3.3, 6.4_
  - [x] 9.5 Create reports module page
    - Create app/dashboard/reports/page.tsx
    - Migrate ReportsModule component
    - _Requirements: 3.3, 6.4_
  - [x] 9.6 Create settings module page
    - Create app/dashboard/settings/page.tsx
    - Migrate SettingsModule component
    - _Requirements: 3.3, 6.4_

- [x] 10. Checkpoint - Verify all pages render
  - Ensure all tests pass, ask the user if questions arise.
  - Run `bun run dev` and manually verify all routes
  - Run `bun run build` to verify production build

- [x] 11. Implement authentication flow
  - [x] 11.1 Create auth context and provider
    - Create context for auth state management
    - Implement AuthProvider component
    - Wire up with auth controller
    - _Requirements: 8.1, 8.4, 8.5_
  - [x] 11.2 Implement protected routes
    - Create middleware or layout protection for dashboard
    - Redirect unauthenticated users to landing
    - _Requirements: 8.1, 8.4_
  - [x] 11.3 Write property test for auth-view mapping
    - **Property 9: Auth-View Mapping**
    - Test correct view shown for auth state
    - **Validates: Requirements 8.1, 8.4**
  - [x] 11.4 Write property test for auth persistence
    - **Property 11: Auth Persistence**
    - Test auth state persists across navigation
    - **Validates: Requirements 8.5**
  - [x] 11.5 Write property test for login redirect
    - **Property 10: Login Redirect**
    - Test successful login redirects to dashboard
    - **Validates: Requirements 8.3**

- [x] 12. Implement services layer
  - [x] 12.1 Create API service
    - Implement base API service with fetch wrapper
    - Add error handling and Result types
    - _Requirements: 2.5_
  - [x] 12.2 Create storage service
    - Implement local storage utilities
    - Add session storage for auth state
    - _Requirements: 2.5_

- [x] 13. Final integration and cleanup
  - [x] 13.1 Wire all components together
    - Ensure all imports are correct
    - Verify data flow from controllers to views
    - _Requirements: 6.5, 6.6_
  - [x] 13.2 Write property test for client-side navigation
    - **Property 4: Client-Side Navigation**
    - Test navigation doesn't cause full page reload
    - **Validates: Requirements 3.5**
  - [x] 13.3 Update package.json scripts
    - Add dev, build, start, lint scripts for Bun
    - Verify all scripts work correctly
    - _Requirements: 10.6, 10.7, 10.8_

- [x] 14. Final checkpoint - Complete verification
  - Ensure all tests pass, ask the user if questions arise.
  - Run full test suite with `bun test`
  - Run production build with `bun run build`
  - Verify application starts with `bun run start`

## Notes

- All tasks including property tests are required for comprehensive coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All components requiring interactivity must have 'use client' directive
