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
  Select,
  Checkbox,
  IconButton,
  Menu,
  MenuButton,
  SimpleGrid,
  MenuList,
  FormControl,
  FormLabel,
  MenuItem,
  Badge,
  Input,
} from '@chakra-ui/react'
import { LayoutDashboard, Wallet, Clock, PiggyBank, BarChart2, HelpCircle, Settings, Share2, MoreVertical, TrendingUp } from 'lucide-react'
import { RiCoinsFill, RiCoinsLine } from "react-icons/ri";
import { LuChartLine } from "react-icons/lu";
import { GiHomeGarage } from "react-icons/gi";
import { AiOutlineTransaction } from "react-icons/ai";
import { PiHandDepositBold, PiHandWithdrawBold } from "react-icons/pi";
import {FlutterwavePaymentModal} from '../../../components/wallet';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import {CenteredLayout} from '../../../components';

function WalletWithdrawalPage() {
  const {axios, notify, authUser, commaInt, redirect} = useContext(GlobalStore);
  const [currency, setCurrency] = useState({
      code: 'NGN',
      symbol: '₦'
  });
  const [showDepositModal, setDepositModalVisibility] = useState(false);
  const [amount, setAmount] = useState(0);
  const [banks, setBanks] = useState([]);
  const [accept, setAccept] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoadingState] = useState(false);
  const amountRef = useRef();
  const DEBUG = JSON.parse(import.meta.env.VITE_DEBUG);

  async function processWithdrawal(){
    try{
      setLoadingState(true);
      const payload = {
        amount: Number(amount),
        bank_code: selectedBank,
        account_number: accountNumber,
      };
      const res = await axios.post('/wallet/withdraw/', jsonifyObject(payload));
      const data = objectifyJSON(res.data);
      if (res.status === 200){
        notify({ title: 'Withdrawal requested', color: 'blue' });
        redirect('/wallet/', 500);
      }else{
        notify({ title: data?.message || 'Withdrawal failed', color: 'red' });
      }
    }catch(error){
      notify({
        title: "Oops! Something went wrong",
        body: error?.response?.data?.message || error.message,
        color: 'red'
      })
    }finally{
      setLoadingState(false);
    }
  }

  // async func

  async function init(){
    try{
      setLoadingState(true);
      const res = await axios.get('/wallet/banks/');
      const data = objectifyJSON(res.data);
      setBanks(data.data);
    }catch(error){
      notify({ title: 'Unable to load banks', body: error.message, color: 'red' });
    }finally{
      setLoadingState(false);
    }
  }

  function handleSubmit(){
    if (!accept){
      notify({ title: 'Please accept the terms to continue', color: 'red' });
      return;
    }
    if (!amount || Number(amount) <= 0){
      notify({ title: 'Enter a valid amount', color: 'red' });
      return;
    }
    if (step === 1){
      if (!selectedBank || !accountNumber){
        notify({ title: 'Enter bank and account number', color: 'red' });
        return;
      }
      return processWithdrawal();
    }
    setStep(1);
  }

  useEffect(() => {
    init();
  }, [])

  return (
    <Box>
      <CenteredLayout>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} w="95%" maxW={'980px'}>
          {/* Left: Step forms */}
          <Box borderRadius="20px" px={6} py={8} border="1px solid lavender" bg="white">
            <VStack align="stretch" spacing={5}>
              <Heading size="md">Withdraw Funds</Heading>
              {step === 0 ? (
                <>
                  <Text color="gray.600">Enter the amount you want to withdraw.</Text>
                  <Heading size="sm" color="primary">Available Balance: {currency.symbol}{commaInt(2000000)}</Heading>

                  <Heading
                   size="lg" w="100%"
                   color="primary"
                   ref={amountRef} display={'flex'}
                   px={4} py={3} border="1px solid lavender" textAlign="center"
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

                  <Button onClick={handleSubmit} isDisabled={Number(amount) < 50000 } bg="primary" colorScheme="blue" w="full" size="lg">Proceed</Button>
                </>
              ) : (
                <>
                  <Text color="gray.600">Enter your bank details to receive your funds.</Text>
                  <Box as={FormControl} isRequired w="full" mb={3}>
                    <Text as={FormLabel}>Bank Name</Text>
                    <Select isRequired w="full" value={selectedBank} onChange={(e)=> setSelectedBank(e.target.value)}>
                      {banks?.map((bank) => (
                        <option key={bank?.code} value={bank?.code}>{bank.name}</option>
                      ))}
                    </Select>
                  </Box>

                  <Box as={FormControl} isRequired w="full">
                    <Text as={FormLabel}>Account Number</Text>
                    <Input isRequired py={4} w="full" type="tel" name="account-number" value={accountNumber} onChange={(e)=> setAccountNumber(e.target.value)} />
                  </Box>

                  <Button onClick={handleSubmit} isLoading={loading} bg="primary" colorScheme="blue" w="full" size="lg">Submit</Button>
                </>
              )}

              <Alert colorScheme="blue" color="primary" gap={2} textAlign="left" borderRadius="lg" border="1px solid" borderColor="primary">
                <Checkbox borderColor="primary" value={accept} onInput={e => setAccept(!accept)} isChecked={accept} style={{accentColor: 'primary'}} type="checkbox" name="i_accept" />
                Veyu is not a bank.
              </Alert>
            </VStack>
          </Box>

          {/* Right: Instructions & Tips */}
          <Box borderRadius="20px" px={6} py={8} border="1px solid lavender" bg="white">
            <VStack align="stretch" spacing={5}>
              <Heading size="md">How withdrawals work</Heading>
              <VStack align="stretch" spacing={3}>
                <HStack align="start" spacing={3}>
                  <Wallet size={18} />
                  <Box>
                    <Text fontWeight="600">Enter an amount</Text>
                    <Text color="gray.600">We currently require a minimum of ₦50,000 per withdrawal.</Text>
                  </Box>
                </HStack>

                <HStack align="start" spacing={3}>
                  <Settings size={18} />
                  <Box>
                    <Text fontWeight="600">Provide bank details</Text>
                    <Text color="gray.600">Select your bank and input a valid 10-digit account number.</Text>
                  </Box>
                </HStack>

                <HStack align="start" spacing={3}>
                  <Share2 size={18} />
                  <Box>
                    <Text fontWeight="600">Submit your request</Text>
                    <Text color="gray.600">We’ll process your withdrawal to the provided bank account.</Text>
                  </Box>
                </HStack>

                <HStack align="start" spacing={3}>
                  <Clock size={18} />
                  <Box>
                    <Text fontWeight="600">Processing time</Text>
                    <Text color="gray.600">Transfers typically settle within minutes, but may take longer based on your bank.</Text>
                  </Box>
                </HStack>
              </VStack>

              <Box borderTopWidth={1} pt={4}>
                <Heading size="sm" mb={2}>Tips</Heading>
                <VStack align="stretch" spacing={1} color="gray.600">
                  <Text>- Ensure your account name matches your profile to avoid delays.</Text>
                  <Text>- Double-check the account number to prevent failed transfers.</Text>
                  <Text>- Keep your contact info up to date for notifications.</Text>
                </VStack>
              </Box>

              <Box borderTopWidth={1} pt={4}>
                <Heading size="sm" mb={2}>Need help?</Heading>
                <Text color="gray.600">Contact support via chat or email if your withdrawal doesn’t reflect in time.</Text>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </CenteredLayout>
    </Box>
  )
}

export default WalletWithdrawalPage;
