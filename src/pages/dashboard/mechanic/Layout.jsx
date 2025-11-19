import {useState, useEffect, useContext, createContext, Fragment, useCallback} from 'react';
import {Link, Routes, Route, Outlet, useLocation} from 'react-router-dom';
import {GlobalStore} from '../../../App';
import {objectifyJSON, jsonifyObject} from '../../../utils';
import {MechanicDashboardSideBar, MechanicNavbar, UnauthenticatedNavbar} from '../../../components/nav';
import {VerificationNotice} from '../../../components';
import { mapBusinessProfileResponse, handleApiError } from '../../../utils/businessUtils';
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
} from '@chakra-ui/react'
import { LayoutDashboard, Wallet, Clock, PiggyBank, BarChart2, HelpCircle, Settings, Share2, MoreVertical, TrendingUp, RotateCw as RepeatIcon } from 'lucide-react'
import { RiCoinsFill, RiCoinsLine } from "react-icons/ri";
import { PiHandDepositBold, PiHandWithdrawBold } from "react-icons/pi";
import Dashboard from './MechanicDashboard';


export const MechanicContext = createContext({
  mechanic: null,
})

function MechanicDashboardLayout({children, hideSidebar, ...props}) {
  const {axios, notify, authUser, commaInt} = useContext(GlobalStore);
  const [sidebarOpen, setSidebarState] = useState(false);
  const [loading, setLoadingState] = useState(true);
  const [mechanic, setMechanic] = useState();
  const [isMobile] = useMediaQuery('(max-width: 768px)');

  async function init(){
    try {
      // First, ensure the user is authenticated
      if (!authUser?.id) {
        throw new Error('User not authenticated');
      }

      // Create a default mechanic profile with user data
      const defaultMechanic = {
        id: authUser.id,
        user: authUser,
        isNew: true,
        // Add default values for required fields
        business_name: `${authUser.first_name} ${authUser.last_name}'s Auto Shop`,
        services: [],
        status: 'pending_verification',
        verified_business: false
      };

      // Try to fetch mechanic data if the endpoint exists
      try {
        const res = await axios.get('/mechanics/me/');
        if (res?.data) {
          const rawData = objectifyJSON(res.data);
          if (rawData) {
            // Use utility function to map API response to consistent structure
            const mappedData = mapBusinessProfileResponse(rawData);
            console.log("Mechanic data loaded:", mappedData);
            setMechanic({
              ...mappedData,
              isNew: false
            });
            return;
          }
        }
      } catch (apiError) {
        // Use utility function for consistent error handling
        const errorInfo = handleApiError(apiError);
        console.log("API Error:", errorInfo.message);
        
        // If 404, it means the mechanic profile doesn't exist yet
        if (apiError.response?.status === 404) {
          console.log("Using default mechanic profile - profile not found");
          setMechanic(defaultMechanic);
          return;
        }
        
        // For other errors, show notification but still use default profile
        notify({
          title: 'Profile Loading Issue',
          description: errorInfo.message,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        
        setMechanic(defaultMechanic);
        return;
      }

      // If we get here, either the endpoint doesn't exist or returned no data
      console.log("Using default mechanic profile");
      setMechanic(defaultMechanic);
      return;
    } catch (error) {
      console.error("Error in init:", error);
      
      // Use utility function for consistent error handling
      const errorInfo = handleApiError(error);
      
      // If 404, it means the mechanic profile doesn't exist yet
      if (error.response?.status === 404) {
        setMechanic({
          id: authUser?.id,
          user: authUser,
          isNew: true,
          business_name: authUser ? `${authUser.first_name} ${authUser.last_name}'s Auto Shop` : 'My Auto Shop',
          services: [],
          status: 'pending_verification',
          verified_business: false
        });
      } else {
        notify({
          title: 'Error',
          description: errorInfo.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoadingState(false);
    }
  }

  // Load Google Maps script
  const loadGoogleMaps = useCallback(() => {
    if (window.google && window.google.maps) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google && window.google.maps) {
          console.log('Google Maps API loaded successfully');
          resolve();
        } else {
          reject(new Error('Google Maps API failed to load'));
        }
      };
      
      script.onerror = (error) => {
        console.error('Error loading Google Maps API:', error);
        reject(new Error('Error loading Google Maps API'));
      };
      
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadGoogleMaps();
        await init();
      } catch (error) {
        console.error('Initialization error:', error);
        // Continue with default profile even if Google Maps fails to load
        if (!mechanic) {
          setMechanic({
            id: authUser?.id,
            user: authUser || {},
            isNew: true,
            business_name: authUser ? `${authUser.first_name} ${authUser.last_name}'s Auto Shop` : 'My Auto Shop',
            services: [],
            status: 'pending_verification'
          });
        }
      }
    };

    initialize();
  }, [authUser?.id]);

  if (loading) {
    return (
      <Flex minH="100vh" justifyContent="center" alignItems="center">
        <Box textAlign="center">
          <Text fontSize="lg" mb={4}>Loading your dashboard...</Text>
          <Progress size="xs" isIndeterminate />
        </Box>
      </Flex>
    );
  }

  // If we have an error and no mechanic data, show error state
  if (!mechanic) {
    return (
      <Flex minH="100vh" justifyContent="center" alignItems="center" p={4}>
        <Box textAlign="center" maxW="md">
          <Heading size="lg" mb={4}>Unable to Load Dashboard</Heading>
          <Text mb={6}>
            We couldn't load your mechanic profile. Please try refreshing the page or contact support if the issue persists.
          </Text>
          <Button 
            colorScheme="blue" 
            onClick={init}
            leftIcon={<RepeatIcon />}
          >
            Try Again
          </Button>
        </Box>
      </Flex>
    );
  }

  const context = {
    mechanic,
  }

  return (
    <MechanicContext.Provider value={context}>
    <Stack>
      <MechanicNavbar sidebarOpen={sidebarOpen} setSidebarState={setSidebarState} hideSidebar={hideSidebar} />

      <Flex minH="100vh" position="relative">
        <Fragment>
          <MechanicDashboardSideBar
           mechanic={mechanic}
           sidebarOpen={sidebarOpen}
           onClose={() => setSidebarState(false)}
           setSidebarState={setSidebarState}
           loading={loading}
           // display={hideSidebar && 'none'}
           mode={hideSidebar ? 'drawer' : 'block'}
          />

          <Box
           flex={{ md: 1 }}
           w={isMobile ? '100%' : hideSidebar ? '100%' : "calc(100% - 280px)"}
           ml={isMobile ? '0px' : hideSidebar ? '0px' : "280px"}
          >
            <Container pb={10} maxW="container.xl">
              {
                !hideSidebar && !mechanic?.verified_business && 
                <VerificationNotice user={authUser} onRefresh={init} businessType={'mechanic'} />
              }
              <Outlet />
            </Container>
          </Box>
        </Fragment>
      </Flex>
    </Stack>
    </MechanicContext.Provider>
  )
}

export default MechanicDashboardLayout;

