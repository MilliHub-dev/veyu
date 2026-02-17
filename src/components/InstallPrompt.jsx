import { useEffect, useState } from 'react'
import { Box, HStack, Text, Button, Icon, CloseButton, useColorModeValue } from '@chakra-ui/react'
import { Download, Share } from 'lucide-react'

function isIOS() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function isMobile() {
  if (typeof navigator === 'undefined') return false
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent)
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState('android') // 'android' | 'ios'
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const bg = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    if (!isMobile()) return
    if (isStandalone()) return
    if (window.location.pathname.includes('/chat')) return

    const dismissed = localStorage.getItem('pwa_prompt_dismissed') === '1'
    if (dismissed) return

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setMode('android')
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)

    // iOS doesn't fire beforeinstallprompt; show guidance instead
    if (isIOS()) {
      setMode('ios')
      // Delay slightly to avoid flashing on page transitions
      const t = setTimeout(() => setVisible(true), 800)
      return () => {
        window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
        clearTimeout(t)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    }
  }, [])

  useEffect(() => {
    const onInstalled = () => {
      setVisible(false)
      localStorage.setItem('pwa_prompt_dismissed', '1')
    }
    window.addEventListener('appinstalled', onInstalled)
    return () => window.removeEventListener('appinstalled', onInstalled)
  }, [])

  if (!visible) return null

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for unexpected cases
      setVisible(false)
      localStorage.setItem('pwa_prompt_dismissed', '1')
      return
    }
    deferredPrompt.prompt()
    try {
      await deferredPrompt.userChoice
    } catch {}
    setDeferredPrompt(null)
    setVisible(false)
    localStorage.setItem('pwa_prompt_dismissed', '1')
  }

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem('pwa_prompt_dismissed', '1')
  }

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      zIndex="20"
      bg={bg}
      borderTop="1px solid"
      borderColor={borderColor}
      boxShadow="0 -4px 16px rgba(0,0,0,0.08)"
      p={3}
    >
      <HStack spacing={3} align="center" justify="space-between">
        <HStack spacing={3}>
          <Icon as={mode === 'ios' ? Share : Download} boxSize={5} color="blue.500" />
          {mode === 'ios' ? (
            <Text fontSize="sm">
              Install Veyu: tap Share, then “Add to Home Screen”.
            </Text>
          ) : (
            <Text fontSize="sm">
              Install Veyu for faster access and offline support.
            </Text>
          )}
        </HStack>
        <HStack spacing={2}>
          {mode === 'android' && (
            <Button colorScheme="blue" size="sm" onClick={handleInstall}>
              Install
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Not now
          </Button>
        </HStack>
      </HStack>
    </Box>
  )
}

