import {useState, useEffect, useContext} from 'react';
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  ButtonGroup,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tabs,
  Text,
  VStack,
  Button,
  Badge,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react"
import {
  Search,
  MessageCircle,
  Bell,
  ShoppingCart,
  User,
  Star,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  ShieldCheck,
  Zap,
} from "lucide-react"
import {ListingItemCard, ImageCarousel, LocationBreadcrumb} from "../../components";
import {GlobalStore} from "../../App";
import {objectifyJSON} from "../../utils";
import ScrollAnimation from 'react-animate-on-scroll';
import {Link} from 'react-router-dom';

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

export default function MainPage() {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [query, setQuery] = useState("");
  const [topDeals, setTopDeals] = useState({
    rentals: [],
    sales: [],
    services: [],
  });
  const {authUser, redirect, axios, notify} = useContext(GlobalStore);

  function navToPage(path){
    if (!query.trim()){
      return redirect(path)
    }
  }

  async function getData(){
    const res = await axios.get(`/listings/my-listings/?scope=recents;top-deals`);
    const data = objectifyJSON(res.data);

    setRecentlyViewed(data.recents);
    setTopDeals(data.top_deals);
  }

  useEffect(() => {
    getData();
  }, [])

  return (
    <Box minH="100vh">
      {/* Hero Section */}
      <Box>
        <Container maxW="container.xl" pb={8} pt={6}>
          <LocationBreadcrumb />

          <Grid
           mt={5}
           templateColumns={{ base: "1fr", md: "1fr 1fr" }}
           gap={8}
           alignItems="center"
           templateAreas={{
              base: `"image" "content"`,  // Reverse order on small screens
              md: `"content image"`,       // Normal order on larger screens
           }}
          >
            <Box gridArea="content">
              <Heading size="xl" mb={4} className="subtitle">
                Your garage, on demand
              </Heading>

              <Text fontSize="md" mb={4}>
                Shop cars, rent vehicles, and book trusted mechanics — all in one seamless experience.
              </Text>

              <Stack spacing={4} align={{ base: 'stretch', md: 'center' }} direction={{ base: 'column', md: 'row' }} mb={4} justify={{ md: 'flex-start' }}>
               {/* <InputGroup size="lg">
                  <InputLeftElement>
                    <Search size="20px"/>
                  </InputLeftElement>
                  <Input
                   value={query}
                   placeholder="Search for cars, rentals or mechanic services..."
                   borderRadius="30px" bg="gray.200"
                   onInput={e => setQuery(e.target.value)}
                  />
                </InputGroup> */}

                <Button as={!query.trim() && Link} to='/buy' colorScheme="blue" bg="primary" size="lg">
                  Shop vehicles
                </Button>
                <Button as={!query.trim() && Link} to='/rent' colorScheme="blue" variant="outline" borderColor="primary" borderWidth={2} size="lg">
                  Rent vehicles
                </Button>
                <Button as={!query.trim() && Link} to='/mechanics' colorScheme="blue" variant="ghost" size="lg">
                  Get a mechanic
                </Button>
              </Stack>
            </Box>

            <Box position="relative" gridArea="image">
              <Image lazy src="/assets/images/hero-image.jpg" alt="Featured Car" w="full" h="auto" />
              <Box width="247px" position="absolute" top={4} right={4}  p={2} borderRadius="md">
                <Image w="100%" lazy src="/assets/icons/1.png" h="auto" alt='icon' />
              </Box>
              <Box width="247px" position="absolute" bottom={200} left={4}  p={2} borderRadius="md" >
                <Image w="247px" lazy src="/assets/icons/2.png" h="auto" alt='icon' />
              </Box>
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* Recently Viewed Section */}
      {
        recentlyViewed?.length > 0 &&
        <Container maxW="7xl" py={12}>
          <Heading size="lg" mb={2}>
            Recently viewed
          </Heading>
          <Text as="p" color="gray.600" mb={8}>
            Catchup where you left!
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={8}>
            {recentlyViewed?.map((listing, index) => (
              <ListingItemCard key={index} listing={listing} />
            ))}
          </SimpleGrid>
        </Container>
      }

      {/* Promotional Banner */}
      <Box bg="primary" color="white">
        <Container maxW="7xl" py={12}>
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={8} alignItems="center">
            <Image src="/assets/images/motaa-car-mid.png" alt="BMW Promotional" />

            <Box>
              <Heading size={{base: "2xl", sm: "3xl", md: "4xl"}} mb={4}>
                Featured tools
              </Heading>

              <Heading className="title" fontWeight="400" size={{base: 'md', md: "lg"}} mb={4} px={4} py={4} bg="tertiary" color="primary">
                Plan smarter. Shop faster.
              </Heading>
              
              <Text mb={6}>
                Calculate payments, compare deals, check affordability, find dealers, and book services — all in one place.
              </Text>

              <Stack spacing={3} direction={{ base: 'column', md: 'row' }} mb={4}>
                <Button as={Link} to='/tools/payment-calculator' size='sm' variant='outline' colorScheme='whiteAlpha' borderColor='white' color='white'>Payment Calculator</Button>
                <Button as={Link} to='/compare' size='sm' variant='outline' colorScheme='whiteAlpha' borderColor='white' color='white'>Compare Deals</Button>
                <Button as={Link} to='/tools/affordability' size='sm' variant='outline' colorScheme='whiteAlpha' borderColor='white' color='white'>Affordability Check</Button>
                <Button as={Link} to='/dealers' size='sm' variant='outline' colorScheme='whiteAlpha' borderColor='white' color='white'>Dealer Finder</Button>
                <Button as={Link} to='/mechanics' size='sm' variant='outline' colorScheme='whiteAlpha' borderColor='white' color='white'>Book Service</Button>
              </Stack>

              <Button as={Link} to='/tools' fontWeight={'600'} bg="tertiary" color="primary" w={{base: '100%', md: '250px'}} size="lg">
                Explore tools
              </Button>
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us Section */}
      <Container maxW="container.xl" my={20}>
        <Heading size="lg" textAlign="center" mb={12}>
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
              icon={<Search size={24} />}
              title="Smart search"
              description="Find the right vehicle or service fast with powerful filters and instant results."
            />
          </ScrollAnimation>

          <ScrollAnimation animateIn="zoomIn">
            <FeatureCard
              icon={<ShieldCheck size={24} />}
              title="Trust & transparency"
              description="Verified partners, clear history, and upfront pricing so you can decide with confidence."
            />
          </ScrollAnimation>

          <ScrollAnimation animateIn="zoomIn">
            <FeatureCard
              icon={<Zap size={24} />}
              title="Effortless experience"
              description="Lightning‑fast booking and built‑in messaging streamline every step from browse to keys."
            />
          </ScrollAnimation>
        </Flex>
        </center>
      </Container>

      {/* Top Deals Section */}
      
      <Container maxW="7xl" py={12} align="center">
        <Heading size="lg" mb={6} textAlign="center">
          Today’s top picks
        </Heading>

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
             borderRadius="30px" px={'35px'}
            >Rent</Tab>

            <Tab as={Button}
              color="primary"
             _selected={{
               bgColor: 'primary',
               color: 'white'
             }}
             borderWidth="1px"
             colorScheme={'blue'}
             borderColor="cornflowerblue"
             borderRadius="30px" px={'35px'}
            >Mechanic</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={8}>
                {topDeals?.sales?.map((listing, index) => (
                  <ListingItemCard key={index} listing={listing} />
                ))}
              </SimpleGrid>
            </TabPanel>

            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={8}>
                {topDeals?.rentals?.map((listing, index) => (
                  <ListingItemCard key={index} listing={listing} />
                ))}
              </SimpleGrid>
            </TabPanel>
            
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={8}>
                {/*{topDeals.services?.map((listing, index) => (
                  <ListingItemCard key={index} listing={listing} />
                ))}*/}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>


    </Box>
  )
}

