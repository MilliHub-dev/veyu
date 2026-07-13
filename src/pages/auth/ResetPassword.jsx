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
  InputRightElement,
  Text,
  VStack,
  useColorModeValue,
  Alert,
  AlertIcon,
  Container,
  IconButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import authService from "../../services/authService";

export const ResetPasswordView = () => {
  const { uidb64, token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      await authService.confirmPasswordReset(token, uidb64, password, confirmPassword);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
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
                <Heading size="lg" textAlign="center" color="green.600">
                  Password Reset Successful
                </Heading>
                <Text textAlign="center" color={textColor}>
                  Your password has been reset successfully. You can now login with your new password.
                </Text>
                <Button as="a" href="/login" colorScheme="blue" w="full">
                  Go to Login
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
                Set new password
              </Heading>
              <Text textAlign="center" color={textColor}>
                Enter your new password below.
              </Text>

              {error && (
                <Alert status="error" borderRadius="lg">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <form onSubmit={handleResetPassword}>
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel color={textColor}>New Password</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Lock size={20} color="gray" />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
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
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          icon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                          size="sm"
                          color="gray.500"
                          _hover={{ color: "blue.500" }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color={textColor}>Confirm New Password</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Lock size={20} color="gray" />
                      </InputLeftElement>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
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
                      <InputRightElement>
                        <IconButton
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          icon={showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          variant="ghost"
                          size="sm"
                          color="gray.500"
                          _hover={{ color: "blue.500" }}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    size="lg"
                    colorScheme="blue"
                    w="full"
                    isLoading={isLoading}
                    loadingText="Resetting password..."
                    _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                    transition="all 0.2s"
                    py={6}
                  >
                    Reset Password
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default ResetPasswordView;
