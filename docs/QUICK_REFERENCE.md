# Inspection Slip Feature - Quick Reference

## 🚀 Quick Start

### For Customers

**Schedule an Inspection:**
```javascript
// From cart page, click "Schedule Inspection" button
// Or use the ScheduleInspectionModal component
import { ScheduleInspectionModal } from '../components';

<ScheduleInspectionModal
  isOpen={true}
  onClose={() => {}}
  listingId="listing-uuid"
  vehicleInfo={{ name: "Toyota Camry 2020" }}
  onSuccess={(slip) => console.log('Slip:', slip)}
/>
```

**View Inspection Slip:**
```javascript
// Navigate to slip page
navigate(`/inspections/slip/${slipReference}`);
// Example: navigate('/inspections/slip/INSP-7');
```

**Download Slip:**
```javascript
import inspectionService from '../services/inspectionService';

const downloadSlip = async (slipReference) => {
  const blob = await inspectionService.downloadInspectionSlip(slipReference);
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `inspection-slip-${slipReference}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
```

### For Dealers

**Verify Inspection Slip:**
```javascript
// Navigate to verification page
navigate('/verify-inspection');

// Or use the component directly
import { DealerInspectionVerification } from '../components';

<DealerInspectionVerification />
```

**Programmatic Verification:**
```javascript
import inspectionService from '../services/inspectionService';

const verifySlip = async (slipNumber) => {
  const response = await inspectionService.verifyInspectionSlip({
    slip_number: slipNumber
  });
  
  if (response.success && response.data.valid) {
    console.log('Valid slip:', response.data);
  } else {
    console.log('Invalid slip');
  }
};
```

## 📋 API Methods

### Inspection Service Methods

```javascript
import inspectionService from '../services/inspectionService';

// Get slip details
const slip = await inspectionService.getInspectionSlip('INSP-7');

// Download slip PDF
const blob = await inspectionService.downloadInspectionSlip('INSP-7');

// Verify slip (dealers)
const result = await inspectionService.verifyInspectionSlip({
  slip_number: 'INSP-7'
});

// Regenerate slip
const newSlip = await inspectionService.regenerateInspectionSlip(inspectionId);

// Book inspection
const booking = await inspectionService.bookInspection({
  listing_id: 'uuid',
  inspection_type: 'pre_purchase',
  scheduled_date: '15/12/2024',
  scheduled_time: '10:00',
  payment_method: 'card',
  payment_reference: 'PAY-123'
});
```

## 🎨 Components

### ScheduleInspectionModal
```javascript
<ScheduleInspectionModal
  isOpen={boolean}
  onClose={() => void}
  listingId={string}
  listingType="buy" | "rent"
  vehicleInfo={{ name: string }}
  alreadyPaid={boolean}
  onSuccess={(slip) => void}
/>
```

### InspectionSlip
```javascript
<InspectionSlip
  slipData={{
    inspection_number: 'INSP-7',
    customer_name: 'John Doe',
    vehicle: { name: 'Toyota Camry' },
    // ... other fields
  }}
  onDownload={() => void}
  onProceed={() => void}
/>
```

### DealerInspectionVerification
```javascript
<DealerInspectionVerification />
// No props needed - fully self-contained
```

## 🛣️ Routes

```javascript
// Customer routes
/inspections/slip/:slipReference  // View slip
/cart                             // Cart with inspection options

// Dealer routes
/verify-inspection                // Verify customer slips
```

## 📊 Data Structures

### Slip Data
```typescript
interface InspectionSlip {
  id: number;
  inspection_number: string;      // "INSP-7"
  inspection_type: string;         // "pre_purchase"
  scheduled_date: string;          // "2024-12-15"
  scheduled_time: string;          // "10:00"
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  vehicle: {
    name: string;
    make: string;
    model: string;
    year: number;
    vin?: string;
  };
  dealer: {
    business_name: string;
    location: string;
    phone: string;
  };
  payment_status: "paid" | "pending";
  inspection_fee: number;
  payment_method: string;
  payment_reference: string;
  status: "draft" | "in_progress" | "completed";
  created_at: string;
}
```

### Verification Response
```typescript
interface VerificationResponse {
  success: boolean;
  data: {
    valid: boolean;
    inspection_number: string;
    payment_status: string;
    status: string;
    // ... all slip fields
  };
}
```

## 🎯 Common Use Cases

### 1. Add Inspection to Existing Order
```javascript
// From cart page
const handleAddInspection = (order) => {
  setSelectedOrder(order);
  setInspectionModalOpen(true);
};
```

### 2. View Slip After Scheduling
```javascript
const handleInspectionSuccess = (slip) => {
  const slipRef = slip.slip_reference || slip.inspection_number;
  navigate(`/inspections/slip/${slipRef}`);
};
```

### 3. Dealer Verification Flow
```javascript
// 1. Customer provides slip number
const slipNumber = "INSP-7";

// 2. Dealer enters in verification page
// 3. System verifies and shows details
// 4. Dealer proceeds with inspection
```

## 🔧 Utility Functions

### Format Date
```javascript
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
```

### Get Inspection Type Label
```javascript
const getInspectionTypeLabel = (type) => {
  const labels = {
    pre_purchase: 'Pre-Purchase Inspection',
    pre_rental: 'Pre-Rental Inspection',
    maintenance: 'Maintenance Inspection',
    insurance: 'Insurance Inspection',
  };
  return labels[type] || type;
};
```

### Generate QR Code Data
```javascript
const qrData = `VEYU-INSPECTION:${slipNumber}:${inspectionId}`;
// Example: "VEYU-INSPECTION:INSP-7:123"
```

## 🎨 Styling

### Status Colors
```javascript
const statusColors = {
  paid: 'green',
  pending: 'yellow',
  draft: 'gray',
  in_progress: 'blue',
  completed: 'green',
  signed: 'purple',
  archived: 'orange'
};
```

### Common Styles
```javascript
// Success card
<Card borderWidth="2px" borderColor="green.500" bg="green.50">

// Error alert
<Alert status="error" borderRadius="md">

// Info badge
<Badge colorScheme="blue" fontSize="md" px={2} py={1}>
```

## 🐛 Error Handling

```javascript
try {
  const slip = await inspectionService.getInspectionSlip(slipRef);
  // Handle success
} catch (error) {
  console.error('Error:', error);
  
  // Show user-friendly message
  toast({
    title: 'Error',
    description: error?.response?.data?.message || 'Failed to load slip',
    status: 'error',
    duration: 5000,
    isClosable: true,
  });
}
```

## 📱 Responsive Design

```javascript
// Use Chakra UI responsive props
<Box
  w={{ base: '100%', md: '50%' }}
  p={{ base: 4, md: 8 }}
  fontSize={{ base: 'sm', md: 'md' }}
>
```

## 🔐 Authentication

All API calls require authentication:
```javascript
// Token is automatically included via apiClient
// Managed by TokenManager in src/services/api.js
```

## 📞 Support

### Common Issues

**Slip not loading:**
- Check slip reference format (INSP-7)
- Verify authentication token
- Check network tab for API errors

**Verification failing:**
- Ensure dealer is logged in
- Check slip belongs to dealer's dealership
- Verify payment status is "paid"

**Download not working:**
- Check blob response type
- Verify PDF generation on backend
- Check browser download permissions

### Debug Mode
```javascript
// Enable debug logging
console.log('Slip data:', slipData);
console.log('Verification result:', verificationResult);
```

## 🎉 Quick Tips

1. Always handle loading states
2. Show user-friendly error messages
3. Use toast notifications for feedback
4. Implement proper error boundaries
5. Test on mobile devices
6. Verify QR codes work correctly
7. Check PDF downloads in different browsers
8. Test with different slip statuses
9. Verify dealer permissions
10. Monitor API response times

---

**Need help?** Check the full implementation guide in `INSPECTION_SLIP_FRONTEND_IMPLEMENTATION.md`
