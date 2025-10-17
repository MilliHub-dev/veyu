import { Box, Container, Heading, Text, SimpleGrid, VStack, HStack, Icon, Card, CardHeader, CardBody, Button } from '@chakra-ui/react';
import { Car, Wrench, ShieldCheck, Wallet, MessageCircle, Truck } from 'lucide-react';

export default function ServicesPage() {
  const services = [
    { icon: Car, title: 'Buy & Sell Vehicles', desc: 'Browse verified listings across cars, bikes, boats, aircraft, UAVs and more.' },
    { icon: Truck, title: 'Rentals', desc: 'Flexible daily, weekly, or monthly rentals for diverse vehicle categories.' },
    { icon: Wrench, title: 'Mechanic Marketplace', desc: 'Find verified service providers, book maintenance and repairs seamlessly.' },
    { icon: ShieldCheck, title: 'Verification', desc: 'Business verification for dealers and mechanics to ensure trust and safety.' },
    { icon: Wallet, title: 'Digital Wallet & Payments', desc: 'Fund, pay, and withdraw securely with a built‑in wallet and receipts.' },
    { icon: MessageCircle, title: 'Chat & Notifications', desc: 'Negotiate, book, and get updates on listings and services in real time.' },
  ];

  return (
    <Box bg={'gray.50'}>
      <Container maxW="container.xl" py={16}>
        <VStack align="stretch" spacing={8}>
          <Heading size="2xl">Our Services</Heading>
          <Text color="gray.600" fontSize="lg">Everything you need to buy, rent, and maintain vehicles — in one place.</Text>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {services.map((s, i) => (
              <Card key={i} borderRadius="lg">
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={s.icon} color="primary" />
                    <Heading size="md">{s.title}</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Text color="gray.600">{s.desc}</Text>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          <HStack>
            <Button as={'a'} href="/signup" colorScheme="blue">Get Started</Button>
            <Button as={'a'} href="/login" variant="outline">Sign In</Button>
          </HStack>

          <VStack align="stretch" spacing={4} pt={6}>
            <Heading size="md">Vehicle Categories</Heading>
            <HStack spacing={3} wrap={'wrap'}>
              <Button size="sm" variant="outline">Cars</Button>
              <Button size="sm" variant="outline">Bikes</Button>
              <Button size="sm" variant="outline">Boats</Button>
              <Button size="sm" variant="outline">Aircraft</Button>
              <Button size="sm" variant="outline">UAV / Drones</Button>
              <Button size="sm" variant="outline">Trucks & Buses</Button>
            </HStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
