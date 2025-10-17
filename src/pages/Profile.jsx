import { Box, Container, Heading, Text, SimpleGrid, VStack, HStack, Avatar, Button, Card, CardBody, CardHeader } from '@chakra-ui/react';

export default function PublicProfilePage() {
  return (
    <Box bg={'gray.50'}>
      <Container maxW="container.xl" py={16}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          <Card gridColumn={{ base: 'span 1', md: 'span 1' }}>
            <CardHeader>
              <HStack spacing={3}>
                <Avatar name="Guest User" />
                <VStack align="flex-start" spacing={0}>
                  <Heading size="md">Your Profile</Heading>
                  <Text color="gray.500">Sign in to personalize your experience</Text>
                </VStack>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Button as={'a'} href="/login" colorScheme="blue">Sign In</Button>
                <Button as={'a'} href="/signup" variant="outline">Create Account</Button>
              </VStack>
            </CardBody>
          </Card>

          <Card gridColumn={{ base: 'span 1', md: 'span 2' }}>
            <CardHeader>
              <Heading size="md">Why create an account?</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Text>• Save favorite vehicles and compare easily</Text>
                <Text>• Track orders, bookings and wallet activity</Text>
                <Text>• Chat with dealers and mechanics in one place</Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
