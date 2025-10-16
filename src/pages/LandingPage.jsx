import {useRef, useContext, Fragment, useState, useEffect} from 'react';
import {
    Box,
    Button,
    Flex,
    Icon,
    Text,
    useMediaQuery,
    Container,
    Heading,
    SimpleGrid,
    VStack,
    HStack,
    InputLeftElement,
    InputGroup,
    Image,
    Accordion,
    AccordionItem,
    AccordionPanel,
    AccordionButton,
    Tabs, TabList, Tab,
    ButtonGroup, 
    Stack,
    Input,
    Avatar,
    Select,
    InputRightElement,
} from "@chakra-ui/react";
import {Link, useNavigate} from 'react-router-dom';
import { Autocomplete } from '@react-google-maps/api';
import { Globe, Shield, Clock, Star, } from 'lucide-react'
import { Search, Car, DollarSign, Key, PenToolIcon as Tools } from 'lucide-react'
import Layout from "./Layout";
import {motion, } from 'framer-motion';
import {FaCirclePlus, FaCircleMinus, FaPlus} from 'react-icons/fa6';
import {RxArrowRight} from 'react-icons/rx';
import faqs from '../data/faqs.json';
import '../assets/Home.css';
import ScrollAnimation from 'react-animate-on-scroll';
import { DashboardSearchBar } from '../components';
import { MdHeight } from 'react-icons/md';

const featureList = [
  {
    label: 'Buy',
    background: {
      xAxis: '90%',
      yAxis: '10%'
    },
    image: '/assets/images/sell_car.jpg',
    cta: {
      label: 'Find your car',
      link: ''
    },
    content: 'Get more value for your car faster, easier and more securely',
    card: {
      image: {
        mobile: '/assets/images/buy-widget-mobile.svg',
        desktop: '/assets/images/buy-widget.svg'
      },
      posX: '10%',
      posY: '27.5%'
    }
  },
  {
    label: 'Sell',
    background: {
      xAxis: '50%',
      yAxis: '10%'
    },
    image: '/assets/images/list_car.jpg',
    cta: {
      label: 'List your car',
      link: ''
    },
    content: 'List your car for sale and get it sold in no time. Veyu connects you to verified dealers and certified mechanics across the Globe.',
    card: {
      image: {
        mobile: '/assets/images/sale-widget-mobile.svg',
        desktop: '/assets/images/sell-widget.svg'
      },
      posX: '50%',
      posY: '25px'
    }
  },
  {
    label: 'Rent',
    background: {
      xAxis: '70%',
      yAxis: '10%'
    },
    image: '/assets/images/image.jpg',
    cta: {
      label: 'Find Rentals',
      link: ''
    },
    content: 'Choose from a premium fleet of rental cars. Whether for business or leisure, Veyu has the car you need.',
    card: {
      image: {
        mobile: '/assets/images/rent-not-mobile.svg',
        desktop: '/assets/images/rent-not.svg'
      },
      posX: '50%',
      posY: '55.0%'
    }
  },
  {
    label: 'Find Mechanic',
    background: {
      xAxis: '50%',
      yAxis: '10%'
    },
    image: '/assets/images/mechanic.jpg',
    cta: {
      label: 'Find Mechanics',
      link: ''
    },
    content: 'Get to hire the best of mechanics in your area. Veyu connects you to verified dealers and certified mechanics across the Globe.',
    card: {
      image: {
        mobile: '/assets/images/rent-not-mobile.svg',
        desktop: '/assets/images/rent-not.svg'
      },
      posX: '50%',
      posY: '15.0%'
    }
  },
]

function HowItWorks(){
  const steps = [
    { icon: Search, title: 'Search', text: 'Find vehicles, rentals, or mechanics near you.' },
    { icon: Car, title: 'Compare', text: 'Compare options, prices, and ratings.' },
    { icon: Key, title: 'Book/Buy', text: 'Secure checkout and instant booking.' },
    { icon: Shield, title: 'Drive/Service', text: 'Enjoy verified partners and support.' },
  ];
  return (
    <Box py={16}>
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <Heading size="lg" textAlign="center" textColor='primary'>How it works</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6} mt={8}>
          {steps.map((s, i) => (
            <VStack key={i} p={6} bg="white" borderRadius="lg" boxShadow="sm" align="start">
              <Icon as={s.icon} color="primary" />
              <Text fontWeight="bold">{s.title}</Text>
              <Text color="gray.600">{s.text}</Text>
            </VStack>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}

function TrustedBy(){
  const brands = [
    'Toyota','Honda','BMW','Mercedes','Lexus','Kia',
    'Yamaha','Ducati','Kawasaki','Suzuki',
    'Bayliner','Sea Ray','Tracker','Yamaha Boats',
    'Cessna','Bombardier','Airbus','Boeing',
    'Trek','Giant','Specialized'
  ];
  return (
    <Box py={12} bg="gray.50">
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <Heading size="md" textAlign="center" color="gray.700">Trusted by buyers, renters, dealers, mechanics, and riders</Heading>
        <Flex mt={6} wrap="wrap" gap={4} justify="center">
          {brands.map((b, i) => (
            <Box key={i} px={4} py={2} borderRadius="full" bg="white" boxShadow="sm" borderWidth="1px">{b}</Box>
          ))}
        </Flex>
      </Container>
    </Box>
  )
}
export const HomePage = ({ props }) => {
    const heroRef = useRef();
    const [isMobile] = useMediaQuery('(max-width: 760px)');

    return(
      <div>
        <SearchHero />
        <FeaturedDeals />
        <HowItWorks />
        <TrustedBy />

        <Features />

        <Container maxW="container.xl" px={4} py={10}>
          <Heading my={5} textAlign="center" size="lg" textColor='primary'> Browse all Vehicles </Heading>

          <Tabs colorScheme="blue"  align="center" mb={8}>
            <TabList align="center" mx="auto" as={ButtonGroup} size='md' border="none" isAttached variant='outline' mt={3}>
              <Tab as={Button}
                color="primary"
               _selected={{
                 bgColor: 'primary',
                 color: 'white'
               }}
               borderWidth="1px"
               colorScheme={'blue'}
               borderColor="cornflowerblue"
               width="150px"
               borderRadius="30px" px={'35px'}
              >Buy</Tab>

              <Tab as={Button}
                color="primary"
               _selected={{
                 bgColor: 'primary',
                 color: 'white'
               }}
               borderWidth="1px"
               colorScheme={'blue'}
               borderColor="cornflowerblue"
               width="150px"
               borderRadius="30px" px={'35px'}
              >Rent</Tab>
            </TabList>
          </Tabs>

          <Stack px={4}>
            <Heading size="md" textColor='primary'> Popular Brands & Types </Heading>

            <SimpleGrid columns={{ base: 2, sm: 3, md: 5, lg: 6 }} spacing={4} py={6}>
              {[
                { name: 'Toyota', type: 'Cars', logo: '/assets/icons/ToyotaLogo.svg' },
                { name: 'Ford', type: 'Cars', logo: '/assets/icons/FordLogo.svg' },
                { name: 'BMW', type: 'Cars', logo: '/assets/icons/BmwLogo.svg' },
                { name: 'Mercedes', type: 'Cars', logo: '/assets/icons/MercedesLogo.svg' },
                { name: 'Honda', type: 'Cars', logo: '/assets/icons/car.png' },
                { name: 'Lexus', type: 'Cars', logo: '/assets/icons/car.png' },
                { name: 'Yamaha', type: 'Bikes', logo: '/assets/icons/sportbike.png' },
                { name: 'Kawasaki', type: 'Bikes', logo: '/assets/icons/sportbike.png' },
                { name: 'Suzuki', type: 'Bikes', logo: '/assets/icons/sportbike.png' },
                { name: 'Bayliner', type: 'Boats', logo: '/assets/icons/boat.png' },
                { name: 'Sea Ray', type: 'Boats', logo: '/assets/icons/boat.png' },
                { name: 'Tracker', type: 'Boats', logo: '/assets/icons/boat.png' },
                { name: 'Cessna', type: 'Aircraft', logo: '/assets/icons/plane.png' },
                { name: 'Airbus', type: 'Aircraft', logo: '/assets/icons/Airbus-Logo.png' },
                { name: 'Boeing', type: 'Aircraft', logo: '/assets/icons/plane.png' },
                { name: 'DJI', type: 'Drones', logo: '/assets/icons/plane.png' },
                { name: 'Parrot', type: 'Drones', logo: '/assets/icons/plane.png' },
                { name: 'Autel', type: 'Drones', logo: '/assets/icons/plane.png' },
              ].map((item, idx) => (
                <ScrollAnimation key={idx} animateIn="zoomIn">
                  <Flex
                    direction="column"
                    align="center"
                    gap={2}
                    p={3}
                    borderWidth="1px"
                    borderRadius="lg"
                    bg="white"
                    boxShadow="sm"
                    _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                    transition="all .2s"
                  >
                    <Image
                      src={item.logo || '/placeholder.svg?height=40&width=40'}
                      alt={item.name}
                      boxSize="40px"
                      objectFit="contain"
                    />
                    <Text fontWeight="semibold" fontSize="sm">{item.name}</Text>
                    <Text fontSize="xs" color="gray.500">{item.type}</Text>
                  </Flex>
                </ScrollAnimation>
              ))}
            </SimpleGrid>
          </Stack>

         {/*  <Stack px={4}>
            <Heading size="md"> Top Brands </Heading>

            <Stack placeItems="center">
              <Flex w={'100%'} alignItems="center" gap={8} justify="space-between" className="hidden-scroll" flexWrap="nowrap" overflowX='scroll' py={10}>
                {[
                  {name: 'Toyota', logo: '/assets/icons/ToyotaLogo.svg'},
                  {name: 'Ford', logo: '/assets/icons/FordLogo.svg'},
                  {name: 'BMW', logo: '/assets/icons/BmwLogo.svg'},
                  {name: 'Mercedes Benz', logo: '/assets/icons/MercedesLogo.svg'},
                ].map((brand) => 
                  <ScrollAnimation animateIn="bounceIn">
                    <Stack minW={'250px'} maxW={'250px'} px={4} py={4} rounded="xl" bgColor="gray.100" placeItems="center">
                      <Image loading="eager" src={brand.logo} width={'100px'} />

                      <Heading size="md" textTransform="uppercase" mt={5}> {brand.name} </Heading>
                    </Stack>
                  </ScrollAnimation>
                )}
              </Flex>

              <Button variant="outline" maxW={'200px'} rightIcon={<FaPlus />}> Show all Brands </Button>
            </Stack>
          </Stack>
        */}
        </Container>

        <Testimonials />

        <Partnership />

        {/* FAQs */}
        <Container maxW={{md: '75%'}} py={'100px'} textAlign={'center'}>
          <Text my={2} className='title' textColor='primary'> Frequently Asked Questions </Text>
          <Text my={2} className='text' textColor='primary'> Still not convinced? <a href={'/'} className='link'>Chat with our team here.</a> </Text>

          <Stack mt={10} maxW={{md: '500px'}} mx={'auto'}>
            <Accordion allowMultiple allowToggle border={'none'} textAlign={'left'}>
              {
                faqs.map((faq, idx) => 
                    <AccordionItem borderRadius={5} my={4} border={'1px solid lavender'}>
                      {({ isExpanded }) => (
                        <Fragment key={idx}>
                        <AccordionButton as={Flex} wrap={'nowrap'} alignItems={'center'} justifyContent={'space-between'}>
                          <Text flex={1} className='' size="md" textAlign={'left'}> {faq?.question} </Text>
                          <Icon className='icon' fontSize={'20px'}>{isExpanded ? <FaCircleMinus /> : <FaCirclePlus /> }</Icon>
                        </AccordionButton>

                        <AccordionPanel px={3} py={3}>
                          <Text className=''>{faq?.answer}</Text>
                        </AccordionPanel>
                        </Fragment>
                      )}
                    </AccordionItem>
              )}
            </Accordion>
          </Stack>
        </Container>
      </div>
    )
}

export default HomePage;

function SearchHero(){
  const [isMobile] = useMediaQuery('(max-width: 760px)');
  const navigate = useNavigate();
  const [type, setType] = useState('vehicles');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [places, setPlaces] = useState(null);
  const [showMakeSug, setShowMakeSug] = useState(false);
  const [showModelSug, setShowModelSug] = useState(false);

  const makesByType = {
    vehicles: ['Toyota','Honda','BMW','Mercedes','Lexus','Kia','Ford','Audi'],
    bikes: ['Yamaha','Honda','Kawasaki','Ducati','Suzuki'],
    boats: ['Bayliner','Sea Ray','Yamaha Boats','Tracker'],
  };
  const modelsByMake = {
    Toyota: ['Camry','Corolla','RAV4','Highlander'],
    Honda: ['Accord','Civic','CR-V'],
    BMW: ['3 Series','5 Series','X3','X5'],
    Yamaha: ['R1','R6','MT-07'],
  };

  useEffect(() => {
    // Hide model suggestions when switching type or make
    setShowModelSug(false);
  }, [type, make]);

  function onSearch(){
    const params = new URLSearchParams();
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (location) params.set('q', location);

    if (type === 'mechanics'){
      navigate(`/search/mechanics/?${params.toString()}`);
      return;
    }
    // default search endpoint supports filtering by type
    params.set('type', type);
    navigate(`/search/cars/?${params.toString()}`);
  }
  function useMyLocation(){
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setLocation(`${latitude.toFixed(5)},${longitude.toFixed(5)}`);
    });
  }
  return (
    <Box
      as={motion.section}
      id='welcome'
      position="relative"
      overflow="hidden"
      py={{ base: 16, md: 28 }}
    >
      {/* Blurred background image layer */}
      <Box
        position="absolute"
        inset={0}
        bgImage={`url('/assets/veyu/land1.jpg')`}
        bgSize="cover"
        bgPos="center"
        filter="blur(3px)"
        transform="scale(1.05)"
      />
      {/* Dark overlay to increase contrast */}
      <Box position="absolute" inset={0} bg="blackAlpha.600" />

      <Container position="relative" zIndex={1} maxW="7xl" px={{ base: 4, md: 8 }}>
        <VStack align="start" spacing={6} color="white">
          <Heading size={{ base: 'xl', md: '2xl' }} lineHeight={1.1}>
            Find your next vehicle or service
          </Heading>
          <Text maxW={{ base: '100%', md: '60%' }} fontSize={{ base: 'md', md: 'lg' }}>
            Buy, rent, or service cars, aircraft, bikes, boats, and more. Compare prices, explore deals, and book with verified partners.
          </Text>

          <Box bg="white" borderRadius="lg" p={{ base: 3, md: 5 }} w="100%" maxW="1000px" boxShadow="lg">
            <Tabs variant="soft-rounded" colorScheme="blue" onChange={(i) => setType(['vehicles','bikes','boats','mechanics'][i])}>
              <TabList flexWrap={'wrap'}>
                <Tab>Vehicles</Tab>
                <Tab>Aircraft</Tab>
                <Tab>Bikes</Tab>
                <Tab>Boats</Tab>
                <Tab>Mechanics</Tab>
              </TabList>
            </Tabs>

            <Flex direction={{ base: 'column', md: 'row' }} gap={3} mt={3}>
              <InputGroup position="relative">
                <InputLeftElement pointerEvents="none">
                  <Icon as={Search} color="gray.400" />
                </InputLeftElement>
                <Input
                  value={make}
                  onChange={(e) => { setMake(e.target.value); setShowMakeSug(true); }}
                  onFocus={() => setShowMakeSug(true)}
                  onBlur={() => setTimeout(() => setShowMakeSug(false), 150)}
                  placeholder={(type === 'bikes' ? 'Brand (e.g., Yamaha)' : type === 'boats' ? 'Brand (e.g., Bayliner)' : 'Make (e.g., Toyota)')}
                  bg="gray.50"
                />
                {showMakeSug && (
                  <Box position="absolute" top="42px" left={0} right={0} bg="white" borderWidth="1px" borderRadius="md" zIndex={5} maxH="200px" overflowY="auto">
                    {(makesByType[type] || []).filter(m => m.toLowerCase().includes(make.toLowerCase())).slice(0,8).map((m,i) => (
                      <Box key={i} px={3} py={2} _hover={{ bg: 'gray.50' }} cursor="pointer" onMouseDown={() => { setMake(m); setShowMakeSug(false); }}>
                        {m}
                      </Box>
                    ))}
                  </Box>
                )}
              </InputGroup>
              {type !== 'mechanics' && (
                <InputGroup position="relative">
                  <Input
                    value={model}
                    onChange={(e) => { setModel(e.target.value); setShowModelSug(true); }}
                    onFocus={() => setShowModelSug(true)}
                    onBlur={() => setTimeout(() => setShowModelSug(false), 150)}
                    placeholder="Model (e.g., Camry)"
                    bg="gray.50"
                  />
                  {showModelSug && (
                    <Box position="absolute" top="42px" left={0} right={0} bg="white" borderWidth="1px" borderRadius="md" zIndex={5} maxH="200px" overflowY="auto">
                      {(modelsByMake[make] || []).filter(md => md.toLowerCase().includes(model.toLowerCase())).slice(0,8).map((md,i) => (
                        <Box key={i} px={3} py={2} _hover={{ bg: 'gray.50' }} cursor="pointer" onMouseDown={() => { setModel(md); setShowModelSug(false); }}>
                          {md}
                        </Box>
                      ))}
                    </Box>
                  )}
                </InputGroup>
              )}
              <Box flex={1}>
                <Autocomplete onLoad={(inst) => setPlaces(inst)} onPlaceChanged={() => {
                  const plc = places?.getPlace?.();
                  const addr = plc?.formatted_address || plc?.name;
                  if (addr) setLocation(addr);
                }}>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or ZIP" bg="gray.50" />
                </Autocomplete>
                <Button size="xs" variant="ghost" mt={1} onClick={useMyLocation}>Use my location</Button>
              </Box>
            </Flex>
            <Box mt={3} textAlign={{ base: 'center', md: 'left' }}>
              <Button onClick={onSearch} colorScheme="blue" bg="primary" px={10} w={{ base: '100%', md: 'auto' }} size={{ base: 'lg', md: 'md' }}>
                Search
              </Button>
            </Box>
            <HStack spacing={4} mt={3} color="gray.600" flexWrap="wrap">
              <Text fontSize="sm">Popular: Toyota, Honda, BMW • Motorbikes • Boats</Text>
            </HStack>
          </Box>

          <HStack spacing={6} pt={4} color="whiteAlpha.900" flexWrap="wrap">
            <HStack><Icon as={Shield} /><Text>Verified dealers</Text></HStack>
            <HStack><Icon as={DollarSign} /><Text>Transparent pricing</Text></HStack>
            <HStack><Icon as={Clock} /><Text>Fast checkout</Text></HStack>
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}

function FeaturedDeals(){
  const cards = [
    { title: 'Toyota Camry 2021', price: '₦12,500,000', img: '/assets/images/sell_car.jpg', meta: '45k km • Automatic • Petrol' },
    { title: 'Honda Accord 2020', price: '₦11,200,000', img: '/assets/images/list_car.jpg', meta: '38k km • Automatic • Petrol' },
    { title: 'Mercedes C300 2019', price: '₦22,800,000', img: '/assets/images/hero-image.jpg', meta: '25k km • Automatic • Petrol' },
    { title: 'Lexus RX350 2018', price: '₦27,000,000', img: '/assets/images/image.jpg', meta: '60k km • Automatic • Petrol' },
  ];

  return (
    <Box py={12} bg="gray.50">
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <Heading size="lg" mb={6} textAlign={{ base: 'left', md: 'center' }} textColor='primary'>
          Featured deals near you
        </Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {cards.map((c, i) => (
            <Box key={i} bg="white" borderRadius="lg" overflow="hidden" boxShadow="sm" _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }} transition="all .2s">
              <Image src={c.img} alt={c.title} h="180px" w="100%" objectFit="cover" />
              <Box p={4}>
                <Text fontWeight="bold">{c.title}</Text>
                <Text color="primary" fontWeight="800" mt={1}>{c.price}</Text>
                <Text fontSize="sm" color="gray.600" mt={1}>{c.meta}</Text>
                <Button mt={3} size="sm" rightIcon={<RxArrowRight />}>View details</Button>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}

function Partnership() {
  return (
    <Box
      py={20}
      position="relative"
      color="white"
      backgroundImage={`url('/assets/veyu/homes.jpg')`}
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      minH={'460px'}
      backgroundPosition="center"
    >
      <Box position="absolute" inset={0} bg="blackAlpha.700" />
      <Container position="relative" zIndex={1} maxW="7xl">
        <VStack spacing={6} textAlign="center">
          <Heading size="lg" align="center">
            Ready to Move your business forward<Text as="span" color="tertiary">?</Text>
            <br /> partner with us today.
          </Heading>

          <Text fontSize="lg" maxW="2xl">
            Whether you're a dealer, mechanic, or fleet operator, Veyu helps you grow with tools that convert.
          </Text>
          <HStack spacing={4}>
            <Link to="/signup/business">
            <Button colorScheme="yellow" bg="tertiary" color="primary" rightIcon={<RxArrowRight />} size="md" width="200px">
              Get started
            </Button>
            </Link>
            <Button variant="outline" colorScheme="whiteAlpha" borderColor="white" color="white">Learn more</Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}



// Feature Card Component
function FeatureCard({ icon, title, description, ...props }) {
  return (
    <Box bgGradient="linear(to-br, white, gray.50)" minW={'260px'} maxW={'320px'} p={8} borderRadius="2xl" boxShadow="lg" textAlign="left" _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }} transition="all .2s" {...props}>
      <Box bg="blue.100" w="fit-content" px={4} py={3} borderRadius="full" mb={4}>
        {icon}
      </Box>
      <Text fontSize="lg" color="primary" fontWeight="bold" mb={1}>
        {title}
      </Text>
      <Text color="gray.600">{description}</Text>
    </Box>
  )
}


function Features() {
  return (
    <Box py={16}>
      <Container maxW="container.xl">
        <Heading size="lg" textAlign="center" mb={12} textColor='primary'>
          Why Veyu<Text as="span" color="primary">?</Text>
        </Heading>
          <center>
                  <Flex
                  w={'100%'}
                  className="hidden-scroll"
                  alignItems="center"
                  px={4} gap={8} justify="space-between"
                  flexWrap="nowrap"
                  overflowX='scroll'
                  py={10}
                  >
                    <ScrollAnimation animateIn="zoomIn">
                      <FeatureCard
                        icon={<Icon as={Image} fontSize="25px" src="/assets/icons/market.png" />}
                        title="All in One Marketplace"
                        description="Veyu offers you the best experience by providing solutions to your Vehicles needs all in one place."
                      />
                    </ScrollAnimation>

                    <ScrollAnimation animateIn="zoomIn">
                      <FeatureCard
                        icon={<Icon as={Image} fontSize="25px" src="/assets/icons/trust.png" />}
                        title="Trust & Transparency"
                        description="Have peace of mind when dealing on Veyu with our secure technology and verified partners."
                      />
                    </ScrollAnimation>

                    <ScrollAnimation animateIn="zoomIn">
                      <FeatureCard
                        icon={<Icon as={Image} fontSize="25px" src="/assets/icons/easy.png" />}
                        title="Ease of Use"
                        description="Veyu makes it easy for users to find Vehicles and mechanics with our easy flow."
                      />
                    </ScrollAnimation>

                     <ScrollAnimation animateIn="zoomIn">
                      <FeatureCard
                        icon={<Icon as={Image} fontSize="25px" src="/assets/icons/creative.png" />}
                        title="Educative Content"
                        description="With Veyu Reels Whether you're a first-time car owner, a bike enthusiast, or a fleet operator, Veyu Reels helps you learn fast and drive smart  all in under 60 seconds"
                      />
                    </ScrollAnimation>
                  </Flex>
            </center>
      </Container>
    </Box>
  )
}


function TestimonialCard({ name, role, comment, rating, avatar, title }) {
  return (
    <Box
      bg="white"
      p={6}
      borderRadius="20px"
      boxShadow="md"
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-4px)' }}
      minW="280px"
      maxW="280px"

    >
      <Flex gap={2}>
        <Avatar name={name} src={avatar} />
        <HStack spacing={1} mb={4}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon
              key={i}
              as={Star}
              color={i < rating ? 'yellow.400' : 'gray.300'}
              fill={i < rating ? 'currentColor' : 'none'}
            />
          ))}
        </HStack>
      </Flex>

      <Text my={2} fontWeight="bold">"{title}"</Text>

      <Text color="gray.600" mb={4}>
        {comment}
      </Text>

      <HStack spacing={3}>  
        <Box>
          <Text fontWeight="bold">{name}</Text>
          <Text fontSize="sm" color="gray.500">
            {role}
          </Text>
        </Box>
      </HStack>
    </Box>
  )
}

function Testimonials() {
  const testimonials = [
    {
      name: 'Amaka O.',
      role: 'Bought a Lexus RX 350',
      title: "Seamless from search to keys",
      comment:
        'Found the exact spec I wanted and closed in days. Pricing transparency is A+.',
      rating: 5,
      avatar: '/assets/images/list_car.jpg',
    },
    {
      name: 'Tunde A.',
      role: 'Booked a mobile mechanic',
      title: "Reliable pros, fast booking",
      comment:
        'The mechanic arrived on time and fixed my brakes same day. Will use again.',
      rating: 5,
      avatar: '/assets/images/mechanic.jpg',
    },
    {
      name: 'Chioma N.',
      role: 'Weekend boat rental',
      title: "Great selection and service",
      comment:
        'Smooth checkout, fair pricing, and the boat was immaculate. Perfect getaway!',
      rating: 5,
      avatar: '/assets/images/image.jpg',
    },
    {
      name: 'Ola D.',
      role: 'Motorbike enthusiast',
      title: "Love the multi-vehicle options",
      comment:
        'Nice to have bikes, cars, and boats in one place. Super convenient!',
      rating: 5,
      avatar: '/assets/images/sell_car.jpg',
    },
  ]

  return (
    <Box py={16} bg="gray.50">
      <Container maxW="7xl">
        <Heading size="lg" textAlign="center" mb={12} textColor='primary'>
          What our clients say
        </Heading>
        <Flex px={4} py={10} flexWrap="nowrap" justify="space-between" overflowX="scroll" className="hidden-scroll" gap={4}>
          {testimonials.map((testimonial, index) => (
            <ScrollAnimation animateIn="slideIn" delay={Number(`0.${index}s`)}>
              <TestimonialCard key={index} {...testimonial} />
            </ScrollAnimation>
          ))}
        </Flex>
      </Container>
    </Box>
  )
}



