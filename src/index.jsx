import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import { ChakraProvider } from "@chakra-ui/react";
import VeyuTheme from "./theme.jsx";
import App from './App.jsx';
import "animate.css/animate.compat.css";
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={VeyuTheme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

reportWebVitals();
