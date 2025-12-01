# Schedule Vehicle Inspection Modal - Redesign Documentation

## Overview

The `ScheduleInspectionModal` is a completely redesigned, modern modal component for scheduling vehicle inspections. It provides an improved user experience with better visual design, clearer information hierarchy, and enhanced payment options.

## Key Improvements

### 1. **Modern Visual Design**
- **Gradient header** with icon for better visual appeal
- **Card-based layout** for better content organization
- **Interactive payment method cards** with hover effects
- **Color-coded alerts** for different states
- **Smooth animations** and transitions

### 2. **Enhanced User Experience**
- **Collapsible inspection details** to reduce clutter
- **Visual feedback** for selected payment methods
- **Real-time wallet balance** display
- **Clear date/time constraints** (tomorrow to 30 days)
- **Contextual information** based on inspection type

### 3. **Better Information Architecture**
- **Vehicle info card** prominently displayed
- **Inspection type details** with duration and inclusions
- **Payment method comparison** with visual cards
- **Clear pricing** with gradient card
- **Status indicators** for payment state

### 4. **Improved Payment Flow**
- **Three payment methods** clearly differentiated:
  - Card Payment (Paystack) - with credit card icon
  - Wallet - with real-time balance display
  - Bank Transfer - with bank icon
- **Visual selection** with checkmarks
- **Insufficient balance warning** for wallet payments

## Component API

### Props

```jsx
<ScheduleInspectionModal
  isOpen={boolean}              // Required: Modal open state
  onClose={function}            // Required: Close handler
  listingId={number}            // Required: Vehicle listing ID
  listingType={string}          // Optional: 'buy' or 'rent' (default: 'buy')
  vehicleInfo={object}          // Optional: Vehicle details { name, make, model, year }
  alreadyPaid={boolean}         // Optional: Whether inspection fee is already paid (default: false)
  onSuccess={function}          // Optional: Success callback with inspection slip data
/>
```

### Usage Examples

#### Basic Usage
```jsx
import { ScheduleInspectionModal } from '../components';

function MyComponent() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSuccess = (inspectionSlip) => {
    console.log('Inspection scheduled:', inspectionSlip);
    // Navigate to inspection details or show confirmation
  };

  return (
    <>
      <Button onClick={onOpen}>Schedule Inspection</Button>
      
      <ScheduleInspectionModal
        isOpen={isOpen}
        onClose={onClose}
        listingId={123}
        listingType="buy"
        vehicleInfo={{ name: '2020 Toyota Camry' }}
        onSuccess={handleSuccess}
      />
    </>
  );
}
```

#### Already Paid Scenario (Checkout Flow)
```jsx
<ScheduleInspectionModal
  isOpen={isOpen}
  onClose={onClose}
  listingId={456}
  listingType="buy"
  vehicleInfo={{ name: '2019 Honda Accord' }}
  alreadyPaid={true}  // Payment already completed in checkout
  onSuccess={handleSuccess}
/>
```

## Features

### Inspection Types

The modal supports four inspection types with different pricing:

1. **Pre-Purchase Inspection** - ₦25,000
   - Comprehensive inspection before buying
   - Duration: 2-3 hours
   - Includes: Engine check, Body inspection, Test drive, Full report

2. **Pre-Rental Inspection** - ₦20,000
   - Quick inspection before renting
   - Duration: 1-2 hours
   - Includes: Basic check, Safety inspection, Documentation, Condition report

3. **Maintenance Inspection** - ₦15,000
   - Regular maintenance and service check
   - Duration: 1-2 hours
   - Includes: Service check, Fluid levels, Tire inspection, Basic diagnostics

4. **Insurance Inspection** - ₦20,000
   - Inspection for insurance purposes
   - Duration: 1-2 hours
   - Includes: Damage assessment, Value estimation, Photo documentation, Report

### Payment Methods

#### 1. Card Payment (Paystack)
- Secure payment gateway integration
- Instant confirmation
- Credit/Debit card support

#### 2. Wallet Payment
- Uses user's wallet balance
- Real-time balance display
- Instant deduction
- Insufficient balance warning

#### 3. Bank Transfer
- Manual transfer option
- Payment reference generation
- Requires confirmation

### Date & Time Selection

- **Minimum date**: Tomorrow (next day)
- **Maximum date**: 30 days from today
- **Time selection**: Any time during business hours
- **Visual calendar picker** with time input

### Validation

- Required fields: Date and Time
- Payment method validation
- Wallet balance check
- Date range validation

### Error Handling

- Network errors
- Payment failures
- Validation errors
- Insufficient balance
- API errors

## Design Tokens

### Colors
- **Primary**: Blue (blue.500, blue.600)
- **Success**: Green (green.500, green.50)
- **Warning**: Orange (orange.500)
- **Error**: Red (red.500)
- **Info**: Blue (blue.50, blue.200)

### Spacing
- Modal padding: 6 (24px)
- Section spacing: 5 (20px)
- Card padding: 3-4 (12-16px)

### Typography
- Header: xl, bold
- Section labels: semibold
- Body text: normal
- Helper text: sm

## Accessibility

- Keyboard navigation support
- ARIA labels for icons
- Focus management
- Screen reader friendly
- Color contrast compliance

## Mobile Responsiveness

- Responsive modal width (max 600px)
- Stacked layout on mobile
- Touch-friendly buttons
- Optimized spacing

## Integration Points

### Services Used
- `inspectionService.bookInspection()` - Book inspection
- `walletService.getBalance()` - Get wallet balance
- `PaystackPaymentModal` - Card payment processing

### Data Flow
1. User selects inspection type, date, and time
2. User selects payment method
3. System validates inputs
4. Payment processing (if not already paid)
5. Inspection booking API call
6. Success callback with inspection slip
7. Modal closes

## Testing Considerations

- Test all payment methods
- Test validation scenarios
- Test error handling
- Test already paid flow
- Test different inspection types
- Test date/time constraints
- Test wallet balance scenarios

## Future Enhancements

- [ ] Add inspection location selection
- [ ] Add mechanic preference
- [ ] Add special instructions field
- [ ] Add inspection history view
- [ ] Add rescheduling capability
- [ ] Add cancellation option
- [ ] Add SMS/Email notification preferences
- [ ] Add calendar integration
- [ ] Add multiple date/time suggestions

## Migration from Old Component

### Old Component (InspectionBooking)
```jsx
<InspectionBooking
  listingId={123}
  listingType="buy"
  onBookingComplete={handleComplete}
  onCancel={handleCancel}
  alreadyPaid={false}
/>
```

### New Component (ScheduleInspectionModal)
```jsx
<ScheduleInspectionModal
  isOpen={isOpen}
  onClose={onClose}
  listingId={123}
  listingType="buy"
  vehicleInfo={{ name: 'Vehicle Name' }}
  alreadyPaid={false}
  onSuccess={handleComplete}
/>
```

### Key Differences
1. Uses modal pattern instead of inline component
2. Requires `isOpen` and `onClose` props
3. `onBookingComplete` renamed to `onSuccess`
4. `onCancel` replaced by `onClose`
5. Added `vehicleInfo` prop for better context
6. Enhanced visual design and UX

## Support

For issues or questions, please contact the development team or create an issue in the project repository.

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Author**: Development Team
