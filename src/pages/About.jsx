import { Box, Container, Heading, Text, SimpleGrid, Image, Stack, Button, HStack, VStack, Icon } from '@chakra-ui/react';
import { CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <Box bg={'gray.50'}>
      <Box bg={'white'} borderBottomWidth={1} borderColor={'gray.200'}>
        <Container maxW="container.xl" py={16}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <VStack align="flex-start" spacing={5}>
              <Heading size="2xl">About Veyu</Heading>
              <Text color="gray.600" fontSize="lg">
                Veyu is an all‑in‑one vehicle marketplace designed to streamline transactions and
                services across cars, bikes, boats, aircraft, UAVs and more. We connect buyers,
                sellers, renters, and service providers in one secure platform.
              </Text>
              <HStack spacing={4} color="green.600">
                <Icon as={CheckCircle} />
                <Text>Verified dealers, mechanics and service providers</Text>
              </HStack>
              <HStack spacing={4} color="green.600">
                <Icon as={CheckCircle} />
                <Text>Secure payments and wallet</Text>
              </HStack>
              <HStack spacing={4} color="green.600">
                <Icon as={CheckCircle} />
                <Text>Seamless chat, bookings and notifications</Text>
              </HStack>
              <HStack spacing={3} pt={4}>
                <Button colorScheme="blue" as={'a'} href="/buy">Explore Vehicles</Button>
                <Button variant="outline" as={'a'} href="/rent">Rent a Vehicle</Button>
              </HStack>
            </VStack>
            <Image src="/assets/images/list_car.jpg" w={'100%'} h={'auto'} borderRadius="lg" alt="About Veyu" objectFit="cover" />
          </SimpleGrid>
        </Container>
      </Box>

      <Container maxW="container.xl" py={16}>
        <Heading size="lg" mb={6}>Our Mission</Heading>
        <Text color="gray.700" fontSize="lg">
          Empower the vehicle ecosystem with transparent discovery, fair pricing, and reliable
          services backed by modern technology—from road to water and air.
        </Text>
      </Container>

      <Container maxW="container.xl" pb={16}>
        <Heading size="md" mb={4}>Supported Categories</Heading>
        <HStack spacing={3} wrap={'wrap'}>
          <Button size="sm" variant="outline">Cars</Button>
          <Button size="sm" variant="outline">Bikes</Button>
          <Button size="sm" variant="outline">Boats</Button>
          <Button size="sm" variant="outline">Aircraft</Button>
          <Button size="sm" variant="outline">UAV / Drones</Button>
          <Button size="sm" variant="outline">Trucks & Buses</Button>
        </HStack>
      </Container>
    </Box>
  );
}
