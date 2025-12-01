import {useState, useEffect, useContext} from 'react';
import {
	Box,
	Modal,
	ModalBody,
	ModalHeader,
	ModalCloseButton,
	ModalContent,
	ModalOverlay,
	Button,
	Alert,
	AlertIcon,
	Text,
	Image,
	Divider,
	Heading,
} from '@chakra-ui/react';
// import {Zap} from '@chakra-ui/icons'
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { PaystackButton } from 'react-paystack';
import {PinField, CenteredLayout} from '.';
import {EmptyWalletIcon,} from './icons';
import {GlobalStore} from '../App';
import {objectifyJSON, jsonifyObject} from '../utils';


export const PaystackPaymentModal = ({
	isOpen, onClose,
	onSuccess, payload,
	customizations,
	metadata,
	...props
}) => {
	const {
	   	amount,
	    email,
	    reference
	} = payload;

	const {title, logo, description} = customizations;
	const DEBUG = JSON.parse(import.meta.env.VITE_DEBUG);
	// const PAYSTACK_LIVE_KEY = import.meta.env.VITE_PAYSTACK_LIVE_PUBLIC_KEY;
	const PAYSTACK_LIVE_KEY = "pk_test_b61ba0372b2ab11527ef2b9da625af0cfe4d3134";

	const componentProps = {
		reference: reference || `VEYU-${Date.now()}`,
		email: email,
		amount: amount * 100,
		publicKey: PAYSTACK_LIVE_KEY,
		text: "Pay Now",
		metadata: metadata || {},
		onSuccess: (reference) => {
			console.log("✅ Paystack SUCCESS callback triggered");
			console.log("📦 Success response:", reference);
			onPaymentComplete(reference);
		},
		onClose: () => {
			console.log("❌ Paystack CLOSE callback triggered");
			onModalClose();
		},
	};

	function onPaymentComplete(response){
		console.log("🎉 Paystack payment completed:", response);
		console.log("📞 Calling onSuccess callback with response...");
		console.log("🔍 Response details:", JSON.stringify(response, null, 2));
		
		try {
			const result = onSuccess(response);
			console.log("✅ onSuccess callback completed:", result);
			return result;
		} catch (err) {
			console.error("❌ Error in onSuccess callback:", err);
			throw err;
		}
	}

	function onModalClose(){
		// user cancelled the payment flow
		console.log("🚫 User cancelled the transaction");
		console.log("🔒 Closing payment modal...");
		onClose();
	}


	return(
	  <Modal isCentered isOpen={isOpen} onClose={onClose} size="lg">
	    <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
	    <ModalContent 
	    	w={'90%'} 
	    	maxW={'500px'} 
	    	borderRadius="2xl" 
	    	overflow="hidden"
	    	boxShadow="2xl"
	    >
	      <ModalHeader 
	      	bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
	      	color="white" 
	      	py={6}
	      	position="relative"
	      >
	        <Box textAlign="center">
	          <Heading size="lg" mb={2}>{title}</Heading>
	          <Text fontSize="3xl" fontWeight="bold">
	            ₦{parseInt(amount).toLocaleString()}
	          </Text>
	        </Box>
	        <ModalCloseButton color="white" top={4} right={4} />
	      </ModalHeader>

	      <ModalBody py={6} px={6}>
	        <Box w={'100%'} mb={4}>
	          <Box 
	          	bg="gray.50" 
	          	p={4} 
	          	borderRadius="xl" 
	          	border="1px solid" 
	          	borderColor="gray.200"
	          	mb={4}
	          >
	            <Image 
	            	w={'100%'} 
	            	maxH="80px"
	            	objectFit="contain"
	            	src={'/assets/images/paystack-banner.png'} 
	            	alt="Paystack"
	            />
	          </Box>

	          <Alert 
	          	status="info"
	          	variant="left-accent"
	          	borderRadius="lg" 
	          	bg="blue.50"
	          	borderColor="blue.200"
	          >
	          	<AlertIcon color="blue.500" />
	          	<Box>
		          	<Text fontSize="sm" color="gray.700" fontWeight="500">
		          		Secure Payment Processing
		          	</Text>
		          	<Text fontSize="xs" color="gray.600" mt={1}>
		          		Veyu does not store your card details. All transactions are securely processed by Paystack.
		          	</Text>
	          	</Box>
	          </Alert>
	        </Box>

	        <Box mt={6} mb={4}>
	          <PaystackButton 
	          	{...componentProps} 
	          	className="paystack-button"
	          	style={{
	          		width: '100%',
	          		padding: '16px',
	          		background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
	          		color: 'white',
	          		border: 'none',
	          		borderRadius: '12px',
	          		fontSize: '16px',
	          		fontWeight: '600',
	          		cursor: 'pointer',
	          		transition: 'all 0.3s ease',
	          		boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
	          	}}
	          	onMouseOver={(e) => {
	          		e.target.style.transform = 'translateY(-2px)';
	          		e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
	          	}}
	          	onMouseOut={(e) => {
	          		e.target.style.transform = 'translateY(0)';
	          		e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
	          	}}
	          />
	        </Box>

	        <Text fontSize="xs" color="gray.500" textAlign="center" mt={4}>
	          🔒 256-bit SSL encrypted payment
	        </Text>
	      </ModalBody>
	    </ModalContent>
	  </Modal>
	)
}


export const FlutterwavePaymentModal = ({
	isOpen, onClose,
	onSuccess, payload,
	customizations,
	...props
}) => {
	const {
	    currency, amount, payment_option,
	    email, phone_number, first_name, last_name,
	} = payload;

	const {title, logo, description} = customizations;
	const DEBUG = JSON.parse(import.meta.env.VITE_DEBUG);
	console.log("Amount", payment_option, amount)

	const config = {
		public_key: "FLWPUBK_TEST-6d708e896eb3ba9f1ee4e1e73509e9e5-X",
		tx_ref: Date.now(),
		amount: DEBUG ? (amount > 500000 ? 500000 : amount) : amount,
		currency: currency,
		payment_options: payment_option,
		customer: {
		  email: email,
		  phone_number: phone_number,
		  name: `${first_name} ${last_name}`,
		},
		customizations: {
		  title: "Payment for Veyu",
		  description: description,
		  logo: logo,
		},
		meta: {...props?.meta}
	};
	const handleFlutterPayment = useFlutterwave(config);

	function payUp(){
		try{
		  handleFlutterPayment({
		    callback: (response) => {
		      console.log(response);
		      onPaymentComplete(response);
		      closePaymentModal(); // this will close the modal programmatically
		    },
		    onClose: () => {
		      onModalClose();
		    },
		  });
		}catch(err){
		  console.log("error paying up:", err)
		}
	}

	function onPaymentComplete(response){
		return onSuccess(response)
	}

	function onModalClose(){
	// user cancelled the payment flow
		console.log("User cancelled the transaction")
	}


	return(
	  <Modal isCentered isOpen={isOpen} onClose={onClose} size="lg">
	    <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
	    <ModalContent 
	    	w={'90%'} 
	    	maxW={'500px'} 
	    	borderRadius="2xl" 
	    	overflow="hidden"
	    	boxShadow="2xl"
	    >
	      <ModalHeader 
	      	bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" 
	      	color="white" 
	      	py={6}
	      	position="relative"
	      >
	        <Box textAlign="center">
	          <Heading size="lg" mb={2}>{title}</Heading>
	          <Text fontSize="3xl" fontWeight="bold">
	            {currency} {parseInt(amount).toLocaleString()}
	          </Text>
	        </Box>
	        <ModalCloseButton color="white" top={4} right={4} />
	      </ModalHeader>

	      <ModalBody py={6} px={6}>
	        <Box w={'100%'} mb={4}>
	          <Box 
	          	bg="gray.50" 
	          	p={4} 
	          	borderRadius="xl" 
	          	border="1px solid" 
	          	borderColor="gray.200"
	          	mb={4}
	          >
	            <Image 
	            	w={'100%'} 
	            	maxH="80px"
	            	objectFit="contain"
	            	src={'/assets/images/flutterwave-banner.png'} 
	            	alt="Flutterwave"
	            />
	          </Box>

	          <Alert 
	          	status="info"
	          	variant="left-accent"
	          	borderRadius="lg" 
	          	bg="orange.50"
	          	borderColor="orange.200"
	          >
	          	<AlertIcon color="orange.500" />
	          	<Box>
		          	<Text fontSize="sm" color="gray.700" fontWeight="500">
		          		Secure Payment Processing
		          	</Text>
		          	<Text fontSize="xs" color="gray.600" mt={1}>
		          		Veyu does not store your card details. All transactions are securely processed by Flutterwave.
		          	</Text>
	          	</Box>
	          </Alert>
	        </Box>

	        <Box mt={6} mb={4}>
	          <Button 
	          	w="100%" 
	          	size="lg"
	          	h="56px"
	          	bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
	          	color="white"
	          	borderRadius="xl"
	          	fontSize="16px"
	          	fontWeight="600"
	          	_hover={{
	          		transform: 'translateY(-2px)',
	          		boxShadow: '0 6px 16px rgba(245, 87, 108, 0.5)'
	          	}}
	          	_active={{
	          		transform: 'translateY(0)',
	          	}}
	          	transition="all 0.3s ease"
	          	boxShadow="0 4px 12px rgba(245, 87, 108, 0.4)"
	          	onClick={payUp}
	          > 
	          	Pay Now 
	          </Button>
	        </Box>

	        <Text fontSize="xs" color="gray.500" textAlign="center" mt={4}>
	          🔒 256-bit SSL encrypted payment
	        </Text>
	      </ModalBody>
	    </ModalContent>
	  </Modal>
	)
}


export const WalletPaymentModal = ({
	isOpen, onClose,
	onSuccess, payload,
	...props
}) => {
	const {
	    amount,
	    recipient,
	} = payload;

	const [pin, setPin] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const {axios, notify, authUser} = useContext(GlobalStore);

	async function payUp(){
		if (pin.length < 4) {
			notify({
				title: 'Invalid PIN',
				body: 'Please enter your 4-digit PIN',
				color: 'orange'
			});
			return;
		}

		setIsLoading(true);
		try{
			const res = await axios.post('/wallet/pay', JSON.stringify({
				amount: amount,
				recipient: recipient?.id || recipient?.owner?.id,
				pin: pin
			}));
			const data = objectifyJSON(res.data);

			if (res.status === 200){
				notify({
					title: 'Payment Successful',
					body: 'Payment completed successfully',
					color: 'green'
				});
				onSuccess(data);
			}else{
				// insufficient funds / wrong pin
				notify({
					title: 'Error',
					body: data?.message || 'Payment failed',
					color: 'red'
				})
			}

		}catch(err){
			console.log("error paying up:", err);
			notify({
				title: 'Payment Error',
				body: err?.response?.data?.message || 'Failed to process payment',
				color: 'red'
			})
		} finally {
			setIsLoading(false);
		}
	}

	return(
	  <Modal isCentered isOpen={true} onClose={onClose} size="md">
	    <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
	    <ModalContent 
	    	w={'90%'} 
	    	maxW={'450px'}
	    	borderRadius="2xl"
	    	overflow="hidden"
	    	boxShadow="2xl"
	    >
	      <ModalHeader 
	      	bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" 
	      	color="white" 
	      	py={6}
	      	textAlign="center"
	      	position="relative"
	      >
	        <Box display="flex" flexDirection="column" alignItems="center">
	          <Box bg="white" rounded="full" p={3} mb={3}>
	            <EmptyWalletIcon width="32px" height="32px" />
	          </Box>
	          <Heading size="md">Wallet Payment</Heading>
	        </Box>
	        <ModalCloseButton color="white" top={4} right={4} />
	      </ModalHeader>

	      <ModalBody px={6} py={6}>
	        <Box 
	        	bg="gray.50" 
	        	p={4} 
	        	borderRadius="xl" 
	        	mb={4}
	        	border="1px solid"
	        	borderColor="gray.200"
	        >
	          <Box mb={3}>
	            <Text fontSize="xs" color="gray.500" mb={1}>From</Text>
	            <Text fontSize="sm" fontWeight="600" color="gray.700">
	              {authUser?.email}
	            </Text>
	          </Box>
	          
	          <Divider borderColor="gray.300" my={3} />
	          
	          <Box mb={3}>
	            <Text fontSize="xs" color="gray.500" mb={1}>To</Text>
	            <Text fontSize="sm" fontWeight="600" color="gray.700">
	              {recipient?.owner?.email || recipient?.email}
	            </Text>
	          </Box>
	          
	          <Divider borderColor="gray.300" my={3} />
	          
	          <Box>
	            <Text fontSize="xs" color="gray.500" mb={1}>Amount</Text>
	            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
	              ₦{parseInt(amount).toLocaleString()}
	            </Text>
	          </Box>
	        </Box>

	        <Box mt={6}>
	          <Text fontSize="sm" fontWeight="600" mb={3} color="gray.700">
	            Enter Wallet PIN
	          </Text>
	          <PinField onChange={val => setPin(val)} value={pin} />
	        </Box>

	        <Box mt={6} display="flex" gap={3}>
	          <Button 
	          	onClick={payUp} 
	          	isDisabled={amount < 5 || pin.length < 4} 
	          	isLoading={isLoading}
	          	loadingText="Processing..."
	          	bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
	          	color="white"
	          	flex={1}
	          	h="48px"
	          	borderRadius="xl"
	          	fontWeight="600"
	          	_hover={{
	          		transform: 'translateY(-2px)',
	          		boxShadow: '0 6px 16px rgba(79, 172, 254, 0.5)'
	          	}}
	          	_active={{
	          		transform: 'translateY(0)',
	          	}}
	          	transition="all 0.3s ease"
	          	boxShadow="0 4px 12px rgba(79, 172, 254, 0.4)"
	          > 
	          	Pay Now
	          </Button>
	          
	          <Button 
	          	onClick={onClose}
	          	variant="outline"
	          	colorScheme="gray"
	          	flex={1}
	          	h="48px"
	          	borderRadius="xl"
	          	fontWeight="600"
	          	borderWidth="2px"
	          > 
	          	Cancel
	          </Button>
	        </Box>

	        <Text fontSize="xs" color="gray.500" textAlign="center" mt={4}>
	          🔒 Secure wallet transaction
	        </Text>
	      </ModalBody>
	    </ModalContent>
	  </Modal>
	)
}




// Export wallet components
export { default as WalletOverview } from './WalletOverview';
export { default as DepositModal } from './DepositModal';
export { default as WithdrawModal } from './WithdrawModal';
export { default as TransferModal } from './TransferModal';
