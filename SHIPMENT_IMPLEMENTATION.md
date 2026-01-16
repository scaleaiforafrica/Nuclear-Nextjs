# Shipment Management System Implementation

## Overview

This document describes the complete implementation of the shipment management system for the Nuclear Supply Chain Management application. The system provides comprehensive tracking of medical isotope shipments with procurement integration, route visualization, and radioactive decay calculations.

## Table of Contents

1. [Features](#features)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Frontend Components](#frontend-components)
5. [Service Layer](#service-layer)
6. [Utilities](#utilities)
7. [Testing](#testing)
8. [Usage Guide](#usage-guide)

---

## Features

### Core Functionality
- ✅ **Shipment Creation**: Create shipments manually or from procurement requests
- ✅ **Route Visualization**: Static map display with waypoints using Leaflet
- ✅ **Activity Decay Tracking**: Real-time calculation of isotope activity decay
- ✅ **Procurement Integration**: Seamless linking between procurement and shipments
- ✅ **Status Management**: Track shipments through their lifecycle (Pending → In Transit → At Customs → Dispatched → Delivered)
- ✅ **Mobile Responsive**: Full functionality on mobile and desktop devices

### Security & Validation
- ✅ **Row Level Security (RLS)**: PostgreSQL policies for data access control
- ✅ **Input Validation**: Zod schemas for API request validation
- ✅ **Authentication Required**: All endpoints require authentication
- ✅ **XSS Protection**: React auto-escaping and input sanitization

---

## Database Schema

### Migration: `006_shipment_procurement_integration.sql`

#### Extended `shipments` Table

New columns added to existing table:
```sql
-- Procurement Integration
procurement_request_id UUID REFERENCES procurement_requests(id)
shipment_number TEXT UNIQUE
batch_number TEXT
carrier TEXT

-- Activity Tracking
initial_activity NUMERIC
current_activity NUMERIC
expected_activity_at_arrival NUMERIC

-- Route & Delivery
route_waypoints JSONB
estimated_delivery_time TEXT
special_handling_instructions TEXT
temperature_requirements TEXT
created_by UUID REFERENCES auth.users(id)
```

#### Indexes
- `idx_shipments_procurement_request_id` - Fast lookup of shipments by procurement request
- `idx_shipments_shipment_number` - Unique shipment number index
- `idx_shipments_created_by` - User's shipments
- `idx_shipments_status` - Status filtering

#### Functions

**`generate_shipment_number()`**
- Generates sequential shipment numbers (SH-2851, SH-2852, etc.)
- Starts from SH-2851 if no shipments exist
- Thread-safe incrementation

#### RLS Policies
1. **Users can view all shipments** - All authenticated users can SELECT
2. **Users can create shipments** - All authenticated users can INSERT
3. **Users can update their own shipments** - Users can UPDATE where `created_by = auth.uid()`

#### Seed Data
8 sample shipments with various statuses:
- SH-2851: In Transit (linked to PR-2847)
- SH-2852: Delivered (linked to PR-2846)
- SH-2853: At Customs (independent)
- SH-2854: Dispatched (linked to PR-2843)
- SH-2855: Pending
- SH-2856: In Transit (linked to PR-2841)
- SH-2857: Delivered
- SH-2858: At Customs

---

## API Endpoints

### 1. `POST /api/shipments`
Create a new shipment manually.

**Request Body:**
```typescript
{
  batch_number: string;
  isotope: string;
  origin: string;
  destination: string;
  carrier: string;
  status: ShipmentStatus;
  procurement_request_id?: string;
  initial_activity?: number;
  route_waypoints?: RouteWaypoint[];
  estimated_delivery_time?: string;
  special_handling_instructions?: string;
  temperature_requirements?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: Shipment;
}
```

### 2. `GET /api/shipments`
List all shipments with optional filters.

**Query Parameters:**
- `status` - Filter by shipment status
- `isotope` - Filter by isotope type
- `origin` - Filter by origin location
- `destination` - Filter by destination
- `procurement_request_id` - Filter by linked procurement
- `start_date` - Filter by creation date (from)
- `end_date` - Filter by creation date (to)
- `from_procurement` - Boolean filter (true/false)
- `page` - Page number (default: 1)
- `per_page` - Results per page (default: 30, max: 100)

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: Shipment[];
  count: number;
}
```

### 3. `GET /api/shipments/[id]`
Fetch a single shipment by ID with full details.

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: Shipment & {
    procurement_requests?: ProcurementRequest;
  };
}
```

### 4. `POST /api/shipments/from-procurement`
Create a shipment from an existing procurement request.

**Request Body:**
```typescript
{
  procurement_request_id: string;
  carrier: string;
  estimated_delivery_time?: string;
  temperature_requirements?: string;
}
```

**Validation:**
- Procurement request must exist
- Status must be "PO Approved" or "Completed"
- Origin and destination must be set
- No existing shipment for this procurement

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: Shipment;
}
```

### 5. `GET /api/procurement/[id]/shipment`
Fetch shipment linked to a procurement request.

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data: Shipment | null;
}
```

---

## Frontend Components

### 1. `CreateShipmentDialog`
**Location:** `components/shipments/CreateShipmentDialog.tsx`

**Features:**
- Two-tab interface (Manual Entry / From Procurement)
- Form validation with React Hook Form
- Real-time procurement data fetching
- Loading states and error handling
- Mobile responsive (full screen on mobile)

**Props:**
```typescript
interface CreateShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}
```

**Manual Entry Tab:**
- Isotope (required)
- Batch Number (required)
- Origin (required)
- Destination (required)
- Carrier (required)
- Status (dropdown)
- Initial Activity (optional)
- Estimated Delivery Time (optional)
- Temperature Requirements (textarea)
- Special Handling Instructions (textarea)

**From Procurement Tab:**
- Procurement Request selector (filtered by status)
- Auto-populated: isotope, quantity, origin, destination
- Carrier (required)
- Estimated Delivery Time (optional)
- Temperature Requirements (optional)

### 2. `RouteDisplayMap`
**Location:** `components/shipments/RouteDisplayMap.tsx`

**Features:**
- Leaflet-based static map
- Waypoint markers with status colors (green=completed, blue=current, gray=upcoming)
- Route polyline connecting waypoints
- Interactive popups with waypoint details
- Auto-fit bounds to show entire route
- Legend showing waypoint status
- Responsive sizing
- Fallback for missing coordinates

**Props:**
```typescript
interface RouteDisplayMapProps {
  waypoints: RouteWaypoint[];
  className?: string;
  height?: string;
}
```

### 3. `ShipmentRouteCard`
**Location:** `components/shipments/ShipmentRouteCard.tsx`

**Features:**
- Compact route summary
- Origin → Destination display
- Progress bar based on waypoint completion
- Waypoint timeline with status indicators
- ETA and delivery time information
- Activity decay display (initial, current, expected)
- "View Map" button opens full map dialog
- Mobile responsive

**Props:**
```typescript
interface ShipmentRouteCardProps {
  origin: string;
  destination: string;
  waypoints?: RouteWaypoint[];
  eta?: string;
  estimatedDeliveryTime?: string;
  currentActivity?: number;
  initialActivity?: number;
  expectedActivityAtArrival?: number;
  isotope?: string;
  className?: string;
}
```

### 4. `ProcurementShipmentLink`
**Location:** `components/procurement/ProcurementShipmentLink.tsx`

**Features:**
- Shows shipment link for procurement requests
- "Create Shipment" button for eligible requests (PO Approved/Completed)
- Link to shipment details if exists
- Status badge display
- Auto-refresh on creation

**Props:**
```typescript
interface ProcurementShipmentLinkProps {
  procurementRequestId: string;
  procurementStatus: string;
  onShipmentCreated?: () => void;
  className?: string;
}
```

---

## Service Layer

### Shipment Service
**Location:** `services/shipment.service.ts`

**Functions:**

```typescript
// Create shipment manually
createShipment(data: CreateShipmentRequest): Promise<Shipment>

// Create from procurement
createShipmentFromProcurement(data: ShipmentFromProcurement): Promise<Shipment>

// Fetch all shipments with filters
fetchShipments(filters?: ShipmentFilter): Promise<Shipment[]>

// Fetch single shipment
fetchShipmentById(id: string): Promise<Shipment | null>

// Fetch by procurement ID
fetchShipmentByProcurementId(procurementId: string): Promise<Shipment | null>

// Calculate current activity
calculateShipmentCurrentActivity(initialActivity: number, isotope: string, createdAt: string): number

// Generate route waypoints
generateShipmentRoute(origin: string, destination: string, includeIntermediate: boolean): Promise<RouteWaypoint[]>

// Utility functions
formatShipmentETA(eta: string): string
calculateShipmentProgress(waypoints?: RouteWaypoint[]): number
getCurrentWaypoint(waypoints?: RouteWaypoint[]): RouteWaypoint | null
validateShipmentData(data: Partial<CreateShipmentRequest>): string[]
isShipmentUrgent(eta: string): boolean
isShipmentDelayed(eta: string, status: string): boolean
```

---

## Utilities

### Isotope Decay Library
**Location:** `lib/isotope-decay.ts`

**Key Constants:**
```typescript
ISOTOPE_HALF_LIVES: Record<string, number> = {
  'Tc-99m': 6.0,     // hours
  'I-131': 192.0,     // 8 days
  'F-18': 1.83,       // 110 minutes
  'Lu-177': 161.5,    // 6.73 days
  'I-123': 13.2,
  'Ga-68': 1.13,
  'Y-90': 64.0,
  'Sm-153': 46.5,
  'Ra-223': 274,      // 11.43 days
  'In-111': 67,       // 2.8 days
}
```

**Key Functions:**
```typescript
// Core decay calculation: A(t) = A₀ × (1/2)^(t/t½)
calculateDecay(initialActivity: number, halfLife: number, elapsedTime: number): number

// Calculate current activity for isotope
calculateCurrentActivity(initialActivity: number, isotope: string, elapsedHours: number): number

// Calculate expected activity at arrival
calculateActivityAtArrival(initialActivity: number, isotope: string, deliveryTimeStr: string): number

// Time utilities
parseDeliveryTime(deliveryTimeStr: string): number
calculateElapsedHours(startTime: string | Date, endTime?: string | Date): number

// Percentage calculations
calculateDecayPercentage(initialActivity: number, currentActivity: number): number
calculateRemainingPercentage(initialActivity: number, currentActivity: number): number

// Display utilities
getFormattedHalfLife(isotope: string): string
estimateTimeToThreshold(initialActivity: number, isotope: string, thresholdActivity: number): number
```

### Route Utilities
**Location:** `lib/route-utils.ts`

**Key Functions:**
```typescript
// Geocoding
geocodeAddress(address: string): Promise<[number, number] | null>

// Distance calculation (Haversine formula)
calculateDistance(coord1: [number, number], coord2: [number, number]): number

// Waypoint generation
generateIntermediateWaypoints(origin: [number, number], destination: [number, number], count: number): [number, number][]
generateRouteWaypoints(origin: string, destination: string, includeIntermediate: boolean): Promise<RouteWaypoint[]>

// Display utilities
formatCoordinates(coordinates: [number, number]): string
calculateBounds(coordinates: [number, number][]): [[number, number], [number, number]] | null
estimateTravelTime(distanceKm: number): number

// City database
addKnownCoordinates(city: string, coordinates: [number, number]): void
getKnownCities(): string[]
```

**Known Cities (Fallback):**
30+ major African cities with pre-configured coordinates including:
- South Africa: Johannesburg, Cape Town, Pretoria, Durban, Port Elizabeth, Bloemfontein
- Kenya: Nairobi, Mombasa, Kisumu
- Nigeria: Lagos, Abuja, Kano
- Ghana: Accra, Kumasi
- And more...

---

## Testing

### Test Coverage

#### 1. Isotope Decay Tests
**File:** `__tests__/isotope-decay.test.ts`

**Coverage:**
- ✅ Decay calculations (25 tests)
- ✅ Half-life data validation
- ✅ Time parsing
- ✅ Percentage calculations
- ✅ Formatting functions

#### 2. Route Utils Tests
**File:** `__tests__/route-utils.test.ts`

**Coverage:**
- ✅ Distance calculations (22 tests)
- ✅ Waypoint generation
- ✅ Coordinate formatting
- ✅ Bounds calculation
- ✅ City database management

#### 3. Shipment Service Tests
**File:** `__tests__/shipment-service.test.ts`

**Coverage:**
- ✅ Data validation (22 tests)
- ✅ Progress calculation
- ✅ Waypoint utilities
- ✅ Status checks (urgent, delayed)
- ✅ ETA formatting

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test __tests__/isotope-decay.test.ts

# Run with watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

**Test Results:**
- ✅ 69/69 tests passing
- ✅ All utility functions covered
- ✅ Edge cases handled

---

## Usage Guide

### Creating a Shipment Manually

1. Navigate to **Dashboard → Shipments**
2. Click **"+ Create Shipment"** button
3. Select **"Manual Entry"** tab
4. Fill in required fields:
   - Isotope (dropdown)
   - Batch Number
   - Origin
   - Destination
   - Carrier
   - Status
5. Optionally add:
   - Initial Activity
   - Delivery Time Estimate
   - Temperature Requirements
   - Special Handling Instructions
6. Click **"Create Shipment"**

### Creating a Shipment from Procurement

1. **From Procurement Page:**
   - Find a procurement request with status "PO Approved" or "Completed"
   - Click **"Create Shipment"** button in the Shipment column
   
2. **From Shipment Creation Dialog:**
   - Navigate to **Dashboard → Shipments**
   - Click **"+ Create Shipment"**
   - Select **"From Procurement"** tab
   - Choose a procurement request from dropdown
   - Enter carrier information
   - Optionally add delivery time and temperature requirements
   - Click **"Create Shipment"**

### Viewing Shipment Details

1. Navigate to **Dashboard → Shipments**
2. Click on any shipment row or **"View Details"** button
3. View comprehensive information:
   - Shipment header (number, isotope, batch, status)
   - Route card with map visualization
   - Activity decay information
   - Waypoint timeline
   - Handling requirements
   - Linked procurement details (if applicable)

### Filtering Shipments

Use the filter controls at the top of the Shipments page:

- **Status**: Filter by shipment status
- **Isotope**: Filter by isotope type
- **From Procurement**: Show only shipments linked to procurement requests
- **Search**: Search by shipment number, isotope, batch, origin, or destination

### Tracking Shipment Progress

1. Open shipment details
2. View the **Route Card** showing:
   - Progress bar (percentage completed)
   - Current location/waypoint
   - List of all waypoints with completion status
3. Click **"View Map"** to see full route visualization
4. Monitor **Activity Levels**:
   - Initial Activity (at shipment origin)
   - Current Activity (real-time calculation)
   - Expected at Arrival

---

## Mobile Support

All components are fully responsive:

### Mobile Optimizations
- ✅ **Tables → Cards**: List views convert to card format on mobile
- ✅ **Touch Targets**: Minimum 44x44px for all interactive elements
- ✅ **Full Screen Dialogs**: Creation and detail dialogs go full screen
- ✅ **Responsive Maps**: Map height adjusts for mobile screens
- ✅ **Stack Layout**: Forms and information stack vertically
- ✅ **Touch-Friendly Controls**: Large buttons and inputs

---

## Data Flow

### Shipment Creation Flow

```
User Action
    ↓
CreateShipmentDialog (Validation)
    ↓
Service Layer (shipment.service.ts)
    ↓
API Route (/api/shipments or /api/shipments/from-procurement)
    ↓
Database Function (generate_shipment_number)
    ↓
Supabase Insert
    ↓
RLS Policy Check
    ↓
Return Shipment Data
    ↓
Update UI + Toast Notification
```

### Activity Decay Calculation

```
Shipment Created (initial_activity set)
    ↓
calculateElapsedHours(created_at)
    ↓
ISOTOPE_HALF_LIVES[isotope]
    ↓
calculateDecay(initial, halfLife, elapsed)
    ↓
current_activity = initial × (1/2)^(elapsed/halfLife)
    ↓
Display in UI (updates on page load/refresh)
```

---

## Security Considerations

### Authentication & Authorization
- ✅ All API endpoints require authentication
- ✅ Users can only update their own shipments
- ✅ RLS policies enforce data access rules

### Input Validation
- ✅ Zod schemas validate all API inputs
- ✅ SQL injection prevented (parameterized queries)
- ✅ XSS prevented (React auto-escaping)

### Data Integrity
- ✅ Foreign key constraints (procurement_request_id → procurement_requests)
- ✅ Unique constraints (shipment_number)
- ✅ Check constraints (status values)
- ✅ Not null constraints on required fields

---

## Performance Optimizations

### Database
- ✅ Indexes on frequently queried columns
- ✅ JSONB for flexible waypoint storage
- ✅ Computed columns for total costs
- ✅ Efficient query patterns (joins, pagination)

### Frontend
- ✅ Lazy loading of map components
- ✅ Memoization of expensive calculations
- ✅ Debounced search inputs
- ✅ Pagination for large datasets
- ✅ Client-side caching

### API
- ✅ Batch queries where possible
- ✅ Select only needed fields
- ✅ Pagination support
- ✅ Filtered queries

---

## Future Enhancements

Potential additions (out of scope for this implementation):

1. **Real-time GPS Tracking**: Live location updates via GPS devices
2. **Push Notifications**: Alert users of shipment status changes
3. **Document Attachments**: Upload/download shipping documents
4. **Temperature Monitoring**: Integration with temperature sensors
5. **Multi-leg Routes**: Support for complex routes with multiple stops
6. **Shipment History**: Detailed audit log of all changes
7. **Bulk Operations**: Create multiple shipments at once
8. **Export Functionality**: Export shipment data to PDF/Excel
9. **Advanced Reporting**: Analytics and insights on shipping performance
10. **Email Notifications**: Automated emails for status updates

---

## Troubleshooting

### Common Issues

**1. Map not displaying**
- Ensure Leaflet CSS is imported
- Check that waypoints have valid coordinates
- Verify network access to tile server (OpenStreetMap)

**2. Shipment creation fails**
- Verify all required fields are filled
- Check procurement request status (must be PO Approved or Completed)
- Ensure no duplicate shipment for procurement request
- Verify origin and destination are set

**3. Activity calculations incorrect**
- Verify isotope name matches ISOTOPE_HALF_LIVES keys
- Check created_at timestamp is valid
- Ensure initial_activity is positive number

**4. Geocoding not working**
- Check city name is in known coordinates list
- Verify network access to Nominatim API
- Use full address format: "City, Country"

---

## Support

For issues or questions:
1. Check this documentation
2. Review test files for usage examples
3. Inspect browser console for errors
4. Check API response messages

---

**Version:** 1.0.0  
**Last Updated:** January 16, 2026  
**Author:** Nuclear Supply Chain Development Team
