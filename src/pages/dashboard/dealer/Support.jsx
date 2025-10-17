import { Box, VStack, HStack, SimpleGrid, Text, Heading, FormControl, FormLabel, Input, Select, Textarea, Button, Link, useToast, Badge } from "@chakra-ui/react";
import { useState } from "react";
import { Mail, Phone, MessageCircle, HelpCircle } from "lucide-react";

export default function Support() {
  const toast = useToast();
  const [form, setForm] = useState({ subject: "", category: "general", message: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.subject || !form.message || !form.email) {
      toast({ title: "Please fill all required fields", status: "warning" });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast({ title: "Ticket submitted", description: "We'll get back to you shortly.", status: "success" });
      setForm({ subject: "", category: "general", message: "", email: "" });
    }, 800);
  }

  return (
    <Box w="full" px={{ base: 4, md: 8 }} py={6}>
      <VStack align="stretch" spacing={6} maxW="1000px" mx="auto">
        <HStack justify="space-between" align="center">
          <Heading size="lg">Support</Heading>
          <Badge colorScheme="purple">Dealer</Badge>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <VStack align="start" spacing={2} borderWidth="1px" borderColor="gray.200" bg="white" boxShadow="sm" borderRadius="lg" p={5}>
            <HStack><Mail size={18} /><Text fontWeight="semibold">Email</Text></HStack>
            <Link color="blue.600" href="mailto:support@veyu.cc">support@veyu.cc</Link>
            <Text fontSize="sm" color="gray.600">Typical response in 24 hrs</Text>
          </VStack>

          <VStack align="start" spacing={2} borderWidth="1px" borderColor="gray.200" bg="white" boxShadow="sm" borderRadius="lg" p={5}>
            <HStack><Phone size={18} /><Text fontWeight="semibold">Phone</Text></HStack>
            <Text>+234 800 000 0000</Text>
            <Text fontSize="sm" color="gray.600">Mon–Fri, 9:00–17:00</Text>
          </VStack>

          <VStack align="start" spacing={2} borderWidth="1px" borderColor="gray.200" bg="white" boxShadow="sm" borderRadius="lg" p={5}>
            <HStack><MessageCircle size={18} /><Text fontWeight="semibold">Chat</Text></HStack>
            <Text fontSize="sm" color="gray.600">Use the form to start a conversation</Text>
            <HStack color="gray.600"><HelpCircle size={16} /><Text fontSize="sm">Knowledge base coming soon</Text></HStack>
          </VStack>
        </SimpleGrid>

        <Box as="form" onSubmit={handleSubmit} borderWidth="1px" borderColor="gray.200" bg="white" boxShadow="sm" borderRadius="lg" p={{ base: 5, md: 6 }}>
          <VStack spacing={5} align="stretch">
            <HStack>
              <Heading size="md">Submit a ticket</Heading>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              <FormControl isRequired>
                <FormLabel>Subject</FormLabel>
                <Input placeholder="Describe your issue briefly" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} bg="white" borderColor="gray.300" focusBorderColor="blue.400" />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} bg="white" borderColor="gray.300" focusBorderColor="blue.400" sx={{ option: { backgroundColor: "white", color: "black" } }}>
                  <option value="general">General</option>
                  <option value="listings">Listings</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Technical</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Reply Email</FormLabel>
                <Input type="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} bg="white" borderColor="gray.300" focusBorderColor="blue.400" />
              </FormControl>
            </SimpleGrid>

            <FormControl isRequired>
              <FormLabel>Message</FormLabel>
              <Textarea placeholder="Provide details that will help us resolve your issue" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} minH="160px" bg="white" borderColor="gray.300" focusBorderColor="blue.400" />
            </FormControl>

            <HStack justify="flex-end">
              <Button type="submit" colorScheme="blue" isLoading={submitting}>Send</Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}

