import { Box, Container, Heading, Text, VStack, Divider, UnorderedList, ListItem, Flex, Icon, HStack, Tag, Link as CLink } from "@chakra-ui/react"
import {
  BsFileEarmarkText,
  BsShieldCheck,
  BsPerson,
  BsPersonBadge,
  BsCreditCard,
  BsCalendar,
  BsExclamationTriangle,
  BsLock,
  BsClock,
  BsGear,
  BsGlobe,
  BsExclamationCircle,
  BsShieldShaded,
  BsEnvelope,
  BsTelephone,
  BsGlobe2,
  BsInstagram,
  BsGeoAlt,
} from "react-icons/bs"

const TermsAndConditions = () => {
  return (
    <Container maxW="900px" py={8} px={4}>
      {/* Hero Header */}
      <Box bgGradient="linear(to-r, purple.600, pink.500)" color="white" p={6} borderRadius="xl" mb={6} boxShadow="lg">
        <Flex align="center" gap={3}>
          <Icon as={BsFileEarmarkText} boxSize={8} />
          <Box>
            <Heading as="h1" size="lg">Terms and Conditions</Heading>
            <Text opacity={0.9}>LAST UPDATED: 17 OCT 2025</Text>
          </Box>
        </Flex>
        <HStack spacing={3} mt={4} wrap="wrap">
          <Tag colorScheme="whiteAlpha" variant="subtle">User Rights</Tag>
          <Tag colorScheme="whiteAlpha" variant="subtle">Payments</Tag>
          <Tag colorScheme="whiteAlpha" variant="subtle">Privacy</Tag>
        </HStack>
      </Box>

      {/* Quick Nav */}
      <Box bg="gray.50" borderWidth={1} borderColor="gray.200" p={4} borderRadius="md" mb={6}>
        <HStack spacing={4} wrap="wrap">
          <CLink href="#agreement" className="link">Agreement</CLink>
          <CLink href="#services" className="link">Our Services</CLink>
          <CLink href="#ip" className="link">IP Rights</CLink>
          <CLink href="#user-representations" className="link">User Representations</CLink>
          <CLink href="#registration" className="link">Registration</CLink>
          <CLink href="#payments" className="link">Payments</CLink>
          <CLink href="#subscriptions" className="link">Subscriptions</CLink>
          <CLink href="#prohibited" className="link">Prohibited</CLink>
          <CLink href="#privacy" className="link">Privacy</CLink>
          <CLink href="#term" className="link">Term & Termination</CLink>
          <CLink href="#modifications" className="link">Modifications</CLink>
          <CLink href="#law" className="link">Governing Law</CLink>
          <CLink href="#liability" className="link">Liability</CLink>
          <CLink href="#indemnification" className="link">Indemnification</CLink>
          <CLink href="#communications" className="link">Electronic Comms</CLink>
          <CLink href="#contact" className="link">Contact</CLink>
        </HStack>
      </Box>

      <VStack spacing={6} align="stretch">

        <Divider />

        {/* Agreement Section */}
        <Box>
          <Heading as="h2" size="lg" mb={4}>
            AGREEMENT TO OUR LEGAL TERMS
          </Heading>
          <Text mb={4}>
            We are Veyu Ltd ("Company," "we," "us," or "our"), a company registered in Nigeria.
          </Text>
          <Text mb={4}>
            We operate the website www.veyu.cc (the "Site"), mobile applications, and related products and services
            that refer to these terms (collectively, the "Services").
          </Text>
          <Text mb={4}>
            You can contact us by phone at +234 (0) 800 000 0000, email at support@veyu.cc.
          </Text>
          <Text mb={4}>
            These Terms and Conditions constitute a legally binding agreement between you, whether personally or on
            behalf of an entity ("you"), and Veyu Ltd. concerning your access to and use of the Services. By accessing
            the Services, you agree that you have read, understood, and agree to be bound by all of these Terms and
            Conditions. IF YOU DO NOT AGREE WITH THESE TERMS, YOU ARE PROHIBITED FROM USING THE SERVICES.
          </Text>
          <Text>
            We reserve the right to make changes to these Terms and Conditions from time to time. We will notify you of
            any changes by updating the "Last updated" date of these Terms, and it is your responsibility to review
            these Terms periodically. Continued use of the Services after the updated Terms are posted signifies
            acceptance of the changes.
          </Text>
        </Box>

        {/* Numbered Sections */}
        <Box>
          <Flex align="center" mb={3}>
            <Icon as={BsGlobe} boxSize={5} color="blue.500" mr={2} />
            <Heading as="h2" size="md">
              1. OUR SERVICES
            </Heading>
          </Flex>
          <Text mb={4}>
            The Services include a platform for buying and selling vehicles, booking rentals, and accessing verified
            mechanics and service providers across categories including cars, motorcycles, boats, aircraft, UAVs and more.
            The Services are
            intended for users who are at least 18 years old. Persons under the age of 18 must have permission from and
            be directly supervised by a parent or guardian to use the Services.
          </Text>
        </Box>

        <Box>
          <Flex align="center" mb={3}>
            <Icon as={BsShieldCheck} boxSize={5} color="blue.500" mr={2} />
            <Heading as="h2" size="md">
              2. INTELLECTUAL PROPERTY RIGHTS
            </Heading>
          </Flex>
          <Text mb={4}>
            Veyu Ltd. owns all intellectual property rights in the Services, including the website design, logos, and
            other content provided through the Services. You are granted a non-exclusive, revocable license to access
            the Services for your personal or internal business use. You may not reproduce, distribute, or create
            derivative works without our express written permission.
          </Text>
        </Box>

        <Box>
          <Flex align="center" mb={3}>
            <Icon as={BsPerson} boxSize={5} color="blue.500" mr={2} />
            <Heading as="h2" size="md">
              3. USER REPRESENTATIONS
            </Heading>
          </Flex>
          <Text mb={2}>By using the Services, you represent and warrant that:</Text>
          <UnorderedList pl={6} spacing={2} mb={4}>
            <ListItem>All registration information you provide will be accurate.</ListItem>
            <ListItem>You will maintain the accuracy of such information.</ListItem>
            <ListItem>You have the legal capacity to comply with these Terms.</ListItem>
            <ListItem>You will not access the Services through automated means.</ListItem>
            <ListItem>You will not use the Services for illegal or unauthorized purposes.</ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Flex align="center" mb={3}>
            <Icon as={BsPersonBadge} boxSize={5} color="blue.500" mr={2} />
            <Heading as="h2" size="md">
              4. USER REGISTRATION
            </Heading>
          </Flex>
          <Text mb={4}>
            You may be required to register to access certain features of the Services. You agree to keep your password
            confidential and will be responsible for all activities under your account.
          </Text>
        </Box>

        <Box>
          <Flex align="center" mb={3}>
            <Icon as={BsCreditCard} boxSize={5} color="blue.500" mr={2} />
            <Heading as="h2" size="md">
              5. PURCHASES AND PAYMENT
            </Heading>
          </Flex>
          <Text mb={4}>
            We accept payments for Services via card payments, bank transfer, and the Veyu Wallet (integrated via
            Paystack). You agree to provide current, complete, and accurate payment information and authorize us to
            charge your chosen payment method for any purchases. Transaction fees, where applicable, will be disclosed
            at checkout. Refunds, if any, are processed per our applicable policy and applicable law.
          </Text>
        </Box>

        <Box>
          <Flex align="center" mb={3}>
            <Icon as={BsCalendar} boxSize={5} color="blue.500" mr={2} />
            <Heading as="h2" size="md">
              6. SUBSCRIPTIONS
            </Heading>
          </Flex>
          <Text mb={2}>
            <strong>Subscription Billing:</strong> If offered, subscriptions will automatically renew unless cancelled.
            You consent to our charging your payment method on a recurring basis until cancellation.
          </Text>
          <Text mb={2}>
            <strong>Free Trial:</strong> We may offer a free trial for new users. Charges will apply at the end of the
            trial period unless cancelled.
          </Text>
          <Text mb={4}>
            <strong>Cancellation:</strong> You may cancel your subscription through your account settings, with the
            cancellation taking effect at the end of the current term.
          </Text>
        </Box>

        <Box>
          <Flex align="center" mb={3}>
            <Icon as={BsExclamationTriangle} boxSize={5} color="blue.500" mr={2} />
            <Heading as="h2" size="md">
              7. PROHIBITED ACTIVITIES
            </Heading>
          </Flex>
          <Text mb={2}>You may not use the Services for:</Text>
          <UnorderedList pl={6} spacing={2} mb={4}>
            <ListItem>Engaging in unauthorized use, including collecting data or using bots.</ListItem>
            <ListItem>Interfering with the operation of the Services.</ListItem>
            <ListItem>Engaging in any activity that violates local, state, or federal law.</ListItem>
            <ListItem>Impersonating another person or misrepresenting your affiliation.</ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Flex align="center" mb={3}>
            <Icon as={BsLock} boxSize={5} color="blue.500" mr={2} />
            <Heading as="h2" size="md">
              8. PRIVACY POLICY
            </Heading>
          </Flex>
          <Text mb={4}>
            We care about your privacy and security. Please review our <a className="link" href="/privacy-policy">Privacy Policy</a>. By using
            the Services, you agree to the collection and use of your data as described in our Privacy Policy.
          </Text>
        </Box>

        <Box>
          <Flex align="center" mb={3}>
            <Icon as={BsClock} boxSize={5} color="blue.500" mr={2} />
            <Heading as="h2" size="md">
              9. TERM AND TERMINATION
            </Heading>
          </Flex>
          <Text mb={4}>
            These Terms remain effective as long as you use the Services. We reserve the right to suspend or terminate
            your access at any time, without notice, if you violate any terms of this Agreement.
          </Text>
        </Box>

        <Box>
          <Flex align="center" mb={3}>
            <Icon as={BsGear} boxSize={5} color="blue.500" mr={2} />
            <Heading as="h2" size="md">
              10. MODIFICATIONS AND INTERRUPTIONS
            </Heading>
          </Flex>
          <Text mb={4}>
            We may modify or discontinue all or part of the Services without notice. We are not liable for any
            interruptions or changes to the Services.
          </Text>
        </Box>

        <Box>
          <Flex align="center" mb={3}>
            <Icon as={BsGlobe2} boxSize={5} color="blue.500" mr={2} />
            <Heading as="h2" size="md">
              11. GOVERNING LAW
            </Heading>
          </Flex>
          <Text mb={4}>
            These Terms are governed by the laws of Nigeria. Any disputes arising from these Terms shall be resolved
            through arbitration in Nigeria.
          </Text>
        </Box>

        <Box>
          <Flex align="center" mb={3}>
            <Icon as={BsExclamationCircle} boxSize={5} color="blue.500" mr={2} />
            <Heading as="h2" size="md">
              12. LIMITATIONS OF LIABILITY
            </Heading>
          </Flex>
          <Text mb={4}>
            Veyu Ltd. shall not be liable for any direct, indirect, or consequential damages arising from your use of
            the Services. Our liability to you for any cause whatsoever will be limited to the amount paid, if any, by
            you to us during the six-month period prior to the cause of action.
          </Text>
        </Box>

        <Box>
          <Flex align="center" mb={3}>
            <Icon as={BsShieldShaded} boxSize={5} color="blue.500" mr={2} />
            <Heading as="h2" size="md">
              13. INDEMNIFICATION
            </Heading>
          </Flex>
          <Text mb={4}>
            You agree to indemnify and hold Veyu Ltd. harmless from any claims, damages, or losses resulting from your
            use of the Services or breach of these Terms.
          </Text>
        </Box>

        <Box>
          <Flex align="center" mb={3}>
            <Icon as={BsEnvelope} boxSize={5} color="blue.500" mr={2} />
            <Heading as="h2" size="md">
              14. ELECTRONIC COMMUNICATIONS
            </Heading>
          </Flex>
          <Text mb={4}>
            By using the Services, you consent to receive electronic communications from us. You agree that all
            agreements, notices, disclosures, and other communications provided to you electronically satisfy any legal
            requirement that such communications be in writing.
          </Text>
        </Box>

        <Box>
          <Flex align="center" mb={3}>
            <Icon as={BsTelephone} boxSize={5} color="blue.500" mr={2} />
            <Heading as="h2" size="md">
              15. CONTACT US
            </Heading>
          </Flex>
          <Text mb={2}>If you have any questions about these Terms, please contact us at:</Text>
          <VStack align="flex-start" spacing={1} mb={4} pl={4}>
            <Flex align="center">
              <Icon as={BsEnvelope} boxSize={4} color="gray.500" mr={2} />
              <Text>
                <strong>Email:</strong> support@veyu.cc
              </Text>
            </Flex>
            <Flex align="center">
              <Icon as={BsTelephone} boxSize={4} color="gray.500" mr={2} />
              <Text>
                <strong>Phone:</strong> +234 (0) 800 000 0000
              </Text>
            </Flex>
            <Flex align="center">
              <Icon as={BsGlobe} boxSize={4} color="gray.500" mr={2} />
              <Text>
                <strong>Website:</strong> www.veyu.cc
              </Text>
            </Flex>
            <Flex align="center">
              <Icon as={BsInstagram} boxSize={4} color="gray.500" mr={2} />
              <Text>
                <strong>IG/X:</strong> @veyu
              </Text>
            </Flex>
            <Flex align="center">
              <Icon as={BsGeoAlt} boxSize={4} color="gray.500" mr={2} />
              <Text>
                <strong>Address:</strong> Lagos, Nigeria.
              </Text>
            </Flex>
          </VStack>
        </Box>

        <Box>
          <Text fontWeight="medium">
            By using the Services, you acknowledge that you have read, understood, and agree to be bound by these Terms
            and Conditions.
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}

export default TermsAndConditions
