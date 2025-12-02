import { Box, Container, Heading, Text } from '@chakra-ui/react';
import DealerInspectionVerification from '../../../components/DealerInspectionVerification';

/**
 * VerifyInspectionPage
 * Page for dealers to verify customer inspection slips
 */
const VerifyInspectionPage = () => {
  return (
    <Box bg="gray.50" minH="100vh" py={8}>
      <Container maxW="container.xl">
        <Box mb={8} textAlign="center">
          <Heading size="xl" mb={2}>
            Inspection Slip Verification
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Verify customer inspection payments before starting the inspection
          </Text>
        </Box>

        <DealerInspectionVerification />
      </Container>
    </Box>
  );
};

export default VerifyInspectionPage;
