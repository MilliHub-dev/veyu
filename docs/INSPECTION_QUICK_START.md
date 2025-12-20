# Inspection Document - Quick Start Guide

## 🚀 Quick Implementation Overview

After order creation with "Pay After Inspection" option, the system automatically redirects to an inspection slip page.

## 📋 What Was Implemented

### 1. **Order Service** - New Methods
```javascript
import orderService from './services/orderService';

// Generate inspection document
await orderService.generateInspectionDocument(orderId, options);

// Get inspection document
await orderService.getOrderInspectionDocument(orderId);

// Download document
await orderService.downloadInspectionDocument(documentId);

// Preview document
await orderService.getInspectionDocumentPreview(documentId);
```

### 2. **Inspection Service** - Already Complete
```javascript
import inspectionService from './services/inspectionService';

// Get inspection slip
await inspectionService.getInspectionSlip(slipReference);

// Download slip PDF
await inspectionService.downloadInspectionSlip(slipReference);

// Get document preview
await inspectionService.getDocumentPreview(documentId);

// Download document
await inspectionService.downloadDocument(documentId);
```

### 3. **Checkout Flow** - Auto Redirect
When order is created with `pay-after-inspection`:
```javascript
// Backend returns:
{
  "inspection_slip_reference": "INS-2024-001234",
  "order_id": 123
}

// Frontend automatically redirects to:
/inspection/slip?reference=INS-2024-001234&listingId=456
```

### 4. **Inspection Slip Page** - Ready to Use
Route: `/inspection/slip?reference={ref}&listingId={id}`

Features:
- ✅ Displays inspection details
- ✅ Shows QR code
- ✅ Download PDF button
- ✅ Print functionality
- ✅ Share option
- ✅ Mobile responsive

## 🔌 Backend Integration Required

### Checkout Endpoint Response
```javascript
POST /listings/checkout/{listingId}/

// When payment_option === 'pay-after-inspection'
// Backend should return:
{
  "success": true,
  "data": {
    "order_id": 123,
    "inspection_slip_reference": "INS-2024-001234",  // ← Required
    "inspection_id": 456,
    "document_id": 789,
    "payment_status": "inspection_paid",
    "amount_paid": 50000,
    "remaining_balance": 5000000
  }
}
```

### Inspection Slip Endpoint
```javascript
GET /inspections/slips/{slip_reference}/

// Should return:
{
  "success": true,
  "data": {
    "reference": "INS-2024-001234",
    "listingId": 456,
    "inspectionType": "pre_purchase",
    "scheduledDate": "2024-12-15",
    "scheduledTime": "10:00 AM",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "vehicleDetails": {
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "vin": "1HGBH41JXMN109186"
    },
    "paymentStatus": "paid",
    "amount": 50000,
    "createdAt": "2024-12-01T10:00:00Z"
  }
}
```

### Document Download Endpoint
```javascript
GET /inspections/documents/{document_id}/download/

// Returns: PDF file (blob)
Content-Type: application/pdf
Content-Disposition: attachment; filename="inspection_1.pdf"
```

## 🎯 User Flow

1. **Customer Checkout**
   - Selects "Pay After Inspection"
   - Pays inspection fee only

2. **Order Created**
   - Backend generates inspection slip
   - Returns slip reference

3. **Auto Redirect**
   - Frontend redirects to slip page
   - Shows success message

4. **Inspection Slip**
   - Customer views details
   - Downloads/prints slip
   - Presents at inspection

## 📱 Testing

### Test the Flow
```javascript
// 1. Go to checkout
/checkout/pay?listingId=123

// 2. Select "Pay After Inspection"
// 3. Complete payment
// 4. Should redirect to:
/inspection/slip?reference=INS-2024-001234&listingId=123

// 5. Verify slip displays correctly
// 6. Test download button
// 7. Test print button
```

### Manual Testing Checklist
- [ ] Checkout with pay-after-inspection
- [ ] Redirect to slip page works
- [ ] Slip data loads correctly
- [ ] Download PDF works
- [ ] Print functionality works
- [ ] QR code displays
- [ ] Mobile view is responsive
- [ ] Error handling (invalid reference)

## 🔧 Configuration

### Environment Variables
No additional environment variables needed. Uses existing API configuration.

### Routes
Already configured in `src/App.jsx`:
```javascript
<Route path="/inspection/slip" element={<InspectionSlipPage />} />
```

## 📚 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/inspections/slips/{ref}/` | GET | Get slip data |
| `/inspections/slips/{ref}/download/` | GET | Download PDF |
| `/inspections/documents/{id}/preview/` | GET | Preview document |
| `/inspections/documents/{id}/download/` | GET | Download document |
| `/inspections/{id}/status/` | GET | Get status |

## 🐛 Troubleshooting

### Issue: Slip page shows "No reference provided"
**Solution**: Ensure backend returns `inspection_slip_reference` in checkout response

### Issue: Download fails
**Solution**: Check backend document generation and storage

### Issue: Slip data not loading
**Solution**: Verify `/inspections/slips/{ref}/` endpoint is working

### Issue: Redirect not happening
**Solution**: Check checkout response includes `inspection_slip_reference`

## 📞 Support

For implementation questions:
1. Check `INSPECTION_DOCUMENT_IMPLEMENTATION.md` for detailed docs
2. Review `newdoc.md` for complete API reference
3. Contact backend team for API integration

## ✨ Features Ready

- ✅ Automatic redirect after order creation
- ✅ Inspection slip display with QR code
- ✅ PDF download functionality
- ✅ Print-friendly layout
- ✅ Mobile responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ Success notifications

## 🎉 You're All Set!

The frontend is ready. Just ensure your backend:
1. Returns `inspection_slip_reference` in checkout response
2. Implements the slip data endpoint
3. Generates and serves PDF documents

That's it! The inspection document flow is complete.
