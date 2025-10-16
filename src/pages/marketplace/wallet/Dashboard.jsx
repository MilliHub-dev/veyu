

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
  useColorModeValue,
} from '@chakra-ui/react'
import { LayoutDashboard, Wallet, Clock, PiggyBank, BarChart2, HelpCircle, Settings, Share2, MoreVertical, TrendingUp } from 'lucide-react'
import { RiCoinsFill, RiCoinsLine } from "react-icons/ri";
import { LuChartLine } from "react-icons/lu";
import { GiHomeGarage } from "react-icons/gi";
import { AiOutlineTransaction } from "react-icons/ai";
import { PiHandDepositBold, PiHandWithdrawBold } from "react-icons/pi";
import {FlutterwavePaymentModal} from '../../../components/wallet';

function WalletHomePage() {
  const {axios, notify, authUser, commaInt} = useContext(GlobalStore);
  const [wallet, setWallet] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [showDepositModal, setDepositModalVisibility] = useState(false);
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderCol = useColorModeValue('gray.200', 'gray.700');
  const tableHeadBg = useColorModeValue('gray.50', 'gray.700');

  async function getWalletBalance(){
    const res = await axios.get('/wallet/balance/');
    const data = objectifyJSON(res.data);
    console.log("Wallet:", data)
    setWallet(data?.data)
  }

  async function getWalletTransactions(){
    try{
      const res = await axios.get('/wallet/transactions/');
      const data = objectifyJSON(res.data);
      setTransactions(data?.transactions);
    }catch(error){
      notify({
        title: "Oops! An error occurred.",
        body: error.message,
      })
    }
  }

  function init(){
    getWalletBalance();
    getWalletTransactions();
    // setTimeout(() => setLoadingState(false), 2000);
  }

  useEffect(() => {
    init();
  }, [])

  const inflow = (transactions || [])
    .filter(t => String(t?.type).toLowerCase() === 'deposit')
    .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);
  const outflow = (transactions || [])
    .filter(t => String(t?.type).toLowerCase() !== 'deposit')
    .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

  return (
    <Box>
      <VStack align="stretch" spacing={6} my={6}>
        <HStack justify="space-between" align="center">
          <HStack>
            <Wallet />
            <Heading size="md">Wallet</Heading>
          </HStack>
          <HStack spacing={2}>
            <Box as={Link} to='/wallet/deposit/'>
              <Button leftIcon={<PiHandDepositBold />} colorScheme="blue" bgColor="primary">Deposit</Button>
            </Box>
            <Box as={Link} to='/wallet/withdraw/'>
              <Button leftIcon={<PiHandWithdrawBold />} variant="outline" colorScheme="blue">Withdraw</Button>
            </Box>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={5}>
          <Box borderWidth={1} borderRadius="xl" p={6} bg={cardBg} borderColor={borderCol} boxShadow="md">
            <Text color="gray.600">Current Balance</Text>
            <Heading size="2xl" my={2}>₦{commaInt(wallet?.balance)}</Heading>
            <HStack color="green.500" mb={4}>
              <TrendingUp size={16} />
              <Text>+26% vs last month</Text>
            </HStack>
            <HStack spacing={3} flexWrap="wrap">
              
              <Box as={Link} to='/wallet/transactions/'>
                <Button variant="outline" colorScheme="blue">Transactions</Button>
              </Box>
            </HStack>
          </Box>

          <Box borderWidth={1} borderRadius="xl" p={6} bg={cardBg} borderColor={borderCol} boxShadow="sm">
            <Text color="gray.600" mb={2}>Inflow</Text>
            <Heading size="lg" color="green.500">₦{commaInt(inflow)}</Heading>
            <Text mt={2} color="gray.500">Total deposits</Text>
          </Box>

          <Box borderWidth={1} borderRadius="xl" p={6} bg={cardBg} borderColor={borderCol} boxShadow="sm">
            <Text color="gray.600" mb={2}>Outflow</Text>
            <Heading size="lg" color="red.500">₦{commaInt(outflow)}</Heading>
            <Text mt={2} color="gray.500">Payments and withdrawals</Text>
          </Box>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
          <Box
            px={6}
            py={6}
            minH={'100px'}
            bg="primary"
            color="white"
            borderRadius="15px"
            backgroundImage={`url('')`}
            backgroundRepeat={'no-repeat'}
            backgroundSize="contain"
            backgroundPosition="bottom"
            boxShadow="sm"
          >
           
            <Text fontSize="lg" fontWeight="medium">
              Invite your friends to Veyu and get up to 3% cashback on payments with wallet.
            </Text>
          </Box>

          <Box borderWidth={1} borderRadius="xl" p={6} bg={cardBg} borderColor={borderCol} boxShadow="sm">
            <Heading size="sm" mb={4}>Quick Shortcuts</Heading>
            <HStack spacing={3} flexWrap="wrap">
              <Box as={Link} to='/rent'>
                <Button variant="ghost" leftIcon={<GiHomeGarage />}>Rent a vehicle</Button>
              </Box>
              <Box as={Link} to='/buy'>
                <Button variant="ghost" leftIcon={<LuChartLine />}>Buy a vehicle</Button>
              </Box>
              <Box as={Link} to='/mechanics'>
                <Button variant="ghost" leftIcon={<HelpCircle />}>Find a mechanic</Button>
              </Box>
            </HStack>
          </Box>
        </SimpleGrid>

        <Heading size="sm">Recent Transactions</Heading>
        <TableContainer borderWidth={1} borderRadius="lg" bg={cardBg} borderColor={borderCol} boxShadow="sm">
          <Table variant="simple">
            <Thead bg={tableHeadBg}>
              <Tr>
                <Th>Party</Th>
                <Th>Amount</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {(transactions || []).map((transaction) => (
                <Tr key={transaction.id}>
                  <Td>
                    <HStack>
                      <Avatar size="sm" name={transaction.sender} />
                      <Box>
                        <Text fontWeight="medium">{transaction.sender}</Text>
                        <Tag fontSize="sm" textTransform={'capitalize'} colorScheme={String(transaction?.type).toLowerCase() === 'deposit' ? 'green' : 'red'}>
                          {transaction.type}
                        </Tag>
                      </Box>
                    </HStack>
                  </Td>
                  <Td>
                    <Text color={String(transaction?.type).toLowerCase() === 'deposit' ? 'green.500' : 'red.500'} fontWeight="medium">
                      ₦{commaInt(transaction.amount)}
                    </Text>
                  </Td>
                  <Td>
                    <Text>{transaction.date}</Text>
                    <Text fontSize="sm" color="gray.500">{new Date(transaction.date_created).toLocaleDateString()}</Text>
                  </Td>
                  <Td>
                    <Badge colorScheme="green">{transaction.status}</Badge>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton as={IconButton} icon={<MoreVertical size={16} />} variant="ghost" size="sm" />
                      <MenuList>
                        <MenuItem>View details</MenuItem>
                        <MenuItem>Download receipt</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
    </Box>
  )
}

export default WalletHomePage;
