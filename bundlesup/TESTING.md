# BundlesUp Testing Guide

This document outlines the testing procedures for the BundlesUp Shopify app.

## Testing Checklist

### 1. Authentication & OAuth Flow

#### Test 1.1: Initial Installation
- [ ] Navigate to app installation URL
- [ ] Verify redirect to Shopify OAuth page
- [ ] Approve permissions
- [ ] Verify redirect back to app
- [ ] Check user is created in Base44
- [ ] Check shop is created in Base44
- [ ] Verify auth token is set

**Expected Result**: User lands on onboarding page

#### Test 1.2: OAuth Loop Prevention
- [ ] Install app
- [ ] Refresh page multiple times
- [ ] Verify no infinite redirect loop
- [ ] Check max 2 redirect attempts

**Expected Result**: Error message after 2 failed attempts

#### Test 1.3: Token Persistence
- [ ] Install app
- [ ] Close browser
- [ ] Reopen and navigate to app
- [ ] Verify user stays logged in

**Expected Result**: User goes directly to dashboard

### 2. Onboarding Flow

#### Test 2.1: Onboarding Display
- [ ] Complete OAuth
- [ ] Verify onboarding page displays
- [ ] Check all features listed
- [ ] Verify pricing information ($12.99/month, 14-day trial)

**Expected Result**: Onboarding page shows correctly

#### Test 2.2: Trial Activation
- [ ] Click "Start Free Trial"
- [ ] Verify redirect to Shopify billing
- [ ] Approve subscription
- [ ] Verify redirect back to app
- [ ] Check `has_completed_onboarding` is true

**Expected Result**: User lands on dashboard

#### Test 2.3: Skip Onboarding (Dev Mode)
- [ ] Complete OAuth
- [ ] On onboarding page, manually set `has_completed_onboarding: true`
- [ ] Refresh page

**Expected Result**: User goes to dashboard

### 3. Dashboard

#### Test 3.1: Dashboard Display
- [ ] Navigate to dashboard
- [ ] Verify 4 stat cards display
- [ ] Check recent bundles section
- [ ] Verify quick actions widget

**Expected Result**: Dashboard loads with all sections

#### Test 3.2: Empty State
- [ ] Fresh installation with no bundles
- [ ] Navigate to dashboard
- [ ] Verify empty state message
- [ ] Check "Create Bundle" button

**Expected Result**: Empty state displays correctly

#### Test 3.3: Stats Calculation
- [ ] Create 3 bundles (2 active, 1 draft)
- [ ] Add mock sales data
- [ ] Navigate to dashboard
- [ ] Verify stats are calculated correctly

**Expected Result**: Stats show correct numbers

### 4. Products

#### Test 4.1: Product Sync
- [ ] Navigate to Products page
- [ ] Click "Sync from Shopify"
- [ ] Verify loading state
- [ ] Check products are imported
- [ ] Verify product data (name, price, image, inventory)

**Expected Result**: Products sync successfully

#### Test 4.2: Product Search
- [ ] Sync products
- [ ] Enter search query
- [ ] Verify filtered results
- [ ] Clear search
- [ ] Verify all products show

**Expected Result**: Search works correctly

#### Test 4.3: Empty State
- [ ] Fresh installation
- [ ] Navigate to Products page
- [ ] Verify empty state message
- [ ] Check "Sync from Shopify" button

**Expected Result**: Empty state displays

### 5. Bundle Creation

#### Test 5.1: Create Fixed Bundle
- [ ] Navigate to Bundles page
- [ ] Click "Create Bundle"
- [ ] Fill in bundle details:
  - Name: "Summer Bundle"
  - Type: Fixed Bundle
  - Pricing: 20% discount
- [ ] Add 3 products
- [ ] Set quantities
- [ ] Save bundle

**Expected Result**: Bundle created successfully

#### Test 5.2: Create Mix & Match Bundle
- [ ] Create new bundle
- [ ] Select "Mix & Match" type
- [ ] Set min items: 2
- [ ] Set max items: 5
- [ ] Add 5 products
- [ ] Save bundle

**Expected Result**: Mix & Match bundle created

#### Test 5.3: Validation
- [ ] Try to create bundle without name
- [ ] Try to create bundle without products
- [ ] Try to save with invalid discount value

**Expected Result**: Validation errors display

#### Test 5.4: Product Selection
- [ ] Open create modal
- [ ] Go to step 2
- [ ] Add product
- [ ] Verify product appears in selected list
- [ ] Update quantity
- [ ] Remove product
- [ ] Verify product removed

**Expected Result**: Product selection works correctly

### 6. Bundle Management

#### Test 6.1: Bundle List
- [ ] Create 5 bundles
- [ ] Navigate to Bundles page
- [ ] Verify all bundles display
- [ ] Check bundle cards show correct info

**Expected Result**: All bundles listed

#### Test 6.2: Bundle Filters
- [ ] Create bundles with different statuses
- [ ] Click "Active" filter
- [ ] Verify only active bundles show
- [ ] Click "Draft" filter
- [ ] Verify only draft bundles show

**Expected Result**: Filters work correctly

#### Test 6.3: Bundle Search
- [ ] Create bundles with different names
- [ ] Enter search query
- [ ] Verify filtered results
- [ ] Clear search

**Expected Result**: Search works

#### Test 6.4: Edit Bundle
- [ ] Click edit on a bundle
- [ ] Modify name
- [ ] Add/remove products
- [ ] Change discount
- [ ] Save changes
- [ ] Verify updates applied

**Expected Result**: Bundle updated successfully

#### Test 6.5: Duplicate Bundle
- [ ] Click duplicate on a bundle
- [ ] Verify new bundle created
- [ ] Check name has "(Copy)" suffix
- [ ] Verify status is "draft"

**Expected Result**: Bundle duplicated

#### Test 6.6: Toggle Status
- [ ] Click pause on active bundle
- [ ] Verify status changes to "paused"
- [ ] Click activate
- [ ] Verify status changes to "active"

**Expected Result**: Status toggles correctly

#### Test 6.7: Delete Bundle
- [ ] Click delete on a bundle
- [ ] Confirm deletion
- [ ] Verify bundle removed from list

**Expected Result**: Bundle deleted

### 7. Analytics

#### Test 7.1: Analytics Display
- [ ] Navigate to Analytics page
- [ ] Verify 4 stat cards
- [ ] Check revenue by bundle chart
- [ ] Check revenue by type chart
- [ ] Verify top performing bundles table

**Expected Result**: All analytics sections display

#### Test 7.2: Empty State
- [ ] Fresh installation
- [ ] Navigate to Analytics
- [ ] Verify empty state messages

**Expected Result**: Empty states display

#### Test 7.3: Chart Rendering
- [ ] Create bundles with sales data
- [ ] Navigate to Analytics
- [ ] Verify bar chart renders
- [ ] Verify pie chart renders
- [ ] Check tooltips work

**Expected Result**: Charts render correctly

### 8. Settings

#### Test 8.1: Settings Display
- [ ] Navigate to Settings page
- [ ] Verify all sections display
- [ ] Check store configuration
- [ ] Check notification preferences
- [ ] Check display settings

**Expected Result**: Settings page loads

#### Test 8.2: Toggle Settings
- [ ] Toggle notification switches
- [ ] Toggle display switches
- [ ] Change default layout
- [ ] Click "Save Settings"
- [ ] Verify success message

**Expected Result**: Settings saved

### 9. Responsive Design

#### Test 9.1: Mobile View
- [ ] Open app on mobile device
- [ ] Navigate through all pages
- [ ] Verify layout adapts
- [ ] Check touch interactions work

**Expected Result**: App works on mobile

#### Test 9.2: Tablet View
- [ ] Open app on tablet
- [ ] Navigate through all pages
- [ ] Verify layout adapts

**Expected Result**: App works on tablet

#### Test 9.3: Desktop View
- [ ] Open app on desktop
- [ ] Verify sidebar displays
- [ ] Check all features accessible

**Expected Result**: App works on desktop

### 10. Error Handling

#### Test 10.1: Network Errors
- [ ] Disconnect internet
- [ ] Try to create bundle
- [ ] Verify error message
- [ ] Reconnect internet
- [ ] Retry operation

**Expected Result**: Error handled gracefully

#### Test 10.2: API Errors
- [ ] Simulate 500 error from API
- [ ] Verify error message displays
- [ ] Check user can retry

**Expected Result**: API errors handled

#### Test 10.3: Validation Errors
- [ ] Submit forms with invalid data
- [ ] Verify validation messages
- [ ] Correct errors
- [ ] Verify submission works

**Expected Result**: Validation works

### 11. Performance

#### Test 11.1: Page Load Time
- [ ] Measure initial page load
- [ ] Verify < 3 seconds
- [ ] Check bundle list load time
- [ ] Verify < 2 seconds

**Expected Result**: Pages load quickly

#### Test 11.2: Large Data Sets
- [ ] Create 100 bundles
- [ ] Navigate to Bundles page
- [ ] Verify page loads
- [ ] Test search and filters

**Expected Result**: Handles large data sets

### 12. Security

#### Test 12.1: HMAC Verification
- [ ] Send webhook with invalid HMAC
- [ ] Verify request rejected

**Expected Result**: Invalid webhooks rejected

#### Test 12.2: Authentication
- [ ] Try to access app without token
- [ ] Verify redirect to OAuth

**Expected Result**: Unauthenticated access blocked

#### Test 12.3: Authorization
- [ ] Try to access another shop's data
- [ ] Verify access denied

**Expected Result**: Cross-shop access blocked

### 13. Webhooks

#### Test 13.1: Order Creation
- [ ] Create order with bundle items
- [ ] Verify webhook received
- [ ] Check BundleOrder created
- [ ] Verify analytics updated
- [ ] Check bundle stats updated

**Expected Result**: Order tracked correctly

#### Test 13.2: Webhook Retry
- [ ] Simulate webhook failure
- [ ] Verify Shopify retries
- [ ] Check eventual success

**Expected Result**: Webhooks retry on failure

### 14. Integration Tests

#### Test 14.1: End-to-End Flow
- [ ] Install app
- [ ] Complete onboarding
- [ ] Sync products
- [ ] Create bundle
- [ ] Activate bundle
- [ ] Create test order
- [ ] Verify analytics update

**Expected Result**: Complete flow works

#### Test 14.2: Multi-Store
- [ ] Install on Store A
- [ ] Create bundles
- [ ] Install on Store B
- [ ] Verify Store A data not visible
- [ ] Create bundles in Store B
- [ ] Verify isolation

**Expected Result**: Data isolated per store

## Automated Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

## Bug Reporting

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots/videos
5. Browser/device info
6. Error messages
7. Console logs

## Test Data

### Sample Products
- Product A: $10.00
- Product B: $15.00
- Product C: $20.00
- Product D: $25.00
- Product E: $30.00

### Sample Bundles
1. **Summer Bundle**: Products A+B+C, 20% off
2. **Winter Bundle**: Products D+E, $10 off
3. **Mix & Match**: Choose 3 from A,B,C,D,E, 15% off

## Performance Benchmarks

- Initial load: < 3s
- Bundle list: < 2s
- Create bundle: < 1s
- Product sync: < 5s
- Analytics load: < 2s

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Alt text on images

---

**Last Updated**: November 2024
**Version**: 1.0.0
