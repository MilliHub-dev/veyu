import {
  Box, VStack, Skeleton, SkeletonText, SimpleGrid, HStack
} from "@chakra-ui/react";

export const LoadingState = () => {
  return (
    <VStack spacing={6} align="stretch" py={6} maxW="container.xl" w="100%">
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} alignItems="start">
        <VStack spacing={6} align="stretch" gridColumn={{ md: 'span 2' }}>
          {/* Logo Upload Card Skeleton */}
          <Box bg="white" border="1px solid" borderColor="#d0d5dd" borderRadius="xl" p={6}>
            <VStack spacing={4}>
              <Skeleton height="80px" width="80px" borderRadius="md" />
              <Skeleton height="20px" width="120px" />
            </VStack>
          </Box>

          {/* Business Info Card Skeleton */}
          <Box bg="white" border="1px solid" borderColor="#d0d5dd" borderRadius="xl" p={{ base: 4, md: 6 }}>
            <Skeleton height="24px" width="120px" mb={4} />
            <VStack spacing={4} align="stretch">
              <Box>
                <Skeleton height="16px" width="100px" mb={2} />
                <Skeleton height="40px" width="100%" />
                <Skeleton height="12px" width="150px" mt={2} />
              </Box>
              <Box>
                <Skeleton height="16px" width="80px" mb={2} />
                <Skeleton height="40px" width="100%" />
              </Box>
              <Box>
                <Skeleton height="16px" width="60px" mb={2} />
                <Skeleton height="120px" width="100%" />
                <Skeleton height="12px" width="80px" mt={1} />
              </Box>
            </VStack>
          </Box>

          {/* Registration Card Skeleton */}
          <Box bg="white" border="1px solid" borderColor="#d0d5dd" borderRadius="xl" p={6}>
            <Skeleton height="24px" width="100px" mb={4} />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box>
                <Skeleton height="16px" width="90px" mb={2} />
                <Skeleton height="40px" width="100%" />
              </Box>
              <Box>
                <Skeleton height="16px" width="80px" mb={2} />
                <Skeleton height="40px" width="100%" />
              </Box>
            </SimpleGrid>
          </Box>

          {/* Services Card Skeleton */}
          <Box border="1px solid" borderColor="#d0d5dd" borderRadius="xl" bg="white" overflow="hidden">
            <Box p={4} borderBottom="1px solid" borderColor="#d0d5dd">
              <Skeleton height="16px" width="120px" mb={2} />
              <HStack spacing={2} flexWrap="wrap">
                <Skeleton height="32px" width="80px" borderRadius="full" />
                <Skeleton height="32px" width="100px" borderRadius="full" />
                <Skeleton height="32px" width="90px" borderRadius="full" />
                <Skeleton height="32px" width="110px" borderRadius="full" />
                <Skeleton height="32px" width="85px" borderRadius="full" />
              </HStack>
            </Box>
            <Box p={4}>
              <VStack spacing={3} align="stretch">
                <Box>
                  <Skeleton height="14px" width="100px" mb={2} />
                  <HStack spacing={2}>
                    <Skeleton height="32px" width="80px" borderRadius="full" />
                    <Skeleton height="32px" width="100px" borderRadius="full" />
                  </HStack>
                </Box>
                <Box>
                  <Skeleton height="14px" width="120px" mb={2} />
                  <VStack spacing={2} align="stretch">
                    <Box p={3} border="1px solid" borderColor="#e5e7eb" borderRadius="md" bg="#f9fafb">
                      <Skeleton height="14px" width="140px" mb={1} />
                      <Skeleton height="12px" width="200px" mb={1} />
                      <Skeleton height="12px" width="100px" />
                    </Box>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </Box>

          {/* Contact Details Card Skeleton */}
          <Box bg="white" border="1px solid" borderColor="#d0d5dd" borderRadius="xl" p={6}>
            <Skeleton height="24px" width="130px" mb={4} />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box>
                <Skeleton height="16px" width="50px" mb={2} />
                <Skeleton height="40px" width="100%" />
              </Box>
              <Box>
                <Skeleton height="16px" width="180px" mb={2} />
                <Skeleton height="40px" width="100%" />
              </Box>
            </SimpleGrid>
          </Box>

          {/* Save Button Skeleton */}
          <HStack>
            <Skeleton height="40px" width="120px" />
          </HStack>
        </VStack>

        {/* Preview Card Skeleton */}
        <Box 
          position={{ base: "relative", lg: "sticky" }} 
          top={4} 
          bg="white" 
          border="1px solid" 
          borderColor="#d0d5dd" 
          borderRadius="xl" 
          p={{ base: 4, md: 6 }}
          h="fit-content"
        >
          <Skeleton height="20px" width="60px" mb={4} display={{ base: "block", lg: "none" }} />
          <VStack spacing={3} align="stretch">
            <HStack spacing={3}>
              <Skeleton 
                w={{ base: "50px", md: "60px" }}
                h={{ base: "50px", md: "60px" }}
                borderRadius="md"
              />
              <Box flex={1} minW={0}>
                <Skeleton height="16px" width="120px" mb={1} />
                <Skeleton height="14px" width="80px" />
              </Box>
            </HStack>
            <Box height="1px" bg="#e2e8f0" />
            <SkeletonText noOfLines={3} spacing="2" skeletonHeight="2" />
            <VStack align="start" spacing={1}>
              <Skeleton height="12px" width="150px" />
              <Skeleton height="12px" width="130px" />
            </VStack>
            <VStack spacing={2} align="stretch">
              <HStack spacing={2} flexWrap="wrap">
                <Skeleton height="20px" width="60px" borderRadius="md" />
                <Skeleton height="20px" width="80px" borderRadius="md" />
                <Skeleton height="20px" width="70px" borderRadius="md" />
              </HStack>
            </VStack>
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  );
};

export default LoadingState;