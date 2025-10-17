import { Box, Container, Heading, Text, SimpleGrid, VStack, HStack, Input, Textarea, Button, Card, CardBody, Icon } from '@chakra-ui/react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <Box bg={'gray.50'}>
      <Container maxW="container.xl" py={16}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <VStack align="stretch" spacing={6}>
            <Heading size="2xl">Contact Us</Heading>
            <Text color="gray.600">We'd love to hear from you. Send us a message and our team will respond shortly.</Text>

            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack>
                    <Icon as={Mail} />
                    <Text>support@veyu.cc</Text>
                  </HStack>
                  <HStack>
                    <Icon as={Phone} />
                    <Text>+234 (0) 800 000 0000</Text>
                  </HStack>
                  <HStack>
                    <Icon as={MapPin} />
                    <Text>Lagos, Nigeria</Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Input placeholder="Your name" />
                <Input placeholder="Email address" type="email" />
                <Textarea placeholder="How can we help?" rows={6} />
                <Button colorScheme="blue">Send Message</Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
