# Listing Navigation Fix

## Problem
When clicking on a listing card in the marketplace, it doesn't redirect to the BuyDetail page.

## Root Cause
The `ListingItemCard` component was using `listing?.uuid` to build the navigation URL, but the listing object from the API might use a different field name like `id` or `listing_id`.

## Fix Applied
Modified `src/components/index.jsx` in the `ListingItemCard` component:

### Before:
```jsx
<NavLink to={`/${type}/${listing?.uuid}`}>
```

### After:
```jsx
<NavLink to={`/${type}/${listing?.uuid || listing?.id || listing?.listing_id}`}>
```

This provides a fallback chain to check multiple possible ID field names.

## Debugging Added
Added console logging to help identify which ID field is actually being used:

```jsx
console.log('🔍 ListingItemCard - Listing ID fields:', {
    uuid: listing?.uuid,
    id: listing?.id,
    listing_id: listing?.listing_id,
    fullListing: listing
});
```

## Testing Steps

1. **Clear browser cache and refresh** the page
2. **Navigate to the buy listings page** (`/buy`)
3. **Open browser console** (F12)
4. **Look for the debug log** that shows which ID field exists
5. **Click on any listing card**
6. **Verify** you're redirected to the detail page

## Expected Console Output
You should see logs like:
```
🔍 ListingItemCard - Listing ID fields: {
  uuid: "c87678f6-c930-11f0-a5b2-cdce16ffe435",
  id: undefined,
  listing_id: undefined,
  fullListing: {...}
}
```

This will tell you which field name the API is actually using.

## If Still Not Working

If clicking still doesn't work after this fix, check:

1. **Console errors** - Look for JavaScript errors
2. **Network tab** - Verify the listings API is returning data
3. **ID field name** - Check the console log to see which field has a value
4. **Route configuration** - Verify the route in `App.jsx` matches the URL pattern

## Related Files
- `src/components/index.jsx` - ListingItemCard component
- `src/pages/marketplace/buy/BuyListing.jsx` - Listings page
- `src/pages/marketplace/buy/BuyDetail.jsx` - Detail page
- `src/App.jsx` - Route configuration
