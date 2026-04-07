import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

/**
 * Full-screen overlay modal prompting users to download the Veyu app.
 *
 * Props:
 *   isOpen      – boolean
 *   onClose     – function
 *   heading     – string, e.g. "Complete Your Purchase"
 *   subheading  – string, e.g. "Download the Veyu app to buy this vehicle securely"
 *   summaryName – string (optional), shown in the orange card below the header
 *   summaryPrice– string (optional), already formatted currency string
 */
export function AppDownloadModal({ isOpen, onClose, heading, subheading, summaryName, summaryPrice }) {
  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="blackAlpha.600"
      onClick={onClose}
    >
      <Box
        bg="white"
        borderRadius="2xl"
        overflow="hidden"
        maxW="380px"
        w="90vw"
        boxShadow="0 25px 60px rgba(0,0,0,0.25)"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box
          bgGradient="linear(135deg, #F4A950, #e8821a)"
          px={6}
          pt={6}
          pb={10}
          position="relative"
          textAlign="center"
        >
          <Box
            as="button"
            position="absolute"
            top={3}
            right={3}
            w="28px"
            h="28px"
            borderRadius="full"
            bg="whiteAlpha.200"
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="16px"
            fontWeight="bold"
            _hover={{ bg: 'whiteAlpha.400' }}
            onClick={onClose}
          >
            ×
          </Box>
          <Text fontSize="3xl" mb={2}>📱</Text>
          <Heading size="md" color="white" mb={1}>{heading || 'Download the Veyu App'}</Heading>
          <Text fontSize="sm" color="whiteAlpha.900">
            {subheading || 'Get the full experience on our mobile app'}
          </Text>
        </Box>

        {/* Optional summary card */}
        {(summaryName || summaryPrice) && (
          <Box px={6} py={4} bg="orange.50" mx={6} mt={-5} borderRadius="xl" boxShadow="sm">
            {summaryName && (
              <Text fontWeight="bold" fontSize="sm" color="gray.800" noOfLines={2}>
                {summaryName}
              </Text>
            )}
            {summaryPrice && (
              <Text fontWeight="bold" fontSize="lg" color="#F4A950" mt={1}>
                {summaryPrice}
              </Text>
            )}
          </Box>
        )}

        {/* Store buttons */}
        <VStack px={6} py={5} spacing={3}>
          <Text fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" alignSelf="flex-start">
            Download for free
          </Text>

          {/* App Store */}
          <Box
            as="a"
            href="https://apps.apple.com/us/app/veyu/id6761031037"
            target="_blank"
            rel="noopener noreferrer"
            display="flex"
            alignItems="center"
            w="full"
            bg="black"
            borderRadius="xl"
            px={4}
            py={3}
            gap={3}
            _hover={{ opacity: 0.85, transform: 'translateY(-1px)' }}
            transition="all 0.2s"
          >
            <Text fontSize="22px" lineHeight="1" flexShrink={0}>🍎</Text>
            <VStack spacing={0} align="flex-start" flex={1}>
              <Text fontSize="9px" color="gray.400" lineHeight="1">Download on the</Text>
              <Text fontSize="15px" color="white" fontWeight="bold" lineHeight="1.3">App Store</Text>
            </VStack>
          </Box>

          {/* Google Play */}
          <Box
            as="a"
            href="https://play.google.com/store/apps/details?id=com.millihub.veyu"
            target="_blank"
            rel="noopener noreferrer"
            display="flex"
            alignItems="center"
            w="full"
            bg="black"
            borderRadius="xl"
            px={4}
            py={3}
            gap={3}
            _hover={{ opacity: 0.85, transform: 'translateY(-1px)' }}
            transition="all 0.2s"
          >
            <Text fontSize="22px" lineHeight="1" flexShrink={0}>▶</Text>
            <VStack spacing={0} align="flex-start" flex={1}>
              <Text fontSize="9px" color="gray.400" lineHeight="1">Get it on</Text>
              <Text fontSize="15px" color="white" fontWeight="bold" lineHeight="1.3">Google Play</Text>
            </VStack>
          </Box>

          <Button
            variant="ghost"
            size="sm"
            w="full"
            color="gray.400"
            fontSize="xs"
            onClick={onClose}
            _hover={{ color: 'gray.600' }}
          >
            Maybe later
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
