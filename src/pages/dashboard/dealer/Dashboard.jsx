import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { GlobalStore } from '../../../contexts/GlobalStore';
import { objectifyJSON, jsonifyObject } from '../../../utils';
import { DealerDashboardSideBar } from '../../../components/nav';
import { StatCard } from '../../../components/charts';
import { useDashboardError } from '../../../hooks/useDashboardError';
import { InlineError, EmptyStateError } from '../../../components/ErrorDisplay';
import {
  Box,
  Container,
  Flex,
  VStack,
  Image,
  HStack,
  Text,
  Heading,
  Button,
  Avatar,
  AvatarGroup,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  Badge,
  TableContainer,
  Stack,
  Skeleton,
  ButtonGroup,
  Select,
} from '@chakra-ui/react'
import { LayoutDashboard, Wallet, Clock, PiggyBank, BarChart2, HelpCircle, Settings, Share2, MoreVertical, TrendingUp } from 'lucide-react'
import { RiCoinsFill, RiCoinsLine } from "react-icons/ri";
import { PiHandDepositBold, PiHandWithdrawBold } from "react-icons/pi";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js';
import {
  MdSearch,
  MdHome,
  MdBarChart,
  MdPeople,
  MdSettings,
  MdMoreVert,
  MdFilterList,
  MdShare,
  MdMessage,
  MdNotifications,
  MdBolt,
  MdLock,
  MdLocationOn,
  MdKeyboardArrowDown,
  MdInventory,
  MdCalendarMonth,
  MdWarning,
} from "react-icons/md"
import { BsWallet2 } from "react-icons/bs"
import { StatusBadge } from '../../../components'
import { DealershipContext } from './Layout'



ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);



function Dashboard({ }) {
  const { axios, notify, authUser, commaInt } = useContext(GlobalStore);
  const { dealership } = useContext(DealershipContext);
  const [wallet, setWallet] = useState({});
  const [loading, setLoadingState] = useState(true);
  const [recentOrders, setRecentOrders] = useState([])
  const [dashboardData, setDashboardData] = useState({})
  const [chartData, setChartData] = useState({})
  const cardBg = 'white';
  const borderCol = 'gray.200';
  const tableHeadBg = 'gray.50';
  const [dateRange, setDateRange] = useState('30d');

  // Enhanced error handling
  const {
    error,
    clearError,
    executeWithErrorHandling,
    createRetryFunction,
    executeBatch
  } = useDashboardError('dealer dashboard');
  const formatCurrency = (value) => {
    return `₦${parseInt(value).toLocaleString()}`;
  };

  const formatNumber = (value) => {
    return parseFloat(value).toLocaleString();
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      x: { display: true },
      y: { display: true },
    },
  };

  function onSetRange(range) {
    setDateRange(range);
    getDashboardData();
  }

  function exportOrdersCsv() {
    const rows = [
      ['Car', 'Order Type', 'Price', 'Status', 'Client', 'Last Updated'],
      ...recentOrders.map(o => [
        o?.order_item?.vehicle?.name,
        o?.order_type,
        o?.order_item?.price,
        o?.order_status,
        o?.customer,
        o?.last_updated,
      ])
    ];
    const csv = rows.map(r => r.map(v => (v === undefined || v === null) ? '' : String(v).replace(/"/g, '""')).map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recent-orders.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function getWalletBalance() {
    return executeWithErrorHandling(
      async () => {
        try {
          const res = await axios.get('/wallet/balance/');
          const data = objectifyJSON(res.data);
          console.log("Wallet:", data);
          setWallet(data?.data || {});
          return data;
        } catch (err) {
          // If wallet doesn't exist (404), return default empty wallet
          if (err.response && err.response.status === 404) {
            console.log("Wallet not found, using default empty wallet");
            const defaultWallet = { balance: 0, currency: 'NGN' };
            setWallet(defaultWallet);
            return { data: defaultWallet };
          }
          throw err;
        }
      },
      {
        customContext: 'loading wallet balance',
        showNotification: false // We'll handle this at the batch level
      }
    );
  }

  async function getDashboardData() {
    return executeWithErrorHandling(
      async () => {
        const res = await axios.get('/admin/dealership/dashboard/');
        const data = objectifyJSON(res.data);
        const payload = data?.data || {};
        setDashboardData(payload);
        setChartData(payload?.chart_data || null);
        console.log("Chart Data:", payload?.chart_data);
        setRecentOrders(Array.isArray(payload?.recent_orders) ? payload.recent_orders : []);
        return payload;
      },
      {
        customContext: 'loading dashboard data',
        showNotification: false
      }
    );
  }

  async function getWalletTransactions() {
    return executeWithErrorHandling(
      async () => {
        try {
          const res = await axios.get('/wallet/transactions/');
          const data = objectifyJSON(res.data);
          return data;
        } catch (err) {
          // If wallet doesn't exist (404), return empty transactions list
          if (err.response && err.response.status === 404) {
            return { data: [] };
          }
          throw err;
        }
      },
      {
        customContext: 'loading wallet transactions',
        showNotification: false
      }
    );
  }

  async function init() {
    setLoadingState(true);
    clearError(); // Clear any previous errors

    try {
      await executeBatch([
        getWalletBalance,
        getWalletTransactions,
        getDashboardData
      ], {
        continueOnError: true, // Continue loading other data even if one fails
        customContext: 'initializing dashboard',
        onPartialSuccess: (results, errors) => {
          console.log('Dashboard loaded with some errors:', { results, errors });
        }
      });
    } catch (error) {
      // Errors are handled by executeBatch
      console.error('Dashboard initialization failed:', error);
    } finally {
      setLoadingState(false);
    }
  }

  // Create retry function for failed operations
  const retryInit = createRetryFunction(
    async () => {
      await init();
    },
    {
      maxRetries: 2,
      customContext: 'retrying dashboard load'
    }
  );

  useEffect(() => {
    init();

  }, [])

  if (loading) {
    return (
      <Box w={'100%'}>
        <Box py={6} borderBottom={`2px solid ${borderCol}`}>
          <Skeleton height='20px' width='180px' mb={2} />
          <Skeleton height='14px' width='260px' />
        </Box>

        <SimpleGrid gap={4} my={5} minChildWidth={'250px'}>
          {[1, 2, 3].map((i) => (
            <Box key={i} p={5} borderWidth={1} borderColor={borderCol} borderRadius='xl' bg={cardBg} boxShadow='sm'>
              <Skeleton height='14px' width='40%' mb={2} />
              <Skeleton height='28px' width='60%' />
            </Box>
          ))}
        </SimpleGrid>

        <Box py={4} my={5}>
          <Skeleton height='20px' width='200px' mb={3} />
          <Box h={'300px'} borderWidth={1} borderColor={borderCol} borderRadius='xl' bg={cardBg} boxShadow='sm' p={3}>
            <Skeleton height='100%' />
          </Box>
        </Box>

        <Skeleton height='20px' width='180px' mb={3} />
        <TableContainer w={'100%'} borderWidth={1} borderRadius='lg' borderColor={borderCol} bg={cardBg} boxShadow='sm'>
          <Table>
            <Thead bg={tableHeadBg}>
              <Tr>
                <Th>Listings</Th>
                <Th>Amount</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th>Client</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {[...Array(5)].map((_, idx) => (
                <Tr key={idx}>
                  {[...Array(6)].map((__, jdx) => (
                    <Td key={jdx}><Skeleton height='16px' /></Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    )
  }

  return (
    <Box w={'100%'}>
      {/* Error Display */}
      {error && (
        <InlineError
          error={error}
          onRetry={retryInit}
          onDismiss={clearError}
          showDetails={true}
        />
      )}

      <Box py={6} borderBottom={`2px solid ${borderCol}`}>
        <Flex justify="space-between" align="center">
          <Box>
            <Text size="md" className="text" fontWeight="600">Dashboard</Text>
            <Text size="xs" className="small">Welcome back, {authUser?.first_name}👋</Text>
          </Box>
          <Button
            leftIcon={<Share2 size={16} />}
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={() => {
              const profileUrl = `${window.location.origin}/dealership/${authUser?.slug || authUser?.id}`;
              if (navigator.share) {
                navigator.share({
                  title: 'My Dealership Profile',
                  text: `Check out my dealership on Veyu`,
                  url: profileUrl,
                });
              } else {
                navigator.clipboard.writeText(profileUrl);
                alert('Profile link copied to clipboard!');
              }
            }}
          >
            Share Profile
          </Button>
        </Flex>
      </Box>

      <SimpleGrid gap={4} direction={'row'} flexWrap={'wrap'} my={5} minChildWidth={'250px'}>

        <Box as={StatCard}
          borderWidth={1} borderRadius='xl' bg={cardBg} boxShadow='md' borderColor={borderCol}
          title={"Revenue"}
          value={dashboardData?.total_revenue}
          // change={10}
          // data={sparklineData.revenue}
          format={formatCurrency}
        />
        <Box as={StatCard}
          borderWidth={1} borderRadius='xl' bg={cardBg} boxShadow='md' borderColor={borderCol}
          title={"Impressions"}
          value={dashboardData?.impressions}
          // change={-2}
          // data={sparklineData.impressions}
          format={(v) => {
            if (v > 1000) {
              return `${(parseInt(v) / 1000).toFixed(3)}K`
            } else {
              return `${(parseInt(v))}`
            }
          }}
        />
        <Box as={StatCard}
          borderWidth={1} borderRadius='xl' bg={cardBg} boxShadow='md' borderColor={borderCol}
          title={"Total Deals"}
          value={dashboardData?.total_deals}
          // change={14}
          // data={sparklineData.deals}
          format={formatNumber}
        />
      </SimpleGrid>

      <Box py={4} my={5}>
        <Flex justify="space-between" align="center" mb={2}>
          <Heading size={'sm'} fontWeight="500"> Revenue Earnings </Heading>
          <ButtonGroup size="sm" isAttached>
            <Button variant={dateRange === '7d' ? 'solid' : 'outline'} colorScheme={dateRange === '7d' ? 'blue' : undefined} onClick={() => onSetRange('7d')}>7d</Button>
            <Button variant={dateRange === '30d' ? 'solid' : 'outline'} colorScheme={dateRange === '30d' ? 'blue' : undefined} onClick={() => onSetRange('30d')}>30d</Button>
            <Button variant={dateRange === '90d' ? 'solid' : 'outline'} colorScheme={dateRange === '90d' ? 'blue' : undefined} onClick={() => onSetRange('90d')}>90d</Button>
          </ButtonGroup>
        </Flex>
        <Box h={'300px'} borderWidth={1} borderColor={borderCol} borderRadius='xl' bg={cardBg} boxShadow='sm' p={3}>
          {Array.isArray(chartData?.datasets) && chartData.datasets.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <Flex align="center" justify="center" h="100%" color="gray.500">No chart data</Flex>
          )}
        </Box>
      </Box>

      {/* Transactions */}
      <Flex justify="space-between" align="center" mb={2}>
        <Heading size="sm" fontWeight="500"> Recent Orders </Heading>
        <ButtonGroup size="sm">
          <Button variant="outline" onClick={exportOrdersCsv}>Export CSV</Button>
          <Button colorScheme="blue" variant="solid" onClick={init}>Refresh</Button>
        </ButtonGroup>
      </Flex>
      <TableContainer w={'100%'} variant="simple" borderWidth={1} borderRadius="lg" borderColor={borderCol} bg={cardBg} boxShadow='sm'>
        {error && !loading ? (
          <EmptyStateError
            error={error}
            onRetry={retryInit}
            title="Unable to load recent orders"
            description="There was a problem loading your recent orders data."
          />
        ) : (!recentOrders || recentOrders.length === 0) ? (
          <Box p={8} textAlign="center">
            <Text color="gray.600">No recent orders yet.</Text>
          </Box>
        ) : (
          <Table variant="simple" textWrap="nowrap" overflow="auto">
            <Thead bg={tableHeadBg}>
              <Tr>
                <Th columns={5}> Listings</Th>
                <Th>Amount</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th>Client</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {recentOrders?.map((order) => (
                <Tr key={order?.uuid || Math.random()}>
                  <Td columns={5}>
                    <Flex gap={1} align="center">
                      <Image
                        src={order?.order_item?.vehicle?.images?.[0]?.url || '/assets/images/app_icon.jpg'}
                        alt={order?.order_item?.vehicle?.name || 'Vehicle'}
                        boxSize="70px"
                        objectFit="cover"
                        borderRadius="md"
                        mr={3}
                      />
                      <Box>
                        <Text fontWeight="medium">{order?.order_item?.vehicle?.name || 'Untitled listing'}</Text>
                        <Text color="gray.700" fontWeight="medium">
                          {order?.order_type || 'N/A'}
                        </Text>
                      </Box>
                    </Flex>
                  </Td>
                  <Td>
                    <Text color="green.500" fontWeight="medium">
                      {order?.order_item?.price ? `${(order.order_item.price / 10 ** 6).toFixed(2)}M` : '—'}
                    </Text>
                  </Td>
                  <Td>
                    <Text>{order?.last_updated ? new Date(order.last_updated).toLocaleDateString() : '—'}</Text>
                    <Text color="gray.500" fontSize="sm">
                      {order?.last_updated ? new Date(order.last_updated).toLocaleTimeString() : ''}
                    </Text>
                  </Td>
                  <Td>
                    <StatusBadge status={order?.order_status || 'unknown'} />
                  </Td>
                  <Td>
                    <Avatar size="sm" name={order?.customer || 'Customer'} />
                  </Td>
                  <Td>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </TableContainer>
    </Box>
  )
}

export default Dashboard;

