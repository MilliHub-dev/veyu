# Order Service Update - Delete Order Method

## What Was Added

Added a new `deleteOrder` method to the orderService that uses the DELETE HTTP method to cancel/delete orders.

## New Method

### `deleteOrder(orderId)`

**Purpose**: Cancel/delete an order (customer-facing endpoint)

**Endpoint**: `DELETE /api/v1/listings/orders/{order_id}/cancel/`

**Parameters**:
- `orderId` (string/number) - The ID of the order to delete

**Returns**: API response with deletion confirmation

**Usage Example**:
```javascript
import orderService from './services/orderService';

// Delete an order
try {
  const result = await orderService.deleteOrder(orderId);
  console.log('Order deleted:', result);
  
  // Show success message
  toast({
    title: 'Order Cancelled',
    description: 'Your order has been cancelled successfully',
    status: 'success'
  });
} catch (error) {
  console.error('Failed to delete order:', error);
  
  // Show error message
  toast({
    title: 'Cancellation Failed',
    description: error.message || 'Failed to cancel order',
    status: 'error'
  });
}
```

## Difference from Existing `cancelOrder` Method

### Existing Method: `cancelOrder(orderId, reason)`
- **HTTP Method**: POST
- **Endpoint**: `/admin/dealership/orders/{orderId}/cancel/`
- **Use Case**: Dealer/Admin cancelling orders
- **Parameters**: orderId, reason (optional)
- **Access**: Admin/Dealer only

### New Method: `deleteOrder(orderId)`
- **HTTP Method**: DELETE
- **Endpoint**: `/listings/orders/{orderId}/cancel/`
- **Use Case**: Customer cancelling their own orders
- **Parameters**: orderId only
- **Access**: Customer (order owner)

## When to Use Each Method

### Use `cancelOrder()` when:
- You're a dealer/admin cancelling an order
- You need to provide a cancellation reason
- You're in the admin/dealer dashboard

### Use `deleteOrder()` when:
- Customer wants to cancel their own order
- In customer-facing order list/details
- No reason required (optional on backend)

## Implementation Example

### In Order List Component
```javascript
import { useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import orderService from '../services/orderService';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await orderService.deleteOrder(orderId);
      
      toast({
        title: 'Order Cancelled',
        description: 'Your order has been cancelled successfully',
        status: 'success',
        duration: 3000,
      });

      // Refresh orders list
      fetchOrders();
    } catch (error) {
      toast({
        title: 'Cancellation Failed',
        description: error.message || 'Failed to cancel order',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          <h3>{order.title}</h3>
          <Button
            colorScheme="red"
            variant="outline"
            onClick={() => handleDeleteOrder(order.id)}
            isLoading={isDeleting}
            loadingText="Cancelling..."
          >
            Cancel Order
          </Button>
        </div>
      ))}
    </div>
  );
}
```

### In Order Details Component
```javascript
import { Button, useToast, useDisclosure } from '@chakra-ui/react';
import orderService from '../services/orderService';

function OrderDetails({ order }) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCancelOrder = async () => {
    setIsDeleting(true);
    try {
      await orderService.deleteOrder(order.id);
      
      toast({
        title: 'Order Cancelled',
        description: 'Your order has been cancelled successfully',
        status: 'success',
      });

      // Redirect to orders list
      navigate('/orders');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div>
      <h2>Order #{order.id}</h2>
      
      {/* Only show cancel button if order is cancellable */}
      {order.status === 'pending' && (
        <Button
          colorScheme="red"
          onClick={onOpen}
        >
          Cancel Order
        </Button>
      )}

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cancel Order</ModalHeader>
          <ModalBody>
            Are you sure you want to cancel this order?
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              No, Keep Order
            </Button>
            <Button
              colorScheme="red"
              onClick={handleCancelOrder}
              isLoading={isDeleting}
              ml={3}
            >
              Yes, Cancel Order
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
```

## API Response Format

### Success Response
```javascript
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "order_id": "order_123",
    "status": "cancelled",
    "cancelled_at": "2024-11-26T12:00:00Z"
  }
}
```

### Error Response
```javascript
{
  "error": true,
  "message": "Cannot cancel order that has already been shipped",
  "code": "ORDER_NOT_CANCELLABLE"
}
```

## Error Handling

### Common Errors

1. **Order Not Found**
```javascript
{
  "error": "Order not found",
  "status": 404
}
```

2. **Order Not Cancellable**
```javascript
{
  "error": "Cannot cancel order in current status",
  "status": 400
}
```

3. **Unauthorized**
```javascript
{
  "error": "You don't have permission to cancel this order",
  "status": 403
}
```

4. **Already Cancelled**
```javascript
{
  "error": "Order is already cancelled",
  "status": 400
}
```

## Best Practices

### 1. Confirm Before Deleting
Always ask for confirmation before cancelling an order:
```javascript
if (!window.confirm('Are you sure you want to cancel this order?')) {
  return;
}
```

### 2. Check Order Status
Only allow cancellation for certain statuses:
```javascript
const canCancel = ['pending', 'processing'].includes(order.status);

if (!canCancel) {
  toast({
    title: 'Cannot Cancel',
    description: 'This order cannot be cancelled',
    status: 'warning'
  });
  return;
}
```

### 3. Show Loading State
Disable button and show loading during cancellation:
```javascript
<Button
  onClick={handleCancel}
  isLoading={isDeleting}
  loadingText="Cancelling..."
  isDisabled={isDeleting}
>
  Cancel Order
</Button>
```

### 4. Refresh Data After Deletion
Update the UI after successful cancellation:
```javascript
await orderService.deleteOrder(orderId);
// Refresh orders list
fetchOrders();
// Or remove from local state
setOrders(orders.filter(o => o.id !== orderId));
```

## Testing

### Test Cases

1. **Successful Cancellation**
   - Create an order
   - Call `deleteOrder(orderId)`
   - Verify order status is "cancelled"
   - Verify success message shown

2. **Cannot Cancel Shipped Order**
   - Try to cancel shipped order
   - Verify error message shown
   - Verify order status unchanged

3. **Unauthorized Cancellation**
   - Try to cancel another user's order
   - Verify 403 error
   - Verify error message shown

4. **Order Not Found**
   - Call with invalid order ID
   - Verify 404 error
   - Verify error message shown

## Files Modified

- `src/services/orderService.js` - Added `deleteOrder` method

## Summary

✅ Added `deleteOrder` method to orderService
✅ Uses DELETE HTTP method
✅ Customer-facing endpoint
✅ Simple parameter (orderId only)
✅ Proper error handling
✅ Ready to use in components

---

**Status**: ✅ Complete

**Usage**: `await orderService.deleteOrder(orderId)`

**Endpoint**: `DELETE /api/v1/listings/orders/{order_id}/cancel/`
