# Manual Testing Checklist for BundlesUp

Use this checklist to manually test all features of the BundlesUp app.

## Setup

- [ ] Development server is running (`npm run dev`)
- [ ] Test Shopify store is created
- [ ] App is installed in test store
- [ ] Browser DevTools are open (for debugging)

---

## 1. Authentication & Installation

### OAuth Flow
- [ ] Navigate to app URL
- [ ] Redirected to Shopify OAuth page
- [ ] All required scopes are shown
- [ ] Click "Install app"
- [ ] Redirected back to app
- [ ] No OAuth loops
- [ ] Auth token is stored
- [ ] Session persists on page refresh

### Error Handling
- [ ] Test with invalid shop domain
- [ ] Test with cancelled OAuth
- [ ] Test with network disconnection

**Expected Results:**
- Smooth OAuth flow without loops
- Clear error messages
- Proper redirects

---

## 2. Onboarding

### First-Time User Experience
- [ ] Welcome screen displays
- [ ] App benefits are listed
- [ ] Pricing shows: $2.99/month
- [ ] Free trial period shows: 14 days
- [ ] "Start Free Trial" button is prominent

### Billing Flow
- [ ] Click "Start Free Trial"
- [ ] Redirected to Shopify billing page
- [ ] Charge details are correct
- [ ] Click "Approve"
- [ ] Redirected back to app
- [ ] Onboarding marked as complete
- [ ] Dashboard loads

### Skip Options
- [ ] Option to explore first (if applicable)
- [ ] Can complete onboarding later

**Expected Results:**
- Clear, professional onboarding
- Working billing integration
- Smooth transition to dashboard

---

## 3. Dashboard

### Stats Overview
- [ ] 4 stat cards display
- [ ] Active Bundles count is correct
- [ ] Total Revenue displays with currency
- [ ] Total Sales count is correct
- [ ] Conversion Rate shows percentage

### Recent Bundles
- [ ] Shows up to 5 recent bundles
- [ ] Bundle names are displayed
- [ ] Bundle types are shown
- [ ] Status badges are color-coded
- [ ] Click bundle to view details

### Quick Actions
- [ ] "Create Bundle" button works
- [ ] "Sync Products" button works
- [ ] "View Analytics" button works
- [ ] All buttons have icons

### Loading States
- [ ] Loading skeletons show while fetching
- [ ] Smooth transition to content

### Empty States
- [ ] Shows helpful message when no bundles
- [ ] Clear call-to-action

**Expected Results:**
- Dashboard loads in < 3 seconds
- All stats are accurate
- Clean, professional layout

---

## 4. Bundle Management

### Create Bundle - Step 1: Details

#### Form Fields
- [ ] Bundle Name field (required)
- [ ] Description textarea
- [ ] Bundle Type dropdown:
  - [ ] Fixed Bundle
  - [ ] Mix & Match
  - [ ] Upsell
  - [ ] Frequently Bought Together

#### Pricing Strategy
- [ ] Percentage Discount option
- [ ] Amount Discount option
- [ ] Fixed Price option
- [ ] Discount value field (number)

#### Additional Settings
- [ ] Status toggle (Active/Draft)
- [ ] Min items (for Mix & Match)
- [ ] Max items (for Mix & Match)

#### Validation
- [ ] Bundle name required
- [ ] Bundle type required
- [ ] Pricing strategy required
- [ ] Discount value validation (positive number)
- [ ] Clear error messages

### Create Bundle - Step 2: Products

#### Product Selection
- [ ] All products listed
- [ ] Product images load
- [ ] Product names display
- [ ] Product prices show
- [ ] Inventory count shown
- [ ] Search products works
- [ ] Filter by collection (if implemented)

#### Selection UI
- [ ] Checkbox for each product
- [ ] Select multiple products
- [ ] Quantity selector for each
- [ ] Required/optional toggle
- [ ] Selected count shows

#### Navigation
- [ ] "Back" button returns to step 1
- [ ] "Create Bundle" button enabled when valid
- [ ] Cancel button works

### Bundle List View

#### Display
- [ ] All bundles listed
- [ ] Bundle cards with info
- [ ] Product thumbnails
- [ ] Status badges (Active/Draft/Paused)
- [ ] Sales and revenue numbers

#### Filters
- [ ] "All" tab shows all bundles
- [ ] "Active" tab filters
- [ ] "Draft" tab filters
- [ ] "Paused" tab filters
- [ ] Count badges on tabs

#### Search
- [ ] Search by bundle name
- [ ] Real-time filtering
- [ ] Clear search button

#### Actions (per bundle)
- [ ] Edit button opens modal
- [ ] Duplicate creates copy
- [ ] Pause/Activate toggles status
- [ ] Delete shows confirmation
- [ ] Actions dropdown works

### Edit Bundle
- [ ] Modal opens with current data
- [ ] All fields pre-filled
- [ ] Can modify all settings
- [ ] Can add/remove products
- [ ] Save updates bundle
- [ ] Cancel discards changes

### Duplicate Bundle
- [ ] Creates copy with "(Copy)" suffix
- [ ] All settings copied
- [ ] All products copied
- [ ] Status set to Draft

### Delete Bundle
- [ ] Confirmation modal shows
- [ ] Warning message clear
- [ ] "Cancel" closes modal
- [ ] "Delete" removes bundle
- [ ] Cascade deletes related data
- [ ] Success message shows

**Expected Results:**
- Smooth 2-step creation flow
- All validations work
- CRUD operations complete < 1 second
- Professional UI/UX

---

## 5. Products

### Product List
- [ ] All products displayed
- [ ] Grid or list view
- [ ] Product images load
- [ ] Product names
- [ ] Prices with currency
- [ ] Inventory count
- [ ] Shopify product ID

### Sync Products
- [ ] "Sync from Shopify" button
- [ ] Loading indicator during sync
- [ ] Progress or status message
- [ ] Success notification
- [ ] New products added
- [ ] Existing products updated
- [ ] Deleted products handled

### Search & Filter
- [ ] Search by product name
- [ ] Filter by price range
- [ ] Filter by inventory status
- [ ] Sort options (name, price, inventory)

### Product Details
- [ ] Click product to view details
- [ ] Shows all product info
- [ ] Shows variants (if applicable)
- [ ] Shows which bundles include it

**Expected Results:**
- Product sync completes < 5 seconds
- All Shopify data synced correctly
- Clean product display

---

## 6. Analytics

### Stats Cards
- [ ] Total Bundles
- [ ] Total Revenue (with currency)
- [ ] Total Sales
- [ ] Average Conversion Rate

### Revenue by Bundle (Bar Chart)
- [ ] Chart renders correctly
- [ ] X-axis: Bundle names
- [ ] Y-axis: Revenue
- [ ] Bars colored properly
- [ ] Tooltips on hover
- [ ] Data accurate

### Revenue by Type (Pie Chart)
- [ ] Chart renders correctly
- [ ] Sections for each bundle type
- [ ] Colors distinct
- [ ] Legend shows
- [ ] Percentages displayed
- [ ] Tooltips on hover

### Top Performing Bundles (Table)
- [ ] Table headers clear
- [ ] Bundle names
- [ ] Sales count
- [ ] Revenue
- [ ] Conversion rate
- [ ] Sortable columns
- [ ] Top 10 shown

### Date Filters
- [ ] Last 7 days
- [ ] Last 30 days
- [ ] Last 90 days
- [ ] Custom date range
- [ ] Charts update on change

### Export Options
- [ ] Export as CSV (if implemented)
- [ ] Export as PDF (if implemented)
- [ ] Download works

**Expected Results:**
- Analytics load < 2 seconds
- All data accurate
- Charts render smoothly
- Professional data visualization

---

## 7. Settings

### Store Settings
- [ ] Store name displays
- [ ] Store URL shows
- [ ] Connected status indicator
- [ ] Last sync time
- [ ] Reconnect option

### Bundle Display Settings
- [ ] Default bundle layout (Grid/List)
- [ ] Show savings toggle
- [ ] Show individual prices toggle
- [ ] Display product images toggle
- [ ] Save button works

### Notification Settings
- [ ] Email notifications toggle
- [ ] Order notifications
- [ ] Low inventory alerts
- [ ] Weekly report toggle

### Theme Settings
- [ ] Primary color picker
- [ ] Accent color picker
- [ ] Button style options
- [ ] Preview updates live
- [ ] Save applies changes

### Account Settings
- [ ] User email displays
- [ ] Name editable
- [ ] Password change option
- [ ] Time zone setting
- [ ] Language preference

**Expected Results:**
- All settings save successfully
- Changes apply immediately
- Clear success messages

---

## 8. Responsive Design

### Mobile (320px - 767px)
- [ ] Navigation collapses to hamburger
- [ ] Stats stack vertically
- [ ] Bundle cards stack
- [ ] Forms are usable
- [ ] Buttons are tappable
- [ ] No horizontal scroll
- [ ] Text is readable

### Tablet (768px - 1023px)
- [ ] 2-column layouts work
- [ ] Sidebar collapses or adjusts
- [ ] Charts resize properly
- [ ] Tables scroll horizontally if needed
- [ ] Touch interactions work

### Desktop (1024px+)
- [ ] Full layout displays
- [ ] Sidebar always visible
- [ ] Multi-column grids
- [ ] Charts use full width
- [ ] Optimal spacing

**Expected Results:**
- Smooth responsive behavior
- No broken layouts
- Usable on all devices

---

## 9. Error Handling

### Network Errors
- [ ] Offline message shows
- [ ] Retry button available
- [ ] Clear error message
- [ ] Graceful degradation

### Validation Errors
- [ ] Form errors show inline
- [ ] Error messages are clear
- [ ] Red styling for errors
- [ ] Focus on error field

### API Errors
- [ ] 400: Clear validation message
- [ ] 401: Redirect to auth
- [ ] 403: Permission error shown
- [ ] 404: Not found message
- [ ] 500: Generic error with retry

### Loading States
- [ ] Skeleton loaders
- [ ] Spinners for actions
- [ ] Progress bars for uploads
- [ ] Disable buttons during loading

**Expected Results:**
- All errors handled gracefully
- Clear, actionable messages
- No app crashes

---

## 10. Performance

### Page Load Times
- [ ] Dashboard: < 3 seconds
- [ ] Bundle list: < 2 seconds
- [ ] Bundle create: < 1 second
- [ ] Product sync: < 5 seconds
- [ ] Analytics: < 2 seconds

### Interactions
- [ ] Button clicks respond instantly
- [ ] Form inputs no lag
- [ ] Search results real-time
- [ ] Smooth animations (60fps)
- [ ] No janky scrolling

### Network
- [ ] API calls < 500ms
- [ ] Images optimized
- [ ] Lazy loading works
- [ ] Caching effective

**Expected Results:**
- Fast, snappy experience
- No performance issues
- Smooth animations

---

## 11. Webhooks (Backend)

### Setup
- [ ] Webhooks configured in Shopify
- [ ] URLs point to correct functions
- [ ] HMAC verification working

### Order Created
- [ ] Create test order in Shopify
- [ ] Webhook received
- [ ] BundleOrder created in DB
- [ ] BundleAnalytic updated
- [ ] Bundle stats updated

### Order Updated
- [ ] Update test order
- [ ] Webhook received
- [ ] Data updated correctly

### Order Refunded
- [ ] Refund test order
- [ ] Webhook received
- [ ] Stats adjusted correctly
- [ ] Revenue decremented

### Product Updated
- [ ] Update product in Shopify
- [ ] Webhook received
- [ ] Product data synced
- [ ] Bundle items updated

**Expected Results:**
- All webhooks process successfully
- Data stays in sync
- No lost events

---

## 12. Edge Cases

### Boundary Conditions
- [ ] Create bundle with 1 product
- [ ] Create bundle with 50+ products
- [ ] Bundle with very long name
- [ ] Product with no image
- [ ] Product with $0 price
- [ ] Product out of stock

### Concurrent Operations
- [ ] Multiple users editing same bundle
- [ ] Rapid clicking create button
- [ ] Sync while viewing products
- [ ] Delete while editing

### Data Issues
- [ ] Handle empty states
- [ ] Handle null values
- [ ] Handle special characters
- [ ] Handle unicode
- [ ] Handle very large numbers

**Expected Results:**
- App handles edge cases
- No crashes or errors
- Sensible fallbacks

---

## 13. Security

### Authentication
- [ ] Logged out users redirected
- [ ] Session timeout works
- [ ] No sensitive data in URLs
- [ ] Tokens not exposed

### Authorization
- [ ] Users only see their data
- [ ] Can't edit other shops' bundles
- [ ] Admin functions protected
- [ ] API endpoints secured

### Data Protection
- [ ] HTTPS only
- [ ] CSRF protection
- [ ] XSS prevention
- [ ] SQL injection prevention
- [ ] Input sanitization

**Expected Results:**
- App is secure
- No vulnerabilities
- Data protected

---

## 14. Browser Compatibility

### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Layout correct

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Layout correct

### Safari
- [ ] All features work
- [ ] No console errors
- [ ] Layout correct

### Edge
- [ ] All features work
- [ ] No console errors
- [ ] Layout correct

**Expected Results:**
- Consistent experience across browsers
- No browser-specific bugs

---

## Testing Sign-Off

**Tester Name:** _________________
**Date:** _________________
**Version:** _________________

### Overall Assessment

- [ ] All critical features work
- [ ] No major bugs found
- [ ] Performance is acceptable
- [ ] Ready for production

### Issues Found

| Issue | Severity | Status |
|-------|----------|--------|
|       |          |        |
|       |          |        |
|       |          |        |

### Notes

_________________________________
_________________________________
_________________________________

---

## Quick Test Commands

```bash
# Run automated tests
cd /vercel/sandbox/bundle-and-save-app
npm test

# Start dev server
npm run dev

# Check types
npm run typecheck

# Run all tests with UI
npm test -- --ui

# Generate test coverage
npm test -- --coverage
```

---

**Happy Testing! 🧪**
