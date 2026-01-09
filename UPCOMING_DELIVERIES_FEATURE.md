# Dynamic Upcoming Deliveries Feature

## Overview
This feature implements dynamic, real-time tracking of upcoming deliveries in the Nuclear Supply Chain dashboard.

## Features Implemented

### 1. Dynamic Date Display
- **Today's deliveries**: Show as "Today, HH:MM"
- **Tomorrow's deliveries**: Show as "Tomorrow, HH:MM"
- **Other days**: Show as "DayName, HH:MM" (e.g., "Friday, 16:45")

### 2. Real-time Updates
- Automatically checks every minute (60 seconds) for delivery status changes
- Moves completed deliveries from "Upcoming Deliveries" to "Recent Activity"
- Updates relative time displays ("5 minutes ago", "2 hours ago", etc.)

### 3. Database Integration
- Pulls delivery data from Supabase `deliveries` table
- Filters deliveries based on current date/time
- Only shows deliveries scheduled for today and the next 3 days

### 4. Smart Delivery Status
- Automatically detects when a delivery time has passed
- Marks past deliveries as "completed"
- Removes them from the upcoming list

## Files Modified/Created

### New Files
1. **`lib/dateUtils.ts`** - Date/time utility functions
   - `formatDeliveryDateTime()` - Format dates for display
   - `isDeliveryPast()` - Check if delivery has passed
   - `combineDateAndTime()` - Merge date and time values
   - `getUpcomingDates()` - Generate date ranges
   - `formatRelativeTime()` - Format times like "2 hours ago"

2. **`components/shared/UpcomingDeliveries.tsx`** - Client component
   - Displays upcoming deliveries
   - Real-time updates via setInterval
   - Handles empty state gracefully

3. **`components/shared/RecentActivity.tsx`** - Client component
   - Shows recent activities including completed deliveries
   - Updates relative time displays
   - Integrates with completed deliveries

4. **`components/shared/DashboardDeliveryManager.tsx`** - Coordinator component
   - Manages state between upcoming and completed deliveries
   - (Optional, for future enhancements)

### Modified Files
1. **`lib/api.ts`**
   - Updated `getUpcomingDeliveries()` to filter by current time
   - Added `getCompletedDeliveries()` for recent activity

2. **`models/dashboard.model.ts`**
   - Extended `Delivery` interface with status and scheduled_datetime fields

3. **`app/dashboard/page.tsx`**
   - Integrated new client components
   - Passes initial data from server

4. **`seed.sql`**
   - Updated with more realistic test data
   - Uses `CURRENT_DATE` for dynamic dates

## Usage

### Server-side (Dashboard Page)
```typescript
const upcomingDeliveries = await getUpcomingDeliveries(4)
const completedDeliveries = await getCompletedDeliveries(24)

<UpcomingDeliveries initialDeliveries={upcomingDeliveries} />
<RecentActivity 
  initialActivities={recentActivity}
  completedDeliveries={completedDeliveries}
/>
```

### Date Formatting
```typescript
import { formatDeliveryDateTime } from '@/lib/dateUtils'

// Example (assuming today is 2026-01-08 for illustration purposes):

// Today's delivery at 14:30
formatDeliveryDateTime('2026-01-08', '14:30') // "Today, 14:30"

// Tomorrow's delivery at 09:00
formatDeliveryDateTime('2026-01-09', '09:00') // "Tomorrow, 09:00"

// Future delivery (day after tomorrow would be Friday)
formatDeliveryDateTime('2026-01-10', '16:45') // "Friday, 16:45"

// Note: Dates are dynamic and relative to the current date when the function is called
```

### Checking Past Deliveries
```typescript
import { isDeliveryPast } from '@/lib/dateUtils'

// Check if delivery time has passed
if (isDeliveryPast(delivery.date, delivery.time)) {
  // Move to completed
}
```

## Database Schema

The feature uses the `deliveries` table:
```sql
CREATE TABLE public.deliveries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  time TIME NOT NULL,
  isotope TEXT NOT NULL,
  destination TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Configuration

### Update Frequency
The components check for updates every 60 seconds. To change this:

```typescript
// In UpcomingDeliveries.tsx or RecentActivity.tsx
const interval = setInterval(() => {
  // ...
}, 60000) // Change this value (in milliseconds)
```

### Number of Deliveries Displayed
```typescript
// In dashboard page
const upcomingDeliveries = await getUpcomingDeliveries(4) // Change the number
```

### Completed Deliveries Timeframe
```typescript
// In dashboard page
const completedDeliveries = await getCompletedDeliveries(24) // Hours to look back
```

## Testing

Run the date utilities test:
```bash
npx tsx __tests__/dateUtils.test.ts
```

Expected output:
```
=== Testing Date Utilities ===

1. Testing formatDeliveryDateTime:
   Today at 14:30: Today, 14:30
   Tomorrow at 09:00: Tomorrow, 09:00
   Day after at 16:45: Saturday, 16:45
   
✓ All tests completed!
```

## Future Enhancements

1. **Push Notifications**: Alert users when deliveries are completed
2. **Delivery Details Modal**: Click on a delivery to see full details
3. **Manual Status Override**: Allow users to manually mark deliveries as completed
4. **Delivery Filtering**: Filter by isotope type or destination
5. **Historical View**: View all past deliveries
6. **Real-time Database Sync**: Use Supabase real-time subscriptions instead of polling

## Performance Considerations

- Components use React's `useEffect` for cleanup of intervals
- Updates only occur every minute to minimize re-renders
- Server-side filtering reduces data transfer
- Client-side filtering for real-time status changes

## Browser Compatibility

Works in all modern browsers that support:
- JavaScript Date objects
- setInterval/clearInterval
- React 19+ hooks (useState, useEffect)
