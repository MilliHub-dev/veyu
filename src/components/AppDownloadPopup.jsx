import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Image,
  IconButton,
  Button,
} from '@chakra-ui/react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'veyu_app_popup_dismissed';

const MotionBox = motion(Box);

export default function AppDownloadPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Show after a short delay so the page has time to load
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <MotionBox
          position="fixed"
          bottom={{ base: 4, md: 6 }}
          right={{ base: 4, md: 6 }}
          zIndex={9999}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          maxW={{ base: '320px', md: '360px' }}
          w="full"
        >
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="0 20px 60px rgba(0,0,0,0.18)"
            overflow="hidden"
            border="1px solid"
            borderColor="gray.100"
          >
            {/* Header banner */}
            <Box
              bgGradient="linear(135deg, #F4A950, #e8821a)"
              px={5}
              pt={5}
              pb={8}
              position="relative"
            >
              <IconButton
                icon={<X size={16} />}
                aria-label="Close"
                position="absolute"
                top={3}
                right={3}
                size="sm"
                variant="ghost"
                color="whiteAlpha.800"
                _hover={{ color: 'white', bg: 'whiteAlpha.200' }}
                onClick={dismiss}
              />

              <HStack spacing={4} align="flex-start">
                <Image
                  src="/assets/images/VEYU MOBILE APP ICON1.jpg"
                  w="56px"
                  h="56px"
                  borderRadius="xl"
                  objectFit="cover"
                  flexShrink={0}
                  fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Crect width='56' height='56' rx='12' fill='%23fff3'/%3E%3C/svg%3E"
                />
                <VStack align="flex-start" spacing={0.5}>
                  <Text fontWeight="800" fontSize="lg" color="white" lineHeight="1.2">
                    Get the Veyu App
                  </Text>
                  <Text fontSize="sm" color="whiteAlpha.900" lineHeight="1.4">
                    Buy, sell & rent vehicles on the go
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Store buttons */}
            <Box px={5} py={4} bg="white">
              <Text fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" mb={3}>
                Download for free
              </Text>

              <VStack spacing={3}>
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
                  _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                  boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                >
                  <Box flexShrink={0}>
                    <svg width="22" height="27" viewBox="0 0 814 1000" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.2 135.4-316.5 269-316.5 71 0 130.6 46.4 174.5 46.4 42.8 0 109.2-49 192.5-49 31 0 108.2 2.6 108.2 118.3zm-194-150.5c-22.1 26.8-55.2 52-95.9 52-9 0-18-1.3-27-3.2-1.3-9-1.9-18-1.9-26.8 0-57.6 30.4-111.2 65.5-146.3 35-35 97.5-62.2 145.5-62.2 0.6 9 0.6 18 0.6 26.8 0 57-22.1 111.9-57.1 149.8-.2 3.2-19.8 6.9-29.7 9.9z" />
                    </svg>
                  </Box>
                  <VStack spacing={0} align="flex-start" flex={1}>
                    <Text fontSize="10px" color="gray.400" lineHeight="1">Download on the</Text>
                    <Text fontSize="16px" color="white" fontWeight="bold" lineHeight="1.3">App Store</Text>
                  </VStack>
                  <Box>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Box>
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
                  _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                  boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                >
                  <Box flexShrink={0}>
                    <svg width="22" height="24" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="pg1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#00C6FF" />
                          <stop offset="100%" stopColor="#0072FF" />
                        </linearGradient>
                        <linearGradient id="pg2" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FFD000" />
                          <stop offset="100%" stopColor="#FF6D00" />
                        </linearGradient>
                        <linearGradient id="pg3" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FF4040" />
                          <stop offset="100%" stopColor="#C50000" />
                        </linearGradient>
                        <linearGradient id="pg4" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#00D563" />
                          <stop offset="100%" stopColor="#00A543" />
                        </linearGradient>
                      </defs>
                      <path d="M48 0C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48l224-192L48 0z" fill="url(#pg1)" />
                      <path d="M464 232L272 128 48 0l224 256 192-24z" fill="url(#pg2)" />
                      <path d="M48 512c26.5 0 48-21.5 48-48V144L48 512z" fill="url(#pg3)" opacity="0.8" />
                      <path d="M272 384 48 512l416-24-192-104z" fill="url(#pg4)" />
                    </svg>
                  </Box>
                  <VStack spacing={0} align="flex-start" flex={1}>
                    <Text fontSize="10px" color="gray.400" lineHeight="1">Get it on</Text>
                    <Text fontSize="16px" color="white" fontWeight="bold" lineHeight="1.3">Google Play</Text>
                  </VStack>
                  <Box>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Box>
                </Box>
              </VStack>

              <Button
                variant="ghost"
                size="sm"
                w="full"
                mt={3}
                color="gray.400"
                fontSize="xs"
                onClick={dismiss}
                _hover={{ color: 'gray.600' }}
              >
                Continue in browser
              </Button>
            </Box>
          </Box>
        </MotionBox>
      )}
    </AnimatePresence>
  );
}
