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
    Image,
    Input,
    Stack,
    Text
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import { GlobalStore } from "../../App";
import {motion} from 'framer-motion';
import { FaGoogle, FaFacebook, FaArrowRight } from "react-icons/fa";
import { CenteredLayout } from "../../components";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import firebase from 'firebase/compat/app';

export const LoginView = ({ ...props }) => {
    const self = this;

    const {onAuthenticated, axios, notify,} = useContext(GlobalStore)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [provider, setProvider] = useState('veyu');
    const [rememberMe, setRemeberMe] = useState(false);
    const redirect = useNavigate();

    async function handleLogin(e){
        e.preventDefault();

        try{
            const res = await axios.post('/accounts/login/', {
                email,
                password,
            }, { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
            let data = res.data;
            if (typeof data === 'string'){
                try { data = JSON.parse(data) } catch { data = { message: data } }
            }

            if (res.status === 200 && !data?.error){
                onAuthenticated(data)
                notify({
                    'title': 'Success',
                    'body': `Successfully logged in! Welcome back ${data?.user_type}`
                });

                switch(data?.user_type){
                    case 'dealer': return redirect('/dashboard', 200);
                    case 'mechanic': return redirect('/dashboard', 200);
                    default: return redirect(`/home?user=${data.email}`, 200);
                }                
            }else{
                return onError(data?.message, true)
            }
        }catch(error){
            const serverMsg = error?.response?.data?.message
                || (typeof error?.response?.data === 'string' ? error?.response?.data : null)
                || error.message;
            return onError(serverMsg)
        }
    }

    const signInWithGoogle = async () => {
        try{
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = firebase.auth.GoogleAuthProvider.credentialFromResult(result);

            // The signed-in user info.
            const user = result.user;
            if (user){
                const res = await axios.post('/accounts/login/', {
                    provider: 'google',
                    email: user.email,
                    password: ''
                }, { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } });
                let data = res.data;
                if (typeof data === 'string'){
                    try { data = JSON.parse(data) } catch { data = { message: data } }
                }

                if (res.status === 200 && !data?.error){
                    onAuthenticated(data)
                    notify({
                        'title': 'Success',
                        'body': `Successfully logged in! Welcome back ${data?.user_type}`
                    });

                    switch(data?.user_type){
                        case 'dealer': return redirect('/dashboard', 200);
                        case 'mechanic': return redirect('/dashboard', 200);
                        default: return redirect(`/home?user=${data.email}`, 200);
                    }                
                }else{
                    return onError(data?.message, true)
                }

            }
        }catch(error){
            console.error("Signup with google error", error);
        }
    };
    
    function onError(message, reload=false){
        notify({
            'title': 'Error!',
            'body': message || 'Something went wrong!',
            'color': 'red'
        });
        if (reload){
            refresh();
        }
    }
    
    function refresh(){
        setEmail('');
        setPassword('');
        setProvider('veyu');
        setRemeberMe(false);
    }

    return(
        <CenteredLayout py={'2rem'}>
            <Box as={motion.div} style={{ width: '95%', maxWidth: '880px', margin: 'auto', placeSelf: 'center', paddingTop: '3vh', paddingBottom: '5%'}} px={3}>
                <Card overflow="hidden" boxShadow="xl" borderRadius="2xl">
                    <Flex direction={{ base: 'column', md: 'row' }}>
                        <Box
                          flex={{ base: 'none', md: 1 }}
                          minH={{ base: '180px', md: 'auto' }}
                          bgImage={`url('/assets/veyu/login.jpg')`}
                          bgSize="cover"
                          bgPos="center"
                          display={{ base: 'none', md: 'block' }}
                        />

                        <Box flex={1} p={{ base: 6, md: 10 }}>
                            <Image src="/assets/images/logo-main.png" alt="Logo" mb={2} mx={'auto'} width="120px" />
                            <Heading textAlign='center' my={2} size="lg"> Welcome back </Heading>
                            <Text textAlign='center' mb={6} color="gray.600"> Log back in to your account. </Text>

                            <Box>
                                <form onSubmit={handleLogin} method="post" name="sign-in-form">

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
                                            <Input
                                                type="password"
                                                required={true}
                                                value={password}
                                                name="password"
                                                onInput={e => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                            />
                                        </FormControl>

                                        <HStack justify="space-between" align="center" my={1}>
                                            <Checkbox isChecked={rememberMe} onChange={(e) => setRemeberMe(e.target.checked)}>Remember me</Checkbox>
                                            <Button variant="link" colorScheme="blue" onClick={() => redirect('/forgot-password')}>Forgot password?</Button>
                                        </HStack>

                                        <HStack mt={4} spacing={3}>
                                            <Button type="submit" flex={1} colorScheme="blue" bg={'primary'}> Log in </Button>
                                            <Button flex={1} variant="outline" onClick={() => redirect('/signup')} rightIcon={<FaArrowRight />}> Sign up </Button>
                                        </HStack>
                                    </Stack>

                                    <HStack my={6}>
                                        <Divider />
                                        <Heading size={'sm'} color={'grey'}> OR </Heading>
                                        <Divider />
                                    </HStack>

                                    <Button w={'100%'} leftIcon={<FaGoogle />} variant="outline" onClick={signInWithGoogle}> Continue with Google </Button>

                                </form>
                            </Box>
                        </Box>
                    </Flex>
                </Card>
            </Box>
        </CenteredLayout>
    )
}


export default LoginView;
