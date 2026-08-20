import { useState, useContext, useEffect, Fragment } from 'react';
import {
  Box, Stack, Flex,
  Image, Text,
  useMediaQuery, Icon,
  useColorModeValue,
  DrawerContent,
  Divider,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  Drawer,
  SimpleGrid,
  Link,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  Heading,
  Button,
  ButtonGroup,
  VStack,
  Avatar,
  IconButton,
  HStack,
  Tooltip,
  Circle,
  Progress,
  DrawerFooter,
  Container,
  Input,
  Tag,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Skeleton,
} from '@chakra-ui/react';
import { RiCoinsFill, RiCoinsLine } from "react-icons/ri";
import { motion } from 'framer-motion';
import { GlobalStore } from '../contexts/GlobalStore';
import { FcMenu } from 'react-icons/fc';
import { CheckCircleIcon } from '@chakra-ui/icons'
import { FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp, FaUser } from "react-icons/fa";
import { CustomerSearchBar, DashboardSearchBar } from '.';
import { RiAccountCircleLine, RiBellLine, RiFacebookFill, RiHeadphoneLine, RiInstagramFill, RiLinkedinFill, RiLogoutBoxRLine, RiMenuLine, RiTwitterFill, RiAccountCircleFill } from 'react-icons/ri';
import { TbBell, TbSearch } from 'react-icons/tb';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import { RxEnvelopeClosed } from 'react-icons/rx';
import { AiOutlineMessage } from 'react-icons/ai';
import { GiMechanicGarage } from 'react-icons/gi';
import { FiBell } from 'react-icons/fi';
import { MdOutlineAccountCircle } from 'react-icons/md';
import { BsTools } from 'react-icons/bs';
import { LuWallet, LuChartLine } from 'react-icons/lu';
import { NavLink, Link as RLink, useNavigate, useLocation } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  LayoutDashboard, Wallet, Clock,
  PiggyBank, BarChart2, HelpCircle,
  Settings, Share2, MoreVertical, TrendingUp,
  MessageCircle as MessageCircleIcon, Bell as BellIcon, ShoppingCart as ShoppingCartIcon, User as UserIcon
} from 'lucide-react';
import { Menu as MenuGlyph, X as CloseGlyph } from 'lucide-react';
import { GiHomeGarage } from "react-icons/gi";
import { GrUserWorker } from "react-icons/gr";
import {
  Wallet3, Home3, Chart, Shop,
  Chart1, Chart2, Chart21, ChartCircle, ChartFail, ChartSquare, ChartSuccess,
  Coin, User, //Toolbox,
} from "iconsax-react";
import { AiOutlineTransaction } from "react-icons/ai";
import '../assets/css/nav.css';
import { BusinessLogo } from './BusinessLogo';
import { mapBusinessProfileResponse, handleApiError, monitorBusinessProfile } from '../utils/businessUtils';
import { getUserDisplayName, getBusinessDisplayName, getUserEmail } from '../utils/userDataUtils';


export const BackButton = ({ to, onClick, ...props }) => {
  const redirect = useNavigate();

  function goBack() {
    if (to) {
      return redirect(to);
    }
    if (onClick) {
      return onClick();
    }

    const { navigation } = window;
    if (navigation && navigation.canGoBack) {
      return navigation.back();
    } else {
      return redirect('/');
    }
  }

  return (
    <Button
      borderColor="primary"
      variant="outline"
      colorScheme="blue"
      leftIcon={<FaChevronLeft />}
      mb={5}
      onClick={goBack}
      {...props}
    > Back </Button>
  )
}


export const Paginator = ({ onNext, onPrevious, onClick, pagination }) => {
  const [currentPage, setCurrentPage] = useState(1); // page 1 by default, unaffected by parent state.
  const [pages, setPages] = useState([]); // page 1 by default, unaffected by parent state.
  // const {next, previous, count, offset} = pagination;

  function destructurePages() {
    let _offset = pagination?.offset;
    // just in case there's no offset, prevents zero division error
    if (_offset === 0) {
      _offset = 1;
    }
    // make the pages from the offset count, appx.
    let _pages, length = Math.round(pagination?.count / _offset);

    // create a Number Array with the number of pages gotten from div.
    _pages = Array.from({ length }, (_, i) => (i + 1)); // [1, 2, 3, ..., n]
    console.log(`You've got ${_pages} pages!`);
    // setPages(..._pages)
  }

  function handlePageClick(pageNum) {
    // do some cool shit ()
  }

  useEffect(() => {
    destructurePages();
  }, [])


  return (
    <ButtonGroup justifyContent="center" w="100%" isAttached align="center" mt={8}>
      <Button onClick={onPrevious} disabled={!pagination?.previous} variant="outline" size="sm" leftIcon={<ArrowLeft size={20} />}>
        Previous
      </Button>

      {pages?.map((page, i) => (
        <Button
          key={i}
          size="sm"
          disabled={page === '...'}
          onClick={onClick}
          variant={page === 1 ? 'solid' : 'outline'}
          colorScheme={page === 1 ? 'blue' : 'gray'}
        >
          {(page + 1)}
        </Button>
      ))}

      <Button onClick={onNext} disabled={!pagination?.next} variant="outline" size="sm" rightIcon={<ArrowRight size={20} />}>
        Next
      </Button>
    </ButtonGroup>
  )
}


const PUBLIC_NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Buy', to: '/buy' },
  { label: 'Rent', to: '/rent' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact' },
];

export const UnauthenticatedNavbar = ({ transparent, ...props }) => {
  const [navIsOpen, setNavState] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  // Overlay the hero on the landing route only; every other public page sits on
  // a light background and needs a solid bar from the first pixel.
  const overlay = transparent === undefined ? pathname === '/' : transparent;
  const onGlass = overlay && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile sheet whenever the route changes
  useEffect(() => setNavState(false), [pathname]);

  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <Box
      as="header"
      position={overlay ? 'fixed' : 'sticky'}
      top="0"
      left="0"
      right="0"
      zIndex="30"
      transition="background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease"
      bg={onGlass ? 'transparent' : 'rgba(20, 24, 30, 0.82)'}
      backdropFilter={onGlass ? 'none' : 'saturate(180%) blur(16px)'}
      borderBottom="1px solid"
      borderColor={onGlass ? 'transparent' : 'whiteAlpha.200'}
      boxShadow={onGlass ? 'none' : '0 8px 30px -12px rgba(0,0,0,0.5)'}
      color="white"
      {...props}
    >
      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        <Flex align="center" justify="space-between" h={{ base: '64px', md: '76px' }} gap={4}>
          {/* Brand */}
          <HStack as={RLink} to="/" spacing={2.5} flexShrink={0} _hover={{ '& img': { transform: 'scale(1.06)' } }}>
            <Image
              loading="eager"
              src="/assets/images/VEYU MOBILE APP ICON1.jpg"
              alt="Veyu"
              boxSize={{ base: '34px', md: '38px' }}
              borderRadius="10px"
              objectFit="cover"
              transition="transform 0.2s ease"
            />
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight="800"
              letterSpacing="-0.02em"
              display={{ base: 'none', sm: 'block' }}
            >
              Veyu
            </Text>
          </HStack>

          {/* Desktop links */}
          <HStack as="nav" spacing={1} display={{ base: 'none', lg: 'flex' }}>
            {PUBLIC_NAV_LINKS.map((link) => {
              const active = isActive(link.to);
              return (
                <Box
                  key={link.to}
                  as={RLink}
                  to={link.to}
                  px={3.5}
                  py={2}
                  fontSize="sm"
                  fontWeight="600"
                  borderRadius="full"
                  position="relative"
                  color={active ? 'white' : 'whiteAlpha.700'}
                  bg={active ? 'whiteAlpha.200' : 'transparent'}
                  _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
                  transition="all 0.2s ease"
                >
                  {link.label}
                </Box>
              );
            })}
          </HStack>

          {/* Actions */}
          <HStack spacing={{ base: 2, md: 3 }} flexShrink={0}>
            <Button
              as={RLink}
              to="/login"
              variant="ghost"
              size="sm"
              color="white"
              fontWeight="600"
              borderRadius="full"
              px={4}
              display={{ base: 'none', sm: 'inline-flex' }}
              _hover={{ bg: 'whiteAlpha.200' }}
              _active={{ bg: 'whiteAlpha.300' }}
            >
              Log in
            </Button>

            <Button
              as={RLink}
              to="/signup"
              size="sm"
              bg="primary"
              color="secondary"
              fontWeight="700"
              borderRadius="full"
              px={{ base: 4, md: 5 }}
              h={{ base: '36px', md: '40px' }}
              rightIcon={<ArrowRight size={15} />}
              _hover={{ bg: 'tertiary', transform: 'translateY(-1px)', shadow: 'lg' }}
              _active={{ transform: 'translateY(0)' }}
              transition="all 0.2s ease"
            >
              Get Started
            </Button>

            <IconButton
              onClick={() => setNavState((open) => !open)}
              display={{ base: 'inline-flex', lg: 'none' }}
              variant="ghost"
              color="white"
              borderRadius="full"
              _hover={{ bg: 'whiteAlpha.200' }}
              _active={{ bg: 'whiteAlpha.300' }}
              icon={<Icon as={navIsOpen ? CloseGlyph : MenuGlyph} boxSize={5} />}
              aria-label={navIsOpen ? 'Close menu' : 'Open menu'}
              size="sm"
            />
          </HStack>
        </Flex>
      </Container>

      {/* Mobile sheet */}
      <Drawer isOpen={navIsOpen} onClose={() => setNavState(false)} placement="right" size="full">
        <DrawerContent bg="secondary" color="white">
          <Flex align="center" justify="space-between" px={5} h="64px" borderBottom="1px solid" borderColor="whiteAlpha.200">
            <HStack spacing={2.5}>
              <Image
                src="/assets/images/VEYU MOBILE APP ICON1.jpg"
                alt="Veyu"
                boxSize="34px"
                borderRadius="10px"
                objectFit="cover"
              />
              <Text fontSize="lg" fontWeight="800" letterSpacing="-0.02em">Veyu</Text>
            </HStack>
            <IconButton
              onClick={() => setNavState(false)}
              variant="ghost"
              color="white"
              borderRadius="full"
              _hover={{ bg: 'whiteAlpha.200' }}
              icon={<Icon as={CloseGlyph} boxSize={5} />}
              aria-label="Close menu"
              size="sm"
            />
          </Flex>

          <DrawerBody px={5} py={8}>
            <Stack spacing={1}>
              {PUBLIC_NAV_LINKS.map((link) => (
                <Box
                  key={link.to}
                  as={RLink}
                  to={link.to}
                  onClick={() => setNavState(false)}
                  py={3.5}
                  px={4}
                  borderRadius="xl"
                  fontSize="2xl"
                  fontWeight="700"
                  letterSpacing="-0.02em"
                  color={isActive(link.to) ? 'primary' : 'white'}
                  bg={isActive(link.to) ? 'whiteAlpha.100' : 'transparent'}
                  _hover={{ bg: 'whiteAlpha.100' }}
                  transition="all 0.2s ease"
                >
                  {link.label}
                </Box>
              ))}
            </Stack>
          </DrawerBody>

          <DrawerFooter as={Stack} spacing={3} px={5} pb={8} borderTop="1px solid" borderColor="whiteAlpha.200">
            <Button
              as={RLink}
              to="/signup"
              onClick={() => setNavState(false)}
              w="100%"
              size="lg"
              bg="primary"
              color="secondary"
              fontWeight="700"
              borderRadius="full"
              rightIcon={<ArrowRight size={18} />}
              _hover={{ bg: 'tertiary' }}
            >
              Get Started
            </Button>
            <Button
              as={RLink}
              to="/login"
              onClick={() => setNavState(false)}
              w="100%"
              size="lg"
              variant="outline"
              color="white"
              borderColor="whiteAlpha.400"
              fontWeight="600"
              borderRadius="full"
              _hover={{ bg: 'whiteAlpha.100', borderColor: 'whiteAlpha.700' }}
            >
              Log in
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}


export const CustomerNavbar = ({ props }) => {
  const [navIsOpen, setNavState] = useState(false);
  const [searchIsOpen, setSearchState] = useState(false);
  const { authUser, onLogout, logout } = useContext(GlobalStore);
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const [isLaptop] = useMediaQuery('(max-width: 1028px)');
  const isLoggedIn = Boolean(authUser);
  const navBg = useColorModeValue('white', 'gray.900');
  const navColor = useColorModeValue('black', 'white');
  const navigate = useNavigate();

  window.onscroll = (ev) => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      if (window.scrollY > 1000) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }

  function toggleSearch() {
    setSearchState(!searchIsOpen);
  }

  function hideNav() {
    setNavState(false)
  }

  function showNav() {
    setNavState(true)
  }

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <Box
      position={'sticky'}
      top={'0px'}
      bg={navBg}
      as={motion.div}
      color={navColor}
      flex={1} w={'100%'}
      animate={{ opacity: 1, }}
      initial={{ opacity: 0.6, }}
      transition={'.5s linear'}
      className='navbar'
      id='navbar'
      zIndex="20"
      mb={0}
    >
      <Flex className='navbar-inner'
        alignItems={'center'}
        px={4} py={4} gap="10px"
        justifyContent={'space-between'}
        flex={1} w={'100%'}
      >
        <Box as={Flex} alignItems={'center'} justifyContent={'center'} width={'80px'} height={isMobile ? '40px' : '50px'} className='navbar-brand'>
          <RLink to={'/'}>
            <Image
              loading='eager'
              src={'/assets/logo.jpg'}
              width={'100%'}
              className='navbar-brand'
            />
          </RLink>
        </Box>

        <Fragment>
          {!isLaptop &&
            <Flex flex={{ base: 8 / 9, lg: 7 / 8 }} flexWrap={'wrap'} alignItems={'center'}>
              <Flex display={{ base: 'none', lg: 'flex' }} flex={1} flexWrap={'wrap'} className='navbar-nav' gap={6} alignItems={'center'}>
                <Text as={RLink} fontWeight={'500'} to={"/home"}> Home </Text>
                <Text as={RLink} fontWeight={'500'} to={"/buy"}> Buy Now </Text>
                <Text as={RLink} fontWeight={'500'} to={"/rent"}> Rent </Text>
                <Text as={RLink} fontWeight={'500'} to={"/mechanics"}> Search for Mechanic </Text>
              </Flex>
            </Flex>
          }

          {!isMobile && <CustomerSearchBar flex={1} />}

          <Flex flex={isMobile ? 1 : 'unset'} flexWrap={'nowrap'} justifyContent={{ base: 'space-evenly', lg: 'flex-start' }} className='' gap={isMobile ? 3 : 5} alignItems={'center'}>

            {isMobile &&
              <Button onClick={toggleSearch} variant="unstyled"><Icon viewBox='0 0 24 24' className='icon'><TbSearch /></Icon></Button>
            }

            {!isMobile &&
              <Button
                as={RLink}
                to="/wallet"
                borderRadius={'30px'}
                leftIcon={<Wallet size={16} />}
                variant="outline"
                bgColor="#d9ebf5"
                fontWeight="600"
                colorScheme="blue"
                color="primary"
              >{"Wallet"}</Button>
            }

            <RLink to={'/chat'}><Icon viewBox='0 0 24 24' className='icon' color={navColor}><MessageCircleIcon size={18} /></Icon></RLink>
            <RLink to={'/notifications'}><Icon viewBox='0 0 24 24' className='icon' color={navColor}><BellIcon size={18} /></Icon></RLink>
            <RLink to={'/cart'}><Icon viewBox='0 0 24 24' className='icon' color={navColor}><ShoppingCartIcon size={18} /></Icon></RLink>
            {!isLaptop &&
              <Menu to={`/dashboard`}>
                {({ isOpen, onClose }) =>
                  <Fragment>
                    <MenuButton onClose={onClose}>
                      <Icon viewBox='0 0 24 24' className='icon' color={navColor}><UserIcon size={18} /></Icon>
                    </MenuButton>
                    <MenuList px={2}>
                      <Box my={3} placeItems="center">
                        <Avatar name={getUserDisplayName(authUser)} />
                        <Text color="black">{getUserDisplayName(authUser)}</Text>
                      </Box>

                      <Button my={1} as={MenuItem} display={'flex'} justifyContent={'space-between'} onClick={logout} variant={'ghost'} w={'100%'} color="black"> Sign Out  <RiLogoutBoxRLine className='icon' /> </Button>
                      <Button my={1} as={MenuItem} display={'flex'} justifyContent={'space-between'} onClick={() => navigate('/support')} variant={'ghost'} w={'100%'} color="black"> Contact Support <RiHeadphoneLine className='icon' />  </Button>
                    </MenuList>
                  </Fragment>
                }
              </Menu>
            }

            {isLaptop &&
              <Button onClick={navIsOpen ? hideNav : showNav} colorScheme='transparent' px={2}>
                <Icon sx={{ fill: 'black', '& *': { fill: 'black' } }} className='icon'><FcMenu /></Icon>
              </Button>
            }
          </Flex>

        </Fragment>

        <Sidebar onClose={hideNav} show={navIsOpen} />
      </Flex>

      {isMobile && searchIsOpen &&
        <Fragment>
          <Box px={2} py={2} w={'100%'} bg="#F4A950">
            <CustomerSearchBar />
          </Box>
        </Fragment>
      }

    </Box>
  )
}


export const DealerNavbar = ({ sidebarOpen, setSidebarState, dealership, ...props }) => {
  const [navIsOpen, setNavState] = useState(false);
  const [searchIsOpen, setSearchState] = useState(false);
  const { authUser, onLogout, logout } = useContext(GlobalStore);
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const isLoggedIn = Boolean(authUser);
  const navigate = useNavigate();

  // Use dealership logo if available, fallback to authUser logo or name
  const logoSrc = dealership?.logo || authUser?.logo;
  const displayName = dealership?.business_name || getUserDisplayName(authUser);

  window.onscroll = (ev) => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    if (window.scrollY > 1000) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  function toggleSearch() {
    setSearchState(!searchIsOpen);
  }

  function hideNav() {
    setSidebarState(false)
  }

  function showNav() {
    setSidebarState(true)
  }

  function goToChat() {
    navigate('/chat');
  }

  return (
    <Box
      position={'sticky'}
      top={'0px'}
      bg={'white'}
      as={motion.div}
      color={'black'}
      flex={1} w={'100%'}
      animate={{ opacity: 1, }}
      initial={{ opacity: 0.6, }}
      transition={'.5s linear'}
      className='navbar'
      id='navbar'
      zIndex="20"
      mb={0}
      borderBottomWidth={1}
      borderColor="gray.200"
      boxShadow="sm"
    >
      <Flex className='navbar-inner'
        alignItems={'center'}
        px={4}
        py={3}
        justifyContent={'space-between'}
        flex={1} w={'100%'}
      >
        <Flex justifyContent="space-betweeen" alignItems="center">
          <Box as={Flex} alignItems={'center'} justifyContent={'center'} width={isMobile ? '60px' : '80px'} height={isMobile ? '40px' : '50px'} className='navbar-brand'>
            <RLink to={'/'}><Image loading='eager'
              src={!authUser ? '/logo512.jpg' : '/logo512.jpg'}
              width={'100%'} className='navbar-brand' /></RLink>
          </Box>
        </Flex>


        <Flex
          flex={isMobile ? 1 : 'unset'}
          flexWrap={'nowrap'}
          justifyContent={{ base: 'space-around', lg: 'flex-end' }}
          gap={isMobile ? 3 : 5}
          alignItems={'center'}
        >
          {isMobile ? (
            <IconButton
              as={RLink}
              to="/wallet"
              aria-label="Wallet"
              variant="ghost"
              icon={<Wallet size={18} />}
            />
          ) : (
            <Button
              as={RLink}
              to="/wallet"
              borderRadius={'30px'}
              leftIcon={<Wallet size={16} />}
              variant="outline"
              bgColor="#d9ebf5"
              fontWeight="600"
              colorScheme="blue"
              color="primary"
            >E-Wallet</Button>
          )}

          {/* {!isMobile && (
            <HStack spacing={2}>
              <Button as={RLink} to={'/dashboard/settings'} variant="outline" size="sm"></Button>
              <Button as={RLink} to={'/inventory'} colorScheme="blue" size="sm"></Button>
            </HStack>
          )} */}

          <IconButton onClick={goToChat} aria-label="Chat" variant="ghost" icon={<MessageCircleIcon size={18} />} />
          <IconButton as={RLink} to={'/notifications'} aria-label="Notifications" variant="ghost" icon={<BellIcon size={18} />} />

          <Menu zIndex={2} display="block">
            <MenuButton
              as={IconButton}
              icon={<UserIcon size={18} />}
              colorScheme="gray"
              variant="ghost"
              size="sm"
              aria-label="Profile"
            />

            <MenuList py={3} px={3} zIndex={'2 !important'}>
              <Box alignItems="center" justifyContent="center" display="flex" flexDirection="column" p={3}>
                <Avatar
                  size="lg"
                  src={logoSrc}
                  name={displayName}
                />
                <Heading my={1} size="sm" color="black"> {displayName} </Heading>
                <Text color="black"> {getUserEmail(authUser)} </Text>
              </Box>
              <Divider my={2} />
              <MenuItem as={Link} gap={2} to={'/profile'} color="black"> <User size="20" /> Profile </MenuItem>
              <MenuItem as={Link} gap={2} onClick={logout} color="black"> <RiLogoutBoxRLine /> Logout </MenuItem>
            </MenuList>
          </Menu>

          {(isMobile || props.hideSidebar) && (
            <IconButton onClick={sidebarOpen ? hideNav : showNav} aria-label="Menu" variant='ghost' icon={<FcMenu />} />
          )}
        </Flex>
      </Flex>

      {isMobile && searchIsOpen &&
        <Fragment>
          <Box px={2} py={2} w={'100%'} bg="#fff">
            <DashboardSearchBar />
          </Box>
        </Fragment>
      }
    </Box>
  )
}


export const DealerDashboardSideBar = ({ dealership: propDealership, sidebarOpen, setSidebarState, onClose, ...props }) => {
  const { authUser: dealerAuthUser, axios } = useContext(GlobalStore);
  const [dealership, setDealership] = useState(propDealership || {});
  const [loading, setLoading] = useState(!propDealership);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If dealership prop is not provided, fetch it
    if (!propDealership && dealerAuthUser?.id) {
      const fetchDealership = async () => {
        try {
          setLoading(true);
          setError(null);
          console.log('Fetching dealer profile...');
          const response = await axios.get('/accounts/dealer/profile/');
          console.log('Dealer profile response:', response.data);

          if (response.data) {
            // Use utility function for consistent data mapping
            const mappedProfile = mapBusinessProfileResponse(response.data);
            
            // Monitor successful profile fetch
            monitorBusinessProfile('DealerDashboardSideBar_ProfileFetch', {
              apiResponse: response.data,
              mappedProfile,
              dealerAuthUser: dealerAuthUser?.id
            });
            
            setDealership(mappedProfile);
          }
        } catch (error) {
          console.error('Error fetching dealership data:', error);
          const errorInfo = handleApiError(error);
          setError(errorInfo);
          
          // Fallback to auth user data for basic display
          if (dealerAuthUser) {
            setDealership({
              business_name: getUserDisplayName(dealerAuthUser),
              logo: null,
              slug: dealerAuthUser.username || dealerAuthUser.id
            });
          }
        } finally {
          setLoading(false);
        }
      };

      fetchDealership();
    }
  }, [dealerAuthUser, propDealership, axios]);
  const NavLinks = ({ dealership, sidebarOpen, setSidebarState }) => {
    const { logout, authUser } = useContext(GlobalStore);
    const pathname = document.location.pathname;

    useEffect(() => {

    }, [window.location])

    const links = [
      { icon: Home3, label: 'Dashboard', path: '/dashboard', active: pathname.includes('dashboard') },
      { icon: Coin, label: 'Orders', path: '/orders', active: pathname.includes('orders') },
      { icon: Shop, label: 'Inventory', path: '/inventory', active: pathname.includes('inventory') },
      { icon: LuChartLine, label: 'Analytics', path: '/analytics', active: pathname.includes('analytics') },
      { icon: HelpCircle, label: 'Support', path: '/support', active: pathname.includes('support') },
      { icon: Settings, label: 'Settings', path: '/settings', active: pathname.includes('settings') },
    ]

    return (
      <VStack align="stretch" spacing={6}>
        <HStack spacing={3}>
          {loading ? (
            <Box width="100%" p={2}>
              <Skeleton height="40px" />
            </Box>
          ) : (
            <>
              <BusinessLogo
                logoUrl={dealership?.logo}
                businessName={dealership?.business_name || getBusinessDisplayName(authUser)}
                size="md"
                fallbackBg="primary.500"
                fallbackColor="white"
                mx={sidebarOpen ? '0px' : 'auto'}
              />
              {sidebarOpen && (
                <Box flex={1}>
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Text fontWeight="medium" color="black">
                        {dealership?.business_name || getBusinessDisplayName(authUser)}
                      </Text>
                      {dealership?.slug && (
                        <Text fontSize="sm" color="gray.500">@{dealership.slug}</Text>
                      )}
                      {error && (
                        <Text fontSize="xs" color="red.500" mt={1}>
                          {error.message}
                        </Text>
                      )}
                    </Box>
                    <Tooltip label="Share Profile" placement="top">
                      <IconButton
                        icon={<Share2 size={16} />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => {
                          const profileUrl = `${window.location.origin}/dealership/${dealership?.slug || authUser?.id}`;
                          if (navigator.share) {
                            navigator.share({
                              title: dealership?.business_name || 'My Dealership Profile',
                              text: `Check out ${dealership?.business_name || 'my dealership'} on Veyu`,
                              url: profileUrl,
                            });
                          } else {
                            navigator.clipboard.writeText(profileUrl);
                            // You might want to add a toast notification here
                            alert('Profile link copied to clipboard!');
                          }
                        }}
                        aria-label="Share Profile"
                      />
                    </Tooltip>
                  </Flex>
                </Box>
              )}
            </>
          )}
        </HStack>

        <VStack align="stretch" spacing={2}>
          {links.map((item, index) =>
            <Fragment key={index}>
              {
                item?.children ? (
                  <Accordion allowToggle>
                    <AccordionItem border="none">
                      <AccordionButton
                        key={index}
                        as={NavLink}
                        borderRadius="5px"
                        w={'100%'}
                        justifyContent="space-between"
                        alignItems="center"
                        color="black"
                        bgColor={item.active ? 'gray' : 'transparent'}
                        _expanded={{ bgColor: 'gray', color: 'white' }}
                      >
                        {({ expanded }) =>
                          <>
                            <Flex flex={1} gap={3} alignItems="center">
                              <item.icon size={20} />
                              <Text fontWeight="600" color="black"> {item.label} </Text>
                            </Flex>
                            {expanded ? <FaChevronUp /> : <FaChevronDown />}
                          </>
                        }
                      </AccordionButton>

                      <AccordionPanel px={0}>
                        {
                          item.children.map((child, idx) =>
                            <Tooltip key={idx} isDisabled={sidebarOpen} hasArrow label={item.label} placement="right-start">
                              <Button
                                as={NavLink}
                                to={child.path}
                                w={'100%'}
                                mt={1.5}
                                bgColor="transparent"
                                color="black"
                                _activeLink={{ bgColor: 'primary', color: 'white', }}
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Flex flex={1} gap={3} alignItems="center">
                                  <item.icon size={20} />
                                  <Text color="black"> {child.label} </Text>
                                </Flex>
                              </Button>
                            </Tooltip>
                          )
                        }
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  // <Tooltip key={index} isDisabled={sidebarOpen} hasArrow label={item.label} placement="right-start">
                  <Button
                    key={index}
                    as={NavLink}
                    to={item.path}
                    w={'100%'}
                    bgColor="transparent"
                    color="black"
                    _activeLink={{ bgColor: 'primary', color: 'white' }}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Flex flex={1} gap={3} alignItems="center">
                      <item.icon size={20} />
                      <Text color="black"> {item.label} </Text>
                    </Flex>
                    {item?.children && !!sidebarOpen && <FaChevronDown />}
                  </Button>
                  // </Tooltip>
                )
              }
            </Fragment>
          )}

          {/* Main Content */}
          <Button
            leftIcon={sidebarOpen ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
            onClick={() => setSidebarState(!sidebarOpen)}
            justifyContent="start"
            colorScheme="gray"
            variant="solid"
            bottom="0px"
            zIndex="10"
          > {sidebarOpen && 'Close'} </Button>
        </VStack>
      </VStack>
    )
  }
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const { authUser } = useContext(GlobalStore);

  if (isMobile || props.mode === 'drawer') {
    return (
      <Drawer placement={'right'} isOpen={sidebarOpen} onClose={() => setSidebarState(false)} {...props}>
        <DrawerContent bg="white" color="black">
          <DrawerHeader>
            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody>
            <NavLinks sidebarOpen={sidebarOpen} dealership={dealership} setSidebarState={setSidebarState} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Box
      w={"280px"}
      overflow={'hidden'}
      position={"fixed"}
      left="0"
      h={"100vh"}
      bgColor="#fff"
      color="black"
      zIndex="20"
      borderRightWidth={1}
      p={sidebarOpen ? 6 : 2}
      {...props}
    >
      <NavLinks sidebarOpen={sidebarOpen} dealership={dealership} setSidebarState={setSidebarState} />
    </Box>
  )
}



export const MechanicNavbar = ({ sidebarOpen, setSidebarState, ...props }) => {
  const [navIsOpen, setNavState] = useState(false);
  const [searchIsOpen, setSearchState] = useState(false);
  const { authUser, onLogout, logout } = useContext(GlobalStore);
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const isLoggedIn = Boolean(authUser);
  const navigate = useNavigate();

  window.onscroll = (ev) => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      if (window.scrollY > 1000) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }

  function toggleSearch() {
    setSearchState(!searchIsOpen);
  }

  function hideNav() {
    setSidebarState(false)
  }

  function showNav() {
    setSidebarState(true)
  }

  return (
    <Box
      position={'sticky'}
      top={'0px'}
      bg={!authUser ? 'primary' : 'white'}
      as={motion.div}
      color={!authUser ? "white" : "black"}
      flex={1} w={'100%'}
      animate={{ opacity: 1, }}
      initial={{ opacity: 0.6, }}
      transition={'.5s linear'}
      className='navbar'
      id='navbar'
      zIndex="20"
      mb={0}
    >
      <Flex className='navbar-inner'
        alignItems={'center'}
        px={4}
        py={4}
        justifyContent={'space-between'}
        flex={1} w={'100%'}
      >
        <Flex justifyContent="space-betweeen" alignItems="center">

          <Box as={Flex} alignItems={'center'} justifyContent={'center'} width={isMobile ? '60px' : '80px'} height={isMobile ? '40px' : '50px'} className='navbar-brand'>
            <RLink to={'/'}><Image loading='eager'
              src={!authUser ? '/logo512.jpg' : '/logo512.jpg'}
              width={'100%'} className='navbar-brand' /></RLink>
          </Box>
        </Flex>


        <Flex flex={isMobile ? 1 : 'unset'} flexWrap={'wrap'} justifyContent={{ base: 'space-evenly', lg: 'flex-start' }} className='' gap={isMobile ? 3 : 5} alignItems={'center'}>

          {isMobile ? (
            <Button
              as={RLink}
              to="/wallet"
              variant="outline"
              borderColor="primary"
            >
              <Wallet size={22} />
            </Button>
          ) : (
            <Button
              as={RLink}
              to="/wallet"
              borderRadius={'30px'}
              leftIcon={<Wallet size={18} />}
              variant="outline"
              bgColor="#d9ebf5"
              fontWeight="600"
              colorScheme="blue"
              color="primary"
            >Wallet</Button>
          )
          }
          <RLink to={'/chat'}><Icon viewBox='0 0 24 24' className='icon' color="black"><MessageCircleIcon size={18} /></Icon></RLink>
          <RLink to={'/notifications'}><Icon viewBox='0 0 24 24' className='icon' color="black"><BellIcon size={18} /></Icon></RLink>
          <Menu zIndex={2} display="block">
            <MenuButton
              as={IconButton}
              icon={<UserIcon size={18} />}
              colorScheme="blue"
              color="black"
              variant="ghost"
              size="sm"
              aria-label="Profile"
            />

            <MenuList py={3} px={3} zIndex={'2 !important'}>
              <Box placeItems="center" placeContent="center" p={3}>
                <Avatar
                  size="lg"
                  name={getUserDisplayName(authUser)}
                />
                <Heading my={1} size="sm" color="black"> {getUserDisplayName(authUser)} </Heading>
                <Text color="black"> {getUserEmail(authUser)} </Text>
              </Box>
              <Divider my={2} />
              <MenuItem as={Link} gap={2} to={'/profile'} color="black"> <User size="20" /> Profile </MenuItem>
              <MenuItem as={Link} gap={2} onClick={logout} color="black"> <RiLogoutBoxRLine /> Logout </MenuItem>
            </MenuList>
          </Menu>
          {(isMobile || props.hideSidebar) &&
            <Button onClick={sidebarOpen ? hideNav : showNav} colorScheme='transparent' px={2}>
              <Icon sx={{ fill: 'black', '& *': { fill: 'black' } }} className='icon'><FcMenu /></Icon>
            </Button>
          }
        </Flex>
      </Flex>
    </Box>
  )
}


export const MechanicDashboardSideBar = ({ mechanic, sidebarOpen, setSidebarState, onClose, loading, ...props }) => {
  const NavLinks = ({ mechanic, sidebarOpen, setSidebarState, loading }) => {
    const { logout, authUser } = useContext(GlobalStore);
    const pathname = document.location.pathname;

    useEffect(() => {

    }, [window.location])

    const links = [
      { icon: GiHomeGarage, label: 'Dashboard', path: '/dashboard', active: pathname.includes('dashboard') },
      { icon: GrUserWorker, label: 'Bookings', path: '/bookings', active: pathname.includes('bookings') },
      { icon: GiMechanicGarage, label: 'Service Offerings', path: '/services', active: pathname.includes('services') },
      { icon: LuChartLine, label: 'Analytics', path: '/analytics', active: pathname.includes('analytics') },
      { icon: HelpCircle, label: 'Support', path: '/support', active: pathname.includes('support') },
      { icon: Settings, label: 'Settings', path: '/settings', active: pathname.includes('settings') },
    ]

    // Show loading skeleton while profile is being fetched
    if (loading) {
      return (
        <VStack align="stretch" spacing={6}>
          <HStack spacing={3}>
            <Skeleton 
              height="48px" 
              width="48px" 
              borderRadius="full"
              mx={sidebarOpen ? '0px' : 'auto'}
            />
            {sidebarOpen && (
              <Box flex={1}>
                <Skeleton height="20px" width="120px" mb={2} />
                <Skeleton height="16px" width="80px" />
              </Box>
            )}
          </HStack>
          <VStack align="stretch" spacing={2}>
            {links.map((_, index) => (
              <Skeleton key={index} height="40px" borderRadius="5px" />
            ))}
          </VStack>
        </VStack>
      );
    }

    return (
      <VStack align="stretch" spacing={6}>
        <HStack spacing={3}>
          <BusinessLogo 
            logoUrl={mechanic?.logo} 
            businessName={mechanic?.business_name || getBusinessDisplayName(authUser)}
            size="md"
            mx={sidebarOpen ? '0px' : 'auto'}
            fallbackBg="orange.500"
            fallbackColor="white"
          />

          {sidebarOpen && (
            <Box flex={1}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="medium">{`${mechanic?.business_name}`}</Text>
                  <Text fontSize="sm" color="gray.500">@{mechanic?.slug}</Text>
                </Box>
                <Tooltip label="Share Profile" placement="top">
                  <IconButton
                    icon={<Share2 size={16} />}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => {
                      const profileUrl = `${window.location.origin}/mechanic/${mechanic?.slug || mechanic?.id}`;
                      if (navigator.share) {
                        navigator.share({
                          title: mechanic?.business_name || 'My Mechanic Profile',
                          text: `Check out ${mechanic?.business_name || 'my mechanic services'} on Veyu`,
                          url: profileUrl,
                        });
                      } else {
                        navigator.clipboard.writeText(profileUrl);
                        alert('Profile link copied to clipboard!');
                      }
                    }}
                    aria-label="Share Profile"
                  />
                </Tooltip>
              </Flex>
            </Box>
          )}
        </HStack>

        <VStack align="stretch" spacing={2}>
          {links.map((item, index) =>
            <Fragment key={index}>
              {
                item?.children ? (
                  <Accordion allowToggle>
                    <AccordionItem border="none">
                      <AccordionButton
                        key={index}
                        as={NavLink}
                        borderRadius="5px"
                        w={'100%'}
                        justifyContent="space-between"
                        alignItems="center"
                        bgColor={item.active ? 'gray' : 'transparent'}
                        _expanded={{ bgColor: 'gray', color: 'white' }}
                      >
                        {({ expanded }) =>
                          <>
                            <Flex flex={1} gap={3} alignItems="center">
                              <item.icon size={20} />
                              <Text fontWeight="600"> {item.label} </Text>
                            </Flex>
                            {expanded ? <FaChevronUp /> : <FaChevronDown />}
                          </>
                        }
                      </AccordionButton>

                      <AccordionPanel px={0}>
                        {
                          item.children.map((child, idx) =>
                            <Tooltip key={idx} isDisabled={sidebarOpen} hasArrow label={item.label} placement="right-start">
                              <Button
                                as={NavLink}
                                to={child.path}
                                w={'100%'}
                                mt={1.5}
                                bgColor="transparent"
                                _activeLink={{ bgColor: 'primary', color: 'white', }}
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Flex flex={1} gap={3} alignItems="center">
                                  <item.icon size={20} />
                                  <Text> {child.label} </Text>
                                </Flex>
                              </Button>
                            </Tooltip>
                          )
                        }
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  // <Tooltip key={index} isDisabled={sidebarOpen} hasArrow label={item.label} placement="right-start">
                  <Button
                    key={index}
                    as={NavLink}
                    to={item.path}
                    w={'100%'}
                    bgColor="transparent"
                    _activeLink={{ bgColor: 'primary', color: 'white' }}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Flex flex={1} gap={3} alignItems="center">
                      <item.icon size={20} />
                      <Text> {item.label} </Text>
                    </Flex>
                    {item?.children && !!sidebarOpen && <FaChevronDown />}
                  </Button>
                  // </Tooltip>
                )
              }
            </Fragment>
          )}

          {/* Main Content */}
          <Button
            leftIcon={sidebarOpen ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
            onClick={() => setSidebarState(!sidebarOpen)}
            justifyContent="start"
            colorScheme="gray.500"
            variant="solid"
            bottom="0px"
            zIndex="10"
          > {sidebarOpen && 'Close'} </Button>
        </VStack>
      </VStack>
    )
  }
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const { authUser } = useContext(GlobalStore);

  if (isMobile || props.mode === 'drawer') {
    return (
      <Drawer placement={'right'} isOpen={sidebarOpen} onClose={() => setSidebarState(false)} {...props}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody>
            <NavLinks sidebarOpen={sidebarOpen} mechanic={mechanic} setSidebarState={setSidebarState} loading={loading} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Box
      w={"280px"}
      overflow={'hidden'}
      position={"fixed"}
      left="0"
      h={"100vh"}
      bgColor="#fff"
      zIndex="20"
      borderRightWidth={1}
      p={sidebarOpen ? 6 : 2}
      {...props}
    >
      <NavLinks sidebarOpen={sidebarOpen} mechanic={mechanic} setSidebarState={setSidebarState} loading={loading} />
    </Box>
  )
}


export const Sidebar = ({ show, onClose, }) => {
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const { authUser, logout } = useContext(GlobalStore);
  const navigate = useNavigate();
  const isLoggedIn = !!authUser;
  return (
    <Drawer className="sidebar" position="fixed" zIndex="20" isOpen={show} onClose={onClose} placement='right'>
      <DrawerContent>
        <DrawerHeader>
          <DrawerCloseButton />
        </DrawerHeader>

        <DrawerBody>
          {
            isLoggedIn ? (
              // isMobile &&
              <Stack>
                <Text onClick={onClose} py={1} px={4} my={2} as={NavLink} to={"/home"}>Home</Text>
                <Text onClick={onClose} py={1} px={4} my={2} as={NavLink} to={"/buy"}>Buy Now</Text>
                <Text onClick={onClose} py={1} px={4} my={2} as={NavLink} to={"/rent"}>Rent</Text>
                <Text onClick={onClose} py={1} px={4} my={2} as={NavLink} to={"/mechanics"}>Search for Mechanics</Text>
                <Text onClick={onClose} py={1} px={4} my={2} as={NavLink} to={"/wallet"}>Wallet</Text>
              </Stack>
            ) : (
              <Stack>
                <Text onClick={onClose} py={1} px={4} my={2} as={NavLink} to={"/home"} >Home</Text>
                <Text onClick={onClose} py={1} px={4} my={2} as={NavLink} to={"/about"} >About</Text>
                <Text onClick={onClose} py={1} px={4} my={2} as={NavLink} to={"/services"} >Services</Text>
                <Text onClick={onClose} py={1} px={4} my={2} as={NavLink} to={"/contact"} >Contact</Text>
              </Stack>
            )
          }
        </DrawerBody>

        <DrawerFooter as={Stack}>
          {isLoggedIn &&
            <Button display={'flex'} justifyContent={'space-between'} onClick={logout} variant={'ghost'} w={'100%'}> Sign Out  <RiLogoutBoxRLine className='icon' /> </Button>
          }
          <Button display={'flex'} justifyContent={'space-between'} onClick={() => navigate('/support')} variant={'ghost'} w={'100%'}> Contact Support <RiHeadphoneLine className='icon' />  </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}


export const Footer = ({ props }) => {
  const sections = [
    {
      title: 'Product',
      links: [
        { label: 'Buy a Vehicle', url: '/signup' },
        { label: 'Sell your Vehicle', url: '/signup' },
        { label: 'Rent a Vehicle', url: '/signup' },
        { label: 'Find Mechanic', url: '/signup' }
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About us', url: '/#about-us' },
        { label: 'Careers', coming: true },
        { label: 'Press', coming: true },
        { label: 'News', coming: true },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Blog', url: '/blog' },
        { label: 'Newsletter', url: '/bad' },
        { label: 'Events', },
        { label: 'Help centre', url: '/support' }
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', url: '/terms-of-service' },
        { label: 'Privacy Policy', url: '/privacy-policy' },
        { label: 'Licenses', url: '/licenses' }
      ],
    },
  ]

  return (
    <Box as="footer" bg="gray.900" color="white">
      {/* CTA Section */}
      <Box bg="primary" py={{ base: 12, md: 16 }}>
        <Container maxW="7xl">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            gap={6}
          >
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={3} flex={1}>
              <Heading
                size={{ base: 'lg', md: 'xl' }}
                fontWeight="bold"
                color="white"
              >
                Ready to get started?
              </Heading>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="whiteAlpha.900"
                textAlign={{ base: 'center', md: 'left' }}
              >
                Join thousands of dealers, mechanics, and Vehicle enthusiasts on Veyu.
              </Text>
            </VStack>

            <HStack spacing={4}>
              <Button
                size="lg"
                bg="white"
                color="primary"
                _hover={{ bg: 'gray.100' }}
                fontWeight="semibold"
                px={8}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                fontWeight="semibold"
                px={8}
              >
                Learn More
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Footer Content */}
      <Box py={{ base: 12, md: 16 }}>
        <Container maxW="7xl">
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 6 }}
            spacing={{ base: 8, md: 6 }}
            mb={12}
          >
            {/* Brand Column */}
            <VStack
              align={{ base: 'center', sm: 'flex-start' }}
              spacing={4}
              gridColumn={{ base: 'span 1', sm: 'span 2', lg: 'span 2' }}
            >
              <Image
                src="/assets/images/VEYU MOBILE APP ICON1.jpg"
                w="80px"
                alt="Veyu Logo"
                borderRadius="md"
              />
              <Text
                fontSize="sm"
                color="gray.400"
                maxW="sm"
                textAlign={{ base: 'center', sm: 'left' }}
                lineHeight="tall"
              >
                Africa's largest vehicle marketplace. Buy, sell, rent vehicles and find trusted mechanics all in one platform.
              </Text>

              {/* Social Media Icons */}
              <HStack spacing={3} pt={2}>
                {[Facebook, Twitter, Instagram, Linkedin, Youtube].map(
                  (SocialIcon, index) => (
                    <Box
                      key={index}
                      as="button"
                      p={2}
                      borderRadius="md"
                      bg="whiteAlpha.100"
                      _hover={{ bg: 'primary', transform: 'translateY(-2px)' }}
                      transition="all 0.2s"
                    >
                      <Icon
                        as={SocialIcon}
                        boxSize="18px"
                        color="white"
                      />
                    </Box>
                  )
                )}
              </HStack>

              {/* App Store Badges */}
              <VStack align={{ base: 'center', sm: 'flex-start' }} spacing={3} pt={2}>
                <Text fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
                  Download the App
                </Text>
                <HStack spacing={3} flexWrap="wrap">
                  <Box
                    as="a"
                    href="https://apps.apple.com/us/app/veyu/id6761031037"
                    target="_blank"
                    rel="noopener noreferrer"
                    display="flex"
                    alignItems="center"
                    bg="black"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    borderRadius="lg"
                    px={4}
                    py={2}
                    gap={2}
                    _hover={{ borderColor: 'white', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    minW="130px"
                  >
                    <Box flexShrink={0}>
                      <svg width="20" height="24" viewBox="0 0 814 1000" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.2 135.4-316.5 269-316.5 71 0 130.6 46.4 174.5 46.4 42.8 0 109.2-49 192.5-49 31 0 108.2 2.6 108.2 118.3zm-194-150.5c-22.1 26.8-55.2 52-95.9 52-9 0-18-1.3-27-3.2-1.3-9-1.9-18-1.9-26.8 0-57.6 30.4-111.2 65.5-146.3 35-35 97.5-62.2 145.5-62.2 0.6 9 0.6 18 0.6 26.8 0 57-22.1 111.9-57.1 149.8-.2 3.2-19.8 6.9-29.7 9.9z"/>
                      </svg>
                    </Box>
                    <VStack spacing={0} align="flex-start">
                      <Text fontSize="8px" color="gray.400" lineHeight="1">Download on the</Text>
                      <Text fontSize="14px" color="white" fontWeight="bold" lineHeight="1.2">App Store</Text>
                    </VStack>
                  </Box>

                  <Box
                    as="a"
                    href="https://play.google.com/store/apps/details?id=com.millihub.veyu"
                    target="_blank"
                    rel="noopener noreferrer"
                    display="flex"
                    alignItems="center"
                    bg="black"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    borderRadius="lg"
                    px={4}
                    py={2}
                    gap={2}
                    _hover={{ borderColor: 'white', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    minW="130px"
                  >
                    <Box flexShrink={0}>
                      <svg width="20" height="22" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00C6FF"/>
                            <stop offset="100%" stopColor="#0072FF"/>
                          </linearGradient>
                          <linearGradient id="g2" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FFD000"/>
                            <stop offset="100%" stopColor="#FF6D00"/>
                          </linearGradient>
                          <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF4040"/>
                            <stop offset="100%" stopColor="#C50000"/>
                          </linearGradient>
                          <linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00D563"/>
                            <stop offset="100%" stopColor="#00A543"/>
                          </linearGradient>
                        </defs>
                        <path d="M48 0C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48l224-192L48 0z" fill="url(#g1)"/>
                        <path d="M464 232L272 128 48 0l224 256 192-24z" fill="url(#g2)"/>
                        <path d="M48 512c26.5 0 48-21.5 48-48V144L48 512z" fill="url(#g3)" opacity="0.8"/>
                        <path d="M272 384 48 512l416-24-192-104z" fill="url(#g4)"/>
                      </svg>
                    </Box>
                    <VStack spacing={0} align="flex-start">
                      <Text fontSize="8px" color="gray.400" lineHeight="1">Get it on</Text>
                      <Text fontSize="14px" color="white" fontWeight="bold" lineHeight="1.2">Google Play</Text>
                    </VStack>
                  </Box>
                </HStack>
              </VStack>
            </VStack>

            {/* Link Sections */}
            {sections.map((section) => (
              <VStack
                key={section.title}
                align={{ base: 'center', sm: 'flex-start' }}
                spacing={3}
              >
                <Text
                  fontWeight="bold"
                  fontSize="md"
                  color="white"
                  mb={1}
                >
                  {section.title}
                </Text>
                {section.links.map(({ label, url, coming }) => (
                  <HStack key={label} spacing={2}>
                    <Text
                      as={url ? RLink : 'span'}
                      to={url}
                      fontSize="sm"
                      color="gray.400"
                      cursor={url ? "pointer" : "default"}
                      _hover={url ? { color: 'primary' } : {}}
                      transition="color 0.2s"
                    >
                      {label}
                    </Text>
                    {coming && (
                      <Tag
                        size="sm"
                        colorScheme="green"
                        variant="subtle"
                        fontSize="xs"
                      >
                        Soon
                      </Tag>
                    )}
                  </HStack>
                ))}
              </VStack>
            ))}
          </SimpleGrid>

          {/* Newsletter Section */}
          <Box
            bg="whiteAlpha.50"
            borderRadius="xl"
            p={{ base: 6, md: 8 }}
            mb={12}
          >
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align={{ base: 'flex-start', md: 'center' }}
              gap={6}
            >
              <VStack align="flex-start" spacing={2} flex={1}>
                <Heading size="md" color="white">
                  Subscribe to our newsletter
                </Heading>
                <Text fontSize="sm" color="gray.400">
                  Get the latest updates, tips, and exclusive offers delivered to your inbox.
                </Text>
              </VStack>

              <HStack
                spacing={2}
                w={{ base: 'full', md: 'auto' }}
                maxW={{ md: '400px' }}
              >
                <Input
                  placeholder="Enter your email"
                  bg="whiteAlpha.100"
                  borderColor="whiteAlpha.300"
                  _placeholder={{ color: 'gray.500' }}
                  _hover={{ borderColor: 'whiteAlpha.400' }}
                  _focus={{ borderColor: 'primary', boxShadow: '0 0 0 1px var(--chakra-colors-primary)' }}
                  size="lg"
                />
                <Button
                  colorScheme="orange"
                  bg="primary"
                  size="lg"
                  px={8}
                  _hover={{ bg: 'orange.600' }}
                >
                  Subscribe
                </Button>
              </HStack>
            </Flex>
          </Box>

          {/* Support Ticket CTA */}
          <Box
            bg="whiteAlpha.100"
            borderRadius="xl"
            p={{ base: 6, md: 8 }}
            mb={8}
            textAlign="center"
          >
            <VStack spacing={4}>
              <Icon as={RiHeadphoneLine} boxSize={12} color="primary" />
              <VStack spacing={2}>
                <Heading size="md" color="white">
                  Need Help?
                </Heading>
                <Text fontSize="sm" color="gray.400" maxW="md">
                  Our support team is here to help. Create a ticket and we'll get back to you as soon as possible.
                </Text>
              </VStack>
              <Button
                as={RLink}
                to="/support"
                size="lg"
                colorScheme="orange"
                bg="primary"
                leftIcon={<RiHeadphoneLine />}
                _hover={{ bg: 'orange.600', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
                px={8}
              >
                Create Support Ticket
              </Button>
            </VStack>
          </Box>

          {/* Bottom Bar */}
          <Divider borderColor="whiteAlpha.200" mb={6} />

          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            gap={4}
          >
            <Text fontSize="sm" color="gray.400" textAlign={{ base: 'center', md: 'left' }}>
              © {new Date().getFullYear()} Veyu Limited. All rights reserved.
            </Text>

            <HStack
              spacing={6}
              fontSize="sm"
              flexWrap="wrap"
              justify="center"
            >
              <Text
                as={RLink}
                to="/terms-of-service"
                color="gray.400"
                _hover={{ color: 'primary' }}
                cursor="pointer"
              >
                Terms
              </Text>
              <Text
                as={RLink}
                to="/privacy-policy"
                color="gray.400"
                _hover={{ color: 'primary' }}
                cursor="pointer"
              >
                Privacy
              </Text>
              <Text
                as={RLink}
                to="/cookies"
                color="gray.400"
                _hover={{ color: 'primary' }}
                cursor="pointer"
              >
                Cookies
              </Text>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  )
}


export const FormStepper = () => {
  return (
    <Box textAlign="center" p={5}>
      {/* Logo */}
      <Image src="/logo512.jpg" alt="Logo" mb={4} width="100px" />

      {/* Title */}
      <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
        Verify your account
      </Text>
      <Text fontSize="md" color="gray.600" mb={8}>
        Verify your account in 4 easy steps!
      </Text>

      {/* Stepper */}
      <HStack justifyContent="space-between" spacing={0}>
        {/* Step 1 */}
        <Flex direction="column" align="center">
          <CheckCircleIcon w={6} h={6} color="blue.500" />
          <Text fontSize="xs" color="blue.500" mt={2}>Step 1</Text>
        </Flex>

        {/* Connector */}
        <Progress colorScheme="blue" size="xs" value={50} width="40px" my="auto" />

        {/* Step 2 */}
        <Flex direction="column" align="center">
          <Circle size="24px" border="2px solid" borderColor="blue.500" />
          <Text fontSize="xs" color="blue.500" mt={2}>Step 2</Text>
        </Flex>

        {/* Connector */}
        <Progress colorScheme="gray" size="xs" value={50} width="40px" my="auto" />

        {/* Step 3 */}
        <Flex direction="column" align="center">
          <Circle size="24px" border="2px solid" borderColor="gray.300" />
          <Text fontSize="xs" color="gray.500" mt={2}>Step 3</Text>
        </Flex>

        {/* Connector */}
        <Progress colorScheme="gray" size="xs" value={50} width="40px" my="auto" />

        {/* Step 4 */}
        <Flex direction="column" align="center">
          <Circle size="24px" border="2px solid" borderColor="gray.300" />
          <Text fontSize="xs" color="gray.500" mt={2}>Step 4</Text>
        </Flex>
      </HStack>
    </Box>
  );
};




