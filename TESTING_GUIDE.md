# Settings Page - Testing Guide

## Overview
This guide helps you test the comprehensive settings page implementation.

## Prerequisites
1. Supabase project set up with proper credentials
2. Run the database migration: `migrations/add_settings_fields.sql`
3. Application running locally or deployed

## Testing Steps

### 1. Navigation
- [ ] Login to the application
- [ ] Navigate to `/dashboard/settings`
- [ ] Verify all 5 tabs are visible: Profile, Account, Preferences, Security, Notifications

### 2. Profile Settings
- [ ] Change your name and verify it updates
- [ ] Add/update phone number
- [ ] Add/update job title
- [ ] Add/update department
- [ ] Try uploading a profile picture (preview should show)
- [ ] Verify email and role fields are read-only
- [ ] Click "Save Changes" and verify success toast appears

### 3. Account Settings
- [ ] **Password Change:**
  - [ ] Try changing password without entering current password (should show error)
  - [ ] Try entering a weak password < 8 characters (should show error)
  - [ ] Try mismatched passwords (should show error)
  - [ ] Successfully change password with valid inputs
  - [ ] Verify success toast appears

- [ ] **Two-Factor Authentication:**
  - [ ] Toggle 2FA on/off
  - [ ] Verify status updates in UI

- [ ] **Email Notifications:**
  - [ ] Toggle email notifications on/off
  - [ ] Verify changes persist after save

- [ ] **Account Deletion:**
  - [ ] Click "Delete Account" button
  - [ ] Verify confirmation dialog appears
  - [ ] Test cancel functionality
  - [ ] (Optional) Test actual deletion if in dev environment

### 4. Application Preferences
- [ ] **Theme Selection:**
  - [ ] Select Light theme and verify UI updates
  - [ ] Select Dark theme and verify UI updates
  - [ ] Select System theme and verify it follows system preference

- [ ] **Timezone:**
  - [ ] Open timezone dropdown
  - [ ] Select different timezone
  - [ ] Verify selection persists

- [ ] **Date Format:**
  - [ ] Open date format dropdown
  - [ ] Try each format option
  - [ ] Verify selection persists

- [ ] **Notification Channels:**
  - [ ] Toggle each notification type (Email, Push, In-App)
  - [ ] Verify toggles work independently
  - [ ] Save and verify persistence

### 5. Security & Privacy
- [ ] **Active Sessions:**
  - [ ] Verify current session is shown
  - [ ] Check device and browser info is displayed
  - [ ] If multiple sessions exist, try "Sign Out Other Devices"

- [ ] **Login History:**
  - [ ] Verify recent login attempts are shown
  - [ ] Check timestamps are correct
  - [ ] Verify location/IP data (if available)

- [ ] **Privacy Settings:**
  - [ ] Toggle profile visibility
  - [ ] Toggle activity status
  - [ ] Toggle analytics

- [ ] **Data Export:**
  - [ ] Click "Export Data" button
  - [ ] Verify success message appears

### 6. Notifications Configuration
- [ ] **Shipment Alerts:**
  - [ ] Select "All Shipments" option
  - [ ] Select "Critical Only" option
  - [ ] Select "None" option
  - [ ] Verify selection persists

- [ ] **Compliance Reminders:**
  - [ ] Toggle compliance reminders on/off

- [ ] **Email Digests:**
  - [ ] Toggle daily digest on/off
  - [ ] Toggle weekly digest on/off

- [ ] **Push Notifications:**
  - [ ] Toggle push notifications
  - [ ] Verify blue info banner appears when enabled

### 7. Save Functionality
- [ ] Make a change in any tab
- [ ] Verify "Save Changes" button becomes enabled
- [ ] Navigate to another tab without saving
- [ ] Return to original tab - verify changes are still pending
- [ ] Click "Save Changes"
- [ ] Verify success toast appears
- [ ] Verify "Save Changes" button becomes disabled
- [ ] Refresh page and verify changes persisted

### 8. Mobile Responsiveness
- [ ] Test on mobile viewport (< 640px)
  - [ ] Verify sidebar collapses to grid
  - [ ] Verify content is readable and scrollable
  - [ ] Verify mobile save button appears at bottom
  - [ ] Test all form inputs are usable on mobile

- [ ] Test on tablet viewport (640px - 1024px)
  - [ ] Verify responsive grid adjusts appropriately
  - [ ] Verify all content is accessible

### 9. Error Handling
- [ ] Try saving with invalid data (if applicable)
- [ ] Verify error messages appear
- [ ] Try operations while offline
- [ ] Verify appropriate error toasts appear

### 10. Performance
- [ ] Check initial page load time
- [ ] Verify no console errors
- [ ] Verify smooth transitions between tabs
- [ ] Check network requests are optimized

## Expected Results

All tests should pass with:
- ✅ Changes persist after save
- ✅ Validation errors display correctly
- ✅ Toast notifications appear for all actions
- ✅ Mobile layout is functional
- ✅ No console errors
- ✅ Clean and professional UI matching dashboard design

## Common Issues

### Issue: "Failed to fetch profile"
**Solution:** Ensure Supabase credentials are set and database migration has been run.

### Issue: "Unauthorized" errors
**Solution:** Verify user is logged in and session is valid.

### Issue: Profile picture preview not working
**Solution:** This is expected - actual upload to storage needs to be implemented based on your Supabase storage setup.

### Issue: Changes not persisting
**Solution:** Check API routes are accessible and database has proper RLS policies.

## Notes for Developers

- Password change uses Supabase Auth's `updateUser()` method
- Profile updates hit the `/api/settings/profile` endpoint
- Preferences hit the `/api/settings/preferences` endpoint
- All changes are accumulated and saved together (except password)
- Mock data is used for sessions and login history - replace with actual API calls

## Next Steps

After testing, consider implementing:
1. Actual avatar upload to Supabase Storage
2. Real session management with actual session tracking
3. Real login history tracking with middleware
4. Actual 2FA implementation with OTP
5. Real data export with all user data
6. Email verification for email changes
