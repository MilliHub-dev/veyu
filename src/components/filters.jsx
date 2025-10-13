import {useState, useContext, Fragment} from 'react';
import {
    Checkbox,
    Box,
    MenuItem,
    Menu,
    MenuList,
    MenuButton,
    Button,
    Input,
    Heading,
    Text,
} from '@chakra-ui/react';
import MenuAdapter from './menuAdapter';
import { BiChevronDown } from 'react-icons/bi';


export const ServiceFilter = ({ onChange, onClose }) => {
    const services = [
        'Oil Change', 'Tire Alignment/Rotation', 'Body Work'
    ]
    const [isOpen, setOpenState] = useState(false);
    const [value, setValue] = useState([]);

    function addOrRemoveService(e){
        const service = e.target.value;
        let _value = value;

        if (_value.includes(service)){
            _value.splice(_value.indexOf(service), 1);
        }else{
            _value.push(service)
        }
        setValue([..._value]);
    }

    function onClose(){
        setOpenState(false)
    }

    function onOpen(){
        setOpenState(true)
    }

    function applyFilter(){
        onClose();
        onChange({
            'filter': 'services',
            'value': ''.concat(value)
        });
    }

    return(
        <MenuAdapter.Root closeOnSelect={false} isOpen={isOpen} onClose={onClose}>
            <MenuAdapter.Trigger
             minW={'max-content'}
             size={'md'} borderRadius={'10px'}
             isActive={isOpen}
             as={Button}
             onClick={isOpen ? onClose : onOpen}
             bgColor="gray.100"
             rightIcon={<ChevronDownIcon />}
            > Services </MenuAdapter.Trigger>
            <MenuAdapter.Positioner>
                <MenuAdapter.Content maxH="300px" overflowY="auto">
                    <Box>
                        <Text p={3} size="md"> Select Make </Text>
                        {
                            services.map((service) => 
                                <MenuAdapter.Item
                                 key={service}
                                 selected={value.includes(service)}
                                 value={service}
                                 onInput={addOrRemoveService}
                                 as={Checkbox}
                                > {service} </MenuAdapter.Item>
                        )}
                    </Box>
                    <Box px={2} display={'block'} mt={2}>
                        <Button
                         onClick={applyFilter}
                         colorScheme="blue"
                         bgColor="primary"
                         w={'100%'}
                        > Confirm </Button>
                    </Box>
                </MenuAdapter.Content>
            </MenuAdapter.Positioner>
        </MenuAdapter.Root>
    )
}


export const CarBrandFilter = ({ onChange, onClose }) => {
    const brands = [
        'BMW', 'Audi', 'Toyota', 'Mercedis', 'Nissan', 'Mazda', 'Honda',
        'Peugeot', 'Opel', 'Volkswagen', 'Innoson', 'Ford',
    ]
    const [isOpen, setOpenState] = useState(false);
    const [value, setValue] = useState([]);

    function addOrRemoveBrand(e){
        const brand = e.target.value;
        let _value = value;
        console.log("Brand:", brand);

        if (_value.includes(brand)){
            _value.splice(_value.indexOf(brand), 1);
        }else{
            _value.push(brand)
        }
        setValue([..._value]);
    }

    function onClose(){
        setOpenState(false)
    }

    function onOpen(){
        setOpenState(true)
    }

    function applyFilter(){
        onClose();
        onChange({
            'filter': 'brands',
            'value': ''.concat(value)
        });
    }

    return(
        <MenuAdapter.Root closeOnSelect={false} isOpen={isOpen} onClose={onClose}>
            <MenuAdapter.Trigger
             minW={'max-content'}
             size={'md'} borderRadius={'10px'}
             isActive={isOpen}
             as={Button}
             onClick={isOpen ? onClose : onOpen}
             bgColor="gray.100"
             rightIcon={<ChevronDownIcon />}
            > Brand </MenuAdapter.Trigger>
            <MenuAdapter.Positioner>
                <MenuAdapter.Content maxH="300px" overflowY="auto">
                    <Box>
                        <Text p={3} size="md"> Select Make </Text>
                        {brands.map((brand) => <MenuAdapter.Item key={brand} selected={value.includes(brand)} value={brand} onInput={addOrRemoveBrand} as={Checkbox}> {brand} </MenuAdapter.Item>)}
                    </Box>
                    <Box px={2} display={'block'} mt={2}>
                        <Button
                         onClick={applyFilter}
                         colorScheme="blue"
                         bgColor="primary"
                         w={'100%'}
                        > Confirm </Button>
                    </Box>
                </MenuAdapter.Content>
            </MenuAdapter.Positioner>
        </MenuAdapter.Root>
    )
}


export const LocationFilter = ({ onChange, onClose }) => {
    const [isOpen, setOpenState] = useState(false);

    function onClose(){
        setOpenState(false)
    }
    function onOpen(){
        setOpenState(true)
    }

    function applyFilter(){
        onClose();
        onChange({

        })
    }

    return(
        <MenuAdapter.Root closeOnSelect={false} isOpen={isOpen} onClose={onClose}>
            <MenuAdapter.Trigger
             minW={'max-content'}
             size={'md'} borderRadius={'10px'}
             isActive={isOpen}
             as={Button}
             onClick={isOpen ? onClose : onOpen}
             bgColor="gray.100"
             rightIcon={<ChevronDownIcon />}
            > Location </MenuAdapter.Trigger>
            <MenuAdapter.Positioner>
                <MenuAdapter.Content maxH="300px" overflowY="auto">
                    <Box>
                        <Text p={3} size="md"> Select Location </Text>

                        {
                            [
                                'Abuja', 'Kaduna',
                            ]
                            .map((location) => <MenuAdapter.Item key={location} value={location} as={Checkbox}> {location} </MenuAdapter.Item>
                        )}
                    </Box>

                    <Box px={2} display={'block'} mt={2}>
                        <Button onClick={applyFilter} colorScheme="blue" bgColor="primary" w={'100%'}> Confirm </Button>
                    </Box>
                </MenuAdapter.Content>
            </MenuAdapter.Positioner>
        </MenuAdapter.Root>
    )
}


export const PriceFilter = ({ onChange, onClose }) => {
    const [isOpen, setOpenState] = useState(false);
    const [minPrice, setMinPrice] = useState(0.00);
    const [maxPrice, setMaxPrice] = useState(0.00);

    function onClose(){
        setOpenState(false)
    }
    function onOpen(){
        setOpenState(true)
    }

    function applyFilter(){
        onClose();
        onChange({
            'filter': 'price',
            'value': `${minPrice}-${maxPrice}`
        })
    }

    return(
        <MenuAdapter.Root closeOnSelect={false} isOpen={isOpen} onClose={onClose}>
            <MenuAdapter.Trigger
             minW={'max-content'}
             size={'md'} borderRadius={'10px'}
             isActive={isOpen}
             as={Button}
             onClick={isOpen ? onClose : onOpen}
             bgColor="gray.100"
             rightIcon={<ChevronDownIcon />}
            > Price </MenuAdapter.Trigger>
            <MenuAdapter.Positioner>
                <MenuAdapter.Content maxH="300px" overflowY="auto">
                    <Box>
                        <Text p={3} size="md"> Set min and max amount </Text>
                        <Box px={2} py={2} display={'block'}>
                            <Text> Min Amount </Text>
                            <Input value={minPrice} onInput={e => setMinPrice(e.target.value)} type="number" min="1" step="0.01" />
                        </Box>
                        <Box px={2} py={2} display={'block'}>
                            <Text> Max Amount </Text>
                            <Input value={maxPrice} onInput={e => setMaxPrice(e.target.value)} type="number" min="1" step="0.01" />
                        </Box>
                        <Box px={2} display={'block'} mt={2}>
                            <Button onClick={applyFilter} colorScheme="blue" bgColor="primary" w={'100%'}> Confirm </Button>
                        </Box>
                    </Box>
                </MenuAdapter.Content>
            </MenuAdapter.Positioner>
        </MenuAdapter.Root>
    )
}


export const TransmissionFilter = ({ onChange, onClose }) => {
    const [isOpen, setOpenState] = useState(false);
    const [value, setValue] = useState([]);

    function addOrRemoveTrans(e){
        const trans = e.target.value;
        let _value = value;

        if (_value.includes(trans)){
            _value.splice(_value.indexOf(trans), 1);
        }else{
            _value.push(trans)
        }
        setValue([..._value]);
    }

    function onClose(){
        setOpenState(false)
    }
    function onOpen(){
        setOpenState(true)
    }

    function applyFilter(){
        onClose();
        onChange({
            'filter': 'transmission',
            'value': ''.concat(value)
        })
    }

    return(
        <MenuAdapter.Root closeOnSelect={false} isOpen={isOpen} onClose={onClose}>
            <MenuAdapter.Trigger
             minW={'max-content'}
             size={'md'} borderRadius={'10px'}
             isActive={isOpen}
             as={Button}
             onClick={isOpen ? onClose : onOpen}
             bgColor="gray.100"
             rightIcon={<ChevronDownIcon />}
            > Transmission </MenuAdapter.Trigger>
            <MenuAdapter.Positioner>
                <MenuAdapter.Content maxH="300px" overflowY="auto">
                    <Box>
                        <Text p={3} size="md"> Select Transmission </Text>
                            {
                                ['Auto', 'Manual', 'Assisted Manual']
                                .map((trans) => <MenuAdapter.Item onInput={addOrRemoveTrans} value={trans} selected={value.includes(trans)} key={trans} as={Checkbox}> {trans} </MenuAdapter.Item>
                            )}
                        <Box px={2} display={'block'} mt={2}>
                            <Button onClick={applyFilter} colorScheme="blue" bgColor="primary" w={'100%'}> Confirm </Button>
                        </Box>
                    </Box>
                </MenuAdapter.Content>
            </MenuAdapter.Positioner>
        </MenuAdapter.Root>
    )
}



