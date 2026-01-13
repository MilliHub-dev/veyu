import {useState, useEffect, useContext, createContext, Fragment,} from 'react';
import {Link, Routes, Route, Outlet, useLocation} from 'react-router-dom';
import {GlobalStore} from '../../../App';
import {objectifyJSON, jsonifyObject} from '../../../utils';
import {DealerDashboardSideBar, DealerNavbar, UnauthenticatedNavbar} from '../../../components/nav';
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
  MenuList,
  MenuItem,
  Badge,
  Stack,
  useMediaQuery,
  Skeleton,
} from '@chakra-ui/react'
import { LayoutDashboard, Wallet, Clock, PiggyBank, BarChart2, HelpCircle, Settings, Share2, MoreVertical, TrendingUp } from 'lucide-react'
import { RiCoinsFill, RiCoinsLine } from "react-icons/ri";
import {MdWarning,} from "react-icons/md";
import { PiHandDepositBold, PiHandWithdrawBold } from "react-icons/pi";
import {VerificationNotice} from '../../../components';
import Dashboard from './Dashboard';


export const DealershipContext = createContext({
  dealership: null,
})

function DealerDashboardLayout({children, hideSidebar, ...props}) {
  const {axios, notify, authUser, commaInt} = useContext(GlobalStore);
  const [sidebarOpen, setSidebarState] = useState(false);
  const [loading, setLoadingState] = useState(true);
  const [dealership, setDealership] = useState({
    uuid: '',

  });
  const [isMobile] = useMediaQuery('(max-width: 768px)');

  async function init(){
    setLoadingState(true)
    // get the dealership
    try{
      const res = await axios.get(`/admin/dealership/`);
      const data = objectifyJSON(res.data);

      if (res?.status === 200){
        setDealership(data.data);
        console.log("Dealership:", data.data)
      }

      setLoadingState(false)

    }catch(error){
      console.log("error getting dealership:", error)
      setLoadingState(false)
    }
  }



  useEffect(() => {
    init();

  }, [])

  if (loading){
    return (
      <Stack>
        <Box py={4} px={6} borderBottom="1px solid #e2e8f0">
          <Skeleton height="24px" width="180px" mb={2} />
          <Skeleton height="14px" width="240px" />
        </Box>
        <Flex minH="100vh">
          <Box w="280px" p={6} display={{ base: 'none', md: 'block' }}>
            <Skeleton height="20px" mb={4} />
            <Skeleton height="20px" mb={4} />
            <Skeleton height="20px" mb={4} />
          </Box>
          <Box flex={1} p={6}>
            <Skeleton height="28px" width="220px" mb={4} />
            <Skeleton height="200px" borderRadius="lg" />
          </Box>
        </Flex>
      </Stack>
    )
  }

  const context = {
    dealership,
    refreshDealership: init, // Expose refresh function to allow components to trigger a refresh
  }

  return (
    <DealershipContext.Provider value={context}>
    <Stack>
      <DealerNavbar sidebarOpen={sidebarOpen} setSidebarState={setSidebarState} hideSidebar={hideSidebar} dealership={dealership} />

      <Flex minH="100vh" position="relative">
        <Fragment>
          <DealerDashboardSideBar
           dealership={dealership}
           sidebarOpen={sidebarOpen}
           onClose={() => setSidebarState(false)}
           setSidebarState={setSidebarState}
           // display={hideSidebar && 'none'}
           mode={hideSidebar ? 'drawer' : 'block'}
          />

          <Box
           flex={{ md: 1 }}
           w={isMobile ? '100%' : hideSidebar ? '100%' : "calc(100% - 280px)"}
           ml={isMobile ? '0px' : hideSidebar ? '0px' : "280px"}
           bg="gray.50"
           color="black"
          >
            <Container pb={10} maxW="container.xl" color="black">
              <Box
                bg="white"
                borderWidth={1}
                borderColor="gray.200"
                borderRadius="xl"
                boxShadow="sm"
                p={4}
                mt={6}
                mb={4}
              >
                <Flex align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
                  <HStack flex={1} align="center" spacing={4}>
                    <Avatar size="lg" src={dealership?.logo} name={`${dealership?.business_name}`} />
                    <Box>
                      <Heading size="sm">{dealership?.business_name || 'Dealership'}</Heading>
                      <HStack spacing={2}>
                        <Text fontSize="sm" color="gray.600">@{dealership?.slug}</Text>
                        {dealership?.verified_business ? (
                          <Badge colorScheme="green">Verified</Badge>
                        ) : (
                          <Badge colorScheme="yellow">Unverified</Badge>
                        )}
                      </HStack>
                    </Box>
                  </HStack>
                  <HStack spacing={2}>
                    <Button as={Link} to={'/settings'} variant="solid" colorScheme="blue">Settings</Button>
                    <Button as={Link} to={'/inventory'} colorScheme="blue">Manage Inventory</Button>
                  </HStack>
                </Flex>
              </Box>
              {
                !hideSidebar && !dealership?.verified_business && 
                <VerificationNotice user={authUser} onRefresh={init} businessType={'dealer'} />
              }
              <Outlet />
            </Container>
          </Box>
        </Fragment>
      </Flex>
    </Stack>
    </DealershipContext.Provider>
  )
}





export default DealerDashboardLayout;

