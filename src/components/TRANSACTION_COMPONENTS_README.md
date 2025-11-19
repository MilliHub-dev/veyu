# Transaction History Components

This document describes the transaction history components created for the wallet system.

## Components Overview

### 1. TransactionList
Main component that displays transactions in a card layout with optional filtering and pagination.

**Props:**
- `transactions` (array): Array of transaction objects
- `isLoading` (boolean): Loading state indicator
- `onFilterChange` (function): Callback when filters are applied
- `showFilters` (boolean): Whether to show filter controls (default: true)
- `initialFilters` (object): Initial filter values
- `pagination` (object): Pagination configuration
- `onPageChange` (function): Callback when page changes
- `onItemsPerPageChange` (function): Callback when items per page changes

**Features:**
- Card-based transaction display
- Transaction type icons and colors (deposit, withdrawal, transfer)
- Status badges (completed, pending, failed)
- Click to view detailed transaction modal
- Responsive design

### 2. TransactionFilters
Provides filtering controls for the transaction list.

**Props:**
- `onFilterChange` (function): Callback when filters are applied
- `initialFilters` (object): Initial filter values

**Features:**
- Filter by transaction type (deposit, withdrawal, transfer)
- Filter by status (completed, pending, failed)
- Filter by date range (from/to dates)
- Collapsible filter panel
- Active filters summary
- Clear all filters button

### 3. TransactionPagination
Pagination controls for the transaction list.

**Props:**
- `currentPage` (number): Current page number
- `totalPages` (number): Total number of pages
- `totalItems` (number): Total number of items
- `itemsPerPage` (number): Items per page
- `onPageChange` (function): Callback when page changes
- `onItemsPerPageChange` (function): Callback when items per page changes

**Features:**
- First/previous/next/last page navigation
- Page number buttons with smart display
- Items per page selector (10, 20, 50, 100)
- Items range display (e.g., "Showing 1-10 of 50")

### 4. TransactionHistory
Complete page component that integrates all transaction components with API calls.

**Features:**
- Fetches transactions from API
- Manages filter and pagination state
- Handles loading and error states
- Auto-refresh on filter/pagination changes

## Usage Examples

### Basic Usage (No Filtering or Pagination)

```jsx
import TransactionList from './components/TransactionList';

function MyComponent() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch transactions
    walletService.getTransactions().then(response => {
      setTransactions(response.data);
      setIsLoading(false);
    });
  }, []);

  return (
    <TransactionList
      transactions={transactions}
      isLoading={isLoading}
      showFilters={false}
    />
  );
}
```

### With Filtering

```jsx
import TransactionList from './components/TransactionList';

function MyComponent() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleFilterChange = (filters) => {
    setIsLoading(true);
    walletService.getTransactions(filters).then(response => {
      setTransactions(response.data);
      setIsLoading(false);
    });
  };

  return (
    <TransactionList
      transactions={transactions}
      isLoading={isLoading}
      onFilterChange={handleFilterChange}
      showFilters={true}
    />
  );
}
```

### With Filtering and Pagination

```jsx
import TransactionList from './components/TransactionList';

function MyComponent() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const fetchTransactions = (page, limit, filters) => {
    setIsLoading(true);
    walletService.getTransactions({ page, limit, ...filters }).then(response => {
      setTransactions(response.data.results);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(response.data.count / limit),
        totalItems: response.data.count,
        itemsPerPage: limit,
      });
      setIsLoading(false);
    });
  };

  const handleFilterChange = (filters) => {
    fetchTransactions(1, pagination.itemsPerPage, filters);
  };

  const handlePageChange = (newPage) => {
    fetchTransactions(newPage, pagination.itemsPerPage, {});
  };

  const handleItemsPerPageChange = (newLimit) => {
    fetchTransactions(1, newLimit, {});
  };

  return (
    <TransactionList
      transactions={transactions}
      isLoading={isLoading}
      onFilterChange={handleFilterChange}
      showFilters={true}
      pagination={pagination}
      onPageChange={handlePageChange}
      onItemsPerPageChange={handleItemsPerPageChange}
    />
  );
}
```

### Using the Complete TransactionHistory Component

```jsx
import TransactionHistory from './components/TransactionHistory';

function WalletPage() {
  return (
    <Box>
      <TransactionHistory />
    </Box>
  );
}
```

## Transaction Data Structure

```javascript
{
  id: "txn_123456",
  type: "deposit" | "withdrawal" | "transfer",
  amount: 5000.00,
  currency: "NGN",
  status: "completed" | "pending" | "failed",
  description: "Wallet deposit",
  reference: "REF123456",
  created_at: "2024-01-15T10:30:00Z",
  completed_at: "2024-01-15T10:31:00Z",
  recipient: {  // For transfers
    id: "user_789",
    name: "John Doe",
    email: "john@example.com"
  },
  sender: {  // For received transfers
    id: "user_456",
    name: "Jane Smith",
    email: "jane@example.com"
  }
}
```

## API Integration

The components expect the wallet service to provide:

```javascript
// Get transactions with optional filters and pagination
walletService.getTransactions({
  page: 1,
  limit: 10,
  type: 'deposit',
  status: 'completed',
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31'
})
```

**Expected Response:**

```javascript
{
  success: true,
  data: {
    results: [...transactions],
    count: 50,
    next: "url_to_next_page",
    previous: "url_to_previous_page"
  }
}
```

Or for non-paginated:

```javascript
{
  success: true,
  data: [...transactions]
}
```

## Styling

All components use Chakra UI for styling and are fully responsive. They follow the existing design system with:
- Card-based layouts
- Color-coded transaction types (green for deposits, orange for withdrawals, blue for transfers)
- Status badges with appropriate colors
- Mobile-first responsive design

## Requirements Covered

This implementation covers the following requirements from the spec:

- **Requirement 7.1**: Display transactions in reverse chronological order
- **Requirement 7.2**: Filter by transaction type
- **Requirement 7.3**: Filter by date range
- **Requirement 7.4**: Pagination support
- **Requirement 7.5**: Detailed transaction information display
