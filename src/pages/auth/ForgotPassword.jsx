import {
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
  useColorModeValue,
  Alert,
  AlertIcon,
  Container,
} from "@chakra-ui/react";
import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";

export const ForgotPasswordView = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const focusBg = useColorModeValue("white", "gray.800");

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.requestPasswordReset(email);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Box bgGradient={bgGradient} minH="100vh" py={8}>
        <Container maxW="container.sm" px={{ base: 4, md: 8 }}>
          <VStack spacing={8} align="stretch">
            <Card bg={cardBg} p={8} borderRadius="2xl" shadow="2xl">
              <VStack spacing={6} align="stretch">
                <Heading size="lg" textAlign="center" color="blue.600">
                  Check your email
                </Heading>
                <Text textAlign="center" color={textColor}>
                  We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
                </Text>
                <Button as={Link} to="/login" colorScheme="blue" w="full">
                  Back to Login
                </Button>
              </VStack>
            </Card>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bgGradient={bgGradient} minH="100vh" py={8}>
      <Container maxW="container.sm" px={{ base: 4, md: 8 }}>
        <VStack spacing={8} align="stretch">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft size={20} />}
            onClick={() => navigate("/login")}
            alignSelf="flex-start"
          >
            Back to Login
          </Button>

          <Card bg={cardBg} p={8} borderRadius="2xl" shadow="2xl">
            <VStack spacing={6} align="stretch">
              <Heading size="lg" textAlign="center">
                Reset your password
              </Heading>
              <Text textAlign="center" color={textColor}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>

              {error && (
                <Alert status="error" borderRadius="lg">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <form onSubmit={handleRequestReset}>
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel color={textColor}>Email Address</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Mail size={20} color="gray" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        size="lg"
                        bg={inputBg}
                        border="2px solid"
                        borderColor="gray.200"
                        _hover={{ borderColor: "blue.300" }}
                        _focus={{
                          borderColor: "blue.500",
                          bg: focusBg,
                          shadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                        }}
                        pl={12}
                      />
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    size="lg"
                    colorScheme="blue"
                    w="full"
                    isLoading={isLoading}
                    loadingText="Sending reset link..."
                    _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                    transition="all 0.2s"
                    py={6}
                  >
                    Send Reset Link
                  </Button>
                </VStack>
              </form>

              <HStack justify="center" pt={4}>
                <Text color={textColor}>
                  Remember your password?{' '}
                  <Link to="/login" style={{ color: 'var(--chakra-colors-blue-500)', fontWeight: 'semibold' }}>
                    Back to login
                  </Link>
                </Text>
              </HStack>
            </VStack>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default ForgotPasswordView;
