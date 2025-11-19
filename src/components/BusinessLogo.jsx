import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Skeleton,
  SkeletonCircle,
  Box,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { resolveLogoUrl, generateBusinessInitials, monitorBusinessProfile } from '../utils/businessUtils';

/**
 * BusinessLogo Component
 * 
 * A reusable component for displaying business logos with proper error handling,
 * URL resolution, loading states, and accessibility features.
 * 
 * @param {Object} props - Component props
 * @param {string} props.logoUrl - The logo URL (can be relative or absolute)
 * @param {string} props.businessName - Business name for fallback initials and alt text
 * @param {string} props.size - Avatar size ('sm', 'md', 'lg', 'xl', '2xl')
 * @param {string} props.fallbackBg - Background color for fallback avatar
 * @param {string} props.fallbackColor - Text color for fallback avatar
 * @param {string} props.borderRadius - Border radius override
 * @param {function} props.onClick - Click handler
 * @param {Object} props.rest - Additional props passed to Avatar
 */
export const BusinessLogo = ({
  logoUrl,
  businessName,
  size = 'md',
  fallbackBg,
  fallbackColor,
  borderRadius,
  onClick,
  ...rest
}) => {
  const [imageState, setImageState] = useState('loading');
  const [resolvedUrl, setResolvedUrl] = useState(null);
  
  // Default colors based on theme
  const defaultFallbackBg = useColorModeValue('#F4A950', 'orange.500');
  const defaultFallbackColor = useColorModeValue('white', 'white');



  // Effect to resolve URL and reset image state when logoUrl changes
  useEffect(() => {
    console.log('BusinessLogo: Logo URL changed:', { logoUrl, businessName });
    
    if (logoUrl) {
      const resolved = resolveLogoUrl(logoUrl);
      console.log('BusinessLogo: URL resolved to:', resolved);
      setResolvedUrl(resolved);
      setImageState('loading');
    } else {
      console.log('BusinessLogo: No logo URL provided, using fallback for:', businessName);
      setResolvedUrl(null);
      setImageState('fallback');
    }
  }, [logoUrl, businessName]);

  // Handle image load success
  const handleImageLoad = () => {
    console.log('BusinessLogo: Image loaded successfully:', resolvedUrl);
    setImageState('loaded');
  };

  // Handle image load error
  const handleImageError = (error) => {
    console.error('BusinessLogo: Failed to load image:', {
      url: resolvedUrl,
      businessName,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    });
    
    // Monitor the image load failure
    monitorBusinessProfile('BusinessLogo_ImageLoadError', {
      logoUrl,
      resolvedUrl,
      businessName,
      error: error?.message || error,
      imageState
    });
    
    setImageState('error');
  };

  // Show loading skeleton while image is loading
  if (imageState === 'loading' && resolvedUrl) {
    return (
      <Box position="relative" display="inline-block">
        <SkeletonCircle 
          size={size === 'sm' ? '32px' : 
                size === 'md' ? '48px' : 
                size === 'lg' ? '64px' : 
                size === 'xl' ? '80px' : 
                size === '2xl' ? '96px' : '48px'} 
        />
        {/* Hidden image to detect load/error */}
        <img
          src={resolvedUrl}
          alt=""
          style={{ display: 'none' }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </Box>
    );
  }

  // Determine if we should show the image or fallback
  const shouldShowImage = imageState === 'loaded' && resolvedUrl;
  const initials = generateBusinessInitials(businessName);
  
  console.log('BusinessLogo: Render state:', {
    businessName,
    logoUrl,
    resolvedUrl,
    imageState,
    shouldShowImage,
    initials,
    size
  });

  return (
    <Avatar
      size={size}
      name={businessName}
      src={shouldShowImage ? resolvedUrl : undefined}
      bg={fallbackBg || defaultFallbackBg}
      color={fallbackColor || defaultFallbackColor}
      borderRadius={borderRadius}
      onClick={onClick}
      cursor={onClick ? 'pointer' : 'default'}
      // Accessibility attributes
      role={onClick ? 'button' : 'img'}
      aria-label={onClick ? `${businessName} logo` : undefined}
      alt={businessName ? `${businessName} logo` : 'Business logo'}
      // Custom initials override for better control
      getInitials={(name) => initials}
      // Handle image errors at Avatar level as well
      onError={handleImageError}
      {...rest}
    />
  );
};

export default BusinessLogo;