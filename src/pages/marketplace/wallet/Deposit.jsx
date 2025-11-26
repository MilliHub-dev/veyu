import {useState, useEffect, useContext, useRef} from 'react';
import {Link, NavLink, Outlet} from 'react-router-dom';
import {GlobalStore} from '../../../App';
import {objectifyJSON, jsonifyObject} from '../../../utils';
import {
  Box,
  Container,
  Flex,
  VStack,
  Alert,
  HStack,
  Text,
  Heading,
  Button,
  Avatar,
  AvatarGroup,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  IconButton,
  Menu,
  MenuButton,
  SimpleGrid,
  MenuList,
  MenuItem,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import { LayoutDashboard, Wallet, Clock, PiggyBank, BarChart2, HelpCircle, Settings, Share2, MoreVertical, TrendingUp } from 'lucide-react'
import { RiCoinsFill, RiCoinsLine } from "react-icons/ri";
import { LuChartLine } from "react-icons/lu";
import { GiHomeGarage } from "react-icons/gi";
import { AiOutlineTransaction } from "react-icons/ai";
import { PiHandDepositBold, PiHandWithdrawBold } from "react-icons/pi";
import {FlutterwavePaymentModal} from '../../../components/wallet';
import { usePaystackPayment } from 'react-paystack';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import {CenteredLayout} from '../../../components';

function WalletDepositPage() {
  const {axios, notify, authUser, commaInt, redirect} = useContext(GlobalStore);
  const [minDeposit, setMinDeposit] = useState(500)
  const [currency, setCurrency] = useState({
      code: 'NGN',
      symbol: '₦'
  });
  const [showDepositModal, setDepositModalVisibility] = useState(false);
  const [loading, setLoadingState] = useState(true);
  const [amount, setAmount] = useState(0);
  const [accept, setAccept] = useState(true);
  const amountRef = useRef();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderCol = useColorModeValue('lavender', 'gray.700');

  const DEBUG = JSON.parse(import.meta.env.VITE_DEBUG);

  async function processDeposit(response){
    const res = await axios.post('/wallet/deposit/', jsonifyObject(response));
    const data = objectifyJSON(res.data);

    if (res.status === 200){
      redirect('/wallet/', 500);
      notify({
        title: 'Deposit received!',
        color: 'blue'
      })
    }else{
      notify({
        title: data.message,
        color: 'red'
      })
    }
  }

  async function init(){
    // get wallet deposit currency
    const res = await axios.get(`/wallet/`);
    const data = objectifyJSON(res.data);
    console.log("Wallet:", data.data);
    setTimeout(() => setLoadingState(false), 2000);
  }

  // const config = {
  //   public_key: "FLWPUBK_TEST-6d708e896eb3ba9f1ee4e1e73509e9e5-X",
  //   tx_ref: `${authUser?.token.substr(0, 7)}${Date.now()}${authUser?.token.substr(5, 3)}`,
  //   amount: DEBUG ? (amount > 500000 ? 500000 : amount) : amount,
  //   currency: currency?.code,
  //   payment_options: 'card,ussd,transfer',
  //   customer: {
  //     email: authUser?.email,
  //     phone_number: authUser?.phone_number,
  //     name: `${authUser?.first_name} ${authUser?.last_name}`,
  //   },
  //   customizations: {
  //     title: 'Motaa',
  //     description: 'Add funds to your wallet',
  //     logo: `${window.location.origin}/static/motaa/motaa-logo-1.png`,
  //   },
  //   meta: {
  //     transaction_type: 'wallet:deposit'
  //   }
  // };
  // const handleFlutterPayment = useFlutterwave(config);

  const getFinalAmount = (amt) => {
    return (amt * 100)
  }
  
  // const PAYSTACK_LIVE_KEY = import.meta.env.VITE_PAYSTACK_LIVE_PUBLIC_KEY;
  const PAYSTACK_LIVE_KEY = "pk_test_b61ba0372b2ab11527ef2b9da625af0cfe4d3134";
  

  const config = {
    publicKey: PAYSTACK_LIVE_KEY,
    reference: (new Date()).getTime().toString(),
    amount: getFinalAmount(amount),
    email: authUser?.email,
  };

  const handlePayment = usePaystackPayment(config);

  function payUp(){
    try{
      handlePayment(onPaymentComplete, onModalClose);
    }catch(err){
      console.log("error paying up:", err)
    }
  }

  function onPaymentComplete(response){
    console.log(response);
    return processDeposit(response)
  }

  function onModalClose(){
  // user cancelled the payment flow
    console.log("User cancelled the transaction")
  }


  useEffect(() => {
    init();
  }, [])

  return (
    <Box>
      <CenteredLayout>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} w="95%" maxW={'980px'}>
          {/* Left: Amount Card */}
          <Box borderRadius="20px" px={6} py={8} border="1px solid" borderColor="gray.200" bg="white" boxShadow="sm">
            <VStack align="stretch" spacing={5}>
              <Heading size="md">Deposit Funds</Heading>
              <Text color="gray.600">Enter the amount you want to add to your wallet.</Text>

              <VStack align="stretch" spacing={2}>
                <Text fontWeight="600">Amount</Text>
                <Heading
                 size="lg" w="100%"
                 color="primary"
                 ref={amountRef} display={'flex'}
                 px={4} py={3} border="1px solid" borderColor="lavender" textAlign="center"
                 justifyContent="center" borderRadius="lg"
                >
                  <Text as="span" mr={1}>{currency?.symbol}</Text>
                  <Text
                    contentEditable
                    textAlign="left"
                    outline="none"
                    minW="max-content"
                    as="span"
                    style={{wordWrap: "normal"}}
                    overflowX="auto"
                    className="hidden-scroll"
                    onBeforeInput={(e) => {
                      if (e.data && /\D/.test(e.data)) {
                        e.preventDefault();
                      }
                    }}
                    onInput={(e) => {
                      const selection = window.getSelection();
                      const range = selection.getRangeAt(0);
                      const cursorOffset = range.startOffset;

                      const newValue = e.target.textContent.replace(/\D/g, '');
                      setAmount(newValue);
                      const formattedValue = commaInt(newValue);
                      e.target.textContent = formattedValue;

                      const newCursorPos = cursorOffset + (formattedValue.length - newValue.length);
                      range.setStart(e.target.childNodes[0] || e.target, Math.min(newCursorPos, formattedValue.length));
                      range.setEnd(e.target.childNodes[0] || e.target, Math.min(newCursorPos, formattedValue.length));
                      selection.removeAllRanges();
                      selection.addRange(range);
                    }}
                    dangerouslySetInnerHTML={{ __html: `${commaInt(0)}` }}
                  ></Text>
                </Heading>

                {amount < minDeposit && (
                  <Text mt={1} fontSize={'13px'} fontWeight="600" color="red">
                    Minimum allowed amount {currency?.symbol}{minDeposit}
                  </Text>
                )}

                <HStack spacing={3} mt={2} flexWrap="wrap">
                  {[1000, 2000, 5000, 10000, 20000].map((v) => (
                    <Button key={v} size="sm" variant="outline" onClick={() => {
                      setAmount(v);
                      if (amountRef.current) amountRef.current.textContent = commaInt(v);
                    }}>
                      {currency?.symbol}{commaInt(v)}
                    </Button>
                  ))}
                </HStack>
              </VStack>

              <Button onClick={payUp} isDisabled={amount < minDeposit || accept === false } bg="primary" colorScheme="blue" w="full" size="lg">Proceed</Button>

              <Alert fontSize={'14px'} colorScheme="blue" color="primary" gap={2} textAlign="left" borderRadius="lg" border="1px solid" borderColor="primary">
                <Checkbox borderColor="primary" value={accept} onInput={e => setAccept(!accept)} isChecked={accept} style={{accentColor: 'primary'}} type="checkbox" name="i_accept" />
                Veyu is not a bank, all banking services are provided by Paystack.
              </Alert>
            </VStack>
          </Box>

          {/* Right: Instructions & Help */}
          <Box borderRadius="20px" px={6} py={8} border="1px solid" borderColor="gray.200" bg="white">
            <VStack align="stretch" spacing={5}>
              <Heading size="md">How to deposit</Heading>
              <VStack align="stretch" spacing={3}>
                <HStack align="start" spacing={3}>
                  <Wallet size={18} />
                  <Box>
                    <Text fontWeight="600">Enter amount or choose a preset</Text>
                    <Text color="gray.600">Use the quick buttons for common amounts or type a custom value.</Text>
                  </Box>
                </HStack>

                <HStack align="start" spacing={3}>
                  <Settings size={18} />
                  <Box>
                    <Text fontWeight="600">Accept the terms</Text>
                    <Text color="gray.600">Tick the checkbox to proceed with secure payment processing.</Text>
                  </Box>
                </HStack>

                <HStack align="start" spacing={3}>
                  <Share2 size={18} />
                  <Box>
                    <Text fontWeight="600">Pay with Paystack</Text>
                    <Text color="gray.600">Click Proceed and complete your payment in the Paystack modal.</Text>
                  </Box>
                </HStack>

                <HStack align="start" spacing={3}>
                  <Clock size={18} />
                  <Box>
                    <Text fontWeight="600">Auto-update</Text>
                    <Text color="gray.600">After a successful payment, we’ll update your wallet balance automatically.</Text>
                  </Box>
                </HStack>
              </VStack>

              <Box borderTopWidth={1} pt={4}>
                <Heading size="sm" mb={2}>Tips</Heading>
                <VStack align="stretch" spacing={1} color="gray.600">
                  <Text>- Ensure your email is correct to receive receipts.</Text>
                  <Text>- If the modal is closed, you can try again safely.</Text>
                  <Text>- For delays, check Transactions or refresh the page.</Text>
                </VStack>
              </Box>

              <Box borderTopWidth={1} pt={4}>
                <Heading size="sm" mb={2}>Need help?</Heading>
                <Text color="gray.600">Contact support via chat or email if your payment doesn’t reflect within a few minutes.</Text>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </CenteredLayout>
    </Box>
  )
}

export default WalletDepositPage;
