import {useState, useEffect, useContext, useRef} from 'react';
import {GlobalStore} from '../../../App';
import {objectifyJSON, jsonifyObject} from '../../../utils';
import {
  Box,
  VStack,
  Alert,
  AlertIcon,
  HStack,
  Text,
  Heading,
  Button,
  Select,
  Checkbox,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Spinner,
} from '@chakra-ui/react'
import { Wallet, Clock, Settings, Share2, CheckCircle } from 'lucide-react'
import {CenteredLayout} from '../../../components';

function WalletWithdrawalPage() {
  const {axios, notify, commaInt, redirect} = useContext(GlobalStore);
  const [currency] = useState({
      code: 'NGN',
      symbol: '₦'
  });
  const [amount, setAmount] = useState(0);
  const [banks, setBanks] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [accept, setAccept] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoadingState] = useState(false);
  const amountRef = useRef();

  async function verifyAccount(){
    if (!selectedBank || !accountNumber){
      notify({ title: 'Please select bank and enter account number', color: 'red' });
      return;
    }

    if (accountNumber.length !== 10){
      notify({ title: 'Account number must be 10 digits', color: 'red' });
      return;
    }

    try{
      setVerifying(true);
      setVerified(false);
      setAccountName('');

      const payload = {
        account_number: accountNumber,
        bank_code: selectedBank,
      };

      const res = await axios.post('/wallet/withdrawal-requests/verify-account/', jsonifyObject(payload));
      const data = objectifyJSON(res.data);

      if (data.verified){
        setVerified(true);
        setAccountName(data.data.account_name);
        notify({ 
          title: 'Account Verified', 
          body: `Account Name: ${data.data.account_name}`,
          color: 'green' 
        });
      }else{
        setVerified(false);
        notify({ 
          title: 'Verification Failed', 
          body: data.message || 'Invalid account number or bank code',
          color: 'red' 
        });
      }
    }catch(error){
      setVerified(false);
      notify({
        title: "Verification Failed",
        body: error?.response?.data?.message || error.message,
        color: 'red'
      })
    }finally{
      setVerifying(false);
    }
  }

  async function processWithdrawal(){
    if (!verified){
      notify({ title: 'Please verify your account first', color: 'red' });
      return;
    }

    try{
      setLoadingState(true);
      
      const selectedBankData = banks.find(b => b.code === selectedBank);
      
      const payload = {
        amount: Number(amount),
        account_name: accountName,
        account_number: accountNumber,
        bank_name: selectedBankData?.name || '',
        bank_code: selectedBank,
        paystack_verified: true,
      };

      const res = await axios.post('/wallet/withdrawal-requests/', jsonifyObject(payload));
      const data = objectifyJSON(res.data);

      if (res.status === 200 || res.status === 201){
        notify({ 
          title: 'Withdrawal Request Submitted', 
          body: 'Your withdrawal request will be reviewed by our team.',
          color: 'green' 
        });
        redirect('/wallet/transactions', 1000);
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

  async function getWallet(){
    try{
      const res = await axios.get('/wallet/');
      const data = objectifyJSON(res.data);
      setWallet(data?.data);
    }catch(error){
      console.error('Error fetching wallet:', error);
    }
  }

  async function getBanks(){
    try{
      const res = await axios.get('/wallet/banks/');
      const data = objectifyJSON(res.data);
      setBanks(data.data || []);
    }catch(error){
      notify({ title: 'Unable to load banks', body: error.message, color: 'red' });
    }
  }

  async function init(){
    setLoadingState(true);
    await Promise.all([getWallet(), getBanks()]);
    setLoadingState(false);
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
    if (Number(amount) < 100){
      notify({ title: 'Minimum withdrawal amount is ₦100', color: 'red' });
      return;
    }
    if (wallet && Number(amount) > Number(wallet.balance)){
      notify({ title: 'Insufficient balance', color: 'red' });
      return;
    }
    if (step === 1){
      if (!selectedBank || !accountNumber){
        notify({ title: 'Enter bank and account number', color: 'red' });
        return;
      }
      if (!verified){
        notify({ title: 'Please verify your account first', color: 'red' });
        return;
      }
      return processWithdrawal();
    }
    setStep(1);
  }

  function handleBankChange(e){
    setSelectedBank(e.target.value);
    setVerified(false);
    setAccountName('');
  }

  function handleAccountNumberChange(e){
    const value = e.target.value.replace(/\D/g, '');
    setAccountNumber(value);
    setVerified(false);
    setAccountName('');
  }

  useEffect(() => {
    init();
  }, [])

  if (loading){
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Loading...</Text>
      </Box>
    );
  }

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
                  <Heading size="sm" color="primary">
                    Available Balance: {currency.symbol}{wallet ? commaInt(wallet.balance) : '0'}
                  </Heading>

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

                  <Alert status="info" borderRadius="lg">
                    <AlertIcon />
                    <Text fontSize="sm">Minimum withdrawal: ₦100</Text>
                  </Alert>

                  <Button 
                    onClick={handleSubmit} 
                    isDisabled={Number(amount) < 100 || (wallet && Number(amount) > Number(wallet.balance))} 
                    bg="primary" 
                    colorScheme="blue" 
                    w="full" 
                    size="lg"
                  >
                    Proceed
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setStep(0)} 
                    alignSelf="flex-start"
                  >
                    ← Back
                  </Button>
                  
                  <Text color="gray.600">Enter your bank details to receive your funds.</Text>
                  
                  <Box as={FormControl} isRequired w="full">
                    <Text as={FormLabel}>Bank Name</Text>
                    <Select 
                      placeholder="Select Bank"
                      isRequired 
                      w="full" 
                      value={selectedBank} 
                      onChange={handleBankChange}
                    >
                      {banks?.map((bank) => (
                        <option key={bank?.code} value={bank?.code}>{bank.name}</option>
                      ))}
                    </Select>
                  </Box>

                  <Box as={FormControl} isRequired w="full">
                    <Text as={FormLabel}>Account Number</Text>
                    <Input 
                      isRequired 
                      w="full" 
                      type="tel" 
                      maxLength={10}
                      placeholder="Enter 10-digit account number"
                      name="account-number" 
                      value={accountNumber} 
                      onChange={handleAccountNumberChange} 
                    />
                  </Box>

                  <Button 
                    onClick={verifyAccount} 
                    isLoading={verifying}
                    isDisabled={!selectedBank || accountNumber.length !== 10}
                    colorScheme="blue"
                    variant="outline"
                    w="full"
                  >
                    {verifying ? 'Verifying...' : 'Verify Account'}
                  </Button>

                  {verified && accountName && (
                    <Alert status="success" borderRadius="lg">
                      <AlertIcon as={CheckCircle} />
                      <Box flex="1">
                        <Text fontWeight="600">Account Verified</Text>
                        <Text fontSize="sm">{accountName}</Text>
                      </Box>
                    </Alert>
                  )}

                  {!verified && accountName === '' && accountNumber.length === 10 && selectedBank && (
                    <Alert status="warning" borderRadius="lg">
                      <AlertIcon />
                      <Text fontSize="sm">Please verify your account before submitting</Text>
                    </Alert>
                  )}

                  <Box as={FormControl} w="full">
                    <Text as={FormLabel}>Account Name</Text>
                    <Input 
                      w="full" 
                      value={accountName}
                      isReadOnly
                      bg="gray.50"
                      placeholder="Will be filled after verification"
                    />
                  </Box>

                  <Button 
                    onClick={handleSubmit} 
                    isLoading={loading} 
                    isDisabled={!verified}
                    bg="primary" 
                    colorScheme="blue" 
                    w="full" 
                    size="lg"
                  >
                    Submit Withdrawal Request
                  </Button>
                </>
              )}

              <Alert colorScheme="blue" color="primary" gap={2} textAlign="left" borderRadius="lg" border="1px solid" borderColor="primary">
                <Checkbox 
                  borderColor="primary" 
                  onChange={(e) => setAccept(e.target.checked)} 
                  isChecked={accept} 
                  colorScheme="blue"
                />
                <Text fontSize="sm">I understand that Veyu is not a bank and withdrawal requests are subject to review.</Text>
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
                    <Text color="gray.600" fontSize="sm">Minimum withdrawal is ₦100. Ensure you have sufficient balance.</Text>
                  </Box>
                </HStack>

                <HStack align="start" spacing={3}>
                  <Settings size={18} />
                  <Box>
                    <Text fontWeight="600">Verify bank details</Text>
                    <Text color="gray.600" fontSize="sm">Select your bank and enter a valid 10-digit account number. We'll verify it with Paystack.</Text>
                  </Box>
                </HStack>

                <HStack align="start" spacing={3}>
                  <CheckCircle size={18} />
                  <Box>
                    <Text fontWeight="600">Account verification</Text>
                    <Text color="gray.600" fontSize="sm">Your account name will be automatically retrieved and displayed after verification.</Text>
                  </Box>
                </HStack>

                <HStack align="start" spacing={3}>
                  <Share2 size={18} />
                  <Box>
                    <Text fontWeight="600">Submit your request</Text>
                    <Text color="gray.600" fontSize="sm">Once verified, submit your withdrawal request for processing.</Text>
                  </Box>
                </HStack>

                <HStack align="start" spacing={3}>
                  <Clock size={18} />
                  <Box>
                    <Text fontWeight="600">Processing time</Text>
                    <Text color="gray.600" fontSize="sm">Requests are reviewed by our team. Approved transfers typically settle within minutes to hours.</Text>
                  </Box>
                </HStack>
              </VStack>

              <Box borderTopWidth={1} pt={4}>
                <Heading size="sm" mb={2}>Important Notes</Heading>
                <VStack align="stretch" spacing={2} color="gray.600" fontSize="sm">
                  <Text>• Account verification is required before submission</Text>
                  <Text>• Ensure your account name matches your profile</Text>
                  <Text>• Double-check the account number to prevent errors</Text>
                  <Text>• All withdrawals require admin approval</Text>
                  <Text>• Check transaction history for status updates</Text>
                </VStack>
              </Box>

              <Box borderTopWidth={1} pt={4}>
                <Heading size="sm" mb={2}>Need help?</Heading>
                <Text color="gray.600" fontSize="sm">
                  Contact support if you encounter any issues or if your withdrawal doesn't reflect in time.
                </Text>
              </Box>
            </VStack>
          </Box>
        </SimpleGrid>
      </CenteredLayout>
    </Box>
  )
}

export default WalletWithdrawalPage;
