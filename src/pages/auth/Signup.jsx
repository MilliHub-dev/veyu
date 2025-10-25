import {
    Box,
    Button,
    Card,
    Checkbox,
    Divider,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Icon,
    Image,
    Input,
    InputGroup,
    InputRightElement,
    IconButton,
    Link,
    ButtonGroup,
    PinInput,
    PinInputField,
    Select,
    SelectField,
    Stack,
    Text,
} from "@chakra-ui/react";
import { useContext, useRef, useState, createContext, useEffect } from "react";
import { GlobalStore } from "../../App";
import {motion} from 'framer-motion';
import { CenteredLayout, OTPField } from "../../components";
import { redirect, useNavigate, useSearchParams, useParams, Link as RLink } from "react-router-dom";
import { RiCircleFill, RiCircleLine, RiMailCloseFill, RiMailFill, RiMessage2Line, RiMessage3Line, RiMessageLine } from "react-icons/ri";
import { FcSms, FcVoicemail } from "react-icons/fc";
import { FaGoogle, FaFacebook, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { RxChatBubble, RxEnvelopeOpen } from "react-icons/rx";
import { jsonifyObject, objectifyJSON } from "../../utils";
import {ArrowRight} from 'lucide-react';
import { auth } from "../../firebase";
import firebase from 'firebase/compat/app';
import BusinessProfile from './BusinessProfile';

export const SignupContext = createContext({});

export const SignupView = ({...props }) => {
    const {redirect, axios, notify} = useContext(GlobalStore)
    const [params] = useSearchParams();
    const type = params.get('type') || 'customer'
    const [step, setStepValue] = useState(0);
    const [payload, setPayload] = useState({});
    const [user, setUser] = useState(null);
    const [skipConfirmation, setSkipStep] = useState({
        profile: false,
        email: false,
        phone_number: true,
    });
    const [verification, setVerification] = useState('email');
    const [userProvider, setUserProvider] = useState('email'); // email | google | facebook
    const [user_type, setUserType] = useState(type || 'customer');

    const context = {
        nextStep,
        gotoStep,
        addToPayload: onSubmit,
        payload,
        userProvider,
        setUserProvider,
        user_type,
        setUserType,
        createAccount,
        checkEmail,
    }

    const signUpWithGoogle = async () => {
        try{
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = firebase.auth.GoogleAuthProvider.credentialFromResult(result);

            // The signed-in user info.
            const _user = result.user;
            let [first_name, last_name] = _user.displayName.split(" ");
            const data = {
                email: _user.email,
                first_name,
                last_name,
                provider: 'google',
            };

            const newUser = await checkEmail(_user.email);

            if (newUser){
                await setPayload({...data, user_type: type === 'business' ? 'dealer' : 'customer'});
                await setUser(_user);
                setSkipStep({...skipConfirmation, email: true});
                nextStep();
            }
        }catch(error){
            console.error("Signup with google error", error);
        }
    };

    const steps = [
        {
            title: `Create ${type === 'business'? 'a business' : 'your'} account`,
            description: 'Start Today!', 
            key: 'signup',
            component: <EmailStep type={type} signUpWithGoogle={signUpWithGoogle} />
        },
        {
            title: 'Create your account',
            description: 'Start Today!', 
            key: 'profile',
            component: <SignupStep type={type} />
        },
        {
            title: 'Confirm your email',
            description: 'Verify your email to get notifications and updates from Veyu.',
            key: 'email',
            component: <ConfirmationStep type={type} verification={'email'}  />
        },
    ]

    function nextStep(){
        setStepValue((step+1))
    }

    function gotoStep(num){
        setStepValue(num)
    }
    
    function onSubmit(data){
        // if (verification === 'email' && skipConfirmation?.email){
        //     return createAccount(data)
        // }
        setPayload({
            ...payload,
            ...data
        });
    }

    function handleEmailSubmission(data){

    }

    async function checkEmail(email){
        try{
            const res = await axios.get(`/accounts/register/?email=${email}`);
            const data = objectifyJSON(res.data);
            if (res.status === 200){
                return true;
            }else{
                notify({
                    title: 'Error!',
                    body: data.message,
                    color: 'red',
                })
                return false;
            }
        }catch(err){
            notify({
                title: 'An error occurred!',
                body: err.message
            })
        }
    }

    async function createAccount(formData){
        onSubmit(formData);
    }

    const StepComponent = ({ props }) => {
        const currentStep = steps[step];

        useEffect(() => {
            if (skipConfirmation[`${currentStep.key}`]){
                nextStep();
            }
        }, [])
        return currentStep.component
    }

    return(
        <SignupContext.Provider value={context}>
            <br />
            <br />
        <CenteredLayout>
            <Box as={motion.div} style={{ width: '95%', maxWidth: '880px', margin: 'auto', placeSelf: 'center', paddingTop: '3vh', paddingBottom: '5%'}} px={3}>
                <Card overflow="hidden" boxShadow="xl" borderRadius="2xl">
                    <Flex direction={{ base: 'column', md: 'row' }}>
                        <Box
                          flex={{ base: 'none', md: 1 }}
                          minH={{ base: '180px', md: 'auto' }}
                          bgImage={`url('/assets/veyu/signup.jpg')`}
                          bgSize="cover"
                          bgPos="center"
                          display={{ base: 'none', md: 'block' }}
                        />

                        <Box flex={1} p={{ base: 6, md: 10 }}>
                            <Image src="/assets/images/logo-main.png" alt="Logo" mb={2} mx={'auto'} width="120px" />
                            <Heading textAlign='center' my={2} size="lg" textColor={'primary'}> {steps[step].title} </Heading>
                            <Text textAlign='center' mb={6} color={'#F4A950'}> {steps[step].description} </Text>

                            <Box>
                                <StepComponent />
                            </Box>
                        </Box>
                    </Flex>
                </Card>
            </Box>
        </CenteredLayout>
        </SignupContext.Provider>
    )
}


const EmailStep = ({ signUpWithGoogle }) => {
    const [email, setEmail] = useState('');
    const [params] = useSearchParams();
    const type = params.get('type') || 'customer'
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const {axios, notify} = useContext(GlobalStore);
    const {checkEmail, user_type, addToPayload, setUserType, payload, nextStep} = useContext(SignupContext);

    async function handleSubmit(e){
        e.preventDefault();
        try{
            // Validate password confirmation
            if (password !== confirmPassword){
                return notify({
                    title: 'Error!',
                    color: 'red',
                    body: 'Passwords do not match'
                });
            }

            // Validate password length (API requires min 8 characters)
            if (password.length < 8){
                return notify({
                    title: 'Error!',
                    color: 'red',
                    body: 'Password must be at least 8 characters long'
                });
            }

            const canProceed = await checkEmail(email);
            if (canProceed){
                // Validate business type selection for business accounts
                if (type === 'business' && !['dealer', 'mechanic'].includes(user_type)){
                    throw new Error("Please select a business type (Dealer or Mechanic)");
                }
                
                // Set user_type to customer for personal/customer accounts
                if (type === 'personal' || type === 'customer'){
                    setUserType('customer');
                }
                
                addToPayload({
                    email,
                    password,
                    confirm_password: confirmPassword,
                    provider: 'veyu'
                });
                nextStep();
            }
        }catch(err){
            notify({
                title: 'Error!',
                color: 'red',
                body: err.message
            })
        }
    }

    return(
        <Box>
            <form onSubmit={handleSubmit} method="post" name="sign-up-form">
                {type === 'business' && 
                <Box textAlign="center" my={2}>
                    <FormLabel textAlign="center"> Select your business type </FormLabel>
                    <ButtonGroup isAttached mx="auto">
                        <Button
                         fontSize="sm"
                         rounded="lg"
                         variant={user_type === 'dealer' ? 'block' : 'outline'}
                         bgColor={user_type === 'dealer' ? 'primary' : 'transparent'}
                         color={user_type === 'dealer' ? 'white' : 'black'}
                         onClick={() => setUserType('dealer')}
                        > Dealer </Button>
                        <Button
                         fontSize="sm"
                         rounded="lg"
                         variant={user_type === 'mechanic' ? 'block' : 'outline'}
                         bgColor={user_type === 'mechanic' ? 'primary' : 'transparent'}
                         color={user_type === 'mechanic' ? 'white' : 'black'}
                         onClick={() => setUserType('mechanic')}
                        > Mechanic </Button>
                    </ButtonGroup>
                    </Box>
                }

                <Stack flex={1}>
                    <FormControl name={'email'} my={2} isRequired>
                        <FormLabel> Email </FormLabel>
                        <Input
                            type="email"
                            required={true}
                            value={email}
                            name="email"
                            onInput={e => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                    </FormControl>

                    <FormControl name={'password'} my={2} isRequired>
                        <FormLabel> Password </FormLabel>
                        <InputGroup>
                            <Input
                                type={showPassword ? "text" : "password"}
                                required={true}
                                value={password}
                                name="password"
                                minLength={8}
                                onInput={e => setPassword(e.target.value)}
                                placeholder="Enter a password (min 8 characters)"
                            />
                            <InputRightElement>
                                <IconButton
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                                    onClick={() => setShowPassword(!showPassword)}
                                    variant="ghost"
                                    size="sm"
                                />
                            </InputRightElement>
                        </InputGroup>
                    </FormControl>

                    <FormControl name={'confirm_password'} my={2} isRequired>
                        <FormLabel> Confirm Password </FormLabel>
                        <InputGroup>
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                required={true}
                                value={confirmPassword}
                                name="confirm_password"
                                minLength={8}
                                onInput={e => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your password"
                            />
                            <InputRightElement>
                                <IconButton
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    variant="ghost"
                                    size="sm"
                                />
                            </InputRightElement>
                        </InputGroup>
                    </FormControl>

                    <FormControl my={4}>
                        <Button py={6} type="submit" w={'100%'} colorScheme="blue" bg={'primary'}> Get Started  </Button>
                    </FormControl>
                </Stack>
            
                <HStack my={5}>
                    <Divider />
                    <Heading size={'sm'} color={'grey'}> OR </Heading>
                    <Divider />
                </HStack>

                <Stack flex={1} columnGap={4} rowGap={4} my={3}>
                    <Button disabled={type === 'business' && !['dealer', 'mechanic'].includes(user_type)} w={'100%'} variant="outline" borderColor="lightgrey" rounded="lg" onClick={signUpWithGoogle} leftIcon={<FaGoogle />} colorScheme="white" color={'secondary'} bg={'white'}> Sign up with Google </Button>
                </Stack>

                <Divider my={3} />
                <RLink to={`/signup/?type=${type !== 'business' ? 'business' : 'customer'}`}>
                    <Button py={5} rightIcon={<FaArrowRight />} colorScheme="blue" variant="outline" borderWidth={3} borderColor="primary" w={"100%"} rounded="lg"> Create {type === 'business' ? 'Personal' : 'Business'} Account </Button>
                </RLink>

                <HStack justify="center" mt={4}>
                    <Text fontSize="sm" color="gray.600">Already have an account?</Text>
                    <RLink to="/login">
                        <Button variant="link" colorScheme="blue" size="sm">Log in</Button>
                    </RLink>
                </HStack>
            </form>
        </Box>
    )
}


const SignupStep = ({ type }) => {
    const {axios, notify, onAuthenticated} = useContext(GlobalStore);
    const {payload, addToPayload, nextStep, user_type, gotoStep} = useContext(SignupContext);
    const [first_name, setFirstName] = useState(payload?.first_name);
    const [last_name, setLastName] = useState(payload?.last_name);
    const [phone_number, setPhoneNumber] = useState('');
    const [cac_number, setCACNumber] = useState('');
    const [id_type, setIdType] = useState('nin');
    const redirect = useNavigate();

    async function handleSubmit(e){ 
        e.preventDefault();

        const newPayload = {
            ...payload,
            first_name,
            last_name,
            phone_number,
            user_type,
            action: 'create-account'
        }

        try{
            addToPayload({ ...newPayload });

            console.log('Signup payload:', newPayload); // Debug log

            const res = await axios.post('/accounts/register/', newPayload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            console.log('Signup response:', res); // Debug log
            console.log('Response status:', res.status); // Debug log
            console.log('Response data:', res.data); // Debug log
            
            const data = objectifyJSON(res.data)

            if (res.status === 201 || res.status === 200){
                // Store auth data for verification step
                const authData = data.data || data;
                if (authData.token || authData.api_token){
                    localStorage.setItem('veyu-auth-user', jsonifyObject(authData));
                }
                
                notify({
                    title: 'Success',
                    body: "Account created! Please verify your email."
                });

                // Go to email verification step
                nextStep();

                // if (payload.provider === 'google'){ // skip email confirmation
                //     if(type === 'business'){
                //         return redirect('/signup/business/');
                //     }else{
                //         return redirect('/');
                //     }
                // }else{
                //     return nextStep();
                // }
            }else{
                console.log("Signup Error", data)
                notify({
                    title: 'Sign up Error!',
                    color: 'red',
                    body: data.message,
                })
            }
        }catch(error){
            console.error('Signup error:', error);
            console.error('Error response:', error.response?.data);
            
            const errorMessage = error.response?.data?.message 
                || error.response?.data?.error
                || (typeof error.response?.data === 'object' ? JSON.stringify(error.response?.data) : error.response?.data)
                || error.message;
            
            notify({
                title: 'Error!',
                color: 'red',
                body: errorMessage,
            })
        }
    }

    return(
        <form onSubmit={handleSubmit} method="post">
            <Flex justifyContent={'space-between'} columnGap={3} flexWrap={{base: 'wrap', md: 'nowrap'}}>
                <FormControl width={{ base: '100%', md: '50%' }} my={2}>
                    <FormLabel> First name </FormLabel>
                    <Input
                        onInput={e => setFirstName(e.target.value)}
                        value={first_name}
                        placeholder="John"
                    />
                </FormControl>

                <FormControl width={{ base: '100%', md: '50%' }} my={2}>
                    <FormLabel> Last name </FormLabel>
                    <Input
                        onInput={e => setLastName(e.target.value)}
                        value={last_name}
                        placeholder="Doe"
                    />
                </FormControl>
            </Flex>

            <Flex justifyContent={'space-between'} columnGap={3} flexWrap={{base: 'wrap', md: 'nowrap'}}>
                <FormControl width={{ base: '100%', md: '50%' }} my={2}>
                    <FormLabel> Phone number </FormLabel>
                    <Input
                        onInput={e => setPhoneNumber(e.target.value)}
                        value={phone_number} type="tel"
                        placeholder="+234 812 4128 234"
                    />
                </FormControl>
            </Flex>

            <FormControl mt={3}>
                <Button type="submit" w={'100%'} colorScheme="blue" bg={'primary'}> Continue </Button>
            </FormControl>
        </form>
    )
}


const ConfirmationStep = ({ verification, type }) => {
    const {axios, notify, onAuthenticated} = useContext(GlobalStore);
    const {nextStep, payload} = useContext(SignupContext);
    const [otp, setOTP] = useState('');
    const [timeout, setCodeTimer] = useState(0);
    const timer = useRef();
    const redirect = useNavigate();

    // Auto-request verification code when component mounts
    useEffect(() => {
        requestCode();
    }, []);

    async function requestCode(){
        try {
            timer.current.innerHTML = `Request new code in 60s`;
            let time = 60;
            const auth = objectifyJSON(localStorage.getItem('veyu-auth-user'))
            const token = auth?.token || auth?.api_token

            const counter = setInterval(() => {
                if (time > 0){
                    time -= 1
                    timer.current.innerHTML = `Request new code in ${time}s`;
                    setCodeTimer(time);
                }else{
                    timer.current.innerHTML = `Click to resend`;
                    return clearInterval(counter)
                }
            }, 1000);
            
            const res = await axios.post('/accounts/verify-email/', JSON.stringify({
                action: 'request-code',
                email: payload.email,
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                }
            })

            if (res.status === 200) {
                notify({
                    title: 'Success',
                    body: 'Verification code sent to your email'
                });
            }
        } catch (error) {
            console.error('Request code error:', error);
            notify({
                title: 'Error',
                body: error.response?.data?.message || 'Failed to send verification code',
                color: 'red'
            });
        }
    }
    
    async function verifyCode(){
        try {
            const auth = objectifyJSON(localStorage.getItem('veyu-auth-user'));
            const token = auth?.token || auth?.api_token;
            
            if (!token) {
                notify({
                    title: 'Error',
                    body: 'Authentication token not found. Please sign up again.',
                    color: 'red'
                });
                return redirect('/signup');
            }
            
            if (verification === 'email'){
                const res = await axios.post('/accounts/verify-email/', JSON.stringify({
                    action: 'confirm-code',
                    email: payload.email,
                    code: otp
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`
                    }
                })
                
                if (res.status === 200){
                    setOTP('');
                    notify({
                        title: "Success",
                        body: "Your email has been verified! Please log in."
                    });

                    // Clear auth data and redirect to login
                    localStorage.removeItem('veyu-auth-user');
                    setTimeout(() => {
                        redirect('/login');
                    }, 1500);
                }
            }
        } catch (error) {
            console.error('Verify code error:', error);
            notify({
                title: 'Error',
                body: error.response?.data?.message || 'Invalid verification code',
                color: 'red'
            });
        }
    }

    return(
        <Box flex={1} textAlign={'center'} py={8}>
            <VStack spacing={6} maxW="500px" mx={'auto'} px={4}>
                {/* Icon Section */}
                <Box
                    w={20}
                    h={20}
                    borderRadius="full"
                    bg="blue.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mb={2}
                >
                    <Icon 
                        fontSize="40px" 
                        color={'primary'}
                    > 
                        {verification === 'email' ? <RxEnvelopeOpen /> : <RiMessage3Line />}
                    </Icon>
                </Box>

                {/* Heading Section */}
                <VStack spacing={2}>
                    <Heading size={'lg'} fontWeight="bold" color="gray.900">
                        Verify your {verification === 'email' ? 'email' : 'phone'}
                    </Heading>
                    <Text fontSize={'md'} color="gray.600" maxW="400px">
                        We've sent a 6-digit verification code to
                    </Text>
                    <Text fontSize={'md'} fontWeight="semibold" color="primary">
                        {verification === 'email' ? payload?.email : payload?.phone_number}
                    </Text>
                </VStack>

                {/* OTP Input Section */}
                <Box w="full" py={4}>
                    <OTPField value={otp} onChange={val => setOTP(val)} />
                </Box>

                {/* Verify Button */}
                <Button 
                    onClick={verifyCode} 
                    disabled={!otp || otp.length < 6} 
                    type="submit" 
                    w={'100%'} 
                    size="lg"
                    colorScheme="blue" 
                    bg={'primary'}
                    _hover={{ bg: 'blue.600' }}
                    _disabled={{
                        bg: 'gray.300',
                        cursor: 'not-allowed'
                    }}
                >
                    Verify Code
                </Button>

                {/* Resend Section */}
                <HStack spacing={1} fontSize="sm" color="gray.600">
                    <Text>Didn't receive the code?</Text>
                    <Button
                        variant="link"
                        colorScheme="blue"
                        fontWeight="semibold"
                        disabled={timeout > 0}
                        onClick={requestCode}
                        fontSize="sm"
                        _disabled={{
                            color: 'gray.400',
                            cursor: 'not-allowed'
                        }}
                    >
                        <span ref={timer}>Resend code</span>
                    </Button>
                </HStack>

                {/* Help Text */}
                <Box 
                    mt={4} 
                    p={4} 
                    bg="blue.50" 
                    borderRadius="lg" 
                    w="full"
                    borderLeft="4px solid"
                    borderColor="primary"
                >
                    <HStack spacing={2} align="start">
                        <Icon as={RiMailFill} color="primary" mt={0.5} />
                        <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                                Check your spam folder
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                If you don't see the email in your inbox, please check your spam or junk folder.
                            </Text>
                        </VStack>
                    </HStack>
                </Box>
            </VStack>
        </Box>
    )
}


const PhoneConfirmationStep = ({ nextStep, payload }) => {
    const [otp, setOTP] = useState('');
    const [timeout, setCodeTimer] = useState(0);
    const timer = useRef();
    const [verification, setVerification] = useState('email') // email | sms

    async function requestCode(){
        let time = 60;

        const counter = setInterval(() => {
            if (time > 0){
                time -= 1
                timer.current.innerHTML = `Request new code in ${time}s`;
                setCodeTimer(time);
            }else{
                timer.current.innerHTML = `Click to resend`;
                return clearInterval(counter)
            }
        }, 1000);
        timer.current.innerHTML = `Request new code in ${time}s`;

    }

    function verifyCode(){
        console.log("OTP:", otp);
        console.log("Payload:", payload);
        setOTP('');
        timer.current.focus()
        if (verification === 'email'){
            setVerification('sms')
        }
    }

    return(
        <Box flex={1} textAlign={'center'}>
            <Card my={5} py={5} px={5} width={'max-content'} mx={'auto'}>
                <Icon className="icon" color={'primary'} my={3} mx={'auto'}> {verification === 'email' ? <RxEnvelopeOpen /> : <RiMessage3Line /> }</Icon>
                <Heading className="subtitle" size={'md'} mb={3}> Please check your {verification === 'email' ? 'inbox' : 'messages'}. </Heading>
                <Text className="small-text" size={'xs'}> We've sent a code to {verification === 'email' ? `${payload.email}` : `${payload.phone_number}`} </Text>

                <OTPField value={otp} onChange={val => setOTP(val)} />

                <Text className="small-text" size={'xs'}>
                    Didn't get a code?
                    <Button
                     textDecor={'underline'}
                     bg={'transparent'}
                     _hover={{ bg: 'transparent'}}
                     disabled={timeout > 0}
                     px={1}
                     onClick={requestCode}
                    > <span ref={timer}>Click to resend</span> </Button>
                </Text>

                <Button my={5} onClick={verifyCode} disabled={!otp} type="submit" w={'100%'} colorScheme="blue" bg={'primary'}> Verify code </Button>
            </Card>
        </Box>
    )
}

export default SignupView;
