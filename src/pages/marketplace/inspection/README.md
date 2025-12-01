# Inspection Integration Documentation

## Overview
This directory contains the pages that integrate inspection components into the checkout flow.

## Pages Created

### 1. InspectionSlipPage (`/inspection/slip`)
- **Purpose**: Displays the inspection slip after successful booking
- **URL Parameters**:
  - `reference`: Inspection slip reference number (required)
  - `listingId`: Associated listing ID (optional)
- **Features**:
  - Displays inspection details with QR code
  - Download slip as PDF
  - Print functionality
  - Proceed to next step button

### 2. InspectionFormPage (`/inspection/form`)
- **Purpose**: Page for inspectors to conduct vehicle inspections
- **URL Parameters**:
  - `inspectionId`: Existing inspection ID (optional)
  - `reference`: Inspection slip reference (optional)
- **Features**:
  - Dynamic form based on schema from API
  - Section-by-section navigation
  - Photo upload for each section
  - Progress tracking
  - Form validation
  - Submit inspection data

### 3. DocumentPreviewPage (`/inspection/document`)
- **Purpose**: Preview and sign inspection documents
- **URL Parameters**:
  - `documentId`: Document ID to preview (required)
  - `inspectionId`: Associated inspection ID (optional)
- **Features**:
  - PDF document preview with zoom controls
  - Page navigation for multi-page documents
  - Signature status indicators
  - Digital signature capture
  - Download document
  - Submit signature

## Integration Flow

### Checkout with Inspection Flow
1. Customer selects "Pay After Inspection" payment option in checkout
2. Customer pays inspection fee
3. ScheduleInspectionModal opens automatically (redesigned modal)
4. Customer schedules inspection date/time
5. System generates inspection slip
6. Customer is redirected to InspectionSlipPage
7. Inspector uses InspectionFormPage to conduct inspection
8. System generates inspection document
9. Inspector/Customer signs document on DocumentPreviewPage
10. Transaction completes

### Direct Inspection Booking (Future Enhancement)
- Can be added to listing detail pages
- Allows booking inspection before checkout
- Same flow after booking

## Components Used

### From `src/components/`:
- `ScheduleInspectionModal`: Modern redesigned modal for booking inspections with payment integration
- `InspectionBooking`: Legacy booking form (deprecated - use ScheduleInspectionModal)
- `InspectionSlip`: Slip display with QR code
- `InspectionForm`: Dynamic inspection form
- `DocumentPreview`: Document viewer with controls
- `SignaturePad`: Digital signature capture
- `PhotoUpload`: Image upload for inspection photos

### Services Used
- `inspectionService`: All inspection-related API calls
- `walletService`: Wallet payment integration

## Routes Added to App.jsx

```javascript
// Inspection Routes (for authenticated users)
<Route path="/inspection/slip" element={<InspectionSlipPage />} />
<Route path="/inspection/form" element={<InspectionFormPage />} />
<Route path="/inspection/document" element={<DocumentPreviewPage />} />
```

## CheckoutPage Modifications

### Added:
1. Import for `ScheduleInspectionModal` component (redesigned)
2. State for inspection booking modal
3. Handler for inspection booking completion
4. Integrated modal for inspection booking after payment
5. Redirect to inspection slip page after booking

### Modified:
- `onSuccess` function now opens inspection booking modal for "pay-after-inspection" option
- Added `handleInspectionBookingComplete` to handle successful booking
- Replaced old `InspectionBooking` with new `ScheduleInspectionModal` for better UX

## API Endpoints Used

Based on `newdoc.md` specifications:

### Inspection Booking
- `POST /api/v1/listings/checkout/inspection/` - Book inspection

### Inspection Management
- `GET /api/v1/inspections/frontend/form-schema/` - Get form schema
- `POST /api/v1/inspections/frontend/collect-data/` - Submit inspection data
- `POST /api/v1/inspections/frontend/inspections/{id}/upload-photo/` - Upload photos
- `GET /api/v1/inspections/documents/{id}/preview/` - Get document preview
- `GET /api/v1/inspections/signatures/documents/{id}/status/` - Get signature status
- `POST /api/v1/inspections/frontend/documents/{id}/submit-signature/` - Submit signature

## Testing Checklist

- [ ] Checkout with "Pay After Inspection" option
- [ ] Inspection booking modal opens after payment
- [ ] Inspection slip displays correctly with QR code
- [ ] Inspection slip can be downloaded as PDF
- [ ] Inspection form loads with dynamic schema
- [ ] Photos can be uploaded for each section
- [ ] Form validation works correctly
- [ ] Inspection can be submitted successfully
- [ ] Document preview loads correctly
- [ ] Zoom and page navigation work
- [ ] Signature can be captured and submitted
- [ ] All redirects work correctly
- [ ] Error handling works for all scenarios

## Future Enhancements

1. **Offline Mode**: Allow inspectors to work offline and sync later
2. **Video Recording**: Add video recording capability during inspection
3. **AI Damage Detection**: Integrate AI for automatic damage detection
4. **Real-time Updates**: WebSocket updates for inspection status
5. **Multi-language Support**: Support for multiple languages
6. **Mobile App**: Native mobile app for inspectors
7. **Inspection History**: View past inspections for a vehicle
8. **Comparison Tool**: Compare multiple inspection reports

## Notes

- All pages follow the existing design system (Chakra UI)
- Responsive design for mobile, tablet, and desktop
- Error handling with user-friendly messages
- Loading states for all async operations
- Proper navigation with back buttons
- Integration with existing authentication system
