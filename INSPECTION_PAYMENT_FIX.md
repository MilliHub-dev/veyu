# Inspection Payment Flow - Fix Summary

## Problem
When selecting "Pay After Inspection" as the payment method and clicking "Complete Purchase", the system was showing an error:
```
Checkout Failed: You must pay for and complete a vehicle inspection before placing an order for this vehicle.
```

## Root Cause
The checkout flow was trying to create the order directly without first paying for the inspection fee. The backend was validating that the inspection must be paid before creating the order, but the frontend wasn't handling the inspection payment step.

## Solution
Updated the checkout flow to properly handle the "Pay After Inspection" payment option:

### Changes Made

1. **Modified `proceedToCheckout` function** (Line ~350)
   - Now detects when "pay-after-inspection" is selected
   - Opens the payment modal for the inspection fee (not the full amount)
   - The inspection fee amount is already set correctly in the `onChange` handler of the payment option radio group

2. **Updated `onSuccess` callback** (Line ~380)
   - Added special handling for "pay-after-inspection" payments
   - After successful inspection payment, creates the order with the payment reference
   - Sets `payment_status: 'inspection_paid'` to indicate only inspection is paid
   - Redirects to inspection slip page after order creation

## Flow After Fix

1. **User selects "Pay After Inspection"**
   - Amount is automatically set to inspection fee only (e.g., ₦50,000)
   - Full vehicle price will be paid later after inspection

2. **User clicks "Complete Purchase"**
   - Payment modal opens (Paystack or Wallet)
   - User pays the inspection fee

3. **After successful payment**
   - Order is created with `payment_status: 'inspection_paid'`
   - Backend generates inspection slip reference
   - User is redirected to inspection slip page

4. **Inspection slip page**
   - Shows inspection details
   - QR code for inspector
   - Download/print options
   - User presents this at inspection

5. **After inspection**
   - User pays remaining balance
   - Order status updates to fully paid
   - Vehicle delivery process begins

## Backend Requirements

The backend should:

1. **Accept inspection payment in checkout endpoint**
   ```json
   POST /listings/checkout/{listingId}/
   {
     "payment_option": "pay-after-inspection",
     "payment_reference": "PAYSTACK_REF_123",
     "payment_status": "inspection_paid",
     "amount": 50000
   }
   ```

2. **Return inspection slip reference**
   ```json
   {
     "success": true,
     "data": {
       "order_id": 123,
       "inspection_slip_reference": "INS-2024-001234",
       "payment_status": "inspection_paid",
       "amount_paid": 50000,
       "remaining_balance": 5000000
     }
   }
   ```

3. **Generate inspection slip**
   - Create inspection record
   - Generate unique reference
   - Link to order
   - Make available via `/inspections/slips/{reference}/` endpoint

## Testing

To test the fix:

1. Go to checkout page with a listing
2. Select "Pay After Inspection" payment method
3. Verify amount shows inspection fee only (not full price)
4. Click "Complete Purchase"
5. Payment modal should open
6. Complete payment (use test card if in test mode)
7. Should redirect to inspection slip page
8. Verify slip displays correctly with all details

## Files Modified

- `src/pages/marketplace/checkout/CheckoutPage.jsx`
  - `proceedToCheckout()` function - Added pay-after-inspection handling
  - `onSuccess()` callback - Added order creation after inspection payment
  - Payment modals section - Added PaystackPaymentModal for pay-after-inspection

## Related Documentation

- `INSPECTION_PAYMENT_FLOW.md` - Complete payment flow documentation
- `INSPECTION_QUICK_START.md` - Quick start guide for inspection documents
- `newdoc.md` - API reference for inspection endpoints
