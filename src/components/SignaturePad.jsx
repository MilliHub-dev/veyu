import { useRef, useState, useEffect } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Text,
  VStack,
  HStack,
  Icon,
  Input,
  Radio,
  RadioGroup,
  Stack,
  FormControl,
  FormLabel,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { Pen, Eraser, Download, RotateCcw, Upload, Type } from 'lucide-react';

/**
 * SignaturePad Component
 * A canvas-based signature pad for digital signatures with multiple input methods
 */
const SignaturePad = ({ 
  onSave, 
  onClear, 
  width = 400, 
  height = 200,
  penColor = '#000000',
  backgroundColor = '#ffffff',
  disabled = false,
  coordinates = null, // { x, y, width, height } for signature placement
  showMethodSelection = true,
  defaultMethod = 'drawn',
}) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [context, setContext] = useState(null);
  const [signatureMethod, setSignatureMethod] = useState(defaultMethod);
  const [typedSignature, setTypedSignature] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const toast = useToast();
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      setContext(ctx);

      // Set background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }
  }, [penColor, backgroundColor, width, height]);

  useEffect(() => {
    // Clear canvas when method changes
    if (context) {
      clearSignature();
    }
  }, [signatureMethod]);

  const startDrawing = (e) => {
    if (disabled) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e) => {
    if (!isDrawing || disabled) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    context.closePath();
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (context) {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);
    }
    setIsEmpty(true);
    setTypedSignature('');
    setUploadedImage(null);
    setValidationError(null);
    if (onClear) onClear();
  };

  const validateSignature = () => {
    setValidationError(null);

    if (signatureMethod === 'drawn' && isEmpty) {
      setValidationError('Please draw your signature');
      return false;
    }

    if (signatureMethod === 'typed' && !typedSignature.trim()) {
      setValidationError('Please type your signature');
      return false;
    }

    if (signatureMethod === 'uploaded' && !uploadedImage) {
      setValidationError('Please upload a signature image');
      return false;
    }

    return true;
  };

  const handleTypedSignature = (value) => {
    setTypedSignature(value);
    setIsEmpty(false);
    setValidationError(null);

    // Render typed signature on canvas
    if (context) {
      const canvas = canvasRef.current;
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);

      if (value.trim()) {
        context.font = '48px "Brush Script MT", cursive';
        context.fillStyle = penColor;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(value, width / 2, height / 2);
      } else {
        setIsEmpty(true);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Draw image on canvas
        const canvas = canvasRef.current;
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, width, height);

        // Calculate scaling to fit canvas
        const scale = Math.min(width / img.width, height / img.height);
        const x = (width - img.width * scale) / 2;
        const y = (height - img.height * scale) / 2;

        context.drawImage(img, x, y, img.width * scale, img.height * scale);
        setUploadedImage(event.target.result);
        setIsEmpty(false);
        setValidationError(null);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const getSignatureData = () => {
    if (!validateSignature()) {
      return null;
    }

    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');

    return {
      signature_image: dataURL,
      signature_method: signatureMethod,
      coordinates: coordinates || { x: 0, y: 0, width, height },
      metadata: {
        typed_text: signatureMethod === 'typed' ? typedSignature : null,
        timestamp: new Date().toISOString(),
        canvas_dimensions: { width, height },
      },
    };
  };

  const saveSignature = () => {
    const signatureData = getSignatureData();
    
    if (!signatureData) {
      toast({
        title: 'Validation Error',
        description: validationError || 'Please provide a valid signature',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (onSave) {
      onSave({
        ...signatureData,
        dataURL: signatureData.signature_image,
        blob: dataURLToBlob(signatureData.signature_image),
        isEmpty: false,
      });
    }
  };

  const downloadSignature = () => {
    if (isEmpty) return;
    
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `signature-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  const dataURLToBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Touch support
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    canvasRef.current.dispatchEvent(mouseEvent);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    canvasRef.current.dispatchEvent(mouseEvent);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvasRef.current.dispatchEvent(mouseEvent);
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Signature Method Selection */}
      {showMethodSelection && (
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="medium">
            Signature Method
          </FormLabel>
          <RadioGroup value={signatureMethod} onChange={setSignatureMethod} isDisabled={disabled}>
            <Stack direction="row" spacing={4}>
              <Radio value="drawn">
                <HStack spacing={1}>
                  <Icon as={Pen} boxSize={4} />
                  <Text fontSize="sm">Draw</Text>
                </HStack>
              </Radio>
              <Radio value="typed">
                <HStack spacing={1}>
                  <Icon as={Type} boxSize={4} />
                  <Text fontSize="sm">Type</Text>
                </HStack>
              </Radio>
              <Radio value="uploaded">
                <HStack spacing={1}>
                  <Icon as={Upload} boxSize={4} />
                  <Text fontSize="sm">Upload</Text>
                </HStack>
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
      )}

      {/* Typed Signature Input */}
      {signatureMethod === 'typed' && (
        <FormControl isInvalid={validationError && signatureMethod === 'typed'}>
          <FormLabel fontSize="sm">Type your signature</FormLabel>
          <Input
            value={typedSignature}
            onChange={(e) => handleTypedSignature(e.target.value)}
            placeholder="Enter your full name"
            isDisabled={disabled}
            fontFamily="'Brush Script MT', cursive"
            fontSize="lg"
          />
        </FormControl>
      )}

      {/* Upload Signature Input */}
      {signatureMethod === 'uploaded' && (
        <FormControl isInvalid={validationError && signatureMethod === 'uploaded'}>
          <FormLabel fontSize="sm">Upload signature image</FormLabel>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            isDisabled={disabled}
            display="none"
          />
          <Button
            leftIcon={<Upload size={16} />}
            onClick={() => fileInputRef.current?.click()}
            isDisabled={disabled}
            variant="outline"
            w="full"
          >
            {uploadedImage ? 'Change Image' : 'Choose Image'}
          </Button>
        </FormControl>
      )}

      {/* Canvas Area */}
      <Box
        border="2px solid"
        borderColor={borderColor}
        borderRadius="md"
        bg={bgColor}
        p={2}
        position="relative"
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={signatureMethod === 'drawn' ? startDrawing : undefined}
          onMouseMove={signatureMethod === 'drawn' ? draw : undefined}
          onMouseUp={signatureMethod === 'drawn' ? stopDrawing : undefined}
          onMouseLeave={signatureMethod === 'drawn' ? stopDrawing : undefined}
          onTouchStart={signatureMethod === 'drawn' ? handleTouchStart : undefined}
          onTouchMove={signatureMethod === 'drawn' ? handleTouchMove : undefined}
          onTouchEnd={signatureMethod === 'drawn' ? handleTouchEnd : undefined}
          style={{
            cursor: disabled ? 'not-allowed' : signatureMethod === 'drawn' ? 'crosshair' : 'default',
            touchAction: 'none',
            display: 'block',
            width: '100%',
            height: 'auto',
          }}
        />
        
        {isEmpty && !disabled && signatureMethod === 'drawn' && (
          <Flex
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            pointerEvents="none"
            align="center"
            justify="center"
          >
            <Text color="gray.400" fontSize="lg">
              Sign here
            </Text>
          </Flex>
        )}
      </Box>

      {/* Validation Error */}
      {validationError && (
        <Text color="red.500" fontSize="sm">
          {validationError}
        </Text>
      )}

      {/* Coordinate Info (if provided) */}
      {coordinates && (
        <Text fontSize="xs" color="gray.500">
          Signature placement: x={coordinates.x}, y={coordinates.y}, size={coordinates.width}x{coordinates.height}
        </Text>
      )}

      {/* Action Buttons */}
      <ButtonGroup size="sm" spacing={2} w="full">
        <Button
          leftIcon={<RotateCcw size={16} />}
          onClick={clearSignature}
          isDisabled={isEmpty || disabled}
          variant="outline"
          colorScheme="red"
          flex={1}
        >
          Clear
        </Button>
        
        <Button
          leftIcon={<Download size={16} />}
          onClick={downloadSignature}
          isDisabled={isEmpty || disabled}
          variant="outline"
          colorScheme="blue"
          flex={1}
        >
          Download
        </Button>
        
        {onSave && (
          <Button
            leftIcon={<Pen size={16} />}
            onClick={saveSignature}
            isDisabled={disabled}
            colorScheme="green"
            flex={1}
          >
            Save Signature
          </Button>
        )}
      </ButtonGroup>
    </VStack>
  );
};

export default SignaturePad;
