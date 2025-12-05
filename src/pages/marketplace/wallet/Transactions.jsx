

import {useState, useEffect, useContext} from 'react';
import {Link, NavLink, Outlet} from 'react-router-dom';
import {GlobalStore} from '../../../App';
import {objectifyJSON, jsonifyObject} from '../../../utils';
import {
  Box,
  Container,
  Flex,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Avatar,
  AvatarGroup,
  Progress,
  Tag,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  SimpleGrid,
  MenuList,
  MenuItem,
  Badge,
  Select,
  Input,
  Spinner,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  Divider,
} from '@chakra-ui/react'
import { LayoutDashboard, Wallet, Clock, PiggyBank, BarChart2, HelpCircle, Settings, Share2, MoreVertical, TrendingUp, Filter, Download, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react'
import { RiCoinsFill, RiCoinsLine } from "react-icons/ri";
import { LuChartLine } from "react-icons/lu";
import { GiHomeGarage } from "react-icons/gi";
import { AiOutlineTransaction } from "react-icons/ai";
import { PiHandDepositBold, PiHandWithdrawBold } from "react-icons/pi";
import {PaystackPaymentModal} from '../../../components/wallet';

function WalletTransactionsPage() {
  const {axios, notify, authUser, commaInt} = useContext(GlobalStore);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0, has_more: false });
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    source: '',
    start_date: '',
    end_date: '',
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderCol = useColorModeValue('gray.200', 'gray.700');

  async function getWalletTransactions(){
    try{
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.source) params.append('source', filters.source);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      params.append('limit', pagination.limit);
      params.append('offset', pagination.offset);

      const res = await axios.get(`/wallet/transactions/?${params.toString()}`);
      const data = objectifyJSON(res.data);
      
      setTransactions(data?.transactions || []);
      setSummary(data?.summary || null);
      setPagination(data?.pagination || { total: 0, limit: 50, offset: 0, has_more: false });
    }catch(error){
      notify({
        title: "Oops! An error occurred.",
        body: error?.response?.data?.error || error.message,
        color: 'red'
      })
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, offset: 0 })); // Reset to first page
  }

  function handleNextPage() {
    if (pagination.has_more) {
      setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
    }
  }

  function handlePrevPage() {
    if (pagination.offset > 0) {
      setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }));
    }
  }

  function resetFilters() {
    setFilters({
      type: '',
      status: '',
      source: '',
      start_date: '',
      end_date: '',
    });
    setPagination(prev => ({ ...prev, offset: 0 }));
  }

  function getTransactionIcon(type) {
    const typeMap = {
      deposit: <ArrowDownCircle size={20} color="green" />,
      withdraw: <ArrowUpCircle size={20} color="red" />,
      transfer_in: <ArrowDownCircle size={20} color="blue" />,
      transfer_out: <ArrowUpCircle size={20} color="orange" />,
      payment: <ArrowUpCircle size={20} color="purple" />,
      charge: <ArrowUpCircle size={20} color="gray" />,
    };
    return typeMap[type] || <AiOutlineTransaction size={20} />;
  }

  function getStatusColor(status) {
    const colorMap = {
      completed: 'green',
      pending: 'yellow',
      failed: 'red',
      reversed: 'orange',
      locked: 'gray',
    };
    return colorMap[status] || 'gray';
  }

  function init(){
    getWalletTransactions();
  }

  useEffect(() => {
    init();
  }, [filters, pagination.offset])

  return (
    <Box>
      <Box py={6} mb={3}>
        <HStack justify="space-between" align="center">
          <Heading size="md" className="text" fontWeight="600">Transaction History</Heading>
          <Button leftIcon={<RefreshCw size={16} />} onClick={init} size="sm" variant="outline">
            Refresh
          </Button>
        </HStack>
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4} mb={6}>
          <GridItem>
            <Box p={4} borderWidth={1} borderRadius="lg" bg={cardBg} borderColor={borderCol}>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600">Total Deposits</StatLabel>
                <StatNumber fontSize="xl" color="green.500">₦{commaInt(summary.total_deposits)}</StatNumber>
              </Stat>
            </Box>
          </GridItem>
          <GridItem>
            <Box p={4} borderWidth={1} borderRadius="lg" bg={cardBg} borderColor={borderCol}>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600">Total Withdrawals</StatLabel>
                <StatNumber fontSize="xl" color="red.500">₦{commaInt(summary.total_withdrawals)}</StatNumber>
              </Stat>
            </Box>
          </GridItem>
          <GridItem>
            <Box p={4} borderWidth={1} borderRadius="lg" bg={cardBg} borderColor={borderCol}>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600">Total Payments</StatLabel>
                <StatNumber fontSize="xl" color="purple.500">₦{commaInt(summary.total_payments)}</StatNumber>
              </Stat>
            </Box>
          </GridItem>
          <GridItem>
            <Box p={4} borderWidth={1} borderRadius="lg" bg={cardBg} borderColor={borderCol}>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600">Current Balance</StatLabel>
                <StatNumber fontSize="xl" color="blue.500">₦{commaInt(summary.current_balance)}</StatNumber>
              </Stat>
            </Box>
          </GridItem>
        </Grid>
      )}

      {/* Filters */}
      <Box p={4} borderWidth={1} borderRadius="lg" bg={cardBg} borderColor={borderCol} mb={4}>
        <HStack mb={3} align="center">
          <Filter size={18} />
          <Text fontWeight="600">Filters</Text>
        </HStack>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }} gap={3}>
          <Select 
            placeholder="All Types" 
            value={filters.type} 
            onChange={(e) => handleFilterChange('type', e.target.value)}
            size="sm"
          >
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
            <option value="transfer_in">Transfer In</option>
            <option value="transfer_out">Transfer Out</option>
            <option value="payment">Payment</option>
            <option value="charge">Charge</option>
          </Select>

          <Select 
            placeholder="All Status" 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
            size="sm"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="reversed">Reversed</option>
            <option value="locked">Locked</option>
          </Select>

          <Select 
            placeholder="All Sources" 
            value={filters.source} 
            onChange={(e) => handleFilterChange('source', e.target.value)}
            size="sm"
          >
            <option value="wallet">Wallet</option>
            <option value="bank">Bank</option>
          </Select>

          <Input 
            type="date" 
            placeholder="Start Date" 
            value={filters.start_date}
            onChange={(e) => handleFilterChange('start_date', e.target.value)}
            size="sm"
          />

          <Input 
            type="date" 
            placeholder="End Date" 
            value={filters.end_date}
            onChange={(e) => handleFilterChange('end_date', e.target.value)}
            size="sm"
          />
        </Grid>
        <HStack mt={3}>
          <Button size="sm" onClick={resetFilters} variant="ghost" colorScheme="blue">
            Clear Filters
          </Button>
        </HStack>
      </Box>

      {/* Transactions Table */}
      {loading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="blue.500" />
          <Text mt={4} color="gray.600">Loading transactions...</Text>
        </Box>
      ) : transactions.length === 0 ? (
        <Box textAlign="center" py={10} borderWidth={1} borderRadius="lg" bg={cardBg}>
          <AiOutlineTransaction size={48} style={{ margin: '0 auto', color: 'gray' }} />
          <Text mt={4} fontSize="lg" fontWeight="600">No transactions found</Text>
          <Text color="gray.600">Try adjusting your filters or make your first transaction</Text>
        </Box>
      ) : (
        <>
          <TableContainer borderWidth={1} borderRadius="lg" bg={cardBg} borderColor={borderCol}>
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Transaction</Th>
                  <Th>Type</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th>Reference</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {transactions.map((transaction) => (
                  <Tr key={transaction.id}>
                    <Td>
                      <HStack>
                        <Box>{getTransactionIcon(transaction.type)}</Box>
                        <Box>
                          <Text fontWeight="medium" fontSize="sm">
                            {transaction.transaction_direction === 'Incoming' 
                              ? transaction.sender_name || transaction.sender_email
                              : transaction.recipient_name || transaction.recipient_email}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {transaction.narration || 'No description'}
                          </Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Tag size="sm" colorScheme={transaction.type === 'deposit' || transaction.type === 'transfer_in' ? 'green' : 'red'}>
                          {transaction.type_display || transaction.type}
                        </Tag>
                        <Text fontSize="xs" color="gray.500">{transaction.source_display || transaction.source}</Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text
                        color={transaction.transaction_direction === 'Incoming' ? 'green.500' : 'red.500'}
                        fontWeight="600"
                        fontSize="md"
                      >
                        {transaction.transaction_direction === 'Incoming' ? '+' : '-'}
                        ₦{commaInt(transaction.amount)}
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(transaction.status)}>
                        {transaction.status_display || transaction.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{new Date(transaction.date_created).toLocaleDateString()}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(transaction.date_created).toLocaleTimeString()}
                      </Text>
                      {transaction.days_old !== undefined && (
                        <Text fontSize="xs" color="gray.400">{transaction.days_old} days ago</Text>
                      )}
                    </Td>
                    <Td>
                      <Text fontSize="xs" color="gray.600">{transaction.tx_ref || 'N/A'}</Text>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<MoreVertical size={16} />} variant="ghost" size="sm" />
                        <MenuList>
                          <MenuItem icon={<Download size={14} />}>Download receipt</MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <HStack justify="space-between" mt={4} p={4} borderWidth={1} borderRadius="lg" bg={cardBg}>
            <Text fontSize="sm" color="gray.600">
              Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} transactions
            </Text>
            <HStack>
              <Button 
                size="sm" 
                onClick={handlePrevPage} 
                isDisabled={pagination.offset === 0}
                variant="outline"
              >
                Previous
              </Button>
              <Button 
                size="sm" 
                onClick={handleNextPage} 
                isDisabled={!pagination.has_more}
                colorScheme="blue"
              >
                Next
              </Button>
            </HStack>
          </HStack>
        </>
      )}
    </Box>
  )
}

export default WalletTransactionsPage;
