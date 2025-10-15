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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  useMediaQuery,
  SimpleGrid,
  MenuList,
  MenuItem,
  Badge,
  Drawer, DrawerBody, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerOverlay,
} from '@chakra-ui/react'
import { LayoutDashboard, Wallet, Clock, PiggyBank, BarChart2, HelpCircle, Settings, Share2, MoreVertical, TrendingUp, Menu as MenuIcon, ArrowDownCircle, ArrowUpCircle, ReceiptText } from 'lucide-react'
import { PiHandDepositBold, PiHandWithdrawBold } from "react-icons/pi";
// import {MenuIcon} from '@chakra-ui/icons';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Overview', link: 'home'},
  { icon: ArrowDownCircle, label: 'Deposit', link: 'deposit'},
  { icon: ArrowUpCircle, label: 'Withdraw', link: 'withdraw'},
  { icon: ReceiptText, label: 'Transactions', link: 'transactions'},
 // { icon: PiggyBank, label: 'Savings', link: 'savings'},
]


function WalletLayout({ ...props }) {
  const {axios, notify, authUser, commaInt} = useContext(GlobalStore);
  const [wallet, setWallet] = useState({});
  const [navState, setNavState] = useState(false);
  const [showDepositModal, setDepositModalVisibility] = useState(false);
  const [isMobile] = useMediaQuery('(max-width: 800px)');

  async function getWallet(){
    const res = await axios.get('/wallet/');
    const data = objectifyJSON(res.data);
    console.log("Wallet:", data)
    setWallet(data?.data)
  }

  function init(){
    // getWallet();
    // setTimeout(() => setLoadingState(false), 2000);
  }

  function hideNav(){
    setNavState(false);
  }
  
  function showNav(){
    setNavState(true);
  }

  useEffect(() => {
    init();
  }, [])


  return (
    <Flex flexDirection={{base: 'column', lg: 'row'}} position="relative">
      {/* Sidebar */}
    {
      isMobile ? (
        <Drawer isOpen={navState} onClose={hideNav} placement="left">
          <DrawerOverlay />

          <DrawerContent>
            <DrawerHeader> <DrawerCloseButton /> </DrawerHeader>
            <DrawerBody>
              <Navigation wallet={wallet} authUser={authUser} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      ):(
        <Box
          w="280px"
          position="fixed"
          left="0"
          h="100vh"
          bgColor="#fff"
          zIndex="2"
          borderRightWidth={1}
          p={6}
          boxShadow="sm"
        >
          <Navigation wallet={wallet} authUser={authUser} />
        </Box>
      )
    }

      {/* Main Content */}
      <Box flex={1} ml={!isMobile && "280px"}>
        <Container maxW="container.xl" pb={10}>
          {isMobile && 
            <Box pt={2}>
              <Button onClick={showNav}> <MenuIcon size={18} /> </Button>
            </Box>
          }
          <Outlet />
        </Container>
      </Box>
    </Flex>

  )
}

export default WalletLayout;


const Navigation = ({ authUser, wallet}) => (
  <VStack align="stretch" spacing={6}>
    <HStack spacing={3}>
      <Avatar size="sm" name={`${authUser?.first_name} ${authUser?.last_name}`} />
      <Box flex={1}>
        <Text fontWeight="medium">{`${authUser?.first_name} ${authUser?.last_name}`}</Text>
        <Text fontSize="sm" color="gray.500">Pay ID: 4557321238</Text>
      </Box>
      <IconButton
        icon={<Share2 size={18} />}
        variant="ghost"
        size="sm"
        aria-label="Share"
      />
    </HStack>

    <Box borderWidth={1} borderRadius="lg" p={4} bg="gray.50">
      <Text fontSize="sm" color="gray.600">Current balance</Text>
      <Heading size="md">₦{wallet?.balance ? `${wallet.balance.toLocaleString()}` : '0'}</Heading>
    </Box>

    <VStack align="stretch" spacing={2}>
      {sidebarItems.map((item, index) => (
        <Button
          key={index}
          as={NavLink}
          leftIcon={<item.icon size={20} />}
          to={`${item.link}`}
          variant={'ghost'}
          justifyContent="start"
          borderRadius="md"
          _hover={{ bg: 'gray.50' }}
          _activeLink={{ bg: 'blue.50', color: 'blue.700', borderLeftWidth: 3, borderLeftColor: 'primary' }}
        >
          {item.label}
        </Button>
      ))}
    </VStack>
  </VStack>
)


