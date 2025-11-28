# Inspection Payment Flow

## Overview
Payment must be completed **before** an inspection can begin. Once payment is verified, the inspection status changes to "Draft" and the order can be created.

## Flow Sequence

### 1. Customer Initiates Inspection Payment
```javascript
// Get inspection fee quote
const quote = await inspectionService.getInspectionQuote({
  inspection_type: 'pre_purchase',
  vehicle_id: listingId
});

// Initiate payment
const paymentResponse = await inspectionService.payForInspection(inspectionId, {
  payment_method: 'bank', // or 'wallet'
  amount: quote.fee
});

// paymentResponse contains:
// - paystack_reference: Reference for Paystack popup
// - authorization_url: URL to redirect to Paystack
// - transaction_id: Backend transaction ID
```

### 2. Backend Creates Pending Transaction
- Backend creates transaction with status: `pending`
- Returns Paystack reference and authorization URL
- Transaction linked to inspection

### 3. Frontend Shows Paystack Payment Popup
```javascript
// Use Paystack Popup or redirect
const handler = PaystackPop.setup({
  key: 'your_paystack_public_key',
  email: customerEmail,
  amount: quote.fee * 100, // Convert to kobo
  ref: paymentResponse.paystack_reference,
  callback: function(response) {
    // Payment successful, verify it
    verifyPayment(response.reference);
  },
  onClose: function() {
    // User closed popup
    console.log('Payment cancelled');
  }
});

handler.openIframe();
```

### 4. Customer Completes Payment on Paystack
- Customer enters card details
- Paystack processes payment
- Returns reference on success

### 5. Frontend Verifies Payment
```javascript
const verificationResponse = await inspectionService.verifyInspectionPayment(inspectionId, {
  reference: paystackReference
});

// verificationResponse contains:
// - status: 'success' or 'failed'
// - inspection_status: 'draft' (if successful)
// - message: Verification message
```

### 6. Backend Verifies with Paystack API
- Backend calls Paystack verification endpoint
- Updates transaction status
- Updates inspection status to "Draft"

### 7. Inspection Status Changes to "Draft"
- Inspection can now begin
- Inspector can access inspection form
- Customer can proceed to create order

### 8. Order Creation
```javascript
// Create order after successful inspection payment
const order = await orderService.createOrderFromInspection({
  inspection_id: inspectionId,
  listing_id: listingId,
  delivery_address: '123 Main St',
  delivery_date: '2025-12-01',
  notes: 'Please call before delivery'
});

// order contains:
// - order_id: New order ID
// - order_status: 'pending' or 'confirmed'
// - inspection_id: Linked inspection
// - total_amount: Order total
```

## API Endpoints

### Inspection Payment
- `POST /api/v1/inspections/{id}/pay/` - Initiate payment
- `POST /api/v1/inspections/{id}/verify-payment/` - Verify payment

### Order Creation
- `POST /api/v1/listings/orders/` - Create order from inspection
- `GET /api/v1/inspections/{id}/order-status/` - Check if inspection is ready for order

## Status Flow

```
Inspection Created → Payment Initiated → Payment Pending → Payment Verified → Draft → In Progress → Completed
                                                                                  ↓
                                                                            Order Created
```

## Frontend Service Methods

### InspectionService
- `getInspectionQuote(quoteData)` - Get fee quote
- `payForInspection(inspectionId, paymentData)` - Initiate payment
- `verifyInspectionPayment(inspectionId, verificationData)` - Verify payment

### OrderService
- `createOrderFromInspection(orderData)` - Create order after payment
- `getInspectionOrderStatus(inspectionId)` - Check if ready for order

## Error Handling

```javascript
try {
  // Initiate payment
  const payment = await inspectionService.payForInspection(inspectionId, paymentData);
  
  // Show Paystack popup
  // ... Paystack integration ...
  
  // Verify payment
  const verification = await inspectionService.verifyInspectionPayment(inspectionId, {
    reference: paystackReference
  });
  
  if (verification.status === 'success') {
    // Payment successful, create order
    const order = await orderService.createOrderFromInspection(orderData);
    // Redirect to order confirmation
  } else {
    // Payment failed
    showError('Payment verification failed');
  }
} catch (error) {
  console.error('Payment error:', error);
  showError(error.message || 'Payment failed');
}
```

## Notes

1. **Payment First**: Order cannot be created until inspection payment is verified
2. **Status Check**: Always verify inspection status is "Draft" before creating order
3. **Transaction Tracking**: Each payment creates a transaction record for audit trail
4. **Paystack Integration**: Use Paystack Popup for better UX
5. **Error Recovery**: Handle payment failures gracefully with retry options
