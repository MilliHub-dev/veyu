import React from 'react';
import { Box, VStack, HStack, Text, Heading } from '@chakra-ui/react';
import { BusinessLogo } from './BusinessLogo';

/**
 * Demo component to showcase BusinessLogo functionality
 * This can be used for testing and demonstration purposes
 */
export const BusinessLogoDemo = () => {
  const testCases = [
    {
      title: 'Absolute URL Logo',
      logoUrl: 'https://via.placeholder.com/150/FF6B35/FFFFFF?text=LOGO',
      businessName: 'Test Auto Shop',
      size: 'lg'
    },
    {
      title: 'Relative URL Logo',
      logoUrl: '/assets/logo.jpg',
      businessName: 'Veyu Motors',
      size: 'md'
    },
    {
      title: 'No Logo (Fallback to Initials)',
      logoUrl: null,
      businessName: 'Quick Fix Garage',
      size: 'lg'
    },
    {
      title: 'Single Word Business',
      logoUrl: null,
      businessName: 'AutoRepair',
      size: 'md'
    },
    {
      title: 'Custom Colors',
      logoUrl: null,
      businessName: 'Premium Motors',
      size: 'xl',
      fallbackBg: 'blue.500',
      fallbackColor: 'white'
    },
    {
      title: 'Small Size',
      logoUrl: null,
      businessName: 'Tiny Shop',
      size: 'sm'
    }
  ];

  return (
    <Box p={8} maxW="800px" mx="auto">
      <Heading mb={6} textAlign="center">BusinessLogo Component Demo</Heading>
      
      <VStack spacing={8} align="stretch">
        {testCases.map((testCase, index) => (
          <Box key={index} p={4} borderWidth={1} borderRadius="md" bg="gray.50">
            <HStack spacing={4} align="center">
              <BusinessLogo
                logoUrl={testCase.logoUrl}
                businessName={testCase.businessName}
                size={testCase.size}
                fallbackBg={testCase.fallbackBg}
                fallbackColor={testCase.fallbackColor}
              />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">{testCase.title}</Text>
                <Text fontSize="sm" color="gray.600">
                  Business: {testCase.businessName}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Logo URL: {testCase.logoUrl || 'None (fallback to initials)'}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Size: {testCase.size}
                </Text>
              </VStack>
            </HStack>
          </Box>
        ))}
      </VStack>
      
      <Box mt={8} p={4} bg="blue.50" borderRadius="md">
        <Heading size="md" mb={2}>Features Demonstrated:</Heading>
        <VStack align="start" spacing={1}>
          <Text>✅ URL resolution (absolute and relative URLs)</Text>
          <Text>✅ Error handling with fallback to initials</Text>
          <Text>✅ Loading states with skeleton placeholder</Text>
          <Text>✅ Responsive sizing (sm, md, lg, xl, 2xl)</Text>
          <Text>✅ Custom colors for fallback display</Text>
          <Text>✅ Accessibility features (alt text, ARIA labels)</Text>
          <Text>✅ Proper initials generation from business names</Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default BusinessLogoDemo;