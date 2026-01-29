import {extendTheme} from '@chakra-ui/react'

const VeyuTheme = extendTheme({
  fonts: {
    heading: `'Satoshi', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `'Satoshi', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  },
  colors: {
    'primary': '#F4A950',
    'secondary': '#14181e',
    'tertiary': '#FDD153',
    'accent': '#F2F3F5',
    'white': '#FFFFFF',
    "orange": {
      50: "#fff6eb",
      100: "#fde9cf",
      200: "#fcd0a1",
      300: "#fab670",
      400: "#f9a356",
      500: "#f39f48",
      600: "#da8530",
      700: "#b66b1e",
      800: "#8c5014",
      900: "#5e340a",
    },
    dark: {
      50: "#f7f7f7",
      100: "#e1e1e1",
      200: "#c4c4c4",
      300: "#9a9a9a",
      400: "#6f6f6f",
      500: "#4a4a4a",
      600: "#2e2e2e",
      700: "#1b1b1b",
      800: "#0d0d0d",
      900: "#000000",
    },
  },
  styles: {
    global: {
      body: {
        color: "black",
        fontFamily: `'Satoshi', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
      },
    },
  },
});



export default VeyuTheme;